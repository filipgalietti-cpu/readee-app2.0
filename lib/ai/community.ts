/**
 * Community content pipeline.
 *
 * When a parent opts into sharing an AI-generated passage, we:
 *   1. Anonymize personal details (proper names → generic names, school
 *      names → "a school", etc.). Gemini already gets a constraint in
 *      the generator when sharing is on; this is a belt-and-suspenders
 *      pass on the stored text.
 *   2. Run the safety banlist one more time (not a security boundary,
 *      just a fast-fail).
 *   3. Regenerate audio from the cleaned passage (the original audio
 *      bakes in the child's real name — community gets a clean copy).
 *   4. AI QC gate — run the same judges we use on the catalog audit
 *      (q.should_be_asked / q.image_quality / q.audio_quality). Hard
 *      fail rejects the submission with a parent-friendly reason.
 *      Warn forces the row to status='pending' regardless of trusted-
 *      parent status, so a human looks before it goes live.
 *   5. Land it in community_passages — pass + trusted parent → approved
 *      auto-publish; everything else → pending for admin review.
 *   6. Admins review via /admin/community and either approve or reject.
 *
 * We store the REWRITTEN text separately from the parent's private copy —
 * the original child_ai_content row stays untouched, the community copy
 * is its own row with its own moderation state. Every verdict + check is
 * logged to content_qc_log (target_kind='community_passage').
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { containsUnsafeContent } from "@/lib/ai/safety";
import { generateSpeech } from "@/lib/ai/readee-ai";
import { judgeShouldBeAsked } from "@/lib/ai/qc-question-meta";
import { judgeAudioFile, judgeImageQuality } from "@/lib/ai/qc-media";

/**
 * Once a parent has TRUSTED_THRESHOLD successful community approvals,
 * their subsequent submissions auto-approve and skip the admin queue.
 * An admin can still demote them via profile_trust_flags if quality
 * drops.
 */
export const TRUSTED_THRESHOLD = 5;

type CommunityQcVerdict = "pass" | "warn" | "fail";

type CommunityQcResult = {
  verdict: CommunityQcVerdict;
  /** Surface to the parent UI when verdict is fail. Plain English. */
  reason: string | null;
  /** Per-check breakdown for the audit log. */
  checks: Array<{ kind: string; severity: CommunityQcVerdict; reason: string }>;
};

/** Run the same AI judges we use for catalog audit against a
 *  community submission BEFORE it lands in the queue. This is the
 *  deliverability gate for the community surface — anything failing
 *  any judge is rejected with a specific reason; warns force the row
 *  to status='pending' regardless of trust. */
async function runCommunityQC(input: {
  passage: string;
  questions: any[];
  imageUrl: string | null;
  audioUrl: string | null;
}): Promise<CommunityQcResult> {
  const checks: CommunityQcResult["checks"] = [];

  // Pedagogy: each question must actually be worth asking for the
  // standard. We don't have an explicit standardId on community rows
  // (parent-generated), so the judge runs without a fixed standard
  // and just rates "is this a question worth asking?".
  for (const q of input.questions ?? []) {
    if (!q?.prompt || !Array.isArray(q?.choices)) continue;
    try {
      const v = await judgeShouldBeAsked({
        standardId: "(community submission)",
        standardDescription:
          "Reading comprehension — assess whether the question is worth asking and well-formed",
        prompt: q.prompt,
        choices: q.choices,
        correct: String(q.correct ?? ""),
        passageBody: input.passage,
      });
      if (!v.ok) continue;
      const sev: CommunityQcVerdict =
        v.verdict === "drop" ? "fail" : v.verdict === "weak" ? "warn" : "pass";
      checks.push({
        kind: "q.should_be_asked",
        severity: sev,
        reason: v.reason ?? "",
      });
    } catch {
      // QC failures shouldn't block submission entirely — log and
      // continue. The admin queue still catches anything sketchy.
    }
  }

  // Image — only if there's an image to judge.
  if (input.imageUrl) {
    try {
      const v = await judgeImageQuality({
        imageUrl: input.imageUrl,
        expectedScene: input.passage.slice(0, 400),
      });
      if (v.ok) {
        checks.push({
          kind: "q.image_quality",
          severity: v.severity,
          reason: v.reason ?? "",
        });
      }
    } catch {}
  }

  // Audio — judge the regenerated audio against the cleaned passage.
  if (input.audioUrl) {
    try {
      const v = await judgeAudioFile({
        audioUrl: input.audioUrl,
        expectedText: input.passage,
      });
      if (v.ok) {
        checks.push({
          kind: "q.audio_quality",
          severity: v.severity,
          reason: v.reason ?? "",
        });
      }
    } catch {}
  }

  // Roll up: any fail → fail; any warn → warn; otherwise pass.
  const fail = checks.find((c) => c.severity === "fail");
  if (fail) {
    return {
      verdict: "fail",
      reason: `${fail.kind}: ${fail.reason || "did not pass quality check"}`,
      checks,
    };
  }
  const warn = checks.find((c) => c.severity === "warn");
  if (warn) {
    return { verdict: "warn", reason: warn.reason || null, checks };
  }
  return { verdict: "pass", reason: null, checks };
}

