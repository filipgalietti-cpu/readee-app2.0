import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { soundSlidersQuiz } from "./sound-sliders-quiz";
import { soundDetectivesQuiz } from "./sound-detectives-quiz";
import { wordMachinesQuiz } from "./word-machines-quiz";
import { letterSoundsQuiz } from "./letter-sounds-quiz";
import { snapWordsQuiz } from "./snap-words-quiz";
import { tellItBackQuiz } from "./tell-it-back-quiz";
import { wordWonderQuiz } from "./word-wonder-quiz";
import { namingDoingWordsQuiz } from "./naming-doing-words-quiz";

/**
 * UNIT 2 EXAM — 12 hand-chosen questions from the Sound & Letter Lab quizzes
 * (every standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`unit-2-exam: ${quiz.id} has no question ${id}`);
  return q;
}

export const unit2Exam: QuizDef = {
  id: "unit-2-exam",
  lessonId: "unit-2",
  title: "Unit 2 Exam",
  standard: "K-U2",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers (one per phonics skill)
    pick(letterSoundsQuiz, "c-1-s-sound-recognition"),     // RF.K.3a letter sounds
    pick(soundSlidersQuiz, "c-slide-t-op-word"),           // RF.K.2c blend
    pick(soundDetectivesQuiz, "c-first-sound-pig"),        // RF.K.2d isolate
    pick(wordMachinesQuiz, "c-2-car-to-jar-word"),         // RF.K.2e substitute
    // middle: words + comprehension + language
    pick(snapWordsQuiz, "c-identify-the"),                 // RF.K.3c sight words
    pick(tellItBackQuiz, "c-2"),                           // RL.K.2 retell middle
    pick(wordWonderQuiz, "c-1-swift-quick"),               // RL.K.4 word meaning
    pick(namingDoingWordsQuiz, "c-make-plural-dog"),       // K.L.1 plurals
    // applied: sorts (multi-item)
    pick(soundDetectivesQuiz, "c-sort-beginning-end"),     // RF.K.2d applied sort
    pick(namingDoingWordsQuiz, "c-sort-naming-doing-1"),   // K.L.1 applied sort
    // stretch + production close
    pick(wordMachinesQuiz, "h-3-fin-to-fan-middle"),       // RF.K.2e next-grade stretch
    pick(snapWordsQuiz, "c-read-the-speak"),               // RF.K.3c read aloud (speak)
  ],
};
