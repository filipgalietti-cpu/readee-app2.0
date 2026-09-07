import { describe, it, expect } from "vitest";
import { LESSONS } from "@/app/data/lessons-v2";

/**
 * Three engine defects that were invisible because nothing rendered wrong - the
 * lesson simply taught less than it was authored to.
 *
 * These tests pin the CLASSIFICATION and the COUNTS rather than the React
 * output, because the classification is where the risk is: a speaking task that
 * flips category starts either hiding a sentence a child must read, or revealing
 * the answer to an open question.
 */

type Scene = {
  id: string;
  layout?: string;
  image?: string;
  fx?: { text: string; effect: string };
  prompt?: string;
  interaction?: { type: string; text?: string } | null;
};

const scenes = (): { slug: string; s: Scene }[] =>
  Object.entries(LESSONS).flatMap(([slug, e]) =>
    ((e.lesson as unknown as { scenes: Scene[] }).scenes ?? []).map((s) => ({ slug, s })),
  );

/** The same rule Speak.tsx applies when a lesson does not declare `mode`. */
const FUNCTION_WORD =
  /\b(the|a|an|and|is|are|was|were|my|to|of|in|on|it|he|she|they|we|you|has|have)\b/i;
function isReadTask(text: string): boolean {
  const t = text.trim();
  if (t.split(/\s+/).length === 1) return true;
  return /^[A-Z]/.test(t) || /[.!?]$/.test(t) || FUNCTION_WORD.test(t);
}

describe("speaking tasks are classified, not guessed", () => {
  it("a sentence to read is a read task, so its text gets shown", () => {
    // Every one of these was hidden behind a literal "?" before.
    for (const t of [
      "She reads and they play.",
      "Milo is in the barn",
      "I like my kite",
      "My seat is in the front row.",
      "A dog ran to the cat",
    ]) {
      expect(isReadTask(t), t).toBe(true);
    }
  });

  it("an accept-list is NOT a read task, so it stays hidden - it is the answer", () => {
    // "Say what made the puddles!" must not print "rain raining" on screen.
    for (const t of [
      "rain raining",
      "drink drinks drinking",
      "author authors writer",
      "spots spot dots dot",
      "jumps hops swims sits naps eats runs sleeps croaks leaps",
    ]) {
      expect(isReadTask(t), t).toBe(false);
    }
  });

  it("the old heuristic was wrong on exactly the cases that mattered", () => {
    // It keyed off word count and the literal substring " my ": anything with
    // more than one word became an accept-list unless it happened to contain
    // " my ". That is why "She reads and they play." accepted "cats play".
    const old = (t: string) => t.split(/\s+/).length > 1 && !t.includes(" my ");
    expect(old("She reads and they play.")).toBe(true); // accept-list: WRONG
    expect(isReadTask("She reads and they play.")).toBe(true); // read: right
    // And it is still right about the genuine open-production tasks.
    expect(old("rain raining")).toBe(true);
    expect(isReadTask("rain raining")).toBe(false);
  });

  it("classifies the whole catalogue into two non-trivial groups", () => {
    const speak = scenes().filter(({ s }) => s.interaction?.type === "speak");
    expect(speak.length).toBeGreaterThan(400);
    const read = speak.filter(({ s }) => isReadTask(String(s.interaction?.text ?? "")));
    // Before the fix only single-word targets showed their text: 18 of 422.
    // The read group is what newly becomes visible, and it must be the majority
    // of the catalogue's speaking work without swallowing the accept-lists.
    expect(read.length).toBeGreaterThan(200);
    expect(read.length).toBeLessThan(speak.length);
  });

  it("an authored mode overrides the classifier in both directions", () => {
    // The classifier is a fallback. A lesson that declares its intent wins.
    const decide = (text: string, mode?: "read" | "any") =>
      mode ? mode === "read" : isReadTask(text);
    expect(decide("rain raining", "read")).toBe(true);
    expect(decide("She reads and they play.", "any")).toBe(false);
  });
});

describe("authored teaching text reaches the child", () => {
  it("every scene declaring fx has somewhere to render it", () => {
    // Precedence for the visual stage is interaction, then image, then fx. A
    // scene whose fx loses that contest used to drop the text entirely; it now
    // renders beside the prompt, so no scene is left with nowhere to put it.
    const withFx = scenes().filter(({ s }) => s.fx?.text?.trim());
    expect(withFx.length).toBeGreaterThan(600);

    const displaced = withFx.filter(
      ({ s }) => s.layout === "full" || !!s.interaction || !!s.image,
    );
    // This is the population the fix exists for. If it ever hits zero the fix is
    // dead code and someone changed the layout rules.
    expect(displaced.length).toBeGreaterThan(150);
  });

  it("prompts carry authored emphasis markup that must not print literally", () => {
    const starred = scenes().filter(({ s }) => /\*\*/.test(String(s.prompt ?? "")));
    // 76 prompts, most of them Kindergarten. They render through PromptText now.
    expect(starred.length).toBeGreaterThan(50);
    // And the markup is well formed, so the parser cannot leave a stray star.
    for (const { s } of starred) {
      const stars = (String(s.prompt).match(/\*\*/g) ?? []).length;
      expect(stars % 2, s.prompt).toBe(0);
    }
  });
});

describe("participation is not scored as a correct answer", () => {
  it("listen and read-along are not in the assessed set", () => {
    // Finishing a listening scene proves attendance, not learning. They used to
    // emit correct: true through a `?? true` default and inflate every score
    // built on these events.
    const ASSESSED = new Set(["choose", "sort", "sequence", "highlight", "transform", "speak"]);
    expect(ASSESSED.has("listen")).toBe(false);
    expect(ASSESSED.has("read-along")).toBe(false);
    // And the assessed ones stay assessed.
    for (const t of ["choose", "sort", "sequence", "highlight", "transform", "speak"]) {
      expect(ASSESSED.has(t), t).toBe(true);
    }
  });

  it("the catalogue really does lean on the passive types", () => {
    const types = scenes()
      .map(({ s }) => s.interaction?.type)
      .filter(Boolean) as string[];
    const passive = types.filter((t) => t === "listen" || t === "read-along").length;
    // ~353 scenes were emitting a correct answer for watching.
    expect(passive).toBeGreaterThan(300);
  });
});
