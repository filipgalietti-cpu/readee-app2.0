import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { fableTellersQuiz } from "./fable-tellers-quiz";
import { decodingChampionsQuiz } from "./decoding-champions-quiz";
import { longOrShortQuiz } from "./long-or-short-quiz";
import { teamPlayersQuiz } from "./team-players-quiz";
import { askAndAnswerG2Quiz } from "./ask-and-answer-g2-quiz";
import { characterChallengesQuiz } from "./character-challenges-quiz";
import { factFindersAskQuiz } from "./fact-finders-ask-quiz";
import { paragraphPowerQuiz } from "./paragraph-power-quiz";
import { chainsAndStepsQuiz } from "./chains-and-steps-quiz";
import { wordSolversQuiz } from "./word-solvers-quiz";
import { clueHuntersQuiz } from "./clue-hunters-quiz";

/**
 * GRADE 2 · UNIT 1 EXAM — 12 hand-chosen questions from the unit's quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g2-unit-1-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g2Unit1Exam: QuizDef = {
  id: "g2-unit-1-exam",
  lessonId: "g2-unit-1",
  title: "Unit 1 Exam",
  standard: "G2-U1",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // phonics ramp
    pick(decodingChampionsQuiz, "c-1"),                    // RF.2.3 decode
    pick(longOrShortQuiz, "c-1"),                          // RF.2.3a vowel discrimination
    pick(teamPlayersQuiz, "c-1"),                          // RF.2.3b vowel teams
    // literature block
    pick(askAndAnswerG2Quiz, "c-2-how-kite-flew"),         // RL.2.1 how-question
    pick(fableTellersQuiz, "c-1"),                         // RL.2.2 moral
    pick(characterChallengesQuiz, "c-2"),                  // RL.2.3 response tracking
    // informational block
    pick(factFindersAskQuiz, "c-4-why-glide"),             // RI.2.1 why-question
    pick(paragraphPowerQuiz, "c-2-p2-focus"),              // RI.2.2 paragraph focus
    pick(chainsAndStepsQuiz, "c-2-no-bucket"),             // RI.2.3 chain reasoning
    // language block
    pick(wordSolversQuiz, "c-3-bank-money-context"),       // L.2.4 multiple meaning
    pick(clueHuntersQuiz, "c-1-mend-meaning"),             // L.2.4a context clue
    // production close
    pick(chainsAndStepsQuiz, "c-6-skip-tapping-speak"),    // RI.2.3 speak closer
  ],
};
