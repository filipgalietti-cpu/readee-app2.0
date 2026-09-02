import { describe, it, expect } from "vitest";
import { createLadder, recordWord, activeList, WORDS_PER_LIST, type LadderState, type PlacedBand } from "@/lib/placement/ladder";
import { decidePlacement } from "@/lib/placement/decide";
import { childCopyProblems } from "@/lib/placement/bank";
import { buildPlan } from "@/lib/placement/plan";
import {
  narrate, narrationProblems, NARRATION_ORDER, NARRATION_MAX_CHARS, REASSURANCE, ASK_CLOSE, FORBIDDEN_NARRATION_WORDS,
} from "@/lib/placement/narration";
import { fixtureMaya } from "@/lib/placement/fixtures";
import type { Moment, NarrationLine } from "@/lib/placement/types";

/* ---------------------------------------------------------------- helpers */

function playList(s: LadderState, pass: boolean, hardWords: string[] = []): LadderState {
  if (pass) {
    for (let i = 0; i < WORDS_PER_LIST; i++) s = recordWord(s, `w${i}`, true);
    return s;
  }
  const words = hardWords.length >= 3 ? hardWords : ["x0", "x1", "x2"];
  for (let i = 0; i < 3; i++) s = recordWord(s, words[i], false);
  return s;
}

function ladderFor(enrolled: PlacedBand, trueBand: number, hardWords: string[] = []): LadderState {
  let s = createLadder(enrolled);
  let guard = 0;
  while (!s.done && guard++ < 20) {
    const list = activeList(s);
    if (!list) break;
    s = playList(s, list.band <= trueBand, list.band === trueBand + 1 ? hardWords : []);
  }
  return s;
}

const byId = (lines: NarrationLine[], id: NarrationLine["id"]) => lines.find((l) => l.id === id)!.text;

/** The stricter check the spec asks for, on top of narrationProblems. */
function strictProblems(line: NarrationLine): string[] {
  const out = [...narrationProblems(line), ...childCopyProblems(line.text)];
  for (const w of FORBIDDEN_NARRATION_WORDS) if (new RegExp(`\\b${w}\\b`, "i").test(line.text)) out.push(w);
  if (/[—–]/.test(line.text)) out.push("dash");
  if (line.text.length >= NARRATION_MAX_CHARS) out.push("length");
  return out;
}

function expectHouseRules(lines: NarrationLine[]) {
  expect(lines.map((l) => l.id)).toEqual([...NARRATION_ORDER]);
  expect(lines.map((l) => l.id)).toEqual(["strengths", "number", "placement", "skill-decoding", "skill-fluency", "skill-comprehension", "path", "plan", "ask"]);
  for (const l of lines) {
    expect(strictProblems(l), `${l.id}: ${l.text}`).toEqual([]);
    expect(l.text.length, `${l.id} length`).toBeLessThan(340);
    expect(l.text.trim().length).toBeGreaterThan(0);
  }
  for (const id of ["number", "placement", "skill-decoding", "skill-fluency", "skill-comprehension"] as const) {
    expect(byId(lines, id)).not.toContain("!");
  }
  // "failing" lives only inside the reassurance sentence.
  for (const l of lines) {
    if (/\bfailing\b/.test(l.text)) {
      expect(l.id).toBe("placement");
      expect(l.text).toContain(REASSURANCE);
      expect(l.text.split(REASSURANCE).join("")).not.toMatch(/\bfailing\b/);
    }
  }
  expect(byId(lines, "ask").endsWith(ASK_CLOSE)).toBe(true);
}

/* ------------------------------------------------------------- Maya (A) */

describe("narrate: Maya, below level", () => {
  const maya = fixtureMaya();
  const today = new Date(2026, 8, 2);
  const plan = buildPlan({ decision: maya.decision, moments: maya.moments, today });
  const lines = narrate({ childName: "Maya", pronoun: "she", decision: maya.decision, moments: maya.moments, plan, today });

  it("follows the house rules on every line", () => expectHouseRules(lines));

  it("is what the fixture carries", () => {
    expect(maya.narration).toEqual(lines);
  });

  it("says the benchmark, the number, the percentile and the peer comparison", () => {
    const n = byId(lines, "number");
    expect(n).toContain("benchmark");
    expect(n).toContain("94 words per minute");
    expect(n).toContain("61");
    expect(n).toContain("11th");
    expect(n).toContain("average 2nd grader");
    expect(n).toContain("in the middle of the year");
  });

  it("places her two grade levels below with the reassurance sentence", () => {
    const p = byId(lines, "placement");
    expect(p).toContain("two grade levels below");
    expect(p).toContain(REASSURANCE);
  });

  it("cites the moments in the strengths and skill lines", () => {
    expect(byId(lines, "strengths")).toContain("She read every word on the 2nd-grade list");
    expect(byId(lines, "strengths")).toContain("she understood everything she read");
    expect(byId(lines, "skill-decoding")).toContain("Umbrella and remember are where the 3rd-grade list got hard");
    expect(byId(lines, "skill-decoding")).toContain("2nd-grade words");
    expect(byId(lines, "skill-fluency")).toContain("61 words per minute at 87 percent accuracy");
    expect(byId(lines, "skill-fluency")).toContain("In the story she slowed down but kept going");
    expect(byId(lines, "skill-comprehension")).toContain("three of three");
  });

  it("reads the plan back: path, dose, milestones, first unit", () => {
    const path = byId(lines, "path");
    expect(path).toContain("starts with 2nd-grade words and sounds");
    expect(path).toContain("skips 2nd-grade stories and 2nd-grade nonfiction");
    expect(path).toContain("targets 3rd-grade words next");
    expect(path).toContain("Luna");
    expect(path).toContain("the 4th-grade bar");
    const plan = byId(lines, "plan");
    expect(plan).toContain("10 minutes a day, 5 days a week");
    expect(plan).toContain("read like a 3rd grader by late April");
    expect(plan).toContain("reach the 4th-grade bar by next fall");
    const ask = byId(lines, "ask");
    expect(ask).toContain("Her plan starts with 2nd Grade Sound Workshop");
    expect(ask.endsWith("Everything on the path is included with Readee Plus. You can start it now.")).toBe(true);
  });

  it("uses her pronouns throughout", () => {
    for (const l of lines) expect(l.text).not.toMatch(/\b(they|them|their)\b/i);
  });
});

