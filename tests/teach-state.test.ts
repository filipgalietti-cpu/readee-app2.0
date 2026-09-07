import { describe, it, expect } from "vitest";
import { stateAt, type ResolvedStep } from "@/lib/lesson-engine/teach/state";

const textOf = (id: string) =>
  ({ "s1.ben": "Ben", "s1.hops": "hops", slot: "", word: "rain" } as Record<string, string>)[id] ?? "";

describe("the teaching state at a moment", () => {
  it("shows nothing before the first step", () => {
    const steps: ResolvedStep[] = [{ atMs: 1000, ops: [{ op: "show", target: "a" }] }];
    expect(stateAt(steps, 0, textOf).shown.has("a")).toBe(false);
    expect(stateAt(steps, 1000, textOf).shown.has("a")).toBe(true);
  });

  it("holds two contrasting marks at once - the vowel-team lesson", () => {
    // magic-teams: "The A does the talking" then "The I stays quiet". Both
    // states must be on screen together or the contrast is not taught.
    const steps: ResolvedStep[] = [
      { atMs: 100, ops: [{ op: "mark", target: "a", kind: "ok" }] },
      { atMs: 200, ops: [{ op: "mark", target: "i", kind: "dim", tone: "quiet" }] },
    ];
    const s = stateAt(steps, 300, textOf);
    expect(s.marks.get("a")?.[0].kind).toBe("ok");
    expect(s.marks.get("i")?.[0].kind).toBe("dim");
  });

  it("marks are additive on one target, not replacing", () => {
    const steps: ResolvedStep[] = [
      { atMs: 0, ops: [{ op: "mark", target: "x", kind: "underline" }] },
      { atMs: 10, ops: [{ op: "mark", target: "x", kind: "highlight" }] },
    ];
    expect(stateAt(steps, 20, textOf).marks.get("x")).toHaveLength(2);
  });

  it("off:true removes one mark and leaves the others", () => {
    const steps: ResolvedStep[] = [
      { atMs: 0, ops: [{ op: "mark", target: "x", kind: "underline" }, { op: "mark", target: "x", kind: "ring" }] },
      { atMs: 10, ops: [{ op: "mark", target: "x", kind: "underline", off: true }] },
    ];
    const m = stateAt(steps, 20, textOf).marks.get("x")!;
    expect(m.map((x) => x.kind)).toEqual(["ring"]);
  });

  it("move COPIES evidence so the child can still read the source", () => {
    // Filip's example: a phrase lifts out of a sentence into a diagram. If the
    // source vanished, the relationship being taught would vanish with it.
    const steps: ResolvedStep[] = [
      { atMs: 0, ops: [{ op: "move", from: "s1.ben", to: "slot", copy: true }] },
    ];
    const s = stateAt(steps, 10, textOf);
    expect(s.landed.get("slot")).toBe("Ben");
    expect(s.text.get("s1.ben")).toBeUndefined(); // source untouched
  });

  it("a non-copy move empties the source", () => {
    const s = stateAt([{ atMs: 0, ops: [{ op: "move", from: "s1.ben", to: "slot" }] }], 10, textOf);
    expect(s.text.get("s1.ben")).toBe("");
  });

  it("recases on the way into a slot - Ben becomes He, He stays capitalised", () => {
    const s = stateAt(
      [{ atMs: 0, ops: [{ op: "setText", target: "slot", to: "he" }, { op: "move", from: "slot", to: "dest", copy: true, as: "capitalize" }] }],
      10, textOf,
    );
    expect(s.landed.get("dest")).toBe("He");
  });

  it("segment records where a word splits, without destroying the word", () => {
    // The old workaround was to shatter "rain" into "r ai n" so the digraph was
    // addressable, and the child then never saw the word.
    const s = stateAt([{ atMs: 0, ops: [{ op: "segment", target: "word", at: [1, 3] }] }], 10, textOf);
    expect(s.seams.get("word")).toEqual([1, 3]);
    expect(textOf("word")).toBe("rain");
  });

  it("clear removes marks without hiding the target", () => {
    const steps: ResolvedStep[] = [
      { atMs: 0, ops: [{ op: "mark", target: "x", kind: "ring" }] },
      { atMs: 10, ops: [{ op: "clear", target: "x", what: "marks" }] },
    ];
    const s = stateAt(steps, 20, textOf);
    expect(s.marks.get("x")).toBeUndefined();
    expect(s.shown.has("x")).toBe(true);
  });

  it("folding to the end gives the complete explanation - the reduced-motion state", () => {
    const steps: ResolvedStep[] = [
      { atMs: 1000, ops: [{ op: "mark", target: "a", kind: "underline" }] },
      { atMs: 5000, ops: [{ op: "label", target: "a", text: "silent" }] },
      { atMs: 9000, ops: [{ op: "connect", id: "l1", from: "a", to: "b", kind: "arrow" }] },
    ];
    const end = stateAt(steps, Number.MAX_SAFE_INTEGER, textOf);
    expect(end.marks.get("a")).toHaveLength(1);
    expect(end.labels.size).toBe(1);
    expect(end.links.size).toBe(1);
  });

  it("is pure - the same moment always yields the same screen, so replay is free", () => {
    const steps: ResolvedStep[] = [
      { atMs: 0, ops: [{ op: "mark", target: "a", kind: "ok" }] },
      { atMs: 500, ops: [{ op: "setText", target: "slot", to: "cape" }] },
    ];
    const a = stateAt(steps, 700, textOf);
    const b = stateAt(steps, 700, textOf);
    expect([...a.shown]).toEqual([...b.shown]);
    expect(a.text.get("slot")).toBe(b.text.get("slot"));
  });
});
