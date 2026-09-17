import type { SavedLessonStats } from "@/lib/approved-unit/lesson-stats";
import { UNIT_ONE, approvedCoverage } from "@/lib/approved-unit/catalogue";
import { unitGateway, UNIT_EXAM_ID } from "@/lib/approved-unit/gateway";
import { unitHasAccess } from "@/lib/approved-unit/entitlement";
import type { JourneySnapshot } from "./types";
import { assignedJourneyCatalog } from "./next-lesson";
import { freeJourneyLesson, lessonCompleted } from "./lesson-access";
import { lessonPurpose } from "./lesson-purpose";

export type JourneyTheme = "garden" | "woods" | "valley";
export type AdventureLesson = {
  nodeId: string;
  lessonId: string;
  title: string;
  objective?: string;
  icon: "memo" | "musical-note" | "magnifying-glass" | "open-book" | "newspaper" | "seedling";
  shape: "page" | "garden" | "sign";
  available: boolean;
  lockedReason?: string;
  stats?: SavedLessonStats;
};
export type AdventureChapter = {
  id: string;
  name: string;
  subtitle: string;
  eyebrow?: string;
  progressLabel?: string;
  theme: JourneyTheme;
  lessonIds: string[];
  checkpointLabel?: string;
  milestoneLabel?: string;
  originLabel?: string;
};
export type AdventureReader = {
  name: string;
  provisional: boolean;
  assessmentComplete?: boolean;
  outfitId?: string | null;
  chapters: AdventureChapter[];
  definition: { lessons: AdventureLesson[] };
};
export type LiveAdventureChapter = AdventureChapter & {
  unitKey: string;
  grade: string;
  domain: string;
  unitLessonIds: string[];
  reason: string;
  rewardId: string | null;
  part: number;
  parts: number;
};
const TITLES: Record<string, string> = {
  RF: "Sound Workshop",
  RL: "Story Treasures",
  RI: "Fact Finders",
  L: "Word Magic",
};

/** View adapter only. Retains the existing catalog order, completion rules and access rules.
 * Reviewed units are one path. Legacy groups retain three-stop pagination until their unit
 * membership is reviewed; pagination never invents a curriculum unit or prescription.
 */
