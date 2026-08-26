import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { digraphDetectivesQuiz } from "./digraph-detectives-quiz";
import { soundItOutQuiz } from "./sound-it-out-quiz";
import { magicTeamsQuiz } from "./magic-teams-quiz";
import { twoKindsOfBooksQuiz } from "./two-kinds-of-books-quiz";
import { whosTellingItQuiz } from "./whos-telling-it-quiz";
import { textFeatureFindersQuiz } from "./text-feature-finders-quiz";
import { pictureOrWordsQuiz } from "./picture-or-words-quiz";
import { whatIsItQuiz } from "./what-is-it-quiz";
import { wordsInRealLifeQuiz } from "./words-in-real-life-quiz";
import { strongWordsQuiz } from "./strong-words-quiz";

/**
 * GRADE 1 · UNIT 3 EXAM — 12 hand-chosen questions from the unit's quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g1-unit-3-exam: ${quiz.id} has no question ${id}`);
  // namespace the id — generic ids like "c-2" collide across source quizzes,
  // and the runner's asked-set would silently drop the second one
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g1Unit3Exam: QuizDef = {
  id: "g1-unit-3-exam",
  lessonId: "g1-unit-3",
  title: "Unit 3 Exam",
  standard: "G1-U3",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers: phonics ramp
    pick(digraphDetectivesQuiz, "c-read-shop"),           // RF.1.3a digraphs
    pick(soundItOutQuiz, "c-1-read-snip"),                // RF.1.3b decode
    pick(magicTeamsQuiz, "c-2"),                          // RF.1.3c long vowels
    // literature block
    pick(twoKindsOfBooksQuiz, "c-1-ben-bedtime"),         // RL.1.5 story vs info
    pick(whosTellingItQuiz, "c-2-narrator-he-they"),      // RL.1.6 narrator
    // informational block
    pick(textFeatureFindersQuiz, "c-2"),                  // RI.1.5 text features
    pick(pictureOrWordsQuiz, "c-2-arms-source"),          // RI.1.6 fact source
    // language block
    pick(whatIsItQuiz, "c-3-frog-complete"),              // L.1.5b definitions
    pick(wordsInRealLifeQuiz, "c-4-slippery-floor"),      // L.1.5c real-life words
    pick(strongWordsQuiz, "c-6-whole-arm-send"),          // L.1.5d verb shades
    // applied sort
    pick(whosTellingItQuiz, "c-5-sort-lines"),            // RL.1.6 narrator/character sort
    // production close: decode + read aloud
    pick(soundItOutQuiz, "c-5-speak-sentence"),           // RF.1.3b speak closer
  ],
};
