import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { syllableSplittersQuiz } from "./syllable-splitters-quiz";
import { wordBreakersQuiz } from "./word-breakers-quiz";
import { endingReadersQuiz } from "./ending-readers-quiz";
import { pictureDetectivesQuiz } from "./picture-detectives-quiz";
import { sameDifferentStoriesQuiz } from "./same-different-stories-quiz";
import { ideaIllustratorsQuiz } from "./idea-illustrators-quiz";
import { proveItQuiz } from "./prove-it-quiz";
import { wordsWeUseQuiz } from "./words-we-use-quiz";
import { grammarBuildersQuiz } from "./grammar-builders-quiz";
import { writeItRightQuiz } from "./write-it-right-quiz";

/**
 * GRADE 1 · UNIT 4 EXAM — 12 hand-chosen questions from the unit's quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g1-unit-4-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g1Unit4Exam: QuizDef = {
  id: "g1-unit-4-exam",
  lessonId: "g1-unit-4",
  title: "Unit 4 Exam",
  standard: "G1-U4",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers: phonics ramp
    pick(syllableSplittersQuiz, "c-1"),                       // RF.1.3d syllable count
    pick(wordBreakersQuiz, "c-2"),                            // RF.1.3e two-syllable decode
    pick(endingReadersQuiz, "c-q3-sort-d-t"),                 // RF.1.3f -ed sounds sort
    // literature block
    pick(pictureDetectivesQuiz, "c-1-stripes-detail"),        // RL.1.7 image+words describe
    pick(sameDifferentStoriesQuiz, "c-2-leo-feel-act"),       // RL.1.9 compare responses
    // informational block
    pick(ideaIllustratorsQuiz, "c-2-baby-key-idea"),          // RI.1.7 key idea
    pick(proveItQuiz, "c-1-find-point-bikes"),                // RI.1.8 find the point
    pick(proveItQuiz, "c-3-count-rain"),                      // RI.1.8 count reasons
    // language block
    pick(wordsWeUseQuiz, "c-q2"),                             // L.1.6 joining words
    pick(grammarBuildersQuiz, "c-1-kids-play"),               // L.1.1 subject-verb
    pick(writeItRightQuiz, "c-1-find-name"),                  // L.1.2 capitals
    // production close: read aloud
    pick(sameDifferentStoriesQuiz, "c-6-say-leo-feeling"),    // RL.1.9 speak closer
  ],
};