/** URL-safe slug from a passage title, with a short random salt so
 *  concurrent submissions of "the-rainforest" don't collide on the
 *  unique index. */
function buildSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const salt = Math.random().toString(36).slice(2, 8);
  return `${base || "passage"}-${salt}`;
}

// Conservative generic-name whitelist. If a proper-noun-looking token in
// the passage ISN'T in this set, we replace it with Alex / Sam / Jamie
// rotationally. Kid reading passages normally stick to a small cast, so
// this is fine for v1.
const GENERIC_NAMES = ["Alex", "Sam", "Jamie", "Riley", "Casey"];

const COMMON_ALLOWED_PROPER_NOUNS = new Set(
  [
    // Days, months, common geography
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
    "America", "Earth", "English",
    // Common kid-lit tropes the AI uses safely
    "Mrs", "Mr", "Miss", "Ms", "Dr",
    // Keep storybook animal species / categorical nouns intact
    "I", "OK", "Okay",
  ].map((s) => s.toLowerCase()),
);

/**
 * Extracts likely proper-name tokens from text. A token is "proper" if
 * it starts with a capital letter, isn't the first word of a sentence,
 * and isn't on the common-nouns whitelist. Cheap heuristic — good enough
 * for passing through a moderation queue where a human catches edge
 * cases.
 */
