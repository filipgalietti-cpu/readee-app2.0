import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { soundStretchersQuiz } from "./sound-stretchers-quiz";
import { smoothReaderQuiz } from "./smooth-reader-quiz";
import { checkAndFixQuiz } from "./check-and-fix-quiz";
import { storyPartsQuiz } from "./story-parts-quiz";
import { wordPicturesQuiz } from "./word-pictures-quiz";
import { factLinksQuiz } from "./fact-links-quiz";
import { factWordFinderQuiz } from "./fact-word-finder-quiz";
import { wordChangersQuiz } from "./word-changers-quiz";
import { justRightWordsQuiz } from "./just-right-words-quiz";
import { categoryCaptainQuiz } from "./category-captain-quiz";

/**
 * GRADE 1 · UNIT 2 EXAM — 12 hand-chosen questions from the unit's quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g1-unit-2-exam: ${quiz.id} has no question ${id}`);
  return q;
}

export const g1Unit2Exam: QuizDef = {
  id: "g1-unit-2-exam",
  lessonId: "g1-unit-2",
  title: "Unit 2 Exam",
  standard: "G1-U2",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers: phonology + fluency mechanics
    pick(soundStretchersQuiz, "c-hop-sound-count"),        // RF.1.2d segment
    pick(smoothReaderQuiz, "c-1-smooth-pace"),             // RF.1.4b pace/expression
    pick(checkAndFixQuiz, "c-1-find-ran"),                 // RF.1.4c spot the miscue
    pick(checkAndFixQuiz, "c-2-fix-ran"),                  // RF.1.4c fix it
    // literature block
    pick(storyPartsQuiz, "c-trait-jax-evidence"),          // RL.1.3 trait from evidence
    pick(wordPicturesQuiz, "c-touch-choose"),              // RL.1.4 sensory word
    // informational block
    pick(factLinksQuiz, "c-core-3"),                       // RI.1.3 connection
    pick(factWordFinderQuiz, "c-2"),                       // RI.1.4 word meaning
    // language block
    pick(wordChangersQuiz, "c-5-sentence-called"),         // L.1.4c inflection in context
    pick(justRightWordsQuiz, "c-whale-size"),              // L.1.5 shades of meaning
    // applied sort
    pick(categoryCaptainQuiz, "c-5-sort-kitchen-bedroom"), // L.1.5a category sort
    // production close: cold-read with expression
    pick(smoothReaderQuiz, "h-2-cold-read-exclaim"),       // RF.1.4b speak closer
  ],
};
