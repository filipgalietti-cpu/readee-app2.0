import { didLevelUp } from "@/lib/levels/levels";

/** Anything with an `.rpc()` — the browser client or a service-role admin client. */
type RpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: unknown }>;
};

export type AwardResult = {
  /** New spendable balance. */
  carrots: number;
  /** New lifetime total (drives the level ladder). */
  lifetime: number;
  /** Lifetime before this award — the anchor a LevelProgressCard/Burst needs. */
  priorLifetime: number;
  /** True when this award crossed a level boundary. */
  leveledUp: boolean;
};

/**
 * The ONE way to give (or take) carrots.
 *
 * Every award used to be a hand-rolled `update children set carrots = <read> + n`,
 * scattered over eight files. Two things went wrong with that, and both are
 * fixed here rather than in each caller:
 *
 *   1. Only three of the eight also recorded the carrots anywhere the level
 *      ladder could see, so Luna, journey chests and the mystery box earned
 *      carrots that never levelled a child up. Filip's rule is that earning
 *      ANY carrot counts, so the increment has to live in one place.
 *   2. Read-then-write loses an update when two awards land together. The
 *      `award_carrots` RPC does `carrots = carrots + n` in the database.
 *
 * Spending passes a negative `amount`; lifetime is untouched, so buying a shop
 * item never demotes anyone.
 *
 * `countTowardLevel: false` exists for exactly one caller, the level-up BONUS.
 * Bonus carrots that counted toward lifetime could trigger the next level-up,
 * which grants another bonus — a cascade.
 *
 * Best-effort by contract: returns null on failure and never throws, because a
 * carrot hiccup must not fail a finished lesson or a published story.
 */
export async function awardCarrots(
  client: RpcClient,
  childId: string,
  amount: number,
  opts?: { countTowardLevel?: boolean },
): Promise<AwardResult | null> {
  if (!childId || !Number.isFinite(amount) || amount === 0) return null;
  const counts = opts?.countTowardLevel !== false && amount > 0;
  try {
    const { data, error } = await client.rpc("award_carrots", {
      p_child_id: childId,
      p_amount: Math.round(amount),
      p_count_toward_level: counts,
    });
    if (error || !data) return null;
    const row = (Array.isArray(data) ? data[0] : data) as
      | { new_carrots: number; new_lifetime: number }
      | undefined;
    if (!row) return null;
    const lifetime = row.new_lifetime ?? 0;
    const priorLifetime = counts ? lifetime - Math.round(amount) : lifetime;
    return {
      carrots: row.new_carrots ?? 0,
      lifetime,
      priorLifetime,
      leveledUp: counts && didLevelUp(priorLifetime, lifetime),
    };
  } catch {
    return null;
  }
}
