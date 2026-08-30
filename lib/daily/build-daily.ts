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
import { extractSceneSpec, renderSpecAsBrief, describeSpec } from "@/lib/ai/scene-spec";
import { judgeImageQuality } from "@/lib/ai/qc-media";
import { qcImageStructured, generateBestImage } from "@/lib/ai/qc-scene";
import { pickThemeForDate, slugForDate } from "@/lib/daily/themes";
import { trackError } from "@/lib/observability/track";
import { runAutoHealLoop, type Finding, type Healer } from "@/lib/qc/auto-heal";
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

// ───── Image art-style variety ────────────────────────────────────
// Before this, every AI image used one hardcoded cartoon style — the
// uniform "children's-book coloring" look. We now pick the style from
// the content: real-world subjects that are cooler as photos render
// photoreal; made-up stories rotate through a small illustration
// palette so they don't all look identical day to day. (Real named
// historical figures route to actual photos upstream via
// resolveHistoricalImage — that path is untouched here.)
const PHOTOREAL_STYLE =
  "Realistic nature/wildlife photograph, natural lighting, sharp focus, richly detailed, National Geographic documentary style, no text, no watermarks. ";
const ILLUSTRATION_STYLES = [
  "Soft watercolor storybook illustration, gentle washes, hand-painted texture, warm and cozy, no text, no watermarks. ",
  "Bright bold 2D cartoon illustration, clean thick outlines, vibrant saturated colors, kid-friendly, no text, no watermarks. ",
  "Cut-paper collage illustration, layered textured paper shapes, playful and tactile, Eric Carle style, no text, no watermarks. ",
  "Soft colored-pencil and crayon illustration, hand-drawn childlike warmth, gentle shading, no text, no watermarks. ",
  // Spice additions (Aug 25) — each proven-safe for Imagen (simple, strong
  // conventions it renders cleanly; nothing that invites garbled detail):
  "Classic storybook ink-and-wash illustration, fine linework with soft muted color washes, timeless picture-book feel, no text, no watermarks. ",
  "Cozy gouache painting, flat matte colors, rounded friendly shapes, mid-century children's book style, no text, no watermarks. ",
  "Soft pastel chalk illustration, dreamy blended colors, gentle glowing light, bedtime-story mood, no text, no watermarks. ",
  "Felt and fabric craft illustration, stitched textures, plush layered shapes, handmade warmth, no text, no watermarks. ",
];
// Themes whose subject is a real animal / natural phenomenon — photoreal
// beats cartoon here ("a real glowing firefly is cooler than a drawn one").
const PHOTOREAL_THEMES = new Set(["Tuesday animals", "Thursday nature"]);

/** Pick an art-style prefix for a daily AI image. Photoreal for
 *  animals/nature; otherwise a date-seeded rotation through the
 *  illustration palette so stories vary in look. Deterministic per
 *  date so re-running the cron is stable. */
function pickImageStyle(
  themeLabel: string,
  dateStr: string,
  genre?: "fiction" | "nonfiction" | null,
): string {
  if (PHOTOREAL_THEMES.has(themeLabel)) return PHOTOREAL_STYLE;
  // Nonfiction fights Imagen's cute-cartoon prior (smiley fireflies kept
  // shipping despite prompt rules) — bias factual passages to the
  // naturalistic style so anthropomorphism never enters the frame.
  if (genre === "nonfiction") return PHOTOREAL_STYLE;
  let h = 0;
  for (const ch of dateStr) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ILLUSTRATION_STYLES[h % ILLUSTRATION_STYLES.length];
}

/** Filip's rule (Aug 25): an article ships EVERY day. QC failures mean
 *  "heal and note", never "hide the day" — the only thing allowed to hold
 *  a day back is a genuine SAFETY failure, and the pipeline heals those
 *  immediately (safe-harbor image / regenerated text) rather than leaving
 *  a hole in the archive. */
function decidePublishState(qc: { overall: string; checks?: Array<{ name?: string; message?: string; severity?: string }> }): "live" | "hidden" {
  if (qc.overall !== "fail") return "live";
  const checks = qc.checks ?? [];
  const safetyHit = checks.some(
    (c) =>
      c.severity === "fail" &&
      /safety|nudit|naked|inappropriate|suggestive|caricature|violence|weapon/i.test(
        `${c.name ?? ""} ${c.message ?? ""}`,
      ),
  );
  return safetyHit ? "hidden" : "live"; // aesthetic fails ship (and get healed)
}

/** Filip's rules (Aug 25): every daily MUST have an image, and it must
 *  never be sloppy or unsafe. Ladder: judge the chosen image; on FAIL
 *  retry once with the judge's reason folded in; still failing, drop to
 *  a SAFE-HARBOR prompt (single simple subject, no people, no text —
 *  nearly always renders clean); if even that fails the judge on pure
 *  aesthetics we ship the safe-harbor anyway (image is mandatory), but
 *  a SAFETY fail is absolute — an unsafe image never ships, keep the
 *  prior candidate chain's best safe option instead. */
