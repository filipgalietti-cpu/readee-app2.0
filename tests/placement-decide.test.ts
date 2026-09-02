import { describe, it, expect } from "vitest";
import { createLadder, recordWord, activeList, WORDS_PER_LIST, type LadderState, type PlacedBand, type Band } from "@/lib/placement/ladder";
import { decidePlacement, relativeLabel, bandFromGrade, BAND_GRADE_KEY, type PassageEvidence } from "@/lib/placement/decide";
import { childCopyProblems } from "@/lib/placement/bank";
import { grades } from "@/lib/assessment/questions";

function playList(s: LadderState, pass: boolean): LadderState {
  if (pass) {
    for (let i = 0; i < WORDS_PER_LIST; i++) s = recordWord(s, `w${i}`, true);
    return s;
  }
  for (let i = 0; i < 3; i++) s = recordWord(s, `x${i}`, false);
  return s;
}

/** A ladder played by a child whose true word-reading level is `trueBand` (-1 = reads nothing). */
function ladderFor(enrolled: PlacedBand, trueBand: number): LadderState {
  let s = createLadder(enrolled);
  let guard = 0;
  while (!s.done && guard++ < 20) {
    const list = activeList(s);
    if (!list) break;
    s = playList(s, list.band <= trueBand);
  }
  return s;
}

const passage = (band: Band, wordsCorrect: number, wordsTotal: number, durationSeconds = 60): PassageEvidence => ({
  band, wordsCorrect, wordsTotal, durationSeconds,
});
const SPRING = new Date(2027, 3, 15);

describe("relativeLabel", () => {
  it("uses i-Ready's wording", () => {
    expect(relativeLabel(0)).toBe("on grade level");
    expect(relativeLabel(1)).toBe("one grade level below");
    expect(relativeLabel(2)).toBe("two grade levels below");
    expect(relativeLabel(3)).toBe("three or more grade levels below");
    expect(relativeLabel(4)).toBe("three or more grade levels below");
    expect(relativeLabel(-1)).toBe("one grade level above");
    expect(relativeLabel(-2)).toBe("two or more grade levels above");
  });
});

describe("bandFromGrade", () => {
  it("tolerates the grade strings the app stores", () => {
    expect(bandFromGrade("2nd")).toBe(2);
    expect(bandFromGrade("Grade 3")).toBe(3);
    expect(bandFromGrade("kindergarten")).toBe(0);
    expect(bandFromGrade("K")).toBe(0);
    expect(bandFromGrade("4")).toBe(4);
    expect(bandFromGrade("first")).toBe(1);
    expect(bandFromGrade(null)).toBe(0);
  });
});

describe("decidePlacement: the 5 x 5 matrix", () => {
  for (let enrolled = 0; enrolled <= 4; enrolled++) {
    for (let trueBand = 0; trueBand <= 4; trueBand++) {
      it(`enrolled ${enrolled}, true level ${trueBand}`, () => {
        const e = enrolled as PlacedBand;
        const t = trueBand as PlacedBand;
        const d = decidePlacement({
          enrolled: e,
          ladder: ladderFor(e, t),
          passages: t >= 1 ? [passage(t, 97, 100)] : [],
          comprehension: t >= 1 ? { correct: 3, total: 3, band: t } : null,
          foundations: t === 0 ? { letterSounds: { correct: 6, total: 8 }, blending: { correct: 5, total: 6 }, nonsenseWords: { correct: 4, total: 6 } } : null,
          date: SPRING,
        });
        expect(d.placedBand).toBe(t);
        expect(d.relative.delta).toBe(e - t);
        expect(d.relative.label).toBe(relativeLabel(e - t));
        expect(d.gradeKey).toBe(BAND_GRADE_KEY[t]);
        expect(d.readingLevelName).toBe(grades[BAND_GRADE_KEY[t]].reading_level_name);
        expect(d.flags).not.toContain("passage-frustration-stepdown");
        expect(d.flags).not.toContain("comprehension-stepdown");
      });
    }
  }
});

describe("decidePlacement: guards and flags", () => {
  it("a 4th grader who passes the 5th-grade list places at 4th, on grade level, flagged above", () => {
    const d = decidePlacement({ enrolled: 4, ladder: ladderFor(4, 5), passages: [passage(4, 98, 100)], comprehension: { correct: 3, total: 3, band: 4 }, foundations: null, date: SPRING });
    expect(d.placedBand).toBe(4);
    expect(d.flags).toContain("above-4th-words");
    expect(d.relative.label).toBe("on grade level");
    expect(d.decoding.ceilingPassed).toBe(true);
  });

  it("frustration-level accuracy on the placed passage steps the placement down one band", () => {
    const d = decidePlacement({ enrolled: 3, ladder: ladderFor(3, 3), passages: [passage(3, 85, 100)], comprehension: { correct: 3, total: 3, band: 3 }, foundations: null, date: SPRING });
    expect(d.placedBand).toBe(2);
    expect(d.flags).toContain("passage-frustration-stepdown");
    expect(d.readingLevelName).toBe("Growing Reader");
    expect(d.relative.label).toBe("one grade level below");
  });

  it("half or fewer comprehension questions right steps down one band", () => {
    const d = decidePlacement({ enrolled: 3, ladder: ladderFor(3, 3), passages: [passage(3, 96, 100)], comprehension: { correct: 1, total: 3, band: 3 }, foundations: null, date: SPRING });
    expect(d.placedBand).toBe(2);
    expect(d.flags).toContain("comprehension-stepdown");
  });

  it("accuracy and comprehension together step down only once", () => {
    const d = decidePlacement({ enrolled: 3, ladder: ladderFor(3, 3), passages: [passage(3, 85, 100)], comprehension: { correct: 1, total: 3, band: 3 }, foundations: null, date: SPRING });
    expect(d.placedBand).toBe(2);
    expect(d.flags).toContain("passage-frustration-stepdown");
    expect(d.flags).not.toContain("comprehension-stepdown");
  });

  it("never steps below K", () => {
    const d = decidePlacement({ enrolled: 1, ladder: ladderFor(1, 0), passages: [], comprehension: { correct: 0, total: 3, band: 0 }, foundations: null, date: SPRING });
    expect(d.placedBand).toBe(0);
  });
});

