import type { JourneyDefinition, PlannedJourneyLesson } from "@/lib/journey/planner-contract";
import type { Band } from "@/lib/journey/evidence-contract";
import { UNIT_ONE, UNIT_VERSION } from "@/lib/approved-unit/catalogue";
import { UNIT_EXAM_ID } from "@/lib/approved-unit/gateway";
import metadata from "./lesson-metadata.json";

export type Theme = "garden" | "woods" | "valley";
export type JourneyChapter = {
  id: string;
  unitId: string;
  name: string;
  subtitle: string;
  theme: Theme;
  lessonIds: string[];
  checkpointId: string;
  why: string;
  eyebrow?: string;
  progressLabel?: string;
  checkpointLabel?: string;
  milestoneLabel?: string;
  originLabel?: string;
};
export type JourneyFixture = {
  id: string;
  label: string;
  name: string;
  enrollment: Band;
  entry: Band;
  provisional: boolean;
  strength: string;
  focus: string;
  goal: string;
  evidence: string;
  definition: JourneyDefinition;
  chapters: JourneyChapter[];
  completed: string[];
  completedCheckpoints: string[];
  subscriber: boolean;
};
type LessonId = keyof typeof metadata;
type Presentation = {
  icon: "memo" | "musical-note" | "magnifying-glass" | "open-book" | "newspaper" | "seedling";
  shape: "page" | "garden" | "sign";
  objective?: string;
};

const approvedPresentation: Record<(typeof UNIT_ONE)[number]["id"], Presentation> = {
  "rhyme-time": {
    icon: "musical-note",
    shape: "garden",
    objective: "Listen for words that rhyme and make a rhyme of your own.",
  },
  "key-details": {
    icon: "open-book",
    shape: "page",
    objective: "Use story details to answer who, what, and where questions.",
  },
  "syllable-beats": {
    icon: "musical-note",
    shape: "garden",
    objective: "Hear and count the syllables in spoken words.",
  },
  "book-makers": {
    icon: "open-book",
    shape: "page",
    objective: "Tell how authors and illustrators help make a book.",
  },
  "letter-pairs": {
    icon: "memo",
    shape: "page",
    objective: "Match uppercase letters with their lowercase partners.",
  },
  "book-basics": {
    icon: "memo",
    shape: "page",
    objective: "Follow print from left to right and page by page.",
  },
  "story-kinds": {
    icon: "open-book",
    shape: "page",
    objective: "Explore familiar kinds of books and what happens inside them.",
  },
  "big-kid-words": {
    icon: "seedling",
    shape: "garden",
    objective: "Use position words to describe where objects are.",
  },
};

const approvedUnitSource = {
  source: "Founder-approved Kindergarten Unit 1 catalogue",
  locator: "lib/approved-unit/catalogue.ts",
  version: UNIT_VERSION,
};

const approvedLessons: PlannedJourneyLesson[] = UNIT_ONE.map((lesson) => ({
  nodeId: `kindergarten-unit-one:${lesson.id}`,
  lessonId: lesson.id,
  slug: lesson.id,
  contentVersion: UNIT_VERSION,
  unitId: UNIT_VERSION,
  standardIds: [lesson.standard],
  reason: { category: "normal-curriculum-sequence", curriculumSource: approvedUnitSource },
  parentExplanation: approvedPresentation[lesson.id].objective ?? lesson.title,
  explanationTemplateVersion: "approved-unit-review-v1",
  ruleVersion: UNIT_VERSION,
}));