async function shipGateImage(input: {
  teacherId: string;
  imageUrl: string | null;
  imageScene: string;
  passageBody: string;
  stylePrefix?: string;
}): Promise<string | null> {
  if (!input.imageUrl) return null;
  const v1 = await judgeImageQuality({
    imageUrl: input.imageUrl,
    expectedScene: input.imageScene.slice(0, 400),
    passageBody: input.passageBody,
  });
  if (!v1.ok || v1.severity !== "fail") return input.imageUrl; // judge error = don't block
  console.warn(`[daily] ship-gate FAIL, retrying: ${v1.reason.slice(0, 120)}`);
  const retry = await generateImage({
    teacherId: input.teacherId,
    prompt: `${input.imageScene}

Previous attempt failed review: ${v1.reason.slice(0, 200)}. Fix that issue.`,
    stylePrefix: input.stylePrefix,
  });
  if (!retry.ok) return null;
  const v2 = await judgeImageQuality({
    imageUrl: retry.imageUrl,
    expectedScene: input.imageScene.slice(0, 400),
    passageBody: input.passageBody,
  });
  if (v2.ok && v2.severity === "fail") {
    console.warn(`[daily] ship-gate FAIL twice, safe-harbor: ${v2.reason.slice(0, 120)}`);
    // Safe-harbor: strip the scene to its simplest safe form.
    const harbor = await generateImage({
      teacherId: input.teacherId,
      prompt: `A single, simple, friendly illustration of the main subject of this scene: ${input.imageScene.slice(0, 200)}. One subject only, plain background, no people, no text or letters anywhere, no frames.`,
      stylePrefix: input.stylePrefix,
    });
    if (!harbor.ok) return retry.imageUrl; // image mandatory: best available
    const v3 = await judgeImageQuality({
      imageUrl: harbor.imageUrl,
      expectedScene: input.imageScene.slice(0, 400),
      passageBody: input.passageBody,
    });
    const unsafe = v3.ok && v3.severity === "fail" && /nudit|naked|safety|inappropriate|suggestive|anatomy/i.test(v3.reason);
    if (unsafe) return retry.imageUrl; // never ship a safety fail; fall back
    return harbor.imageUrl; // image mandatory: harbor ships even on aesthetic warn/fail
  }
  return retry.imageUrl;
}

// Safety preamble for the daily question. Public-facing, mixed-age
// K-4 audience plus parents reading along — must stay neutral and
// kid-appropriate. Hard avoid list keeps the model from drifting
// into edgy "on this day" picks (wars, assassinations, atrocities)
// or political/religious controversy on themed days. Module-scoped
// so the easy-rendition generator shares the exact same rules.
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

Fiction framing (Aug 30 quality rule — "Pip's Space Box" class of failure):
- COMMIT TO THE WORLD: a fiction story lives fully inside its premise (a space squirrel is really in space; a talking crayon really talks). No imagination or pretend-play framing at all — no "in his mind", no "in her imagination", no dream endings, no waking up at the end. Never hedge mid-sentence with constructions like "the box began to shake in his mind". Pretend play as a THEME is fine only if the entire story stays in the real world (a kid plays with a box in the park and it stays a box — the fun is the play, not a fantasy sequence).