export function buildAdventureView(
  snapshot: JourneySnapshot,
  fullAccess = snapshot.billing.fullAccess,
) {
  const assigned = assignedJourneyCatalog(
    snapshot.child.reading_level ?? null,
    snapshot.result?.plan,
  );
  const gate = unitGateway(snapshot);
  const releasedIds = new Set<string>(
    UNIT_ONE.flatMap((l) => [l.standard, ...approvedCoverage(l.id)]),
  );
  releasedIds.add(UNIT_EXAM_ID);
  const catalog = gate.applies
    ? [
        ...UNIT_ONE.map((l) => ({
          ...assigned.find((a) => approvedCoverage(l.id).includes(a.standardId))!,
          standardId: l.standard,
          title: l.title,
        })),
        {
          standardId: UNIT_EXAM_ID,
          grade: "Kindergarten",
          domain: "Unit 1",
          title: "The Story Garden · Unit exam",
        },
        ...assigned.filter((l) => !releasedIds.has(l.standardId)),
      ]
    : assigned;
  const completed = new Set(
    catalog
      .filter((lesson) =>
        lessonCompleted(
          lesson.standardId,
          snapshot.practice,
          snapshot.lessonProgress,
          snapshot.completedStandards,
        ),
      )
      .map((lesson) => lesson.standardId),
  );
  if (gate.applies) {
    for (const lesson of UNIT_ONE)
      if (!snapshot.completedStandards?.includes(lesson.standard))
        completed.delete(lesson.standard);
    if (gate.ready) completed.add(UNIT_EXAM_ID);
    else completed.delete(UNIT_EXAM_ID);
  }
  const lessons: AdventureLesson[] = catalog.map((lesson) => {
    const [domain, , skill] = lesson.standardId.split(".");
    const print = domain === "RF" && skill?.startsWith("1");
    const individualSounds = domain === "RF" && /^2[cd]/.test(skill ?? "");
    return {
      stats: snapshot.lessonStats?.[lesson.standardId],
      nodeId: lesson.standardId,
      lessonId: lesson.standardId,
      title: lesson.title,
      objective:
        lesson.standardId === UNIT_EXAM_ID
          ? "Check your skills before opening the next unit."
          : lessonPurpose(lesson.standardId),
      icon: print
        ? "memo"
        : individualSounds
          ? "magnifying-glass"
          : domain === "RL"
            ? "open-book"
            : domain === "RI"
              ? "newspaper"
              : domain === "L"
                ? "memo"
                : "musical-note",
      shape:
        print || domain === "RL" || domain === "L"
          ? "page"
          : individualSounds || domain === "RI"
            ? "sign"
            : "garden",
      lockedReason:
        lesson.standardId === UNIT_EXAM_ID && !gate.examAvailable
          ? "Finish Unit 1 lessons"
          : gate.locked && !releasedIds.has(lesson.standardId)
            ? "Pass the Unit 1 exam"
            : undefined,
      available:
        lesson.standardId === UNIT_EXAM_ID
          ? gate.examAvailable &&
            unitHasAccess(
              { ...snapshot, billing: { ...snapshot.billing, fullAccess } },
              UNIT_EXAM_ID,
            )
          : gate.locked && !releasedIds.has(lesson.standardId)
            ? false
            : fullAccess ||
              freeJourneyLesson({
                lesson,
                signupAt: snapshot.billing.signupAt,
                readingLevel: snapshot.child.reading_level ?? null,
                placement: snapshot.result?.plan,
              }),
    };
  });
  const groups: { key: string; lessons: typeof catalog }[] = [];
  for (const lesson of catalog) {
    const key =
      gate.applies && releasedIds.has(lesson.standardId)
        ? "approved:k-unit-1"
        : `${lesson.grade}:${lesson.domain}`;
    const group = groups.find((entry) => entry.key === key);
    if (group) group.lessons.push(lesson);
    else groups.push({ key, lessons: [lesson] });
  }
  const legacyGradeOrder = [...new Set(groups.map((group) => group.lessons[0].grade))];
  const legacyUnitKeys = legacyGradeOrder.flatMap((grade) =>
    groups
      .filter((group) => group.key !== "approved:k-unit-1" && group.lessons[0].grade === grade)
      .map((group) => group.key),
  );
  const chapters: LiveAdventureChapter[] = groups.flatMap((group, unitIndex) => {
    const first = group.lessons[0];
    const released = group.key === "approved:k-unit-1";
    const domain = first.standardId.split(".")[0];
    const sceneSize = released ? group.lessons.length : 3;
    const parts = Math.ceil(group.lessons.length / sceneSize);
    const reason = snapshot.result?.plan.steps.find(
      (step) =>
        step.kind !== "skipped" &&
        step.unit?.grade === first.grade &&
        step.unit.domain === first.domain,
    )?.reason;
    return Array.from({ length: parts }, (_, index) => ({
      id: `${group.key}:part-${index + 1}`,
      unitKey: group.key,
      grade: first.grade,
      domain: first.domain,
      name: released ? "Kindergarten Unit 1" : (TITLES[domain] ?? first.domain),
      subtitle: released
        ? "8 lessons · Story Garden unit exam"
        : `${first.grade} · ${parts > 1 ? `Part ${index + 1} of ${parts}` : first.domain}`,
      eyebrow: released ? "UNIT 1" : undefined,
      progressLabel: released ? "unit stops" : "chapter lessons",
      theme:
        domain === "RF"
          ? ("garden" as const)
          : domain === "RL" || domain === "RI"
            ? ("valley" as const)
            : ("woods" as const),
      lessonIds: group.lessons
        .slice(index * sceneSize, index * sceneSize + sceneSize)
        .map((lesson) => lesson.standardId),
      unitLessonIds: group.lessons.map((lesson) => lesson.standardId),
      checkpointLabel:
        released && index === parts - 1
          ? "Unit exam results"
          : index === parts - 1
            ? "Unit review"
            : "Reading stop",
      milestoneLabel: index === parts - 1 ? "Unit keepsake" : "Next discoveries",
      originLabel:
        unitIndex === 0 && index === 0
          ? snapshot.result
            ? "Your assessment"
            : "Your starting point"
          : "Your reading plan",
      reason: released
        ? "Eight reviewed lessons, then the Story Garden exam. At least 80% with independent evidence opens the next unit."
        : (reason ??
          `Continue through ${first.grade.toLowerCase()} ${first.domain.toLowerCase()} in the existing lesson sequence.`),
      rewardId:
        !released && index === parts - 1 ? `chest${legacyUnitKeys.indexOf(group.key) + 1}` : null,
      part: index + 1,
      parts,
    }));
  });
  const current =
    (gate.applies && !fullAccess
      ? lessons.find((lesson) => lesson.available && !completed.has(lesson.nodeId))
      : undefined) ?? lessons.find((lesson) => !completed.has(lesson.nodeId));
  const currentChapter = current
    ? chapters.findIndex((chapter) => chapter.lessonIds.includes(current.lessonId))
    : Math.max(0, chapters.length - 1);
  const reader: AdventureReader = {
    name: snapshot.child.first_name || "Reader",
    provisional: snapshot.result?.decision.spectrum?.readingBand === null,
    assessmentComplete: !!snapshot.result,
    outfitId: snapshot.child.equipped_items?.outfit,
    chapters,
    definition: { lessons },
  };
  return { reader, chapters, lessons, completed, current, currentChapter, gate };
}