const approvedUnitFixture: JourneyFixture = {
  id: "kindergarten-unit-one",
  label: "Approved · Kindergarten Unit 1",
  name: "Reader",
  enrollment: 0,
  entry: 0,
  provisional: false,
  strength: "Learning through reviewed reading activities",
  focus: "Kindergarten Unit 1 reading foundations",
  goal: "Complete the Story Garden unit exam",
  evidence: "Founder-approved Kindergarten Unit 1 review fixture.",
  definition: {
    schemaVersion: 1,
    plannerVersion: "approved-unit-review-v1",
    curriculumReleaseId: UNIT_VERSION,
    sourcePlacementId: null,
    learnerAdapterVersion: "learner-evidence-v1",
    lessons: approvedLessons,
  },
  chapters: [
    {
      id: "approved-k-unit-1",
      unitId: UNIT_VERSION,
      name: "Kindergarten Unit 1",
      subtitle: "8 lessons · Story Garden unit exam",
      theme: "garden",
      lessonIds: UNIT_ONE.map((lesson) => lesson.id),
      checkpointId: UNIT_EXAM_ID,
      why: "Eight reviewed lessons build toward the Story Garden unit exam. Passing the exam opens the next unit.",
      eyebrow: "UNIT 1",
      progressLabel: "unit lessons",
      checkpointLabel: "Story Garden exam",
      milestoneLabel: "Unit keepsake",
      originLabel: "Your assessment",
    },
  ],
  completed: approvedLessons.slice(0, 2).map((lesson) => lesson.nodeId),
  completedCheckpoints: [],
  subscriber: true,
};

const source = {
  source: "Journey V2 development fixture",
  locator: "Illustrative sequencing; not approved curriculum",
  version: "journey-v2-demo-v1",
};
const sequences = {
  foundation: [
    ["sentence-shapes", "blend-builders", "sound-spotters"],
    ["sound-stretchers", "smooth-reader", "check-and-fix"],
    ["digraph-detectives", "sound-it-out", "magic-teams"],
  ],
  confirmation: [
    ["sentence-shapes"],
    ["blend-builders", "sound-spotters"],
    ["sound-stretchers", "smooth-reader", "check-and-fix"],
  ],
  woods: [["digraph-detectives", "sound-it-out", "magic-teams"]],
  farther: [
    ["sound-stretchers", "smooth-reader", "check-and-fix"],
    ["digraph-detectives", "sound-it-out", "magic-teams"],
  ],
  meaning: [
    ["ask-it-find-it", "story-message", "fact-questions"],
    ["story-parts", "word-pictures", "fact-links"],
    ["two-kinds-of-books", "whos-telling-it"],
  ],
  above: [
    ["fable-tellers", "character-challenges", "paragraph-power", "decoding-champions"],
    ["word-music", "story-shape", "two-ways-to-see"],
  ],
} satisfies Record<string, LessonId[][]>;