/* -------------------------------------------------------- above level */

describe("narrate: a 2nd grader reading above level", () => {
  const today = new Date(2027, 3, 15);
  const decision = decidePlacement({
    enrolled: 2,
    ladder: ladderFor(2, 3),
    passages: [{ band: 2, wordsCorrect: 118, wordsTotal: 120, durationSeconds: 60, prosody: 85 }],
    comprehension: { correct: 3, total: 3, band: 2 },
    foundations: null,
    date: today,
  });
  const moments: Moment[] = [
    { kind: "list-passed", band: 3, misses: 1 },
    { kind: "passage-expressive", band: 2 },
    { kind: "comprehension", band: 2, correct: 3, total: 3 },
  ];
  const plan = buildPlan({ decision, moments, today });
  const lines = narrate({ childName: "Leo", pronoun: "he", decision, moments, plan, today });

  it("follows the house rules on every line", () => expectHouseRules(lines));

  it("says above level with a keep-climbing sentence and never the reassurance", () => {
    expect(decision.relative.delta).toBe(-1);
    const p = byId(lines, "placement");
    expect(p).toContain("one grade level above");
    expect(p).toContain("climbing");
    expect(p).not.toContain(REASSURANCE);
    for (const l of lines) expect(l.text).not.toMatch(/\bfailing\b/);
  });

  it("keeps the numbers honest", () => {
    expect(byId(lines, "number")).toContain("spring benchmark for 2nd grade is 100 words per minute");
    expect(byId(lines, "number")).toContain("118");
    expect(byId(lines, "skill-fluency")).toContain("Pace and accuracy are both solid");
    expect(byId(lines, "strengths")).toContain("He read the 3rd-grade list with just one miss");
  });
});

/* -------------------------------------------------------- kindergarten */

describe("narrate: a kindergartner with foundations only and no passages", () => {
  const today = new Date(2026, 8, 20);
  const decision = decidePlacement({
    enrolled: 0,
    ladder: ladderFor(0, -1),
    passages: [],
    comprehension: null,
    foundations: { letterSounds: { correct: 3, total: 8 }, blending: { correct: 2, total: 6 }, nonsenseWords: { correct: 1, total: 6 } },
    date: today,
  });
  const moments: Moment[] = [
    { kind: "foundation", skill: "letterSounds", correct: 3, total: 8 },
    { kind: "foundation", skill: "blending", correct: 2, total: 6 },
    { kind: "foundation", skill: "nonsenseWords", correct: 1, total: 6 },
  ];
  const plan = buildPlan({ decision, moments, today });
  const lines = narrate({ childName: "Sam", decision, moments, plan, today });

  it("follows the house rules on every line", () => expectHouseRules(lines));

  it("has no words-per-minute number and talks about letter sounds instead", () => {
    for (const l of lines) expect(l.text).not.toMatch(/\d+ words per minute/);
    const n = byId(lines, "number");
    expect(n).toContain("Kindergartners are not measured on timed passages");
    expect(n).toContain("letter sounds");
    expect(n).toContain("three of eight letter sounds");
    expect(byId(lines, "skill-decoding")).toContain("letter sounds and blending come first");
    expect(byId(lines, "placement")).toContain("on grade level");
    expect(byId(lines, "plan")).toContain("for letter sounds by mid-October");
    expect(byId(lines, "plan")).toContain("for first words by mid-December");
    expect(byId(lines, "ask")).toContain("Kindergarten Story Treasures");
  });

  it("defaults to they with the right verb agreement", () => {
    expect(byId(lines, "strengths")).toContain("Here is where they are.");
    expect(byId(lines, "skill-decoding")).toContain("they are not reading words on their own yet");
    for (const l of lines) expect(l.text).not.toMatch(/\b(she|he|her|him|his)\b/i);
  });
});
