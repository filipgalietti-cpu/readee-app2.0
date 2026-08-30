import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { trickyWordsQuiz } from "./tricky-words-quiz";
import { readingWithPurposeQuiz } from "./reading-with-purpose-quiz";
import { storyPoemPartyQuiz } from "./story-poem-party-quiz";
import { twoTextsCompareQuiz } from "./two-texts-compare-quiz";
import { factPartyG1Quiz } from "./fact-party-g1-quiz";

/**
 * GRADE 1 · UNIT 5 EXAM — 12 hand-chosen questions from the unit's quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g1-unit-5-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g1Unit5Exam: QuizDef = {
  id: "g1-unit-5-exam",
  lessonId: "g1-unit-5",
  title: "Unit 5 Exam",
  standard: "G1-U5",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers: irregular words + purpose
    pick(trickyWordsQuiz, "c-real-way-said"),               // RF.1.3g irregular words
    pick(trickyWordsQuiz, "c-find-there"),                  // RF.1.3g in context
    pick(readingWithPurposeQuiz, "c-2-pick-a-purpose"),     // RF.1.4a set a purpose
    pick(readingWithPurposeQuiz, "c-5-check-sam-page"),     // RF.1.4a check understanding
    // literature capstone
    pick(storyPoemPartyQuiz, "c-ollie-feel-last"),          // RL.1.10 story comprehension
    pick(storyPoemPartyQuiz, "c-poem-hear-word"),           // RL.1.10 poem sense word
    // informational block
    pick(twoTextsCompareQuiz, "c-fact-in-both"),            // RI.1.9 both-books fact
    pick(twoTextsCompareQuiz, "c-same-or-different"),       // RI.1.9 same-fact-different-words
    pick(factPartyG1Quiz, "c-3-key-idea-keeper"),           // RI.1.10 key idea
    pick(factPartyG1Quiz, "c-2-heading-bees"),              // RI.1.10 feature use
    // applied sort
    pick(storyPoemPartyQuiz, "c-sort-rhyming-words"),       // RL.1.10 rhyme sort
    // production close
    pick(factPartyG1Quiz, "c-6-speak-what-flashes"),        // RI.1.10 speak closer
  ],
};