When in doubt, pivot to: science, animals, weather, sports, space, helpers, food, gardening, art, music, friendship, kindness.`;

/** Shape stored in daily_questions.easy_variant (jsonb, nullable).
 *  Mirrors the base columns so the reader can swap renditions 1:1. */
export type DailyEasyVariant = {
  passage_title: string;
  passage_body: string;
  audio_url: string | null;
  question_prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  extra_questions: {
    prompt: string;
    choices: string[];
    correct: string;
    hint: string | null;
  }[];
};

/**
 * K-1 "easy rendition" of an existing daily passage: same topic, same
 * true facts (nonfiction) or story beats (fiction), told in 55-85
 * words of short decodable sentences, with 3 K-1 MCQs and its own TTS
 * narration. Reuses the exact generators + QC judges the base
 * rendition uses (with a K-1 level hint).
 *
 * Filip's article-a-day rule applies: this must NEVER block the day.
 * One QC failure regenerates with the judge's feedback folded in; a
 * second failure returns null (base-only day) and logs.
 */
export async function generateEasyRendition(opts: {
  teacherId: string;
  themeLabel: string;
  baseTitle: string;
  baseBody: string;
  dateStr: string;
}): Promise<DailyEasyVariant | null> {
  const { teacherId, baseTitle, baseBody, dateStr } = opts;

  const easyBrief = [
    SAFETY_PREAMBLE,
    "",
    "Below is today's Daily Readee passage, written for 2nd-4th grade readers.",
    "Write an EASY rendition of the SAME topic for kindergarten and 1st grade readers.",
    "",
    "Hard rules for the easy rendition:",
    "- 55-85 words total.",
    "- Short decodable sentences, 8 words or fewer each.",
    "- Simple high-frequency vocabulary a K-1 reader can decode.",
    "- Keep the SAME topic: the same true facts if informational, the same story beats and characters if narrative. Do not invent new facts or new plot.",
    "- You may reuse the base title if it is decodable, or write a simpler one.",
    "",
    `Base passage title: ${baseTitle}`,
    "Base passage:",
    '"""',
    baseBody,
    '"""',
  ].join("\n");

  let feedback = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const passageRes = await generatePassage({
      teacherId,
      topic: feedback ? `${easyBrief}\n\n${feedback}` : easyBrief,
      gradeLevel: "1st",
      phonicsPattern: null,
      lengthLevel: "short",
      trustedSystem: true,
    });
    if (!passageRes.ok) {
      feedback = `IMPORTANT — the previous attempt failed to generate. Try again, following every rule exactly.`;
      continue;
    }
    const easyTitle = passageRes.passage.title;
    const easyBody = passageRes.passage.passage;

    // Deterministic gate before spending judge credits: word window
    // (tolerance around the 55-85 spec) + sentence length.
    const words = easyBody.split(/\s+/).filter(Boolean).length;
    const sentences = easyBody
      .split(/[.!?]+/)
      .map((s) => s.split(/\s+/).filter(Boolean).length)
      .filter((n) => n > 0);
    const longest = sentences.length ? Math.max(...sentences) : 0;
    if (words < 45 || words > 100 || longest > 12) {
      feedback = `IMPORTANT — the previous attempt broke the length rules: ${words} words (need 55-85) with a ${longest}-word sentence (every sentence must be 8 words or fewer). Fix both.`;
      continue;
    }

    // 3 MCQs at K-1 difficulty, grounded in the EASY passage so every
    // answer is literally findable in the text the young reader saw.
    const mcqRes = await generateMCQQuestions({
      teacherId,
      topic: [
        "Generate exactly 3 multiple-choice comprehension questions for kindergarten and 1st grade readers about this passage.",
        "One-line stems in very simple words. Short answer options (1 to 4 words each).",
        "ALL 3 questions must be LITERAL RECALL: who, what, where, or what happened. No inference, no feelings questions, no 'why' or 'how do you know' questions.",
        "Every correct answer must restate exact words from the passage — a child should be able to point to the sentence that says it.",
        "",
        "Passage:",
        '"""',
        easyBody,
        '"""',
      ].join("\n"),
      gradeLevel: "1st",
      count: 3,
      trustedSystem: true,
    });
    if (!mcqRes.ok || mcqRes.questions.length < 3) {
      feedback = `IMPORTANT — the previous attempt could not produce 3 valid questions. Keep the passage concrete so simple recall questions are possible.`;
      continue;
    }

    // Same QC suite the base rendition runs (passage judge + question
    // checks) with the K-1 level hint. No image/audio here — the day
    // shares one image, and TTS runs only after QC passes.
    const qc = await runFullQuizQc({
      teacherId,
      passageTitle: easyTitle,
      passageBody: easyBody,
      gradeLevel: "1st",
      questions: mcqRes.questions.map((q) => ({
        kind: "multiple_choice" as const,
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint ?? null,
      })),
      imageUrl: null,
      imageScene: null,
      audioUrl: null,
    });
    if (qc.overall === "fail") {
      const reasons = (qc.checks ?? [])
        .filter((c: any) => c.severity === "fail")
        .map((c: any) => `${c.name}: ${c.message}`)
        .join(" ");
      console.warn(`[daily] easy rendition QC fail (attempt ${attempt}) ${dateStr}: ${reasons.slice(0, 200)}`);
      feedback = `IMPORTANT — the previous attempt failed quality review: ${reasons} Rewrite the passage so it does not have these issues.`;
      continue;
    }

    // TTS through the same path that produces the base audio_url.
    // A TTS hiccup ships the easy text without audio rather than
    // dropping the rendition.
    let audioUrl: string | null = null;
    const tts = await generateSpeech({ teacherId, text: easyBody.slice(0, 4000) });
    if (tts.ok) audioUrl = tts.audioUrl;
    else console.warn(`[daily] easy rendition TTS failed ${dateStr}: ${tts.error}`);

    const [mainQ, ...extras] = mcqRes.questions;
    return {
      passage_title: easyTitle,
      passage_body: easyBody,
      audio_url: audioUrl,
      question_prompt: mainQ.prompt,
      choices: mainQ.choices,
      correct: mainQ.correct,
      hint: mainQ.hint ?? null,
      extra_questions: extras.map((q) => ({
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint ?? null,
      })),
    };
  }

  trackError(new Error("easy rendition failed twice — base-only day"), {
    route: "daily-question.easy",
    extra: { date: dateStr },
  });
  return null;
}

/**
 * Narrate a daily passage through the standard TTS + storage-upload
 * path and return the public audio_url. For repair scripts that need
 * to re-narrate a hand-edited passage for an existing day without
 * duplicating the pipeline. Does not write the row — the caller
 * decides which column (audio_url / easy_variant.audio_url) to update.
 */
export async function narrateDailyPassage(
  date: Date | string,
  text: string,
): Promise<{ ok: true; audioUrl: string } | { ok: false; error: string }> {
  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
  const dateStr = typeof date === "string" ? date : slugForDate(date);
  const tts = await generateSpeech({ teacherId, text: text.slice(0, 4000) });
  if (!tts.ok) {
    trackError(new Error(`narrateDailyPassage: ${tts.error}`), {
      route: "daily-question.narrate",
      extra: { date: dateStr },
    });
    return { ok: false, error: tts.error };
  }
  return { ok: true, audioUrl: tts.audioUrl };
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
  /** Extra subjects to avoid beyond the 8-week lookback. Rebuild sweeps
   *  pass the WHOLE archive here (the lookback is backward-only, so a
   *  July rebuild can't see August rows and re-collides without this). */
  extraAvoid?: string[];
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
  // Anti-repeat memory. The weekday theme prompts are generic ("an animal
  // kids might not know — e.g., axolotl, narwhal, capybara") and the model,
  // with no memory of what already ran, collapses onto the same few topics:
  // 7 firefly passages, 7 butterfly ("taste with their feet") passages, and
  // exact-duplicate titles a week apart ("A Big Berry Surprise" ran 6/12 AND
  // 7/3). Feeding it the last three weeks of titles forces a genuinely new
  // pick. Best-effort: a query hiccup just means no avoid-list this run.
  let avoidBlock = "";
  try {
    // Look back ~8 weeks (56 rows), NOT 3. The same-weekday theme recurs on a
    // 28-day beat, so a 21-day window never spans a full cycle — that's exactly
    // how "Summer's Loud Bugs" (Jul 23 Thu) and "The Loud Summer Bugs" (Aug 20
    // Thu, 28 days later) both slipped through. 8 weeks always covers 2 cycles.
    // Titles alone hid dupes ("A Long-Ago Call" vs "A New Way to Talk" were
    // both the Bell story; 7 firefly passages shipped under 7 titles). Include
    // each passage's opening so the model sees the actual SUBJECT.
    const { data: recentRows } = await admin
      .from("daily_questions")
      .select("passage_title, passage_body")
      .lt("date", dateStr)
      .order("date", { ascending: false })
      .limit(56);
    const recentSubjects = ((recentRows ?? []) as { passage_title: string | null; passage_body: string | null }[])
      .filter((r) => !!r.passage_title)
      .map((r) => {
        const firstBit = (r.passage_body ?? "").replace(/\s+/g, " ").slice(0, 90);
        return `- ${r.passage_title}${firstBit ? ` (${firstBit}...)` : ""}`;
      });
    for (const extra of opts?.extraAvoid ?? []) recentSubjects.push(`- ${extra}`);
    if (recentSubjects.length) {
      avoidBlock = `\n\nAVOID REPEATS — these SUBJECTS ran in the last two months (title + opening shown). Pick a subject clearly DIFFERENT from every one — different animal, different phenomenon, different story premise. Not a rephrase, not a close cousin, not the same fact under a new title:\n${recentSubjects.join("\n")}`;
    }
  } catch {
    /* best-effort; ship without the avoid-list if the lookup fails */
  }

  const datedTopic = `${SAFETY_PREAMBLE}

