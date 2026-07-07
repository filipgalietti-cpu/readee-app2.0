/**
 * Adaptive engine — Phase 0 SENSE layer (client-side capture).
 *
 * logLearningEvent() records one graded interaction into `learning_events`
 * (migration 113). It is FIRE-AND-FORGET and best-effort: telemetry must
 * never block, delay, or throw into a child's lesson. If the write fails we
 * swallow it — a lost event is acceptable; a broken lesson is not.
 *
 * These events are the fuel for the adaptive controller (Phase 1), which
 * reads them in a short rolling window to decide brakes vs. gas. They also
 * capture the signals the app used to discard: fork retry counts, hint use,
 * response latency, and the exact wrong choice a child picked.
 */
import { supabaseBrowser } from "@/lib/supabase/client";

export type LearningSurface = "fork" | "lesson_mcq" | "practice";

export interface LearningEvent {
  childId: string;
  standardId: string;
  surface: LearningSurface;
  correct: boolean;
  itemId?: string | null;
  itemType?: string | null;
  attempts?: number; // fork can be >1; one-shot MCQ = 1
  hintUsed?: boolean;
  latencyMs?: number | null;
  chosen?: string | null; // the choice the child actually tapped
  sessionId?: string | null; // groups one sitting (see newSessionId)
  lessonId?: string | null;
  difficulty?: number | null; // 1-3 when known
}

/**
 * A stable id for one lesson/practice sitting, so the controller can scope
 * its rolling window to the current session. Generated once per session and
 * threaded through each event. Safe on server + client.
 */
export function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (older webviews): timestamp + random suffix.
  return `s_${Date.now()}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

/**
 * Record one interaction. Never awaited on a hot path — call and move on.
 */
export function logLearningEvent(ev: LearningEvent): void {
  // Guard: without a child + standard the row is meaningless.
  if (!ev.childId || !ev.standardId) return;
  try {
    const supabase = supabaseBrowser();
    void supabase
      .from("learning_events")
      .insert({
        child_id: ev.childId,
        standard_id: ev.standardId,
        surface: ev.surface,
        item_id: ev.itemId ?? null,
        item_type: ev.itemType ?? null,
        correct: ev.correct,
        attempts: ev.attempts ?? 1,
        hint_used: ev.hintUsed ?? false,
        latency_ms: ev.latencyMs ?? null,
        chosen: ev.chosen ?? null,
        session_id: ev.sessionId ?? null,
        lesson_id: ev.lessonId ?? null,
        difficulty: ev.difficulty ?? null,
      })
      .then(({ error }) => {
        if (error && process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[learning_events] insert failed:", error.message);
        }
      });
  } catch {
    // best-effort: swallow. A dropped event must not surface to the child.
  }
}