describe("decidePlacement: the parent card numbers", () => {
  it("a 4th grader decoding at 2nd who also read the 4th-grade passage gets the norm comparison", () => {
    const d = decidePlacement({
      enrolled: 4,
      ladder: ladderFor(4, 2),
      passages: [passage(2, 70, 72), passage(4, 61, 70)],
      comprehension: { correct: 2, total: 3, band: 2 },
      foundations: null,
      date: SPRING,
    });
    expect(d.placedBand).toBe(2);
    expect(d.flags).not.toContain("passage-frustration-stepdown");
    expect(d.fluency?.onEnrolledPassage).toBe(true);
    expect(d.fluency?.wcpm).toBe(61);
    expect(d.fluency?.typicalForEnrolled).toBe(133);
    expect(d.fluency?.percentile?.band).toBe("below 10");
    expect(d.fluency?.gradeEquivalent?.label).toBe("late-1st-grade");
    expect(d.flags).not.toContain("norm-passage-not-at-enrolled-grade");
    expect(d.needs).toContain("3rd-grade words");
    expect(d.strengths).toContain("reads 2nd-grade words");
    expect(d.seeds.find((s) => s.standard_id === "RF.2.3")?.pass).toBe(true);
    expect(d.seeds.find((s) => s.standard_id === "RL.2.1")?.pass).toBe(true);
    expect(d.seeds.find((s) => s.standard_id === "RF.3.3")?.pass).toBe(false);
    expect(d.seeds.some((s) => s.standard_id === "RF.2.4")).toBe(true);
  });

  it("when the enrolled passage was skipped, the numbers are against the passage actually read and flagged", () => {
    const d = decidePlacement({ enrolled: 4, ladder: ladderFor(4, 2), passages: [passage(2, 90, 92)], comprehension: { correct: 3, total: 3, band: 2 }, foundations: null, date: SPRING });
    expect(d.fluency?.onEnrolledPassage).toBe(false);
    expect(d.fluency?.band).toBe(2);
    expect(d.fluency?.percentile?.percentile).toBe(41);
    expect(d.flags).toContain("norm-passage-not-at-enrolled-grade");
    expect(d.strengths).toContain("reads accurately");
    expect(d.strengths).toContain("understands what they read");
  });

  it("a K child who reads nothing is placed at K with an emergent flag and foundations needs", () => {
    const d = decidePlacement({
      enrolled: 0,
      ladder: ladderFor(0, -1),
      passages: [],
      comprehension: null,
      foundations: { letterSounds: { correct: 3, total: 8 }, blending: { correct: 2, total: 6 }, nonsenseWords: { correct: 1, total: 6 } },
      date: new Date(2026, 8, 20),
    });
    expect(d.placedBand).toBe(0);
    expect(d.readingLevelName).toBe("Beginning Reader");
    expect(d.flags).toContain("emergent");
    expect(d.fluency).toBeNull();
    expect(d.comprehension).toBeNull();
    expect(d.needs).toEqual(expect.arrayContaining(["letter sounds", "blending sounds into words", "sounding out new words"]));
    expect(d.seeds.find((s) => s.standard_id === "RF.K.3a")?.pass).toBe(false);
    expect(d.season).toBe("fall");
  });

  it("every strength and need is clean child-safe copy", () => {
    const cases = [
      decidePlacement({ enrolled: 4, ladder: ladderFor(4, 2), passages: [passage(2, 70, 72), passage(4, 61, 70)], comprehension: { correct: 1, total: 3, band: 2 }, foundations: null, date: SPRING }),
      decidePlacement({ enrolled: 0, ladder: ladderFor(0, -1), passages: [], comprehension: null, foundations: { letterSounds: { correct: 8, total: 8 }, blending: { correct: 6, total: 6 }, nonsenseWords: { correct: 6, total: 6 } }, date: SPRING }),
    ];
    for (const d of cases) {
      for (const s of [...d.strengths, ...d.needs, d.relative.label, d.readingLevelName]) {
        expect(childCopyProblems(s)).toEqual([]);
      }
    }
  });
});