Today is ${fullDate} (${monthName} — ${seasonName} in the Northern Hemisphere). Write a passage that feels appropriate for THIS time of year — do not pick a topic from a different season.

${theme.topic}${avoidBlock}`;

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
  //    passages we extract a structured SceneSpec from the passage,
  //    render that into a deterministic brief, AND keep the spec so
  //    the post-build image judge can verify per-character.
  let imageUrl: string | null = null;
  let imageScene: string | null = null;
  let sceneSpec: Awaited<ReturnType<typeof extractSceneSpec>> extends infer R
    ? R extends { ok: true; spec: infer S }
      ? S
      : null
    : null = null as any;
  const resolved = await resolveHistoricalImage(passageTitle, passageBody);
  if (resolved.kind === "royalty_free") {
    const cachedUrl = await cacheWikipediaImageToSupabase(
      resolved.figureName,
      resolved.imageUrl,
    );
    imageUrl = cachedUrl ?? resolved.imageUrl;
    imageScene = `Wikipedia portrait of ${resolved.figureName}`;
  } else {
    // Extract the SceneSpec first. The spec drives the brief AND the
    // post-generation image judge — keeping them on the same checklist
    // is the difference between "image matches some loose interpretation
    // of the passage" and "image contains the specific named species the
    // passage talks about."
    const specRes = await extractSceneSpec({
      teacherId,
      passageTitle,
      passageBody,
    });
    let brief = "";
    if (specRes.ok) {
      sceneSpec = specRes.spec as any;
      brief = renderSpecAsBrief(specRes.spec);
      console.info(`[daily] spec ${dateStr}:`, describeSpec(specRes.spec));
    } else {
      // Spec extraction failed — fall back to the legacy free-form
      // brief generator (now also species-anchored after the May 12
      // tightening). Don't break the build over a single LLM hiccup.
      const briefRes = await generateImageBrief({
        teacherId,
        passageTitle,
        passageBody,
      });
      if (briefRes.ok) brief = briefRes.brief;
    }
    if (brief) {
      const figureGuard =
        resolved.kind === "ai" && resolved.avoidNamedPerson && resolved.figureName
          ? ` Do not depict ${resolved.figureName}'s likeness — show only the activity, era, or setting they're associated with, no recognizable face.`
          : "";
      imageScene = brief + figureGuard;
      // Best-of-3: generate 3 candidates and let a comparative judge
      // pick the winner against the spec. Comparative grading is
      // consistently more accurate than absolute. Falls back to a
      // single generateImage call when we have no spec (concept
      // passages with empty characters[]) because there's nothing
      // to comparatively grade against.
      const stylePrefix = pickImageStyle(theme.label, dateStr, sceneSpec?.genre ?? null);
      if (sceneSpec) {
        const bestRes = await generateBestImage({
          teacherId,
          prompt: imageScene,
          spec: sceneSpec as any,
          n: 3,
          stylePrefix,
        });
        if (bestRes.ok) {
          imageUrl = bestRes.imageUrl;
          console.info(
            `[daily] best-of-${bestRes.candidateCount} ${dateStr}: winner=${bestRes.winnerIndex} runners=${JSON.stringify(bestRes.runnerUpScores)} reason=${bestRes.reason.slice(0, 120)}`,
          );
        }
      } else {
        const imgRes = await generateImage({
          teacherId,
          prompt: imageScene,
          stylePrefix,
        });
        if (imgRes.ok) imageUrl = imgRes.imageUrl;
      }
    }
  }

  // Ship-gate: never publish a sloppy image (retry once, else imageless).
  if (imageUrl && imageScene) {
    imageUrl = await shipGateImage({
      teacherId,
      imageUrl,
      imageScene,
      passageBody,
      stylePrefix: pickImageStyle(theme.label, dateStr, sceneSpec?.genre ?? null),
    });
  }

  // 4) TTS for the passage.
  let audioUrl: string | null = null;
  const ttsRes = await generateSpeech({
    teacherId,
    text: passageBody.slice(0, 1200),
  });
  if (ttsRes.ok) audioUrl = ttsRes.audioUrl;

  // 4.5) Easy rendition (K-1) — a second, easier telling of the same
  //      topic for young readers. Never blocks the day: any failure
  //      stores null and the day ships base-only (article-a-day rule).
  let easyVariant: DailyEasyVariant | null = null;
  try {
    easyVariant = await generateEasyRendition({
      teacherId,
      themeLabel: theme.label,
      baseTitle: passageTitle,
      baseBody: passageBody,
      dateStr,
    });
  } catch (e: any) {
    trackError(e, { route: "daily-question.easy", extra: { date: dateStr } });
  }
  if (!easyVariant) {
    console.warn(`[daily] easy rendition unavailable for ${dateStr} — base-only day`);
  }

  // 5) QC the whole thing — passage + questions + image + audio.
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
    audioUrl,
    sceneSpec,
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
      easy_variant: easyVariant,
      qc_overall: qc.overall,
      qc_report: qc,
      // Phase 4 pre-publish gate: fails are hidden by default.
      // Heal can promote them later.
      published_state: decidePublishState(qc),
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
  /** Skip the stored-QC gate. For sweeps whose (newer, stricter) judge
   *  failed an image the OLD stored qc_report considered fine. */
  force?: boolean;
  /** Override the style prefix (e.g. force illustration style when the
   *  genre-default photoreal reads gross — insect close-ups). */
  stylePrefixOverride?: string;
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
  if (!opts?.force) {
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

  // Extract a fresh SceneSpec for the heal — same anchor the daily
  // builder now uses. Drives both the brief and the comparative
  // best-of-3 pick below.
  const specRes = await extractSceneSpec({
    teacherId,
    passageTitle,
    passageBody,
  });
  const sceneSpec = specRes.ok ? specRes.spec : null;

  let imageScene = "";
  if (sceneSpec) {
    imageScene = renderSpecAsBrief(sceneSpec);
  } else {
    const briefRes = await generateImageBrief({
      teacherId,
      passageTitle,
      passageBody,
    });
    if (!briefRes.ok) return { ok: false, error: `imageBrief: ${briefRes.error}` };
    imageScene = briefRes.brief;
  }

  // Best-of-3 + comparative judge when we have a spec; otherwise the
  // legacy single-shot path. The heal route in particular benefits
  // because the prior image already failed once — sampling more
  // candidates is precisely the right move on a known-bad starting
  // point.
  let newImageUrl: string;
  const healStyle = opts?.stylePrefixOverride ?? pickImageStyle("", dateStr, sceneSpec?.genre ?? null);
  if (sceneSpec) {
    const bestRes = await generateBestImage({
      teacherId,
      prompt: imageScene,
      spec: sceneSpec,
      n: 3,
      stylePrefix: healStyle,
    });
    if (!bestRes.ok) return { ok: false, error: `image: ${bestRes.error}` };
    newImageUrl = bestRes.imageUrl;
  } else {
    const imgRes = await generateImage({ teacherId, prompt: imageScene, stylePrefix: healStyle });
    if (!imgRes.ok) return { ok: false, error: `image: ${imgRes.error}` };
    newImageUrl = imgRes.imageUrl;
  }

  // Re-run image QC on the new image. Legacy prose judge + (when
  // available) the structured per-character checks layered on top.
  const { checks: imageChecks } = await qcImage({
    teacherId,
    imageUrl: newImageUrl,
    expectedScene: imageScene,
  });
  let structuredChecks: typeof imageChecks = [];
  if (sceneSpec) {
    try {
      const sr = await qcImageStructured({
        teacherId,
        imageUrl: newImageUrl,
        spec: sceneSpec,
      });
      structuredChecks = sr.checks;
    } catch (e: any) {
      trackError(e, { route: "targetedImageRegen.structured" });
    }
  }

  // Splice the new image checks into the report (drop all old
  // image.* checks, append the fresh ones — including the
  // structured per-character verdicts).
  const otherChecks = checks.filter((c) => !c.name.startsWith("image."));
  const updatedChecks = [...otherChecks, ...imageChecks, ...structuredChecks];
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
      // Promote back to live if the heal cleared the fails.
      published_state: "live" /* heals never unpublish a day (Filip: article-a-day promise) */,
    })
    .eq("date", dateStr);
  if (updErr) return { ok: false, error: `update: ${updErr.message}` };

  return { ok: true, regenerated: true, newOverall };
}

// ───── Surgical regens (close-the-loop healers) ───────────────────
//
// Pattern: AI catches the issue (qc_report.checks) → AI addresses
// the issue (these regens) → re-judges → ships or escalates. Every
// failure class has a matching surgical fix that preserves the
// already-passing parts of the piece. The May 10 audit found 3
// historical fails — these are the loops that close them.

/**
 * Regenerate just the passage when reading-level fails or fact-check
 * finds a contradiction. The failure reason becomes part of the next
 * prompt so the model knows WHAT to fix. Audio is regenerated to
 * match the new passage; questions are regenerated too (they
 * referenced the old text). Image is preserved (still visually
 * relevant to the topic).
 */
export async function targetedPassageRegen(opts: {
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
      "date, theme, passage_title, passage_body, image_url, audio_url, question_prompt, choices, correct, hint, extra_questions, qc_overall, qc_report",
    )
    .eq("date", dateStr)
    .maybeSingle();
  if (rowErr) return { ok: false, error: `db: ${rowErr.message}` };
  if (!row) return { ok: false, error: `no row for ${dateStr}` };

  const report = (row as any).qc_report ?? null;
  const checks: Array<{ name: string; severity: string; message: string }> =
    Array.isArray(report?.checks) ? report.checks : [];
  const failing = checks.filter((c) => c.severity === "fail");
  // Trigger conditions: reading_level fail, fact_check fail, passage
  // judge fail. Image/audio failures use their own paths.
  const passageFailReasons = failing.filter(
    (c) =>
      c.name === "passage.reading_level" ||
      c.name === "passage.fact_check" ||
      c.name === "passage.judge",
  );
  if (passageFailReasons.length === 0) {
    return {
      ok: true,
      regenerated: false,
      reason: "no passage-level fails to heal",
    };
  }

  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    return { ok: false, error: e.message };
  }

  // Build an enhanced topic that bundles the original theme with the
  // specific failure feedback. Gemini reads the topic line as
  // guidance — wrapping the failure reasons inside the topic lets
  // the next pass treat them as hard constraints without changing
  // the generator signature.
  const theme = String((row as any).theme ?? "");
  const reasons = passageFailReasons.map((c) => `${c.name}: ${c.message}`).join(" ");
  const constraintBlock = [
    `IMPORTANT — the previous attempt at this topic failed quality review:`,
    reasons,
    `Rewrite the passage so it does not have these issues.`,
    `Keep the passage at or below 2nd-grade Flesch-Kincaid (max 3.5).`,
    `Use shorter sentences and simpler vocabulary if reading_level was flagged.`,
    `If fact_check was flagged, only state facts that match Wikipedia's public record.`,
    `If learning_objective was flagged or the passage taught nothing concrete, focus on ONE teachable idea.`,
  ].join(" ");

  const passageRes = await generatePassage({
    teacherId,
    topic: `${theme}. ${constraintBlock}`,
    gradeLevel: "2nd",
    lengthLevel: "short",
    trustedSystem: true,
  });
  if (!passageRes.ok) {
    return { ok: false, error: `passage regen: ${passageRes.error}` };
  }
  const newTitle = passageRes.passage.title;
  const newBody = passageRes.passage.passage;

  // Regen audio to match new passage text. Reuse the storage URL
  // returned by generateSpeech — daily TTS isn't pinned to a
  // canonical path so a fresh URL is fine.
  const ttsRes = await generateSpeech({
    teacherId,
    text: newBody.slice(0, 1200),
  });
  const newAudioUrl = ttsRes.ok ? ttsRes.audioUrl : (row as any).audio_url;

  // Regen the 3 MCQs against the new passage.
  const mcqRes = await generateMCQQuestions({
    teacherId,
    topic: `Generate exactly 3 comprehension questions about this passage. Mix one main-idea question, one inference question, and one literal-recall question — not all recall.\n\nPassage:\n${newBody}`,
    gradeLevel: "2nd",
    count: 3,
    trustedSystem: true,
  });
  if (!mcqRes.ok) {
    return { ok: false, error: `mcq regen: ${mcqRes.error}` };
  }
  const [main, ...extras] = mcqRes.questions;

  // The easy rendition mirrors the base passage — a healed base can
  // change subject entirely, so regenerate the K-1 rendition from the
  // new body. Failure stores null (base-only day), never blocks the heal.
  let newEasy: DailyEasyVariant | null = null;
  try {
    newEasy = await generateEasyRendition({
      teacherId,
      themeLabel: theme,
      baseTitle: newTitle,
      baseBody: newBody,
      dateStr,
    });
  } catch (e: any) {
    trackError(e, { route: "daily-question.easy.heal", extra: { date: dateStr } });
  }

  // Re-derive the image scene from the NEW passage so the post-heal
  // QC actually judges the (reused) image against the (rewritten)
  // text. Previously we passed imageScene: null which silently
  // skipped the image judge inside runFullQuizQc — that's how the
  // May 12 "wtf animal" row went live: passage was healed, image
  // was never re-judged against the new passage, mismatch shipped.
  // Aug 25 hardening: judging alone still shipped a squirrel passage
  // with a pangolin image (mismatch scored warn, and warns publish).
  // After this heal returns, the caller-visible fix is chained below:
  // any image.* warn/fail in the post-heal QC triggers an image regen
  // from the new passage.
  let postHealImageScene: string | null = null;
  const newBriefRes = await generateImageBrief({
    teacherId,
    passageTitle: newTitle,
    passageBody: newBody,
  });
  if (newBriefRes.ok) postHealImageScene = newBriefRes.brief;

  // Re-run full QC against the new passage + new questions + reused
  // image + new audio.
  const qc = await runFullQuizQc({
    teacherId,
    passageTitle: newTitle,
    passageBody: newBody,
    gradeLevel: "2nd",
    questions: [
      {
        kind: "multiple_choice" as const,
        prompt: main.prompt,
        choices: main.choices,
        correct: main.correct,
        hint: main.hint ?? null,
      },
      ...extras.map((q) => ({
        kind: "multiple_choice" as const,
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint ?? null,
      })),
    ],
    imageUrl: (row as any).image_url ?? null,
    imageScene: postHealImageScene,
    audioUrl: newAudioUrl,
  });

  const { error: updErr } = await admin
    .from("daily_questions")
    .update({
      passage_title: newTitle,
      passage_body: newBody,
      audio_url: newAudioUrl,
      question_prompt: main.prompt,
      choices: main.choices,
      correct: main.correct,
      hint: main.hint ?? null,
      extra_questions: extras.length > 0 ? extras : null,
      easy_variant: newEasy,
      qc_overall: qc.overall,
      qc_report: { ...qc, healedFrom: passageFailReasons.map((c) => c.name) },
      published_state: decidePublishState(qc),
    })
    .eq("date", dateStr);
  if (updErr) return { ok: false, error: `update: ${updErr.message}` };

  // Aug 25: a rewritten passage can change SUBJECT (reading-level heal turned
  // a pangolin fact page into a squirrel story while keeping the pangolin
  // image). If the post-heal QC flags the reused image at all, chain an
  // image regen from the NEW passage so text and art always match.
  const imageFlagged = (qc.checks ?? []).some(
    (c: any) => String(c.name ?? "").startsWith("image.") && c.severity !== "pass",
  );
  if (imageFlagged) {
    const chained = await targetedImageRegen({ date, force: true });
    console.info(
      `[daily] passage-heal chained image regen ${dateStr}:`,
      JSON.stringify(chained).slice(0, 120),
    );
  }

  return { ok: true, regenerated: true, newOverall: qc.overall };
}

