import { describe, it, expect } from "vitest";
import {
  createLadder, recordWord, activeList, nextWordIndex, decodingLevel, needsFoundations, startBand,
  WORDS_PER_LIST, type LadderState,
} from "@/lib/placement/ladder";

/** Play one whole list: a pass with `misses` wrong words (at most 2), or a fail (3 wrong in a row). */
function playList(s: LadderState, pass: boolean, misses = 0): LadderState {
  if (pass) {
    for (let i = 0; i < WORDS_PER_LIST; i++) s = recordWord(s, `w${i}`, i >= misses);
    return s;
  }
  for (let i = 0; i < 3; i++) s = recordWord(s, `x${i}`, false);
  return s;
}

describe("startBand", () => {
  it("starts two bands below enrolled grade, floor K", () => {
    expect(startBand(0)).toBe(0);
    expect(startBand(1)).toBe(0);
    expect(startBand(2)).toBe(0);
    expect(startBand(3)).toBe(1);
    expect(startBand(4)).toBe(2);
  });
});

describe("the word-list ladder", () => {
  it("opens one list at the start band", () => {
    const s = createLadder(4);
    expect(s.current).toBe(2);
    expect(s.lists).toHaveLength(1);
    expect(s.phase).toBe("seeking");
    expect(nextWordIndex(s)).toBe(0);
  });

  it("a 4th grader reading above level climbs to the ceiling list and stops", () => {
    let s = createLadder(4);
    s = playList(s, true); // 2nd
    s = playList(s, true); // 3rd
    s = playList(s, true); // 4th
    expect(s.done).toBe(false);
    s = playList(s, true); // 5th ceiling
    expect(s.done).toBe(true);
    const d = decodingLevel(s);
    expect(d.band).toBe(5);
    expect(d.ceilingPassed).toBe(true);
    expect(d.listsPassed).toEqual([2, 3, 4, 5]);
    expect(d.wordsAsked).toBe(40);
  });

  it("a 4th grader decoding at 2nd grade is found in two lists", () => {
    let s = createLadder(4);
    s = playList(s, true, 1); // 2nd, one miss
    s = playList(s, false); // 3rd fails at the third miss
    expect(s.done).toBe(true);
    const d = decodingLevel(s);
    expect(d.band).toBe(2);
    expect(d.lowestFailedAboveLevel).toBe(3);
    expect(d.wordsAsked).toBe(13);
    expect(needsFoundations(s)).toBe(false);
  });

  it("a 2nd grader decoding at 3rd grade climbs from K", () => {
    let s = createLadder(2);
    for (const pass of [true, true, true, true, false]) s = playList(s, pass);
    expect(s.done).toBe(true);
    expect(decodingLevel(s).band).toBe(3);
    expect(decodingLevel(s).listsPassed).toEqual([0, 1, 2, 3]);
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

  it("a 3rd grader who fails the first list descends and finds the floor", () => {
    let s = createLadder(3); // starts at 1st
    s = playList(s, false); // 1st fails
    expect(s.phase).toBe("descending");
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
    expect(s.done).toBe(true);
    expect(decodingLevel(s).band).toBeNull();
    expect(needsFoundations(s)).toBe(true);
  });

  it("a 3rd grader at level passes 1st, 2nd, 3rd and fails 4th", () => {
    let s = createLadder(3);
    for (const pass of [true, true, true, false]) s = playList(s, pass);
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
