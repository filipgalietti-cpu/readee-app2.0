import { expect, it } from "vitest";
import JourneyMap, { type JGrade } from "@/app/(protected)/journey/_components/JourneyMap";
import { gradeWord } from "@/app/(protected)/placement/_components/reveal/copy";

const grades: JGrade[] = [
  { grade: "Kindergarten", badge: "", units: [{ domKey: "RL", domainName: "Stories", lessons: [{ id: "RL.K.1", title: "Who is in the story?", status: "current" }] }] },
  { grade: "1st Grade", badge: "", units: [{ domKey: "RL", domainName: "Stories", lessons: [{ id: "RL.1.1", title: "Story questions", status: "premium" }] }] },
];
const props = { grades, kidName: "Reader", streak: 0, carrots: 0, equippedOutfitId: null, onStart() {}, onPremium() {} };
it("filters the visible grade while retaining global reward IDs and the actual current lesson", () => {
  const first = new JourneyMap({ ...props, visibleGrade: "Kindergarten" });
  const second = new JourneyMap({ ...props, visibleGrade: "1st Grade", openedChests: ["chest1"] });
  expect(first.lessonsL.map(l => l.id)).toEqual(["RL.K.1"]);
  expect(second.lessonsL.map(l => l.id)).toEqual(["RL.1.1"]);
  expect(first.chestsL[0].id).toBe("chest1");
  expect(second.chestsL[0].id).toBe("chest2");
  expect(second.state.opened.chest2).toBe(false);
  expect(second.curLesson()).toBeUndefined();
  expect(first.nodeAtPt.some(n => n.kind === "trophy")).toBe(false);
  expect(second.showFinalTrophy()).toBe(true);
});
it("does not promote a premium future grade just by browsing it", () => {
  const premium = grades.map(g => ({ ...g, units: g.units.map(u => ({ ...u, lessons: u.lessons.map(l => ({ ...l, status: "premium" as const })) })) }));
  const second = new JourneyMap({ ...props, grades: premium, visibleGrade: "1st Grade" });
  expect(second.curLesson()).toBeUndefined();
  expect(second.state.statuses["RL.K.1"]).toBe("current");
});
it("labels numeric and legacy string zero as kindergarten", () => {
  expect(gradeWord(0)).toBe("kindergarten");
  // @ts-expect-error Legacy database data reaches the runtime without TS validation.
  expect(gradeWord("0")).toBe("kindergarten");
  expect(gradeWord(1)).toBe("1st grade");
});

it("shows one unit and preserves its original chest ID without exposing the final trophy", () => {
  const units = [
    { domKey: "RF", domainName: "Foundations", lessons: [{ id: "RF.1.1", title: "Words", status: "current" as const }] },
    { domKey: "RL", domainName: "Stories", lessons: [{ id: "RL.1.1", title: "Stories", status: "premium" as const }] },
  ];
  const full = [{ grade: "1st Grade", badge: "1", units }];
  const first = new JourneyMap({ ...props, grades: full, visibleGrade: "1st Grade", visibleUnit: "u1" });
  const second = new JourneyMap({ ...props, grades: full, visibleGrade: "1st Grade", visibleUnit: "u2", openedChests: ["chest1"] });
  expect(first.lessonsL.map(l => l.id)).toEqual(["RF.1.1"]);
  expect(first.showFinalTrophy()).toBe(false);
  expect(second.lessonsL.map(l => l.id)).toEqual(["RL.1.1"]);
  expect(second.chestsL[0].id).toBe("chest2");
  expect(second.state.opened.chest2).toBe(false);
  expect(second.curLesson()).toBeUndefined();
  expect(second.showFinalTrophy()).toBe(true);
});

it("keeps the bunny outside the path, opposite the lesson card, at phone and desktop widths", () => {
  const map = new JourneyMap({ ...props, grades: [{grade:"Kindergarten",badge:"K",units:[{domKey:"RL",domainName:"Stories",lessons:Array.from({length:6},(_,i)=>({id:`RL.K.${i+1}`,title:"Story",status:"locked" as const}))}]}], visibleGrade: "Kindergarten", visibleUnit: "u1" });
  for (const width of [288, 358, 958]) {
    map.buildLayout(width);
    for (const lesson of map.lessonsL) {
      const bunny = map.idlePosFor(lesson.x, lesson.y);
      if (lesson.x < map.CX) expect(bunny.x + 96).toBeLessThan(lesson.x);
      else expect(bunny.x).toBeGreaterThan(lesson.x);
      expect(bunny.x).toBeGreaterThanOrEqual(0);
      expect(bunny.x + 96).toBeLessThanOrEqual(width);
    }
  }
});