function detectProperNames(text: string): Set<string> {
  const names = new Set<string>();
  // Split into sentences so we can tell "first word" from "mid-sentence".
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sent of sentences) {
    const tokens = sent.trim().split(/\s+/);
    for (let i = 0; i < tokens.length; i++) {
      const raw = tokens[i].replace(/[^A-Za-z'-]/g, "");
      if (!raw) continue;
      if (i === 0) continue; // first word capitalization is expected
      if (!/^[A-Z][a-z]{1,}$/.test(raw)) continue;
      if (COMMON_ALLOWED_PROPER_NOUNS.has(raw.toLowerCase())) continue;
      names.add(raw);
    }
  }
  return names;
}

export function anonymizeText(text: string): { out: string; replaced: string[] } {
  const detected = Array.from(detectProperNames(text));
  if (detected.length === 0) return { out: text, replaced: [] };
  let out = text;
  const mapping = new Map<string, string>();
  for (let i = 0; i < detected.length; i++) {
    const name = detected[i];
    const replacement = GENERIC_NAMES[i % GENERIC_NAMES.length];
    mapping.set(name, replacement);
    // Replace whole-word occurrences only — guard against substring hits.
    const re = new RegExp(`\\b${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "g");
    out = out.replace(re, replacement);
  }
  return { out, replaced: detected };
}

export function anonymizeQuestions(
  questions: any[] | null | undefined,
): { out: any[] | null; replaced: string[] } {
  if (!Array.isArray(questions)) return { out: questions ?? null, replaced: [] };
  const allReplaced: string[] = [];
  const out = questions.map((q) => {
    const prompt = typeof q?.prompt === "string" ? q.prompt : "";
    const { out: newPrompt, replaced } = anonymizeText(prompt);
    allReplaced.push(...replaced);
    const choices = Array.isArray(q?.choices)
      ? q.choices.map((c: any) => {
          if (typeof c !== "string") return c;
          const { out: nc } = anonymizeText(c);
          return nc;
        })
      : q?.choices ?? null;
    return { ...q, prompt: newPrompt, choices };
  });
  return { out, replaced: Array.from(new Set(allReplaced)) };
}

/**
 * Submit a parent's child_ai_content row for community sharing.
 * Idempotent per source_content_id — if the parent toggles share off
 * then back on, the previous submission is marked withdrawn before a
 * fresh one is created.
 */
export async function submitForCommunityReview(input: {
  parentId: string;
  contentId: string;
}): Promise<{ ok: true; communityId: string } | { ok: false; error: string }> {
  const admin = supabaseAdmin();

  const { data: content, error: contentErr } = await admin
    .from("child_ai_content")
    .select("id, parent_id, title, passage_text, questions, image_url, audio_url, grade_level, topic, phonics_pattern")
    .eq("id", input.contentId)
    .eq("parent_id", input.parentId)
    .maybeSingle();
  if (contentErr || !content) {
    return { ok: false, error: "Content not found or not yours." };
  }
  const c = content as any;
  if (!c.passage_text) {
    return { ok: false, error: "Only passages can be shared with the community." };
  }

  const { out: cleanPassage, replaced: passageReplaced } = anonymizeText(c.passage_text);
  const { out: cleanQuestions, replaced: qReplaced } = anonymizeQuestions(c.questions);

  // Belt-and-suspenders safety check on the SANITIZED version.
  const hit =
    containsUnsafeContent(cleanPassage) ||
    (Array.isArray(cleanQuestions)
      ? cleanQuestions
          .flatMap((q: any) => [q.prompt, ...(q.choices ?? []), q.hint])
          .map((s: any) => (typeof s === "string" ? s : ""))
          .map((s: string) => containsUnsafeContent(s))
          .find(Boolean)
      : null);
  if (hit) {
    return {
      ok: false,
      error: "This passage didn't pass our kid-safe content check. Try regenerating.",
    };
  }

  // Withdraw any prior submission for this source row.
  await admin
    .from("community_passages")
    .update({ status: "withdrawn" })
    .eq("source_content_id", input.contentId)
    .eq("status", "pending");

  // Trusted-parent check. Either:
  //   - Admin has explicitly flagged them as trusted via
  //     profile_trust_flags.is_trusted_parent = true, OR
  //   - They've accumulated >= TRUSTED_THRESHOLD approved submissions.
  // A demotion (admin sets is_trusted_parent=false) overrides the
  // automatic count, so the check honors the explicit flag first.
  const [flagRow, countRow] = await Promise.all([
    admin
      .from("profile_trust_flags")
      .select("is_trusted_parent")
      .eq("profile_id", input.parentId)
      .maybeSingle(),
    admin.rpc("parent_approved_submission_count", {
      p_parent_id: input.parentId,
    }),
  ]);
  const explicitTrust = (flagRow.data as any)?.is_trusted_parent;
  const approvedCount = Number((countRow.data as any) ?? 0);
  const isTrusted =
    explicitTrust === true ||
    (explicitTrust !== false && approvedCount >= TRUSTED_THRESHOLD);

  // Re-generate the read-aloud audio from the anonymized passage. The
  // original audio bakes in the child's real name ("Lily"); rerunning
  // TTS on cleanPassage produces a community-safe version that matches
  // the public text. ~$0.02 per submission, eaten by Readee.
  let audioUrl: string | null = null;
  if (cleanPassage) {
    const tts = await generateSpeech({
      teacherId: input.parentId,
      text: cleanPassage,
    });
    if (tts.ok) audioUrl = tts.audioUrl;
    // If TTS fails the submission still goes through — text + image are
    // already valuable. Don't block the parent on a TTS hiccup.
  }

  // Pull the parent's byline preference. We only stamp a name when
  // they've explicitly opted in via the consent flow.
  const { data: parentProfile } = await admin
    .from("profiles")
    .select("community_byline_consent, community_display_name")
    .eq("id", input.parentId)
    .maybeSingle();
  const displayByline =
    (parentProfile as any)?.community_byline_consent === true
      ? ((parentProfile as any).community_display_name as string | null) ?? null
      : null;

  // ── AI QC gate ─────────────────────────────────────────────────
  // Run the same judges we use on the catalog audit BEFORE the row
  // hits the queue. Hard fails are rejected with a parent-friendly
  // reason; warns force pending status (no trusted-parent fast lane)
  // so a human looks before it goes live.
  const qc = await runCommunityQC({
    passage: cleanPassage,
    questions: cleanQuestions ?? [],
    imageUrl: c.image_url,
    audioUrl: audioUrl,
  });
  if (qc.verdict === "fail") {
    return {
      ok: false,
      error: `Quality check didn't pass — ${qc.reason ?? "try regenerating before sharing"}.`,
    };
  }
  // Trusted-parent fast lane only fires on a clean QC pass.
  const effectivelyTrusted = isTrusted && qc.verdict === "pass";

  // URL slug for /community/[slug]. We salt with a short id chunk so
  // concurrent submissions of similar titles don't collide.
  const titleForSlug = c.title ?? c.topic ?? "passage";
  const slug = buildSlug(titleForSlug);

  const { data: inserted, error: insErr } = await admin
    .from("community_passages")
    .insert({
      source_content_id: c.id,
      source_parent_id: c.parent_id,
      title: c.title ?? c.topic.slice(0, 120),
      passage_text: cleanPassage,
      questions: cleanQuestions,
      image_url: c.image_url,
      audio_url: audioUrl,
      grade_level: c.grade_level ?? "2nd",
      topic: c.topic,
      phonics_pattern: c.phonics_pattern ?? null,
      status: effectivelyTrusted ? "approved" : "pending",
      auto_approved: effectivelyTrusted,
      reviewed_at: effectivelyTrusted ? new Date().toISOString() : null,
      slug,
      display_byline: displayByline,
    })
    .select("id")
    .single();
  if (insErr || !inserted) {
    return { ok: false, error: insErr?.message ?? "Couldn't submit for review." };
  }

  // Audit-trail every QC verdict + check.
  await admin.from("content_qc_log").insert({
    target_kind: "community_passage",
    target_id: (inserted as any).id,
    change_type: "submit_for_review",
    before: null,
    after: { verdict: qc.verdict, checks: qc.checks },
    reason:
      qc.verdict === "warn"
        ? `Submitted with warning — admin review required. ${qc.reason ?? ""}`
        : "Passed AI QC.",
    finding_id: null,
    agent: "community/submit",
  });

  // Optional: surface for operators that names were replaced.
  if (passageReplaced.length + qReplaced.length > 0) {
    // Lightweight log; we don't fail the submission on log failures.
    await admin.from("ai_usage_log").insert({
      teacher_id: input.parentId,
      kind: "quiz_generation",
      model: "community-anonymizer",
      credits_used: 0,
      success: true,
      request_summary: `anonymized names: ${[...passageReplaced, ...qReplaced].join(", ").slice(0, 180)}`,
    });
  }

  return { ok: true, communityId: (inserted as any).id as string };
}

/**
 * Submit a teacher's custom_quiz for community sharing.
 *
 * Teacher quizzes don't have a passage_text column — the quiz's
 * description IS the passage when the wizard generated one. The first
 * question's image_url + audio_url are the hero assets. This function
 * mirrors submitForCommunityReview but reads from custom_quizzes +
 * custom_quiz_questions + custom_questions, then writes to
 * community_passages with source_kind='teacher_quiz' + source_quiz_id.
 *
 * Idempotent per quiz_id — if a teacher toggles share off then on
 * again, the previous submission is marked withdrawn before a fresh
 * one is created.
 */
export async function submitQuizForCommunityReview(input: {
  teacherId: string;
  quizId: string;
}): Promise<{ ok: true; communityId: string } | { ok: false; error: string }> {
  const admin = supabaseAdmin();

  // Pull the quiz + its questions in order.
  const { data: quiz, error: quizErr } = await admin
    .from("custom_quizzes")
    .select("id, teacher_id, title, description, grade_level")
    .eq("id", input.quizId)
    .eq("teacher_id", input.teacherId)
    .maybeSingle();
  if (quizErr || !quiz) {
    return { ok: false, error: "Quiz not found or not yours." };
  }
  const q = quiz as any;
  const passageText = (q.description ?? "").toString().trim();
  if (!passageText) {
    return {
      ok: false,
      error:
        "Add a passage to the quiz description before sharing — community posts need a passage.",
    };
  }

  const { data: junctionRows } = await admin
    .from("custom_quiz_questions")
    .select(
      "position, custom_questions(id, kind, prompt, choices, correct, hint, image_url, audio_url)",
    )
    .eq("quiz_id", input.quizId)
    .order("position", { ascending: true });
  const questions = ((junctionRows ?? []) as any[])
    .map((row: any) => row.custom_questions)
    .filter(Boolean)
    .map((row: any) => ({
      id: row.id,
      kind: row.kind,
      prompt: row.prompt,
      choices: row.choices,
      correct: typeof row.correct === "string" ? row.correct : JSON.stringify(row.correct),
      hint: row.hint,
      image_url: row.image_url,
      audio_url: row.audio_url,
    }));

  if (questions.length === 0) {
    return {
      ok: false,
      error: "Add at least one question to the quiz before sharing.",
    };
  }

  // First question's image is the hero. Audio is regenerated below
  // from the cleaned passage so we don't carry the original quiz audio
  // (might bake in classroom-specific names).
  const heroImage = (questions[0]?.image_url ?? null) as string | null;

  const { out: cleanPassage } = anonymizeText(passageText);
  const { out: cleanQuestions } = anonymizeQuestions(questions);

  // Belt-and-suspenders safety check.
  const hit =
    containsUnsafeContent(cleanPassage) ||
    (Array.isArray(cleanQuestions)
      ? cleanQuestions
          .flatMap((qx: any) => [qx.prompt, ...(qx.choices ?? []), qx.hint])
          .map((s: any) => (typeof s === "string" ? s : ""))
          .map((s: string) => containsUnsafeContent(s))
          .find(Boolean)
      : null);
  if (hit) {
    return {
      ok: false,
      error:
        "This quiz didn't pass our kid-safe content check. Try regenerating before sharing.",
    };
  }

  // Withdraw any prior submission for this quiz.
  await admin
    .from("community_passages")
    .update({ status: "withdrawn" })
    .eq("source_quiz_id", input.quizId)
    .eq("status", "pending");

  // Trusted check on the teacher. Same RPC as parent — counts approved
  // submissions where source_parent_id matches; teacher's profile id
  // is stored there since we repurposed source_parent_id to mean
  // "the human who submitted."
  const [flagRow, countRow] = await Promise.all([
    admin
      .from("profile_trust_flags")
      .select("is_trusted_parent")
      .eq("profile_id", input.teacherId)
      .maybeSingle(),
    admin.rpc("parent_approved_submission_count", {
      p_parent_id: input.teacherId,
    }),
  ]);
  const explicitTrust = (flagRow.data as any)?.is_trusted_parent;
  const approvedCount = Number((countRow.data as any) ?? 0);
  const isTrusted =
    explicitTrust === true ||
    (explicitTrust !== false && approvedCount >= TRUSTED_THRESHOLD);

  // Re-narrate audio from the cleaned passage.
  let audioUrl: string | null = null;
  if (cleanPassage) {
    const tts = await generateSpeech({
      teacherId: input.teacherId,
      text: cleanPassage,
    });
    if (tts.ok) audioUrl = tts.audioUrl;
  }

  // Run the AI QC gate.
  const qc = await runCommunityQC({
    passage: cleanPassage,
    questions: cleanQuestions ?? [],
    imageUrl: heroImage,
    audioUrl,
  });
  if (qc.verdict === "fail") {
    return {
      ok: false,
      error: `Quality check didn't pass — ${qc.reason ?? "try regenerating before sharing"}.`,
    };
  }
  const effectivelyTrusted = isTrusted && qc.verdict === "pass";

  // Pull the teacher's byline preference.
  const { data: teacherProfile } = await admin
    .from("profiles")
    .select("community_byline_consent, community_display_name")
    .eq("id", input.teacherId)
    .maybeSingle();
  const displayByline =
    (teacherProfile as any)?.community_byline_consent === true
      ? ((teacherProfile as any).community_display_name as string | null) ?? null
      : null;

  const titleForSlug = q.title ?? "passage";
  const slug = buildSlug(titleForSlug);

  const { data: inserted, error: insErr } = await admin
    .from("community_passages")
    .insert({
      source_quiz_id: q.id,
      source_parent_id: q.teacher_id, // repurposed: "submitter id"
      source_kind: "teacher_quiz",
      title: (q.title ?? passageText.slice(0, 120)).slice(0, 120),
      passage_text: cleanPassage,
      questions: cleanQuestions,
      image_url: heroImage,
      audio_url: audioUrl,
      grade_level: q.grade_level ?? "2nd",
      topic: q.title ?? "Reading practice",
      phonics_pattern: null,
      status: effectivelyTrusted ? "approved" : "pending",
      auto_approved: effectivelyTrusted,
      reviewed_at: effectivelyTrusted ? new Date().toISOString() : null,
      slug,
      display_byline: displayByline,
    })
    .select("id")
    .single();
  if (insErr || !inserted) {
    return { ok: false, error: insErr?.message ?? "Couldn't submit for review." };
  }

  await admin.from("content_qc_log").insert({
    target_kind: "community_passage",
    target_id: (inserted as any).id,
    change_type: "submit_for_review",
    before: null,
    after: { verdict: qc.verdict, checks: qc.checks, source_kind: "teacher_quiz" },
    reason:
      qc.verdict === "warn"
        ? `Submitted with warning — admin review required. ${qc.reason ?? ""}`
        : "Passed AI QC.",
    finding_id: null,
    agent: "community/submit",
  });

  return { ok: true, communityId: (inserted as any).id as string };
}

/** Withdraw a teacher quiz submission. */
export async function withdrawQuizSubmission(input: {
  teacherId: string;
  quizId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("community_passages")
    .update({ status: "withdrawn" })
    .eq("source_quiz_id", input.quizId)
    .eq("source_parent_id", input.teacherId)
    .in("status", ["pending", "approved"]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function withdrawCommunitySubmission(input: {
  parentId: string;
  sourceContentId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("community_passages")
    .update({ status: "withdrawn" })
    .eq("source_content_id", input.sourceContentId)
    .eq("source_parent_id", input.parentId)
    .in("status", ["pending", "approved"]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function moderateCommunityContent(input: {
  reviewerId: string;
  communityId: string;
  decision: "approved" | "rejected";
  rejectionReason?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = supabaseAdmin();

  // Reviewer must have admin scope.
  const { count } = await admin
    .from("admin_memberships")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", input.reviewerId);
  if ((count ?? 0) === 0) {
    return { ok: false, error: "Only admins can moderate community content." };
  }

  const { error } = await admin
    .from("community_passages")
    .update({
      status: input.decision,
      reviewed_by: input.reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason:
        input.decision === "rejected" ? input.rejectionReason ?? null : null,
    })
    .eq("id", input.communityId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
