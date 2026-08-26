import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { sentenceShapesQuiz } from "./sentence-shapes-quiz";
import { blendBuildersQuiz } from "./blend-builders-quiz";
import { soundSpottersQuiz } from "./sound-spotters-quiz";
import { askItFindItQuiz } from "./ask-it-find-it-quiz";
import { storyMessageQuiz } from "./story-message-quiz";
import { factQuestionsQuiz } from "./fact-questions-quiz";
import { topicSpotterQuiz } from "./topic-spotter-quiz";
import { wordToolboxQuiz } from "./word-toolbox-quiz";
import { sentenceCluesQuiz } from "./sentence-clues-quiz";
import { prefixPowerQuiz } from "./prefix-power-quiz";

/**
 * GRADE 1 · UNIT 1 EXAM — 12 hand-chosen questions from the unit's quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g1-unit-1-exam: ${quiz.id} has no question ${id}`);
  return q;
}

export const g1Unit1Exam: QuizDef = {
  id: "g1-unit-1-exam",
  lessonId: "g1-unit-1",
  title: "Unit 1 Exam",
  standard: "G1-U1",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers: print + phonology
    pick(sentenceShapesQuiz, "c-1-capital-letter-application"), // RF.1.1a sentence features
    pick(blendBuildersQuiz, "c-identify-blend-word"),           // RF.1.2b blend
    pick(soundSpottersQuiz, "c-1-first-sound-ship"),            // RF.1.2c isolate
    // middle: comprehension both strands
    pick(askItFindItQuiz, "c-why-dot-hide"),                    // RL.1.1 why-question
    pick(storyMessageQuiz, "c-message-identify"),               // RL.1.2 central message
    pick(factQuestionsQuiz, "c-2-answer-legs"),                 // RI.1.1 fact detail
    pick(topicSpotterQuiz, "c-1-main-topic"),                   // RI.1.2 main topic
    // language block
    pick(wordToolboxQuiz, "c-bark-context"),                    // L.1.4 multiple meaning
    pick(sentenceCluesQuiz, "c-1-gleeful-meaning"),             // L.1.4a context clue
    // applied: sorts (multi-item)
    pick(prefixPowerQuiz, "c-4-sort-un-re"),                    // L.1.4b affix sort
    pick(storyMessageQuiz, "c-story-events-sort"),              // RL.1.2 retell order
    // production close: read a sentence aloud
    pick(sentenceShapesQuiz, "c-5-read-sentence-aloud"),        // RF.1.1a speak closer
  ],
};
