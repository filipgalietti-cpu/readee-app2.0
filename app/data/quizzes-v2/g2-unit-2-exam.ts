import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { longVowelBuildersQuiz } from "./long-vowel-builders-quiz";
import { prefixSuffixDecodersQuiz } from "./prefix-suffix-decoders-quiz";
import { trickySoundSwitchersQuiz } from "./tricky-sound-switchers-quiz";
import { wordMusicQuiz } from "./word-music-quiz";
import { storyShapeQuiz } from "./story-shape-quiz";
import { twoWaysToSeeQuiz } from "./two-ways-to-see-quiz";
import { scienceWordCluesQuiz } from "./science-word-clues-quiz";
import { findItFastQuiz } from "./find-it-fast-quiz";
import { whyAuthorsWriteQuiz } from "./why-authors-write-quiz";
import { wordMathQuiz } from "./word-math-quiz";
import { wordPlusWordQuiz } from "./word-plus-word-quiz";
import { lookItUpQuiz } from "./look-it-up-quiz";

/**
 * GRADE 2 · UNIT 2 EXAM — 13 hand-chosen questions from the unit's quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g2-unit-2-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g2Unit2Exam: QuizDef = {
  id: "g2-unit-2-exam",
  lessonId: "g2-unit-2",
  title: "Unit 2 Exam",
  standard: "G2-U2",
  askCount: 13,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // gentle open (easier picks)
    pick(longVowelBuildersQuiz, "e-2-find-silent-e"),        // RF.2.3c silent e
    pick(trickySoundSwitchersQuiz, "e-3-long-oo-food"),      // RF.2.3e oo discrimination
    // phonics core
    pick(prefixSuffixDecodersQuiz, "c-3-sort-front-end"),    // RF.2.3d prefix vs suffix position
    // literature block
    pick(wordMusicQuiz, "c-1-train-rhyme"),                  // RL.2.4 rhyme in a fresh poem
    pick(storyShapeQuiz, "c-4-wagon-ending"),                // RL.2.5 ending concludes the action
    pick(twoWaysToSeeQuiz, "c-5-both-views"),                // RL.2.6 two points of view
    // informational block
    pick(scienceWordCluesQuiz, "c-1-nectar-meaning"),        // RI.2.4 topic word from context
    pick(findItFastQuiz, "c-1-ants-contents"),               // RI.2.5 use the contents page
    pick(whyAuthorsWriteQuiz, "c-2-tern-answer"),            // RI.2.6 author's purpose
    // language block
    pick(wordMathQuiz, "c-2-unclear-directions"),            // L.2.4b prefix meaning in context
    pick(wordPlusWordQuiz, "c-3-which-word-moonlight"),      // L.2.4d compound from meaning
    // harder close
    pick(lookItUpQuiz, "h-1-guide-words"),                   // L.2.4e guide words (G3 transfer)
    pick(prefixSuffixDecodersQuiz, "h-4-build-sadness"),     // RF.2.3d speak closer (build sadness)
  ],
};
