import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { rhymeTimeQuiz } from "./rhyme-time-quiz";
import { keyDetailsQuiz } from "./key-details-quiz";
import { syllableBeatsQuiz } from "./syllable-beats-quiz";
import { bookMakersQuiz } from "./book-makers-quiz";
import { letterPairsQuiz } from "./letter-pairs-quiz";
import { bookBasicsQuiz } from "./book-basics-quiz";
import { storyKindsQuiz } from "./story-kinds-quiz";
import { bigKidWordsQuiz } from "./big-kid-words-quiz";

/**
 * UNIT 1 EXAM — 12 hand-chosen questions drawn from the unit's quizzes
 * (every standard represented, mixed formats, one read-aloud, difficulty
 * arc easy → hard). ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`unit-1-exam: ${quiz.id} has no question ${id}`);
  return q;
}

export const unit1Exam: QuizDef = {
  id: "unit-1-exam",
  lessonId: "unit-1",
  title: "Unit 1 Exam",
  standard: "K-U1",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers (one per foundational standard)
    pick(letterPairsQuiz, "c-big-b-partner"),        // RF.K.1d letters
    pick(rhymeTimeQuiz, "q-cat"),                    // RF.K.2a rhyme
    pick(bookBasicsQuiz, "c-1-how-wormy-reads"),     // RF.K.1a-c print concepts
    pick(bigKidWordsQuiz, "c-1-choose-on"),          // K.L.6 position words
    // middle: comprehension + categories
    pick(keyDetailsQuiz, "c-1-who-story-core"),      // RL.K.1 who
    pick(storyKindsQuiz, "c-1-flying-pig-book-type"),// RL.K.5 story vs fact
    pick(bookMakersQuiz, "c-3"),                     // RL.K.6 author writes
    pick(syllableBeatsQuiz, "c-1"),                  // RF.K.2b beats
    // applied: sorts (multi-item)
    pick(rhymeTimeQuiz, "q-sort-at-ug"),             // RF.K.2a rhyme families
    pick(letterPairsQuiz, "c-sort-by-size"),         // RF.K.1d big/little sort
    // stretch + production close
    pick(keyDetailsQuiz, "c-6-what-happened-first"), // RL.K.1 sequence of events
    pick(rhymeTimeQuiz, "q-say-hat"),                // RF.K.2a read aloud (speak)
  ],
};
