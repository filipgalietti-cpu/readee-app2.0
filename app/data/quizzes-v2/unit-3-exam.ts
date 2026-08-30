import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { lookCloseQuiz } from "./look-close-quiz";
import { myFirstReadQuiz } from "./my-first-read-quiz";
import { pictureCluesQuiz } from "./picture-clues-quiz";
import { sameAndDifferentQuiz } from "./same-and-different-quiz";
import { readingPartyQuiz } from "./reading-party-quiz";
import { doubleDutyWordsQuiz } from "./double-duty-words-quiz";
import { wordFamiliesFriendsQuiz } from "./word-families-friends-quiz";
import { capitalStartQuiz } from "./capital-start-quiz";

/**
 * UNIT 3 EXAM — 12 hand-chosen questions from the Super Readers quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`unit-3-exam: ${quiz.id} has no question ${id}`);
  return q;
}

export const unit3Exam: QuizDef = {
  id: "unit-3-exam",
  lessonId: "unit-3",
  title: "Unit 3 Exam",
  standard: "K-U3",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers
    pick(lookCloseQuiz, "c-1-letter-made-hot"),           // RF.K.3d near-twin words
    pick(myFirstReadQuiz, "c-who-ran-to-cat"),            // RF.K.4 story comprehension
    pick(pictureCluesQuiz, "c-1-foxy-walk-choose"),       // RL.K.7 picture clue
    pick(doubleDutyWordsQuiz, "c-1-bat-meaning"),         // K.L.4 word meaning in context
    // middle: compare + categories + mechanics
    pick(sameAndDifferentQuiz, "c-bunny-mouse-both-hops"),// RL.K.9 both/only-one
    pick(wordFamiliesFriendsQuiz, "c-choose-opposite-up"),// K.L.5 opposites
    pick(capitalStartQuiz, "c-we-can-run-capital"),       // K.L.2 capital start
    pick(capitalStartQuiz, "c-do-you-like-cake-question"),// K.L.2 end marks
    // applied: sorts (multi-item)
    pick(wordFamiliesFriendsQuiz, "c-sort-food-animal-core"), // K.L.5 categories sort
    pick(readingPartyQuiz, "h-2"),                        // RL.K.10 story sequence/retell
    // stretch + production close
    pick(doubleDutyWordsQuiz, "h-1-ending-sort"),         // K.L.4 endings stretch
    pick(myFirstReadQuiz, "h-story-retell-beginning"),    // RF.K.4/RL.K.10 production close
  ],
};
