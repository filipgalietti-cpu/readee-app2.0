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
import { runFullQuizQc, qcImage } from "@/lib/ai/qc";
import { pickThemeForDate, slugForDate } from "@/lib/daily/themes";
import { trackError } from "@/lib/observability/track";
import {
  resolveHistoricalImage,
  cacheWikipediaImageToSupabase,
} from "@/lib/ai/historical-artifacts";

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
    trackError(e, { route: "daily-question", extra: { date: dateStr, hint: "DAILY_QUESTION_TEACHER_ID env var missing" } });
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

Hard apolitical / non-controversial rules (Readee sells into both red and blue districts; staying neutral on culture-war topics is the product):
- Avoid politics in any direction. No elections, no party names, no current sitting elected officials except in purely civics-procedural ways ("the president signs bills into law"). No mention of campaigns, primaries, or political commentary.
- Avoid culture-war topics entirely: ICE / immigration enforcement, abortion, gun policy, gender identity, sexual orientation, Pride Month, transgender topics, Black Lives Matter, critical race theory, Israel/Palestine, religion-as-policy, vaccine debates, school choice, DEI debates. These topics are not appropriate here regardless of viewpoint.
- Federally recognized heritage months ARE OK (Black History, Women's History, AAPI, Hispanic, Native American, Veterans). Pride Month and other locally-contested observances are NOT — skip them and pick a seasonal or science angle for that day.
- "Current events" is allowed only when neutral: weather, sports, space, science discoveries, new inventions, animal news, Olympic results, kid-friendly cultural moments. Default away from politics, not toward it.

Approach to real-world topics:
- Public information, real historical figures, and real organizations are fair game when factually framed and free of partisan adjectives.
- Pop culture, sports, scientific discoveries, animals, food, gardening, helpers (firefighters, librarians, teachers, doctors), space, music, art — encouraged.
- Stay journalistic and concrete. Describe, don't editorialize.

Copyright + trademark practical posture:
- Nominative reference is fine: "the popular video game Minecraft", "the basketball player LeBron James", "the May 4 cultural day fans call Star Wars Day". Naming a thing in passing as part of an educational point is normal speech.
- Avoid: extended retellings of copyrighted plots, direct quoted dialogue from copyrighted works, character voicing in fan-fiction style, branded merchandise descriptions.
- Real public figures may be referenced for factual educational content (achievements, sports, science). Don't put words in their mouths they didn't say. Don't reference current elected officials beyond civics procedure.

Religion + culture:
- Specific religious traditions can be described informationally (what people believe, how they observe) when the day naturally calls for it. Don't proselytize. Don't compare faiths competitively. Don't link a faith to a political stance.
- Cultural traditions, festivals, and food are fair game.

When in doubt, pivot to: science, animals, weather, sports, space, helpers, food, gardening, art, music, friendship, kindness.`;

  const datedTopic = `${SAFETY_PREAMBLE}

Today is ${fullDate} (${monthName} — ${seasonName} in the Northern Hemisphere). Write a passage that feels appropriate for THIS time of year — do not pick a topic from a different season.

${theme.topic}`;

  // 1) Passage. Daily is the marquee public-facing passage, so we
  //    target the "medium" tier — substantial enough to be a real
  //    reading moment but bounded so it's not an essay.
  const passageRes = await generatePassage({
    teacherId,
    topic: datedTopic,
    gradeLevel,
    phonicsPattern: null,
    lengthLevel: "medium",
    // System-controlled prompt; the SAFETY_PREAMBLE quotes banlist
    // words inside its own anti-policy rules ("no sexual content"),
    // which would otherwise trip the prompt-side substring filter.
    // Output filter still runs on whatever Gemini returns.
    trustedSystem: true,
  });
  if (!passageRes.ok) {
    const err = `passage: ${passageRes.error}`;
    trackError(new Error(err), { route: "daily-question", extra: { date: dateStr } });
    return { ok: false, error: err, date: dateStr };
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
    trustedSystem: true,
  });
  if (!mcqRes.ok || mcqRes.questions.length === 0) {
    const err = `questions: ${mcqRes.ok ? "no questions returned" : mcqRes.error}`;
    trackError(new Error(err), { route: "daily-question", extra: { date: dateStr } });
    return { ok: false, error: err, date: dateStr };
  }
  const [mainQ, ...extras] = mcqRes.questions;

  // 3) Image — historical figures route through Wikipedia first
  //    (royalty-free, accurate likeness). Imagen can't render named
  //    real people reliably (Roger Bannister with no eyes shipped on
  //    May 6 → driver for this whole flow). For fictional / generic
  //    passages we fall through to the standard brief → Imagen path.
  let imageUrl: string | null = null;
  let imageScene: string | null = null;
  const resolved = await resolveHistoricalImage(passageTitle, passageBody);
  if (resolved.kind === "royalty_free") {
    const cachedUrl = await cacheWikipediaImageToSupabase(
      resolved.figureName,
      resolved.imageUrl,
    );
    imageUrl = cachedUrl ?? resolved.imageUrl;
    imageScene = `Wikipedia portrait of ${resolved.figureName}`;
  } else {
    const briefRes = await generateImageBrief({
      teacherId,
      passageTitle,
      passageBody,
    });
    if (briefRes.ok) {
      // If a named figure was detected but no Wikipedia image exists
      // (or the figure is still living), append a guardrail telling
      // the image generator NOT to depict the named person — show a
      // thematic stand-in instead.
      const figureGuard =
        resolved.kind === "ai" && resolved.avoidNamedPerson && resolved.figureName
          ? ` Do not depict ${resolved.figureName}'s likeness — show only the activity, era, or setting they're associated with, no recognizable face.`
          : "";
      imageScene = briefRes.brief + figureGuard;
      const imgRes = await generateImage({
        teacherId,
        prompt: imageScene,
      });
      if (imgRes.ok) imageUrl = imgRes.imageUrl;
    }
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

/**
 * Targeted asset regen for an existing daily_questions row whose QC
 * verdict is 'fail' but where the only failing checks are image
 * judges. Regenerates the image (and only the image), re-runs the
 * image QC, recomputes overall, and writes the updated row.
 *
 * The May 6 2026 incident is the canonical case: passage + all 3
 * questions passed, only `image.judge` failed ("generic child runner
 * instead of Roger Bannister"). Rebuilding the whole entry threw
 * away good passage + questions to chase one flaky image verdict.
 * This path keeps the proven-good text and only re-rolls the image.
 *
 * Cost: ~$0.05 vs ~$0.10 for a full rebuild. Faster too — single
 * Imagen call + single vision judge call (~10s wall clock vs 60-90s).
 *
 * Returns:
 *   - { ok: true, regenerated: true, newOverall } — image regen ran
 *   - { ok: true, regenerated: false, reason } — non-image failures
 *     present, caller should do a full rebuild instead
 *   - { ok: false, error } — hard error
 */
export async function targetedImageRegen(opts: {
  date?: Date;
}): Promise<
  | { ok: true; regenerated: true; newOverall: string }
  | { ok: true; regenerated: false; reason: string }
  | { ok: false; error: string }
> {
  const date = opts?.date ?? new Date();
  const dateStr = slugForDate(date);
  const admin = supabaseAdmin();

  const { data: row, error: rowErr } = await admin
    .from("daily_questions")
    .select(
      "date, passage_title, passage_body, image_url, qc_overall, qc_report",
    )
    .eq("date", dateStr)
    .maybeSingle();
  if (rowErr) return { ok: false, error: `db: ${rowErr.message}` };
  if (!row) return { ok: false, error: `no row for ${dateStr}` };

  const report = (row as any).qc_report ?? null;
  const checks: Array<{ name: string; severity: string; message: string }> =
    Array.isArray(report?.checks) ? report.checks : [];
  const failing = checks.filter((c) => c.severity === "fail");
  if (failing.length === 0) {
    return { ok: true, regenerated: false, reason: "no failing checks" };
  }
  const allImage = failing.every((c) => c.name.startsWith("image."));
  if (!allImage) {
    return {
      ok: true,
      regenerated: false,
      reason: `non-image failures present: ${failing
        .filter((c) => !c.name.startsWith("image."))
        .map((c) => c.name)
        .join(", ")}`,
    };
  }

  // Regen the image. Re-derive the brief from passage so the new
  // image lines up with the body even if the old brief was stale.
  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    return { ok: false, error: e.message };
  }

  const passageTitle = (row as any).passage_title as string;
  const passageBody = (row as any).passage_body as string;
  const briefRes = await generateImageBrief({
    teacherId,
    passageTitle,
    passageBody,
  });
  if (!briefRes.ok) {
    return { ok: false, error: `imageBrief: ${briefRes.error}` };
  }
  const imageScene = briefRes.brief;
  const imgRes = await generateImage({ teacherId, prompt: imageScene });
  if (!imgRes.ok) return { ok: false, error: `image: ${imgRes.error}` };
  const newImageUrl = imgRes.imageUrl;

  // Re-run image QC on the new image.
  const { checks: imageChecks } = await qcImage({
    teacherId,
    imageUrl: newImageUrl,
    expectedScene: imageScene,
  });

  // Splice the new image checks into the report (drop all old
  // image.* checks, append the fresh ones).
  const otherChecks = checks.filter((c) => !c.name.startsWith("image."));
  const updatedChecks = [...otherChecks, ...imageChecks];
  const sev = (s: string): number =>
    s === "fail" ? 2 : s === "warn" ? 1 : 0;
  const worst = updatedChecks.reduce(
    (acc, c) => Math.max(acc, sev(c.severity)),
    0,
  );
  const newOverall = worst === 2 ? "fail" : worst === 1 ? "warn" : "pass";

  const updatedReport = {
    ...(report ?? {}),
    checks: updatedChecks,
    overall: newOverall,
    targetedRegenAt: new Date().toISOString(),
  };

  const { error: updErr } = await admin
    .from("daily_questions")
    .update({
      image_url: newImageUrl,
      qc_overall: newOverall,
      qc_report: updatedReport,
    })
    .eq("date", dateStr);
  if (updErr) return { ok: false, error: `update: ${updErr.message}` };

  return { ok: true, regenerated: true, newOverall };
}
