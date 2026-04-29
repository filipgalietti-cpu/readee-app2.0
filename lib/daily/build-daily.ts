/**
 * Daily question builder. Uses the same generators that power the
 * Build with AI wizard, runs the QC engine, and writes one row to
 * daily_questions for the given date.
 *
 * Idempotent — if the row exists for the requested date, returns it
 * without calling any AI. Safe to re-trigger from the cron.
 *
 * Cost per build:
 *   - Passage:    1 credit
 *   - Image brief: 1 credit
 *   - Image:      8 credits
 *   - TTS:        2 credits
 *   - 3 MCQs:     1 credit (one batch call)
 *   - QC suite:   ~5 credits
 *   ≈ 18 credits ≈ $0.10
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  generatePassage,
  generateMCQQuestions,
  generateImage,
  generateImageBrief,
  generateSpeech,
} from "@/lib/ai/readee-ai";
import { runFullQuizQc } from "@/lib/ai/qc";
import { pickThemeForDate, slugForDate } from "@/lib/daily/themes";

// The daily question runs against a "system" teacher account so the
// existing rate-limit + log infrastructure has someone to bill. We
// use the platform-admin profile id (Filip) — set via env so we can
// rotate without code changes.
function systemTeacherId(): string {
  const id = process.env.DAILY_QUESTION_TEACHER_ID;
  if (!id) {
    throw new Error("DAILY_QUESTION_TEACHER_ID env var is required.");
  }
  return id;
}

export type DailyBuildResult =
  | { ok: true; date: string; created: boolean; qcOverall: string }
  | { ok: false; error: string; date: string };

/**
 * Build (or fetch) the daily question for the given date.
 * Default date = today UTC.
 */
