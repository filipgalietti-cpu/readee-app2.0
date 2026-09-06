import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { theWholeFactBookQuiz } from "./the-whole-fact-book-quiz";
import { wordsForEffectQuiz } from "./words-for-effect-quiz";

/**
 * GRADE 3 · UNIT 4 EXAM — 12 hand-chosen questions from the unit's two
 * quizzes (6 per standard, both standards covered end to end; 1 sort + 3
 * speaks incl. an on-screen page read-aloud; neither source quiz carries a
 * sequence item, so none here). Ramp: 2 easier picture-supported openers →
 * core middle (RI tools on the fresh fact book, then word / effect / register
 * work on the festival letter, sort, production speak) → harder read-aloud
 * of the book's last page → harder own-view speak close.
 * Every pick's stimulus is fully self-contained: the fact-book quiz speaks
 * its page inside each question (or puts it on screen), and every festival
 * pick carries its own sentence — no "the page we just read" recall.
 * The fact book's c-6 big-idea speak is deliberately left for the grade
 * final so the final is not a replay of this exam.
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g3-unit-4-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g3Unit4Exam: QuizDef = {
  id: "g3-unit-4-exam",
  lessonId: "g3-unit-4",
  title: "Unit 4 Exam",
  standard: "G3-U4",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // easier openers (picture support, 3 options)
    pick(theWholeFactBookQuiz, "e-1-how-a-letter-traveled"),  // RI.3.10 page one of the fresh fact book, how a letter traveled
    pick(wordsForEffectQuiz, "e-1-see-the-jump"),             // L.3.3 the chosen word that makes you SEE the jump
    // informational capstone core (one RI tool each, page spoken inside)
    pick(theWholeFactBookQuiz, "c-1-proof-line-seconds"),     // RI.3.10 tap the line on page four that proves it
    pick(theWholeFactBookQuiz, "c-3-page-five-connection"),   // RI.3.10 how page five's first sentence connects to page four
    pick(theWholeFactBookQuiz, "c-4-expert-word-key"),        // RI.3.10 the expert meaning of key, support in the sentence
    // language core (word for an effect, effect of a word, said vs written)
    pick(wordsForEffectQuiz, "c-1-word-for-the-jolt"),        // L.3.3 the word that makes the jolt
    pick(wordsForEffectQuiz, "c-2-effect-of-roared"),         // L.3.3 name the effect a chosen word makes
    pick(wordsForEffectQuiz, "c-3-sort-said-or-written"),     // L.3.3 sort: Said Out Loud / Written Down
    pick(wordsForEffectQuiz, "c-4-written-version"),          // L.3.3 the spoken line turned into a page line
    pick(wordsForEffectQuiz, "c-6-speak-change-one-word"),    // L.3.3 speak: plain sentence, then one word changed, name the effect
    // harder close
    pick(theWholeFactBookQuiz, "h-3-speak-read-page-six"),    // RI.3.10 read-aloud: the book's two-sentence last page on screen
    pick(theWholeFactBookQuiz, "h-4-speak-your-view"),        // RI.3.10 speak closer: your view, does it match the author, one reason
  ],
};
