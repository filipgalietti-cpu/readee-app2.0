import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { meaningMachinesQuiz } from "./meaning-machines-quiz";
import { longWordTrainsQuiz } from "./long-word-trains-quiz";
import { takeApartAnyWordQuiz } from "./take-apart-any-word-quiz";
import { showMeWhereQuiz } from "./show-me-where-quiz";
import { followTheMessageQuiz } from "./follow-the-message-quiz";
import { whyTheyDidItQuiz } from "./why-they-did-it-quiz";
import { pointToTheFactQuiz } from "./point-to-the-fact-quiz";
import { bigIdeaBackedUpQuiz } from "./big-idea-backed-up-quiz";
import { becauseThenSoQuiz } from "./because-then-so-quiz";
import { threeWordToolsQuiz } from "./three-word-tools-quiz";
import { readAroundTheWordQuiz } from "./read-around-the-word-quiz";
import { newWordNewMeaningQuiz } from "./new-word-new-meaning-quiz";
import { sameRootNewBranchQuiz } from "./same-root-new-branch-quiz";

/**
 * GRADE 3 · UNIT 1 EXAM — 14 hand-chosen questions from the unit's quizzes
 * (one per standard for all 13 standards + a harder speak closer on RL.3.1;
 * 2 sorts + 3 speaks, 2 easier openers → core middle → harder close).
 * Every pick's stimulus is fully self-contained: the G3 quizzes speak their
 * second story page-by-page, so each pick here carries its own page/text
 * inside the narration (or on screen for the read-aloud) — no "the story we
 * just read" recall. ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g3-unit-1-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g3Unit1Exam: QuizDef = {
  id: "g3-unit-1-exam",
  lessonId: "g3-unit-1",
  title: "Unit 1 Exam",
  standard: "G3-U1",
  askCount: 14,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // easier openers (word level)
    pick(meaningMachinesQuiz, "e-1-cloudless-sky"),          // RF.3.3a suffix meaning (-less)
    pick(longWordTrainsQuiz, "e-4-joyous-word"),             // RF.3.3b Latin-suffix word recognition
    // phonics production
    pick(takeApartAnyWordQuiz, "c-5-speak-read-page-three"), // RF.3.3 read-aloud, two long words on the fly
    // literature block
    pick(showMeWhereQuiz, "c-1-proof-recital-soon"),         // RL.3.1 tap the proving line
    pick(followTheMessageQuiz, "c-1-kingfisher-message"),    // RL.3.2 message of a whole tale
    pick(whyTheyDidItQuiz, "c-1-trait-from-actions"),        // RL.3.3 trait proved by three actions
    // informational block
    pick(pointToTheFactQuiz, "c-3-put-together-hide"),       // RI.3.1 put two sentences together
    pick(bigIdeaBackedUpQuiz, "c-3-sort-holds-it-up"),       // RI.3.2 sort details: holds it up / just interesting
    pick(becauseThenSoQuiz, "c-1-why-flash-first"),          // RI.3.3 cause the text gives
    // language block
    pick(threeWordToolsQuiz, "c-4-current-meaning"),         // L.3.4 multiple-meaning word, sentence picks
    pick(readAroundTheWordQuiz, "c-6-speak-bewildered"),     // L.3.4a speak: meaning + name the clue
    pick(newWordNewMeaningQuiz, "c-4-unbelievable-test"),    // L.3.4b affix sum tested in context
    pick(sameRootNewBranchQuiz, "c-3-sort-same-root"),       // L.3.4c sort: same root / just looks like it
    // harder close
    pick(showMeWhereQuiz, "h-4-speak-tell-and-back"),        // RL.3.1 speak closer: tell, then back it up
  ],
};
