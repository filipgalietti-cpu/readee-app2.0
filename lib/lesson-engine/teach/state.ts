/**
 * The teaching sequence as a pure reducer.
 *
 * Every visual in the old engine was a CSS animation with its own lifetime, so
 * three things were impossible and all three are load-bearing for reading
 * instruction:
 *
 *   - A mark could not MEAN something and stay true. `magic-teams` needs the `a`
 *     lit AND the `i` greyed at the same time, because "the first one does the
 *     talking" and "the I stays quiet" is one idea held in contrast. Infinite
 *     loops cannot express a state that became true.
 *   - The screen could not be rebuilt for an arbitrary moment, so replay
 *     restarted the voice over a finished animation.
 *   - Reduced motion had no equivalent, because the teaching WAS the motion.
 *
 * Folding ops into a state object fixes all three at once. The visual at time T
 * is `stateAt(steps, T)` - a fold of every step whose moment has passed. Replay
 * is re-folding from zero. Reduced motion is folding to the end and rendering
 * the result without transitions, which is still the whole explanation.
 */

export type TargetId = string;
export type Tone = "teach" | "good" | "warn" | "quiet";
export type MarkKind =
  | "underline" | "highlight" | "tint" | "ring" | "circle"
  | "strike" | "dim" | "rest" | "missing" | "ok" | "alert";

export type Op =
  | { op: "show"; target: TargetId | TargetId[] }
  | { op: "mark"; target: TargetId | TargetId[]; kind: MarkKind; tone?: Tone; off?: true }
  | { op: "label"; target: TargetId; id?: string; text: string; place?: "under" | "over" | "after"; tone?: Tone }
  | { op: "connect"; id: string; from: TargetId; to: TargetId; kind: "arrow" | "bracket" | "leader" | "capsule"; label?: string; state?: "solid" | "broken" }
  | { op: "move"; from: TargetId; to: TargetId; copy?: boolean; as?: "capitalize" | "lower" }
  | { op: "setText"; target: TargetId; to: string; mode?: "replace" | "append" | "drop" | "recase" }
  | { op: "segment"; target: TargetId; at: number[] }
  | { op: "clear"; target: TargetId; what?: "marks" | "labels" | "links" | "all" };

export type TeachState = {
  /** Targets currently revealed. Anything not here is hidden. */
  shown: Set<TargetId>;
  /** target -> the marks on it. Additive, so two can coexist. */
  marks: Map<TargetId, { kind: MarkKind; tone: Tone }[]>;
  /** label id -> where it hangs and what it says. */
  labels: Map<string, { target: TargetId; text: string; place: "under" | "over" | "after"; tone: Tone }>;
  /** connector id -> endpoints. */
  links: Map<string, { from: TargetId; to: TargetId; kind: string; label?: string; state: string }>;
  /** target -> text overriding the stage definition (after setText or move). */
  text: Map<TargetId, string>;
  /** target -> seam positions, for showing a word split into parts. */
  seams: Map<TargetId, number[]>;
  /** destination -> the text that has landed in it, for `move`. */
  landed: Map<TargetId, string>;
};

export function emptyState(): TeachState {
  return {
    shown: new Set(),
    marks: new Map(),
    labels: new Map(),
    links: new Map(),
    text: new Map(),
    seams: new Map(),
    landed: new Map(),
  };
}

const list = (t: TargetId | TargetId[]) => (Array.isArray(t) ? t : [t]);

const recase = (s: string, as?: "capitalize" | "lower") =>
  as === "capitalize" ? s.charAt(0).toUpperCase() + s.slice(1)
  : as === "lower" ? s.charAt(0).toLowerCase() + s.slice(1)
  : s;

/** Apply one op. Mutates the passed state, which is always a fresh fold. */
export function apply(s: TeachState, op: Op, textOf: (id: TargetId) => string): void {
  switch (op.op) {
    case "show":
      for (const t of list(op.target)) s.shown.add(t);
      return;

    case "mark": {
      for (const t of list(op.target)) {
        const cur = s.marks.get(t) ?? [];
        if (op.off) {
          s.marks.set(t, cur.filter((m) => m.kind !== op.kind));
        } else if (!cur.some((m) => m.kind === op.kind)) {
          // Additive on purpose: "lit" and "quiet" must be able to coexist on
          // two letters of the same word, which is the whole vowel-team lesson.
          s.marks.set(t, [...cur, { kind: op.kind, tone: op.tone ?? "teach" }]);
        }
        s.shown.add(t);
      }
      return;
    }

    case "label":
      s.labels.set(op.id ?? `${op.target}:label`, {
        target: op.target,
        text: op.text,
        place: op.place ?? "under",
        tone: op.tone ?? "teach",
      });
      s.shown.add(op.target);
      return;

    case "connect":
      s.links.set(op.id, {
        from: op.from,
        to: op.to,
        kind: op.kind,
        label: op.label,
        state: op.state ?? "solid",
      });
      s.shown.add(op.from);
      s.shown.add(op.to);
      return;

    case "move": {
      const src = s.text.get(op.from) ?? textOf(op.from);
      s.landed.set(op.to, recase(src, op.as));
      s.shown.add(op.to);
      // A copy leaves the source in place, which is what keeps the child able to
      // read the original sentence after evidence has been lifted out of it.
      if (!op.copy) s.text.set(op.from, "");
      return;
    }

    case "setText": {
      const cur = s.text.get(op.target) ?? textOf(op.target);
      const next =
        op.mode === "append" ? cur + op.to
        : op.mode === "drop" ? cur.replace(op.to, "")
        : op.mode === "recase" ? recase(op.to, "capitalize")
        : op.to;
      s.text.set(op.target, next);
      s.shown.add(op.target);
      return;
    }

    case "segment":
      s.seams.set(op.target, op.at);
      s.shown.add(op.target);
      return;

    case "clear": {
      const what = op.what ?? "all";
      if (what === "marks" || what === "all") s.marks.delete(op.target);
      if (what === "labels" || what === "all")
        for (const [k, v] of s.labels) if (v.target === op.target) s.labels.delete(k);
      if (what === "links" || what === "all")
        for (const [k, v] of s.links) if (v.from === op.target || v.to === op.target) s.links.delete(k);
      return;
    }
  }
}

export type ResolvedStep = { atMs: number; ops: Op[] };

/**
 * The visual at a moment, folded from zero every time.
 *
 * Deliberately not incremental. Folding ~10 steps is free, and it means seeking,
 * replaying, or jumping to the end for reduced motion are all the same code
 * path - there is no way for the screen to disagree with the clock.
 */
export function stateAt(
  steps: ResolvedStep[],
  ms: number,
  textOf: (id: TargetId) => string,
  alwaysShown: TargetId[] = [],
): TeachState {
  const s = emptyState();
  for (const t of alwaysShown) s.shown.add(t);
  for (const step of steps) {
    if (step.atMs > ms) break;
    for (const op of step.ops) apply(s, op, textOf);
  }
  return s;
}
