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
import { qcImageStructured } from "@/lib/ai/qc-scene";
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

  // Re-derive the image scene from the NEW passage so the post-heal
  // QC actually judges the (reused) image against the (rewritten)
  // text. Previously we passed imageScene: null which silently
  // skipped the image judge inside runFullQuizQc — that's how the
  // May 12 "wtf animal" row went live: passage was healed, image
  // was never re-judged against the new passage, mismatch shipped.
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
      qc_overall: qc.overall,
      qc_report: { ...qc, healedFrom: passageFailReasons.map((c) => c.name) },
    })
    .eq("date", dateStr);
  if (updErr) return { ok: false, error: `update: ${updErr.message}` };

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
    })
    .eq("date", dateStr);
  if (updErr) return { ok: false, error: `update: ${updErr.message}` };

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
  const healed: string[] = [];

  // Initial state
  const { data: row, error: rowErr } = await admin
    .from("daily_questions")
    .select("qc_overall, qc_report")
    .eq("date", dateStr)
    .maybeSingle();
  if (rowErr) return { ok: false, error: `db: ${rowErr.message}` };
  if (!row) return { ok: false, error: `no row for ${dateStr}` };

  let report = (row as any).qc_report ?? null;
  let overall = (row as any).qc_overall as string;
  const classify = () => {
    const checks: Array<{ name: string; severity: string }> = Array.isArray(
      report?.checks,
    )
      ? report.checks
      : [];
    return {
      imageFail: checks.some(
        (c) => c.name.startsWith("image.") && c.severity === "fail",
      ),
      audioFail: checks.some(
        (c) => c.name.startsWith("audio.") && c.severity === "fail",
      ),
      passageFail: checks.some(
        (c) =>
          (c.name === "passage.reading_level" ||
            c.name === "passage.fact_check" ||
            c.name === "passage.judge") &&
          c.severity === "fail",
      ),
      questionsBad: checks.some(
        (c) =>
          c.name === "lesson.learning_objective" &&
          (c.severity === "fail" || c.severity === "warn"),
      ),
    };
  };

  // Round-trip helper — read fresh report after each surgical fix.
  const refresh = async () => {
    const { data: r2 } = await admin
      .from("daily_questions")
      .select("qc_overall, qc_report")
      .eq("date", dateStr)
      .maybeSingle();
    report = (r2 as any)?.qc_report ?? null;
    overall = (r2 as any)?.qc_overall ?? overall;
  };

  // Image first — cheapest, no cascading effects.
  if (classify().imageFail) {
    const r = await targetedImageRegen({ date });
    if (r.ok && r.regenerated) {
      healed.push(`image→${r.newOverall}`);
      await refresh();
    }
  }

  // Passage next — drives audio + questions, so we do it before
  // touching questions independently.
  if (classify().passageFail) {
    const r = await targetedPassageRegen({ date });
    if (r.ok && r.regenerated) {
      healed.push(`passage→${r.newOverall}`);
      await refresh();
    }
  }

  // Audio — only fires if passage was OK (passage cascade already
  // re-generates audio when it fires). Catches the case where the
  // passage was clean but TTS rendered garbled / wrong-text audio.
  if (classify().audioFail) {
    const r = await targetedAudioRegen({ date });
    if (r.ok && r.regenerated) {
      healed.push(`audio→${r.newOverall}`);
      await refresh();
    }
  }

  // Questions last — only fires if passage was OK or already healed.
  // The targeted passage regen already regenerates questions, so this
  // step only catches the case where passage was fine but the MCQs
  // were the problem.
  if (classify().questionsBad) {
    const r = await targetedQuestionsRegen({ date });
    if (r.ok && r.regenerated) {
      healed.push(`questions→${r.newOverall}`);
      await refresh();
    }
  }

  return { ok: true, healed, newOverall: overall };
}
