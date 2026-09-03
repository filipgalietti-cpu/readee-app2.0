/**
 * PLACEMENT LADDER - the graded word-list search.
 *
 * The oldest, most-copied placement mechanism there is: the San Diego Quick
 * Assessment, Slosson, and the QRI/BRI word lists all read a short list per
 * grade band, start a couple of grades below the child's enrolled grade so the
 * first list is an easy win, climb while the child passes, and stop at a miss
 * count. This module is that search as a pure state machine. The runner feeds
 * it one word verdict at a time (Azure says the word was read or not) and asks
 * it what to do next. No I/O, no timers, no React.
 *
 * Rules (documented so Jennifer can veto each one by name):
 *   START      two bands below enrolled grade, floor K (SDQA: "2 or 3 lists below").
 *   LIST FAIL  the 3rd miss ends the list early (SDQA: "stop when he misses 3").
 *   LIST PASS  10 words asked and at most 2 misses.
 *   CLIMB      a passed list opens the next band, up to the 5th-grade ceiling list.
 *   DESCEND    a failed list with nothing passed yet opens the band below.
 *   DONE       first failure after a pass (ceiling found), first pass while
 *              descending (floor found), a pass at the ceiling, or a failed K list.
 */

/** 0 = K ... 4 = 4th grade. 5 = the ceiling list (5th-grade words) so an
 *  above-level 4th grader has somewhere to climb. */
export type Band = 0 | 1 | 2 | 3 | 4 | 5;
/** A band the app can actually place a child in (there is no 5th-grade content). */
export type PlacedBand = 0 | 1 | 2 | 3 | 4;

export const CEILING_BAND: Band = 5;
export const BAND_LABEL: Record<Band, string> = { 0: "K", 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th" };

export const WORDS_PER_LIST = 10;
export const LIST_FAIL_AT_MISSES = 3;
export const LIST_PASS_MAX_MISSES = 2;
export const START_BANDS_BELOW_ENROLLED = 1;
/** The ladder stops this many bands above the enrolled grade unless the child read that list perfectly, in which case it opens one more (i-Ready ranges to +3; Star adapts up). */
export const MAX_BANDS_ABOVE_ENROLLED = 2;
/** A list is passed the moment it cannot fail any more (8 right of 10 with at most 2 misses), so a strong reader is not asked the rest. */
export const LIST_PASS_AT_CORRECT = WORDS_PER_LIST - LIST_PASS_MAX_MISSES;

export type WordAttempt = { word: string; correct: boolean };

export type ListRecord = {
  band: Band;
  attempts: WordAttempt[];
  correct: number;
  missed: number;
  complete: boolean;
  passed: boolean;
};

export type LadderPhase = "seeking" | "climbing" | "descending" | "done";

export type LadderState = {
  enrolled: PlacedBand;
  current: Band;
  lists: ListRecord[];
  phase: LadderPhase;
  done: boolean;
};

export function startBand(enrolled: PlacedBand): Band {
  return Math.max(0, enrolled - START_BANDS_BELOW_ENROLLED) as Band;
}

/** The highest list this child can be asked: two bands above enrolled, never past the 5th-grade ceiling list. */
export function topBand(enrolled: PlacedBand): Band {
  return Math.min(CEILING_BAND, enrolled + MAX_BANDS_ABOVE_ENROLLED) as Band;
}

const newList = (band: Band): ListRecord => ({ band, attempts: [], correct: 0, missed: 0, complete: false, passed: false });

export function createLadder(enrolled: PlacedBand): LadderState {
  const start = startBand(enrolled);
  return { enrolled, current: start, lists: [newList(start)], phase: "seeking", done: false };
}

/** The list the runner should be asking words from right now (null when done). */
export function activeList(state: LadderState): ListRecord | null {
  if (state.done) return null;
  const last = state.lists[state.lists.length - 1];
  return last && !last.complete ? last : null;
}

/** Index of the next word to ask within the active list (0-based). */
export function nextWordIndex(state: LadderState): number {
  const list = activeList(state);
  return list ? list.attempts.length : 0;
}

/** Record one word verdict. Returns a NEW state; the input is never mutated. */
export function recordWord(state: LadderState, word: string, correct: boolean): LadderState {
  if (state.done) return state;
  const lists = state.lists.map((l) => ({ ...l, attempts: [...l.attempts] }));
  const list = lists[lists.length - 1];
  if (!list || list.complete) return state;

  list.attempts.push({ word, correct });
  if (correct) list.correct += 1;
  else list.missed += 1;

  if (list.missed >= LIST_FAIL_AT_MISSES) {
    list.complete = true;
    list.passed = false;
  } else if (list.correct >= LIST_PASS_AT_CORRECT) {
    list.complete = true;
    list.passed = true;
  } else if (list.attempts.length >= WORDS_PER_LIST) {
    list.complete = true;
    list.passed = list.missed <= LIST_PASS_MAX_MISSES;
  }

  const next: LadderState = { ...state, lists };
  return list.complete ? advance(next, list) : next;
}

function finish(state: LadderState): LadderState {
  return { ...state, phase: "done", done: true };
}

function open(state: LadderState, band: Band, phase: LadderPhase): LadderState {
  return { ...state, current: band, phase, lists: [...state.lists, newList(band)] };
}

function advance(state: LadderState, list: ListRecord): LadderState {
  if (list.passed) {
    if (state.phase === "descending") return finish(state); // floor found
    if (list.band >= CEILING_BAND) return finish(state); // top of the ladder
    if (list.band >= topBand(state.enrolled) && list.missed > 0) return finish(state); // far enough above grade; only a perfect list earns another
    return open(state, (list.band + 1) as Band, "climbing");
  }
  if (state.phase === "climbing") return finish(state); // ceiling found
  if (list.band <= 0) return finish(state); // nothing below K
  return open(state, (list.band - 1) as Band, "descending");
}

export type DecodingLevel = {
  /** Highest band with a passed list; null when no list was passed. */
  band: Band | null;
  emergent: boolean;
  ceilingPassed: boolean;
  listsPassed: Band[];
  /** The lowest band the child failed above their level (the next target). */
  lowestFailedAboveLevel: Band | null;
  wordsAsked: number;
};

export function decodingLevel(state: LadderState): DecodingLevel {
  const done = state.lists.filter((l) => l.complete);
  const passed = done.filter((l) => l.passed).map((l) => l.band).sort((a, b) => a - b);
  const band = passed.length ? (passed[passed.length - 1] as Band) : null;
  const failedAbove = done
    .filter((l) => !l.passed && (band === null || l.band > band))
    .map((l) => l.band)
    .sort((a, b) => a - b);
  return {
    band,
    emergent: band === null,
    ceilingPassed: band === CEILING_BAND,
    listsPassed: passed,
    lowestFailedAboveLevel: failedAbove.length ? (failedAbove[0] as Band) : null,
    wordsAsked: state.lists.reduce((n, l) => n + l.attempts.length, 0),
  };
}

/**
 * Whether the foundations stage (letter sounds, blending, nonsense words) should
 * run. Always for K and 1st. For older children, only when the word lists land
 * at K or below, where the foundations evidence is what the plan needs.
 */
export function needsFoundations(state: LadderState): boolean {
  if (state.enrolled <= 1) return true;
  if (!state.done) return false;
  const level = decodingLevel(state);
  return level.band === null || level.band === 0;
}
