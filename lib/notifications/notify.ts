import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Kid-facing in-app notifications (the header bell). One login per family
 * (parent auth), but the kid drives on that session and sees the bell — so
 * these pull the kid back into the daily loop. Parent-facing updates go by
 * email, not here.
 *
 * Writes are service-role only (the notifications table has read/update RLS
 * but no insert policy), so this must run server-side (cron, route handlers).
 */

export type NotifyType =
  | "daily"
  | "lesson"
  | "streak"
  | "achievement"
  | "system"
  | "info";

export type NotifyInput = {
  /** The family's auth user id (children.parent_id). */
  userId: string;
  type: NotifyType;
  title: string;
  message: string;
  /**
   * Idempotency key. A second insert with the same (userId, dedupeKey) is a
   * no-op via the unique index — use it for once-per-day / once-per-event
   * nudges (e.g. `daily-readee-2026-08-31`). Omit for always-insert events.
   */
  dedupeKey?: string;
};

/** Best-effort insert — never throws, so a notification failure can't break
 *  the caller (cron loop, completion handler, etc.). */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    const { error } = await supabaseAdmin()
      .from("notifications")
      .upsert(
        {
          user_id: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          dedupe_key: input.dedupeKey ?? null,
        },
        { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
      );
    if (error) console.error("[notify] insert failed:", error.message);
  } catch (e) {
    console.error("[notify] threw:", e);
  }
}
