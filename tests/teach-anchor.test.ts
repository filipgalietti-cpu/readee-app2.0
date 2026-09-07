import { describe, it, expect } from "vitest";
import { findPhrase, resolveAnchors } from "@/lib/lesson-engine/teach/anchor";
import { LESSONS } from "@/app/data/lessons-v2";

/**
 * Anchoring is where the old engine failed silently, so these tests are about
 * the failure modes rather than the happy path.
 */

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
const wordsOf = (s: string) => s.split(/\s+/).map(norm).filter(Boolean);

describe("phrase matching", () => {
  it("matches whole words only - 'run' must not match 'runs'", () => {
    // A grammar lesson teaching exactly this distinction cannot have the engine
    // confuse them. resolveCueTime used startsWith and would have.
    const w = wordsOf("The dogs run and the dog runs fast");
    expect(findPhrase(w, ["run"]).length).toBe(1);
    expect(findPhrase(w, ["runs"]).length).toBe(1);
    expect(findPhrase(w, ["run"])[0]).not.toBe(findPhrase(w, ["runs"])[0]);
  });

  it("matches multi-word phrases as a contiguous run", () => {
    const w = wordsOf("Listen. The dog runs. One dog, and the action word is runs.");
    expect(findPhrase(w, wordsOf("the dog runs")).length).toBe(1);
    expect(findPhrase(w, wordsOf("the action word is runs")).length).toBe(1);
    expect(findPhrase(w, wordsOf("the cat runs")).length).toBe(0);
  });

  it("finds every occurrence, so nth can disambiguate", () => {
    const w = wordsOf("because it rained. Later, because it rained again.");
    expect(findPhrase(w, wordsOf("because it rained")).length).toBe(2);
  });
});

describe("resolving against real narration", () => {
  const lesson = LESSONS["grammar-builders"].lesson as unknown as {
    scenes: { id: string; narration?: { script?: string } }[];
    timings?: Record<string, { words: { w: string; t: number }[] }>;
  };
  const scene = lesson.scenes.find((s) => s.id === "model-verb-match")!;
  const script = scene.narration?.script;
  const words = lesson.timings?.["model-verb-match"]?.words as never;

  it("places a phrase anchor on the moment it is spoken", () => {
    const { atMs, problems } = resolveAnchors(
      [{ id: "a", anchor: { at: "the dog runs" } }, { id: "b", anchor: { at: "the dogs run" } }],
      script,
      words,
    );
    expect(problems.filter((p) => p.reason === "not-found")).toEqual([]);
    expect(atMs[0]).not.toBeNull();
    expect(atMs[1]).not.toBeNull();
    // The plural is explained after the singular; that ordering is the lesson.
    expect(atMs[1] as number).toBeGreaterThan(atMs[0] as number);
  });

  it("DROPS an unfindable anchor instead of firing it at zero", () => {
    // This is the magic-teams bug: `**ai**` is not a word in the script, the old
    // code returned 0, and the underline drew at mount over a frozen screen.
    const { atMs, problems } = resolveAnchors(
      [{ id: "x", anchor: { at: "ai" } }],
      script,
      words,
    );
    expect(atMs[0]).toBeNull();
    expect(problems[0]).toMatchObject({ reason: "not-found" });
  });

  it("reports ambiguity rather than silently taking the first mention", () => {
    const { problems } = resolveAnchors(
      [{ id: "y", anchor: { at: "the" } }],
      script,
      words,
    );
    expect(problems.some((p) => p.reason === "ambiguous")).toBe(true);
  });

  it("nth selects a specific mention", () => {
    const first = resolveAnchors([{ anchor: { at: "the", nth: 1 } }], script, words).atMs[0];
    const third = resolveAnchors([{ anchor: { at: "the", nth: 3 } }], script, words).atMs[0];
    expect(third as number).toBeGreaterThan(first as number);
  });

  it("keeps steps monotonic so an explanation never plays backwards", () => {
    const { atMs } = resolveAnchors(
      [{ anchor: { at: "the dogs run" } }, { anchor: { at: "the dog runs" } }],
      script,
      words,
    );
    expect(atMs[1] as number).toBeGreaterThanOrEqual(atMs[0] as number);
  });

  it("an absolute anchor needs no script at all", () => {
    const { atMs } = resolveAnchors([{ anchor: 2.5 }], undefined, undefined);
    expect(atMs[0]).toBe(2500);
  });

  it("an `after` anchor offsets from a named step", () => {
    const { atMs } = resolveAnchors(
      [{ id: "one", anchor: 1 }, { id: "two", anchor: { after: "one", ms: 800 } }],
      undefined,
      undefined,
    );
    expect(atMs[1]).toBe(1800);
  });
});