function makeFixture(input: {
  id: string;
  label: string;
  name: string;
  sequence: keyof typeof sequences;
  enrollment?: Band;
  entry?: Band;
  provisional?: boolean;
  completed?: number;
  checkpointCompletions?: number[];
  subscriber?: boolean;
  strength: string;
  focus: string;
  goal: string;
  evidence: string;
}): JourneyFixture {
  const groups = sequences[input.sequence];
  const names =
    input.sequence === "woods"
      ? ["Word Woods"]
      : input.sequence === "confirmation"
        ? ["Sound Garden", "Sound Garden · next steps", "Sentence Trail"]
        : input.sequence === "meaning" || input.sequence === "above"
          ? ["Story Valley", "Word Woods", "Reading Summit"]
          : input.sequence === "farther"
            ? ["Sentence Trail", "Word Woods"]
            : ["Sound Garden", "Sentence Trail", "Word Woods"];
  const subtitles =
    input.sequence === "farther"
      ? ["From words to a whole thought.", "Find your way through new words."]
      : input.sequence === "woods"
        ? ["Find your way through new words."]
        : input.sequence === "meaning" || input.sequence === "above"
          ? [
              "Find the story behind the words.",
              "Make meaning, one detail at a time.",
              "Bring the whole story together.",
            ]
          : [
              "Little sounds. Wonderful discoveries.",
              "From words to a whole thought.",
              "Find your way through new words.",
            ];
  const themes: Theme[] =
    input.sequence === "woods"
      ? ["woods"]
      : input.sequence === "confirmation"
        ? ["garden", "garden", "valley"]
        : input.sequence === "meaning" || input.sequence === "above"
          ? ["valley", "woods", "garden"]
          : input.sequence === "farther"
            ? ["valley", "woods"]
            : ["garden", "valley", "woods"];
  const chapters: JourneyChapter[] = groups.map((ids, index) => ({
    id: `demo-chapter-${input.id}-${index}`,
    unitId: metadata[ids[0]].unit,
    name: names[index],
    subtitle: subtitles[index],
    theme: themes[index],
    lessonIds: ids,
    checkpointId: `demo-checkpoint-${input.id}-${index}`,
    why:
      index === 0
        ? input.provisional
          ? "This proposed starting chapter provides guided practice while independent reading is confirmed. It is not a confirmed skill deficit."
          : `This illustrative route begins with ${input.focus.toLowerCase()}. The lesson choices demonstrate how a reviewed recommendation would appear.`
        : "These destinations demonstrate normal continuation within a proposed reading route. Their instructional order still requires curriculum review.",
  }));
  const lessons: PlannedJourneyLesson[] = groups.flatMap((ids, chapter) =>
    ids.map((id, position) => ({
      nodeId: `${input.id}:${id}`,
      lessonId: id,
      slug: id,
      contentVersion: "development-presentation-only",
      unitId: metadata[id].unit,
      standardIds: [metadata[id].standard],
      reason:
        chapter === 0 && position === 0
          ? {
              category: input.provisional
                ? "provisional-follow-up"
                : "assessment-selected-starting-unit",
              evidence: [source],
              mappingId: `demo-${input.id}-entry`,
              mappingVersion: "unapproved-presentation-fixture-v1",
            }
          : { category: "normal-curriculum-sequence", curriculumSource: source },
      parentExplanation:
        chapter === 0 && position === 0
          ? chapters[0].why
          : `${metadata[id].objective} This lesson illustrates the next step in the proposed chapter, rather than a separate diagnosed weakness.`,
      explanationTemplateVersion: "demo-copy-v1",
      ruleVersion: "unapproved-presentation-fixture-v1",
    })),
  );
  return {
    ...input,
    enrollment: input.enrollment ?? 1,
    entry: input.entry ?? 1,
    provisional: input.provisional ?? false,
    subscriber: input.subscriber ?? false,
    definition: {
      schemaVersion: 1,
      plannerVersion: "presentation-fixture-only",
      curriculumReleaseId: "unreleased-visual-fixture",
      sourcePlacementId: `synthetic-assessment-${input.id}`,
      learnerAdapterVersion: "learner-evidence-v1",
      lessons,
    },
    chapters,
    completedCheckpoints: (input.checkpointCompletions ?? []).map(
      (index) => chapters[index].checkpointId,
    ),
    completed: lessons.slice(0, input.completed ?? 0).map((l) => l.nodeId),
  };
}
const base = {
  name: "Filus",
  sequence: "foundation" as const,
  strength: "Recognizing familiar words",
  focus: "Blending sounds into words",
  goal: "Read short sentences with confidence",
  evidence:
    "Synthetic profile: familiar-word success with guided sound-blending practice proposed. No specific phonics deficiency is asserted.",
};
export const JOURNEY_FIXTURES: JourneyFixture[] = [
  approvedUnitFixture,
  makeFixture({ ...base, id: "foundations", label: "A · Grade 1 / foundations" }),
  makeFixture({
    ...base,
    id: "farther",
    label: "B · Grade 1 / later start",
    name: "Nora",
    sequence: "farther",
    strength: "Reading familiar sentences",
    focus: "Reading smoothly and checking meaning",
    goal: "Read longer sentences independently",
    evidence:
      "Synthetic confirmed Grade 1 starting area; this route illustrates starting later without marking omitted lessons mastered.",
  }),
  makeFixture({
    ...base,
    id: "meaning",
    label: "C · Strong decoder / meaning",
    name: "Maya",
    sequence: "meaning",
    strength: "Reading words accurately",
    focus: "Understanding and retelling stories",
    goal: "Explain a story using its details",
    evidence:
      "Synthetic uneven profile: word reading is stronger than connected-text understanding. This is broad guided-reading follow-up, not an item-level diagnosis.",
  }),
  makeFixture({
    ...base,
    id: "above",
    label: "D · Above enrollment",
    name: "Leo",
    sequence: "above",
    entry: 2,
    strength: "Reading beyond the school starting level",
    focus: "Connecting ideas across a text",
    goal: "Discuss Grade 2 stories with evidence",
    evidence:
      "Synthetic confirmed Grade 2 reading with Grade 1 enrollment. Enrollment remains unchanged. These exact lessons have not been prescribed by the production planner.",
  }),
  makeFixture({
    ...base,
    id: "provisional",
    label: "E · Provisional / follow-up",
    name: "Amelia-Rose Alexandra",
    provisional: true,
    sequence: "confirmation",
    strength: "Recognizing words in isolation",
    focus: "Guided reading to confirm a starting point",
    goal: "Find a comfortable independent reading level",
    evidence:
      "Synthetic provisional result: independent reading was not confirmed. Word-reading success does not establish independent reading at that band.",
  }),
  makeFixture({
    ...base,
    id: "progress",
    label: "F · Four lessons completed",
    name: "Oliver",
    completed: 4,
    checkpointCompletions: [0],
    subscriber: true,
  }),
  makeFixture({ ...base, id: "subscriber", label: "G · Readee+ subscriber", subscriber: true }),
  makeFixture({ ...base, id: "free", label: "H · Non-subscriber" }),
  makeFixture({
    ...base,
    id: "garden-later",
    label: "I · Later in Sound Garden",
    name: "Zoe",
    completed: 1,
    subscriber: true,
  }),
  makeFixture({
    ...base,
    id: "woods",
    label: "J · Beginning in Word Woods",
    name: "Theo",
    sequence: "woods",
    focus: "Exploring spelling patterns",
    goal: "Read new words with confidence",
    evidence:
      "Synthetic later instructional entry. Earlier lessons are omitted, not recorded as completed or mastered.",
  }),
];
export const lessonTitle = (id: string) =>
  UNIT_ONE.find((lesson) => lesson.id === id)?.title ?? metadata[id as LessonId]?.title ?? id;
