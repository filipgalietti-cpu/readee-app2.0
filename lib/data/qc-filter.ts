/**
 * Deliverability gate — server-side filter for the question catalog.
 *
 * Questions live in static JSON files under app/data/, but their
 * shippability state lives in the question_qc_status table (we can't
 * mutate the JSON at runtime, and parallel state lets the QC bot
 * work without a deploy).
 *
 * Every server surface that hands questions to a user (practice
 * hub, kid runner, daily question, random practice) MUST filter
 * through one of the helpers below. Anything in 'quarantined' or
 * 'retired' state is held back; only 'pass' (and currently 'warn'
 * — see ALLOW_WARN below) reach the user.
 *
 * Deliverability rule: Filip's policy is "items we ship to parents
 * have passed QC". Warn-state items are tolerated transitively while
 * the regen worker grinds through the backlog; the gate flips to
 * pass-only once that's caught up. Toggle ALLOW_WARN when ready.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOW_WARN = true; // flip to false once the backlog is clean

type QcStatus = "pass" | "warn" | "quarantined" | "retired";

type CacheEntry = { ids: Set<string>; expiresAt: number };
let cache: CacheEntry | null = null;
const TTL_MS = 60 * 1000; // 60s — cron-driven changes propagate within a minute

/** Load every quarantined / retired question target_id. Cached for 60s
 *  to keep page loads cheap; TTL is short so QC bot fixes propagate
 *  without a deploy. */
export async function getBlockedQuestionIds(): Promise<Set<string>> {
  if (cache && cache.expiresAt > Date.now()) return cache.ids;

  const admin = supabaseAdmin();
  const blockedStatuses: QcStatus[] = ALLOW_WARN
    ? ["quarantined", "retired"]
    : ["quarantined", "retired", "warn"];
  const { data } = await admin
    .from("question_qc_status")
    .select("target_id, qc_status")
    .in("qc_status", blockedStatuses);
  const ids = new Set<string>(((data ?? []) as { target_id: string }[]).map((r) => r.target_id));
  cache = { ids, expiresAt: Date.now() + TTL_MS };
  return ids;
}

/** Filter a list of questions by deliverability state. Returns a new
 *  array; never mutates input. */
export async function filterDeliverableQuestions<T extends { id: string }>(
  questions: T[],
): Promise<T[]> {
  const blocked = await getBlockedQuestionIds();
  if (blocked.size === 0) return questions;
  return questions.filter((q) => !blocked.has(q.id));
}

/** Filter a Standard object's questions array. Returns a clone. */
export async function filterDeliverableStandard<
  S extends { questions: Array<{ id: string }> },
>(standard: S): Promise<S> {
  const blocked = await getBlockedQuestionIds();
  if (blocked.size === 0) return standard;
  return {
    ...standard,
    questions: standard.questions.filter((q) => !blocked.has(q.id)),
  };
}

/** Bust the cache — call after the QC bot finishes a run so the next
 *  read picks up fresh state without waiting for TTL. */
export function invalidateQcCache() {
  cache = null;
}
