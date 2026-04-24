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
 *   3. Land it in community_passages with status='pending'.
 *   4. Admins review via /admin/community and either approve or reject.
 *
 * We store the REWRITTEN text separately from the parent's private copy —
 * the original child_ai_content row stays untouched, the community copy
 * is its own row with its own moderation state.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { containsUnsafeContent } from "@/lib/ai/safety";

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

  const { data: inserted, error: insErr } = await admin
    .from("community_passages")
    .insert({
      source_content_id: c.id,
      source_parent_id: c.parent_id,
      title: c.title ?? c.topic.slice(0, 120),
      passage_text: cleanPassage,
      questions: cleanQuestions,
      image_url: c.image_url,
      audio_url: null, // audio contains the anonymized-away names; require regen to share with audio.
      grade_level: c.grade_level ?? "2nd",
      topic: c.topic,
      phonics_pattern: c.phonics_pattern ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (insErr || !inserted) {
    return { ok: false, error: insErr?.message ?? "Couldn't submit for review." };
  }

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