/**
 * Regenerate just the 3 MCQs when learning-objective fails because
 * the questions are all pure recall. Passage + image + audio are
 * preserved. The failure reason carries the model's diagnosis of the
 * passage's teachable point, which we feed back as the explicit
 * objective so the new questions hit it.
 */
export async function targetedQuestionsRegen(opts: {
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
      "date, passage_title, passage_body, image_url, audio_url, qc_overall, qc_report",
    )
    .eq("date", dateStr)
    .maybeSingle();
  if (rowErr) return { ok: false, error: `db: ${rowErr.message}` };
  if (!row) return { ok: false, error: `no row for ${dateStr}` };

  const report = (row as any).qc_report ?? null;
  const checks: Array<{ name: string; severity: string; message: string }> =
    Array.isArray(report?.checks) ? report.checks : [];
  const loFail = checks.find(
    (c) => c.name === "lesson.learning_objective" && c.severity === "fail",
  );
  // Allow healing warn-tier learning-objective too — the May 10
  // audit had several rows with the warn pattern (Foxy, baby birds,
  // spring poem) where questions were all recall.
  const loWarn = checks.find(
    (c) => c.name === "lesson.learning_objective" && c.severity === "warn",
  );
  const lo = loFail ?? loWarn;
  if (!lo) {
    return {
      ok: true,
      regenerated: false,
      reason: "no learning_objective issue to heal",
    };
  }

  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    return { ok: false, error: e.message };
  }

  const passageTitle = (row as any).passage_title as string;
  const passageBody = (row as any).passage_body as string;
  const mcqRes = await generateMCQQuestions({
    teacherId,
    topic: [
      `Generate exactly 3 reading-comprehension questions about this passage.`,
      `Mix question types: one main-idea question, one inference / cause-effect question, one literal-recall question.`,
      `Avoid trivial recall on all three — earlier attempt was flagged: ${lo.message}`,
      ``,
      `Passage title: ${passageTitle}`,
      ``,
      `Passage:`,
      passageBody,
    ].join("\n"),
    gradeLevel: "2nd",
    count: 3,
    trustedSystem: true,
  });
  if (!mcqRes.ok) return { ok: false, error: `mcq regen: ${mcqRes.error}` };
  const [main, ...extras] = mcqRes.questions;

  // Re-derive imageScene from the (unchanged) passage so the post-heal
  // QC re-judges the existing image instead of skipping the image
  // check. Same fix as targetedPassageRegen — without this the image
  // never gets validated after a questions heal.
  let postHealImageScene: string | null = null;
  const briefForQc = await generateImageBrief({
    teacherId,
    passageTitle,
    passageBody,
  });
  if (briefForQc.ok) postHealImageScene = briefForQc.brief;

  const qc = await runFullQuizQc({
    teacherId,
    passageTitle,
    passageBody,
    gradeLevel: "2nd",
    questions: [
      {
        kind: "multiple_choice" as const,
        prompt: main.prompt,
        choices: main.choices,
        correct: main.correct,
        hint: main.hint ?? null,
      },
      ...extras.map((q) => ({
        kind: "multiple_choice" as const,
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint ?? null,
      })),
    ],
    imageUrl: (row as any).image_url ?? null,
    imageScene: postHealImageScene,
    audioUrl: (row as any).audio_url ?? null,
  });

  const { error: updErr } = await admin
    .from("daily_questions")
    .update({
      question_prompt: main.prompt,
      choices: main.choices,
      correct: main.correct,
      hint: main.hint ?? null,
      extra_questions: extras.length > 0 ? extras : null,
      qc_overall: qc.overall,
      qc_report: { ...qc, healedFrom: ["lesson.learning_objective"] },
      published_state: decidePublishState(qc),
    })
    .eq("date", dateStr);
  if (updErr) return { ok: false, error: `update: ${updErr.message}` };

  // Aug 25: a rewritten passage can change SUBJECT (reading-level heal turned
  // a pangolin fact page into a squirrel story while keeping the pangolin
  // image). If the post-heal QC flags the reused image at all, chain an
  // image regen from the NEW passage so text and art always match.
  const imageFlagged = (qc.checks ?? []).some(
    (c: any) => String(c.name ?? "").startsWith("image.") && c.severity !== "pass",
  );
  if (imageFlagged) {
    const chained = await targetedImageRegen({ date, force: true });
    console.info(
      `[daily] passage-heal chained image regen ${dateStr}:`,
      JSON.stringify(chained).slice(0, 120),
    );
  }

  return { ok: true, regenerated: true, newOverall: qc.overall };
}