export function firstIncomplete(fixture: JourneyFixture, completed: ReadonlySet<string>) {
  return fixture.definition.lessons.find((l) => !completed.has(l.nodeId));
}
export function chapterForLesson(fixture: JourneyFixture, lessonId?: string) {
  if (!lessonId) return fixture.chapters.length - 1;
  return Math.max(
    0,
    fixture.chapters.findIndex((c) => c.lessonIds.includes(lessonId ?? "")),
  );
}
export function canOpenDemoLesson(
  fixture: JourneyFixture,
  lesson: PlannedJourneyLesson,
  subscriber: boolean,
  completed: ReadonlySet<string>,
) {
  return (
    subscriber ||
    completed.has(lesson.nodeId) ||
    fixture.definition.lessons[0].nodeId === lesson.nodeId
  );
}
export const gradeName = (band: Band) => (band === 0 ? "Kindergarten" : `Grade ${band}`);

// Visual variants only: these are not new instructional categories or prescriptions.
export function lessonPresentation(id: string): Presentation {
  const approved = approvedPresentation[id as keyof typeof approvedPresentation];
  if (approved) return approved;
  if (id === "sentence-shapes")
    return { icon: "memo", shape: "page", objective: "Find the parts of a complete sentence." };
  if (id === "blend-builders")
    return {
      icon: "musical-note",
      shape: "garden",
      objective: "Put spoken sounds together to make words.",
    };
  if (id === "sound-spotters")
    return {
      icon: "magnifying-glass",
      shape: "sign",
      objective: "Find the sounds at each part of a word.",
    };
  const standard = metadata[id as LessonId]?.standard ?? "";
  if (standard.startsWith("RL")) return { icon: "open-book", shape: "page" };
  if (standard.startsWith("RI")) return { icon: "newspaper", shape: "sign" };
  return { icon: "seedling", shape: "garden" };
}
