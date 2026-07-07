/**
 * Adaptive engine — Phase 2 ACT layer.
 *
 * Given the controller's reading (Phase 1) and what we've already done this
 * session, selectIntervention() picks the ONE next move — a brake or a bit
 * of gas. Pure and dependency-free so it's testable and the demo + the live
 * runtime can share it.
 *
 * THE ANTI-CODDLING CONTRACT (enforced here, not just documented):
 *   - There is no "reveal the answer" intervention. It does not exist.
 *   - Struggle escalates SUPPORT, not ease: hint → extra rep → scaffold.
 *     The child keeps facing the skill; we add ladders, not shortcuts.
 *   - level_down is the LAST resort, only for a frustrated child, and it is
 *     always `temporary` — the runtime restores the level once they recover.
 *   - Advancement is EARNED: gas escalates skip → stretch → level_up only on
 *     a sustained breeze, never a lucky streak.
 *   - Interventions are capped and rate-limited so a lesson never turns into
 *     an endless remediation slog.
 */

import type { AdaptiveReading } from "./controller";

export type InterventionType =
  | "none" // flow — do nothing, stay out of the way
  // brakes (support first, ease only as a last resort)
  | "progressive_hint" // struggling: a sharper strategy hint (never the answer)
  | "extra_rep" // struggling: another rep at the SAME level (mastery)
  | "scaffold" // struggling: break the item into smaller steps
  | "reteach" // frustrated: a quick modeled re-teach mid-flow
  | "level_down" // frustrated, last resort: easier variant, TEMPORARY
  // gas (earned advancement)
  | "skip_ahead" // breezing: skip a mastered rep
  | "stretch" // breezing: a harder item
  | "level_up"; // breezing, sustained: advance a level

export type InterventionKind = "gas" | "hold" | "brakes";

export interface Intervention {
  type: InterventionType;
  kind: InterventionKind;
  /** short coach-facing label */
  title: string;
  /** what the child experiences (kid-facing, encouraging, never labels them) */
  message: string;
  /** why we did it (feeds the parent Adaptive Insight + dev badge) */
  rationale: string;
  /** level_down only — the runtime must restore the level on recovery */
  temporary?: boolean;
}

const NONE: Intervention = {
  type: "none",
  kind: "hold",
  title: "In the zone",
  message: "",
  rationale: "Challenge matches skill — stay out of the way.",
};

// Don't act on a hunch: wait until the window has enough signal, and never
// fire two interventions back-to-back on the same beat.
const MIN_CONFIDENCE = 0.4;
const MAX_INTERVENTIONS_PER_SESSION = 8;

function countType(history: Intervention[], t: InterventionType): number {
  return history.filter((h) => h.type === t).length;
}

/**
 * Pick the next intervention for the current reading, given this session's
 * intervention history. Returns `none` when the right move is to do nothing.
 */
export function selectIntervention(
  reading: AdaptiveReading,
  history: Intervention[] = [],
): Intervention {
  // Guardrails: enough signal + not overdoing it.
  if (reading.confidence < MIN_CONFIDENCE) return NONE;
  if (history.length >= MAX_INTERVENTIONS_PER_SESSION) return NONE;

  switch (reading.directive) {
    case "hold":
      return NONE;

    case "support": {
      // Escalate SUPPORT as struggle persists — never make it easier.
      const hints = countType(history, "progressive_hint");
      const reps = countType(history, "extra_rep");
      if (hints === 0) {
        return {
          type: "progressive_hint",
          kind: "brakes",
          title: "A sharper hint",
          message: "Here's a little strategy to try…",
          rationale: `${reading.reason} — nudge the approach without giving the answer.`,
        };
      }
      if (reps === 0) {
        return {
          type: "extra_rep",
          kind: "brakes",
          title: "One more like it",
          message: "Let's try one more just like that.",
          rationale: `${reading.reason} — another rep at the same level to lock it in (mastery, no skipping).`,
        };
      }
      if (countType(history, "scaffold") === 0) {
        return {
          type: "scaffold",
          kind: "brakes",
          title: "Break it down",
          message: "Let's take this one step at a time.",
          rationale: `${reading.reason} — scaffold the item into smaller steps.`,
        };
      }
      return NONE; // support ladder exhausted — hold and keep coaching in place
    }

    case "reteach": {
      // Frustrated. Re-teach first. Only if that didn't take do we ease the
      // level — and always temporarily.
      const reteaches = countType(history, "reteach");
      if (reteaches === 0) {
        return {
          type: "reteach",
          kind: "brakes",
          title: "Let's re-teach that",
          message: "Let's look at how this works together, real quick.",
          rationale: `${reading.reason} — inject a quick modeled example before trying again.`,
        };
      }
      if (countType(history, "level_down") === 0) {
        return {
          type: "level_down",
          kind: "brakes",
          title: "Meet them where they are",
          message: "Let's warm up with an easier one first.",
          rationale: `${reading.reason} — re-teach didn't land; drop to the easier variant, then climb back.`,
          temporary: true,
        };
      }
      return NONE; // already re-taught and eased the level — let them work there
    }

    case "advance": {
      // Earned gas. Escalate: skip a rep → stretch → level up.
      const skips = countType(history, "skip_ahead");
      const stretches = countType(history, "stretch");
      if (skips === 0) {
        return {
          type: "skip_ahead",
          kind: "gas",
          title: "Skip the easy one",
          message: "You've got this — let's move ahead.",
          rationale: `${reading.reason} — skip a mastered rep so it doesn't get boring.`,
        };
      }
      if (stretches === 0) {
        return {
          type: "stretch",
          kind: "gas",
          title: "Here's a tricky one",
          message: "Ready for a challenge? Try this one.",
          rationale: `${reading.reason} — inject a harder item to keep the stretch.`,
        };
      }
      if (countType(history, "level_up") === 0) {
        return {
          type: "level_up",
          kind: "gas",
          title: "Level up",
          message: "You're flying, let's move you up a level!",
          rationale: `${reading.reason} — sustained breeze; advance to the next level.`,
        };
      }
      return NONE; // already leveled up — keep them at the new challenge
    }

    default:
      return NONE;
  }
}

/**
 * Phase 5 preview: narrate a session's arc for the parent-facing "Adaptive
 * Insight". Deterministic (no LLM needed for the demo); the production
 * version can hand these facts to the conference-notes generator for prose.
 */
export function narrateSession(
  standardLabel: string,
  interventions: Intervention[],
): string {
  if (interventions.length === 0) {
    return `Cruised through ${standardLabel} right in the just-right zone — no help needed.`;
  }
  const brakes = interventions.filter((i) => i.kind === "brakes");
  const gas = interventions.filter((i) => i.kind === "gas");
  const parts: string[] = [];
  if (gas.length) {
    const leveledUp = gas.some((g) => g.type === "level_up");
    parts.push(
      leveledUp
        ? `breezed through ${standardLabel} and moved up a level`
        : `was breezing through ${standardLabel}, so Readee pushed the pace`,
    );
  }
  if (brakes.length) {
    const reteach = brakes.some((b) => b.type === "reteach" || b.type === "level_down");
    parts.push(
      reteach
        ? `hit a wall, so Readee slowed down and re-taught it`
        : `needed a little extra support, so Readee added practice`,
    );
  }
  const body = parts.join("; then ");
  return `This week your child ${body} — ${brakes.length + gas.length} smart adjustment${
    brakes.length + gas.length === 1 ? "" : "s"
  } along the way.`;
}