/**
 * Regenerate just the TTS audio when audio.judge fails. Keeps
 * passage + image + questions intact. Cheapest possible surgical
 * fix — single TTS call + single audio judge. Closes the last loop
 * in autoHealDaily: pre-this, audio fails forced a full rebuild.
 */
export async function targetedAudioRegen(opts: {
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
    .select("date, passage_body, audio_url, qc_overall, qc_report")
    .eq("date", dateStr)
    .maybeSingle();
  if (rowErr) return { ok: false, error: `db: ${rowErr.message}` };
  if (!row) return { ok: false, error: `no row for ${dateStr}` };

  const report = (row as any).qc_report ?? null;
  const checks: Array<{ name: string; severity: string; message: string }> =
    Array.isArray(report?.checks) ? report.checks : [];
  const audioFails = checks.filter(
    (c) => c.severity === "fail" && c.name.startsWith("audio."),
  );
  if (audioFails.length === 0) {
    return { ok: true, regenerated: false, reason: "no audio fails to heal" };
  }

  let teacherId: string;
  try {
    teacherId = systemTeacherId();
  } catch (e: any) {
    return { ok: false, error: e.message };
  }

  const passageBody = (row as any).passage_body as string;
  const tts = await generateSpeech({
    teacherId,
    text: passageBody.slice(0, 1200),
  });
  if (!tts.ok) return { ok: false, error: `tts: ${tts.error}` };
  const newAudioUrl = tts.audioUrl;

  // Re-judge just the new audio. Splice the result into the existing
  // qc_report so we don't re-run the whole 12-check suite for a
  // single-asset fix.
  const { qcAudio } = await import("@/lib/ai/qc");
  const { checks: newAudio } = await qcAudio({
    audioUrl: newAudioUrl,
    expectedText: passageBody,
  });
  const otherChecks = checks.filter((c) => !c.name.startsWith("audio."));
  const merged = [...otherChecks, ...newAudio];
  const worst = merged.reduce(
    (acc, c) =>
      Math.max(acc, c.severity === "fail" ? 2 : c.severity === "warn" ? 1 : 0),
    0,
  );
  const newOverall = worst === 2 ? "fail" : worst === 1 ? "warn" : "pass";

  const updatedReport = {
    ...(report ?? {}),
    checks: merged,
    overall: newOverall,
    targetedAudioRegenAt: new Date().toISOString(),
  };

  const { error: updErr } = await admin
    .from("daily_questions")
    .update({
      audio_url: newAudioUrl,
      qc_overall: newOverall,
      qc_report: updatedReport,
      published_state: "live" /* heals never unpublish a day (Filip: article-a-day promise) */,
    })
    .eq("date", dateStr);
  if (updErr) return { ok: false, error: `update: ${updErr.message}` };

  return { ok: true, regenerated: true, newOverall };
}

/**
 * Auto-heal dispatcher. Reads the current row's qc_report, classifies
 * every failing check, and runs the matching surgical regen in
 * order: image first (cheap, no downstream effects), then questions
 * (cheap, doesn't disturb passage), then passage (full re-cascade).
 *
 * This is the "AI catches → AI addresses" loop Filip wants:
 * - reading_level fail OR fact_check fail → targetedPassageRegen
 * - learning_objective fail/warn → targetedQuestionsRegen
 * - image.* fail → targetedImageRegen
 * - audio.* fail → targetedAudioRegen
 *
 * Returns { ok, healed: string[], newOverall } describing what was
 * fixed and where we landed.
 */
export async function autoHealDaily(opts: {
  date?: Date;
}): Promise<
  | { ok: true; healed: string[]; newOverall: string }
  | { ok: false; error: string }
> {
  const date = opts?.date ?? new Date();
  const dateStr = slugForDate(date);
  const admin = supabaseAdmin();

  // Confirm a row exists for the requested date before invoking the
  // loop. The loop reads findings from the row's qc_report.
  const { data: rowCheck, error: rowErr } = await admin
    .from("daily_questions")
    .select("qc_overall")
    .eq("date", dateStr)
    .maybeSingle();
  if (rowErr) return { ok: false, error: `db: ${rowErr.message}` };
  if (!rowCheck) return { ok: false, error: `no row for ${dateStr}` };

  // refreshFindings: read the latest qc_report.checks. The targeted
  // regen functions persist a new qc_report on each successful run,
  // so the loop sees fresh state every iteration.
  async function refreshFindings(): Promise<Finding[]> {
    const { data } = await admin
      .from("daily_questions")
      .select("qc_report")
      .eq("date", dateStr)
      .maybeSingle();
    const checks: any[] = Array.isArray((data as any)?.qc_report?.checks)
      ? (data as any).qc_report.checks
      : [];
    return checks.map((c) => ({
      name: c.name,
      severity: c.severity,
      message: c.message,
    }));
  }

  // Ordered healers — image first (cheapest, no cascade), then
  // passage (cascades into audio + questions), then audio standalone,
  // then questions standalone. The loop runs ONE healer per attempt
  // and re-checks, so a single passage regen that also clears the
  // image finding won't trigger the image healer again.
  const healers: Healer[] = [
    {
      name: "image",
      matches: (f) => f.name.startsWith("image.") && f.severity === "fail",
      heal: async () => {
        const r = await targetedImageRegen({ date });
        return { ok: r.ok, ran: r.ok && (r as any).regenerated };
      },
    },
    {
      name: "passage",
      matches: (f) =>
        (f.name === "passage.reading_level" ||
          f.name === "passage.fact_check" ||
          f.name === "passage.judge") &&
        f.severity === "fail",
      heal: async () => {
        const r = await targetedPassageRegen({ date });
        return { ok: r.ok, ran: r.ok && (r as any).regenerated };
      },
    },
    {
      name: "audio",
      matches: (f) => f.name.startsWith("audio.") && f.severity === "fail",
      heal: async () => {
        const r = await targetedAudioRegen({ date });
        return { ok: r.ok, ran: r.ok && (r as any).regenerated };
      },
    },
    {
      name: "questions",
      matches: (f) =>
        f.name === "lesson.learning_objective" && f.severity === "fail",
      heal: async () => {
        const r = await targetedQuestionsRegen({ date });
        return { ok: r.ok, ran: r.ok && (r as any).regenerated };
      },
    },
  ];

  const result = await runAutoHealLoop({
    contentType: "daily_question",
    contentId: dateStr,
    refreshFindings,
    healers,
    maxAttempts: 4,
  });

  // Read final overall after the loop so the existing return shape
  // stays the same. Callers (cron + ops scripts) still see what they
  // expect.
  const { data: postRow } = await admin
    .from("daily_questions")
    .select("qc_overall")
    .eq("date", dateStr)
    .maybeSingle();
  const newOverall = (postRow as any)?.qc_overall ?? "fail";

  return {
    ok: true,
    healed: result.healerSequence.map((h) => `${h}→${newOverall}`),
    newOverall,
  };
}
