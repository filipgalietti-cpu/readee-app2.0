import { describe, it, expect } from "vitest";
import {
  createLadder, recordWord, activeList, nextWordIndex, decodingLevel, needsFoundations, startBand, topBand,
  WORDS_PER_LIST, LIST_PASS_AT_CORRECT, type LadderState,
} from "@/lib/placement/ladder";

/** Play one list: a pass with `misses` wrong words first (at most 2) then enough right ones, or a fail (3 wrong in a row). */
function playList(s: LadderState, pass: boolean, misses = 0): LadderState {
  if (pass) {
    for (let i = 0; i < misses; i++) s = recordWord(s, `m${i}`, false);
    for (let i = 0; i < LIST_PASS_AT_CORRECT; i++) s = recordWord(s, `w${i}`, true);
    return s;
  }
  for (let i = 0; i < 3; i++) s = recordWord(s, `x${i}`, false);
  return s;
}

describe("startBand / topBand", () => {
  it("starts one band below enrolled grade, floor K", () => {
    expect(startBand(0)).toBe(0);
    expect(startBand(1)).toBe(0);
    expect(startBand(2)).toBe(1);
    expect(startBand(3)).toBe(2);
    expect(startBand(4)).toBe(3);
  });
  it("climbs at most two bands above enrolled, never past the 5th-grade ceiling", () => {
    expect(topBand(0)).toBe(2);
    expect(topBand(2)).toBe(4);
    expect(topBand(3)).toBe(5);
    expect(topBand(4)).toBe(5);
  });
});

describe("the word-list ladder", () => {
  it("opens one list at the start band", () => {
    const s = createLadder(4);
    expect(s.current).toBe(3);
    expect(s.lists).toHaveLength(1);
    expect(s.phase).toBe("seeking");
    expect(nextWordIndex(s)).toBe(0);
  });

  it("a list passes as soon as eight words are right, without asking the rest", () => {
    let s = createLadder(0);
    for (let i = 0; i < LIST_PASS_AT_CORRECT; i++) s = recordWord(s, `w${i}`, true);
    expect(s.lists[0].complete).toBe(true);
    expect(s.lists[0].passed).toBe(true);
    expect(s.lists[0].attempts).toHaveLength(8);
  });

  it("a 4th grader reading above level climbs 3rd, 4th, 5th and stops: 24 words", () => {
    let s = createLadder(4);
    s = playList(s, true); // 3rd
    s = playList(s, true); // 4th
    expect(s.done).toBe(false);
    s = playList(s, true); // 5th ceiling
    expect(s.done).toBe(true);
    const d = decodingLevel(s);
    expect(d.band).toBe(5);
    expect(d.ceilingPassed).toBe(true);
    expect(d.listsPassed).toEqual([3, 4, 5]);
    expect(d.wordsAsked).toBe(24);
  });

  it("a strong 2nd grader stops two bands above enrolled: 1st, 2nd, 3rd, 4th = 32 words", () => {
    let s = createLadder(2);
    for (let i = 0; i < 3; i++) s = playList(s, true);
    s = playList(s, true, 1); // 4th passed with one miss: far enough
    expect(s.done).toBe(true);
    const d = decodingLevel(s);
    expect(d.band).toBe(4);
    expect(d.listsPassed).toEqual([1, 2, 3, 4]);
    expect(d.wordsAsked).toBe(33);
  });

  it("a flawless 2nd grader keeps climbing past the cap to the ceiling list", () => {
    let s = createLadder(2);
    for (let i = 0; i < 4; i++) s = playList(s, true); // 1st..4th perfect
    expect(s.done).toBe(false);
    s = playList(s, true); // 5th ceiling
    expect(s.done).toBe(true);
    expect(decodingLevel(s).band).toBe(5);
  });

  it("a 4th grader decoding at 2nd grade: fails 3rd, descends, passes 2nd", () => {
    let s = createLadder(4);
    s = playList(s, false); // 3rd fails at the third miss
    expect(s.phase).toBe("descending");
    s = playList(s, true, 1); // 2nd, one miss
    expect(s.done).toBe(true);
    const d = decodingLevel(s);
    expect(d.band).toBe(2);
    expect(d.lowestFailedAboveLevel).toBe(3);
    expect(d.wordsAsked).toBe(12);
    expect(needsFoundations(s)).toBe(false);
  });

  it("a 2nd grader decoding at 3rd grade climbs from 1st", () => {
    let s = createLadder(2);
    for (const pass of [true, true, true, false]) s = playList(s, pass);
    expect(s.done).toBe(true);
    expect(decodingLevel(s).band).toBe(3);
    expect(decodingLevel(s).listsPassed).toEqual([1, 2, 3]);
  });

  it("a K child who cannot read the K list is emergent and needs foundations", () => {
    let s = createLadder(0);
    s = playList(s, false);
    expect(s.done).toBe(true);
    const d = decodingLevel(s);
    expect(d.band).toBeNull();
    expect(d.emergent).toBe(true);
    expect(needsFoundations(s)).toBe(true);
  });

  it("a 3rd grader who fails the first two lists descends and finds the floor at K", () => {
    let s = createLadder(3); // starts at 2nd
    s = playList(s, false); // 2nd fails
    expect(s.phase).toBe("descending");
    expect(s.current).toBe(1);
    s = playList(s, false); // 1st fails
    expect(s.current).toBe(0);
    s = playList(s, true); // K passes
    expect(s.done).toBe(true);
    expect(decodingLevel(s).band).toBe(0);
    expect(needsFoundations(s)).toBe(true);
  });

  it("a 3rd grader who fails every list is emergent", () => {
    let s = createLadder(3);
    s = playList(s, false);
    s = playList(s, false);
    s = playList(s, false);
    expect(s.done).toBe(true);
    expect(decodingLevel(s).band).toBeNull();
    expect(needsFoundations(s)).toBe(true);
  });

  it("a 3rd grader at level passes 2nd, 3rd and fails 4th", () => {
    let s = createLadder(3);
    for (const pass of [true, true, false]) s = playList(s, pass);
    const d = decodingLevel(s);
    expect(d.band).toBe(3);
    expect(d.lowestFailedAboveLevel).toBe(4);
    expect(needsFoundations(s)).toBe(false);
  });

  it("a list passes with two misses and fails on the third", () => {
    let s = createLadder(0);
    s = playList(s, true, 2);
    expect(s.lists[0].passed).toBe(true);
    expect(s.lists[0].missed).toBe(2);
    expect(s.lists[0].attempts).toHaveLength(WORDS_PER_LIST);
    let t = createLadder(0);
    t = playList(t, false);
    expect(t.lists[0].complete).toBe(true);
    expect(t.lists[0].attempts).toHaveLength(3);
  });

  it("never mutates its input and ignores words after done", () => {
    const s0 = createLadder(1);
    const snapshot = JSON.stringify(s0);
    const s1 = recordWord(s0, "cat", true);
    expect(JSON.stringify(s0)).toBe(snapshot);
    expect(s1.lists[0].attempts).toHaveLength(1);
    expect(activeList(s1)?.band).toBe(0);
    let done = createLadder(0);
    done = playList(done, false);
    const after = recordWord(done, "extra", true);
    expect(after).toBe(done);
  });
});