export async function buildDailyQuestion(opts?: {
  date?: Date;
  /** Default 2nd grade — broadest audience appeal. */
  gradeLevel?: string;
  /** When true, regenerate even if a row already exists. */
  force?: boolean;
}): Promise<DailyBuildResult> {
  const date = opts?.date ?? new Date();
  const dateStr = slugForDate(date);
  const gradeLevel = opts?.gradeLevel ?? "2nd";
  const admin = supabaseAdmin();

  // Idempotency check — short-circuit unless force=true.
  if (!opts?.force) {
    const { data: existing } = await admin
      .from("daily_questions")
      .select("date, qc_overall")
      .eq("date", dateStr)
      .maybeSingle();
    if (existing) {
      return {
        ok: true,
        date: dateStr,
        created: false,
        qcOverall: (existing as any).qc_overall,
      };
    }
  }

  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    return { ok: false, error: e.message, date: dateStr };
  }

  const theme = pickThemeForDate(date);

  // Date-anchored topic. Injects today's actual date + season so the
  // AI writes something that fits THE DAY, not just the theme bucket.
  // Without this, "Monday science" can produce a fall-leaves passage
  // in April. With it, the passage stays seasonally appropriate.
  const month = date.getUTCMonth() + 1;
  const seasonName =
    month === 12 || month <= 2
      ? "winter"
      : month >= 3 && month <= 5
        ? "spring"
        : month >= 6 && month <= 8
        ? "summer"
        : "fall";
  const monthName = date.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const fullDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  // Safety preamble for the daily question. Public-facing, mixed-age
  // K-4 audience plus parents reading along — must stay neutral and
  // kid-appropriate. Hard avoid list keeps the model from drifting
  // into edgy "on this day" picks (wars, assassinations, atrocities)
  // or political/religious controversy on themed days.
  const SAFETY_PREAMBLE = `This is a public-facing daily reading passage for K-4 students and their families.

Hard child-safety rules (non-negotiable, K-4 audience):
- No graphic violence, no weapons-as-tools-against-people, no on-page death, no abuse, no addiction, no sexual content, no self-harm, no horror imagery.
- Tragedy is OK to acknowledge factually but never as the focus; if the day's natural anchor is a tragedy, reframe around the recovery, the helpers, or a related neutral angle (a scientific discovery, a famous birthday).

Approach to current events + real-world topics:
- Lean in. Public information about real people, real organizations, real news is fair game when it's age-appropriate and factually framed.
- Stay journalistic — describe, don't editorialize. Skip partisan adjectives.
- Pop culture, sports, scientific discoveries, current inventions, and notable cultural moments are encouraged.

Copyright + trademark practical posture:
- Nominative reference is fine: "the popular video game Minecraft", "the basketball player LeBron James", "the May 4 cultural day fans call Star Wars Day". Naming a thing in passing as part of an educational point is normal speech.
- Avoid: extended retellings of copyrighted plots, direct quoted dialogue from copyrighted works, character voicing in fan-fiction style, branded merchandise descriptions.
- Real historical figures and current public figures may be referenced for factual educational content. Don't put words in their mouths they didn't say.

Religion + culture:
- Specific religious traditions can be described informationally (what people believe, how they observe). Don't proselytize. Don't compare faiths competitively.
- Cultural traditions, festivals, and food are fair game.`;

  const datedTopic = `${SAFETY_PREAMBLE}

Today is ${fullDate} (${monthName} — ${seasonName} in the Northern Hemisphere). Write a passage that feels appropriate for THIS time of year — do not pick a topic from a different season.

${theme.topic}`;

  // 1) Passage
  const passageRes = await generatePassage({
    teacherId,
    topic: datedTopic,
    gradeLevel,
    phonicsPattern: null,
  });
  if (!passageRes.ok) {
    return { ok: false, error: `passage: ${passageRes.error}`, date: dateStr };
  }
  const passageTitle = passageRes.passage.title;
  const passageBody = passageRes.passage.passage;

  // 2) Questions — three MCQs, the first becomes the surfaced one,
  //    the others go into extra_questions for the /today page.
  const mcqRes = await generateMCQQuestions({
    teacherId,
    topic: `${datedTopic}\n\nPassage to ground questions in:\n"""\n${passageBody}\n"""`,
    gradeLevel,
    count: 3,
  });
  if (!mcqRes.ok || mcqRes.questions.length === 0) {
    return {
      ok: false,
      error: `questions: ${mcqRes.ok ? "no questions returned" : mcqRes.error}`,
      date: dateStr,
    };
  }
  const [mainQ, ...extras] = mcqRes.questions;

  // 3) Image brief → image (best-effort; daily question is still
  //    valuable without art if image gen fails).
  let imageUrl: string | null = null;
  let imageScene: string | null = null;
  const briefRes = await generateImageBrief({
    teacherId,
    passageTitle,
    passageBody,
  });
  if (briefRes.ok) {
    imageScene = briefRes.brief;
    const imgRes = await generateImage({
      teacherId,
      prompt: briefRes.brief,
    });
    if (imgRes.ok) imageUrl = imgRes.imageUrl;
  }

  // 4) TTS for the passage.
  let audioUrl: string | null = null;
  const ttsRes = await generateSpeech({
    teacherId,
    text: passageBody.slice(0, 1200),
  });
  if (ttsRes.ok) audioUrl = ttsRes.audioUrl;

  // 5) QC the whole thing.
  const qc = await runFullQuizQc({
    teacherId,
    passageTitle,
    passageBody,
    gradeLevel,
    questions: [
      {
        kind: "multiple_choice" as const,
        prompt: mainQ.prompt,
        choices: mainQ.choices,
        correct: mainQ.correct,
        hint: mainQ.hint ?? null,
      },
      ...extras.map((q) => ({
        kind: "multiple_choice" as const,
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint ?? null,
      })),
    ],
    imageUrl,
    imageScene,
  });

  // 6) Persist. If qc.overall === 'fail' the route handler may decide
  //    to retry once; we still write the row so we have a record.
  const { error: insertErr } = await admin
    .from("daily_questions")
    .upsert({
      date: dateStr,
      theme: theme.label,
      slug: dateStr,
      passage_title: passageTitle,
      passage_body: passageBody,
      image_url: imageUrl,
      audio_url: audioUrl,
      question_prompt: mainQ.prompt,
      choices: mainQ.choices,
      correct: mainQ.correct,
      hint: mainQ.hint ?? null,
      extra_questions: extras.length > 0 ? extras : null,
      qc_overall: qc.overall,
      qc_report: qc,
    });

  if (insertErr) {
    return { ok: false, error: `db: ${insertErr.message}`, date: dateStr };
  }

  return { ok: true, date: dateStr, created: true, qcOverall: qc.overall };
}
