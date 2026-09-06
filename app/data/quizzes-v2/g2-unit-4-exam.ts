import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { readItOutLoudQuiz } from "./read-it-out-loud-quiz";
import { clickAndClunkQuiz } from "./click-and-clunk-quiz";
import { readToLearnQuiz } from "./read-to-learn-quiz";
import { matchYourVoiceQuiz } from "./match-your-voice-quiz";

/**
 * GRADE 2 · UNIT 4 EXAM — 12 hand-chosen questions from the unit's quizzes
 * (all 4 standards covered, ~3 picks per lesson, mixed formats, speak closer,
 * 2 easier openers → core middle → harder close). Every pick's stimulus is
 * fully self-contained — no "our lesson/story" recall (read-to-learn picks
 * avoid the running popcorn-book thread except its self-introducing page one).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g2-unit-4-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g2Unit4Exam: QuizDef = {
  id: "g2-unit-4-exam",
  lessonId: "g2-unit-4",
  title: "Unit 4 Exam",
  standard: "G2-U4",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // gentle open (easier picks)
    pick(readItOutLoudQuiz, "e-1-just-right-speed"),      // RF.2.4b just-right pace pick
    pick(clickAndClunkQuiz, "e-2-corn-cob"),              // RF.2.4c fix the clunk (picture support)
    // fluency core
    pick(readItOutLoudQuiz, "c-2-worried-line"),          // RF.2.4b expression matches the feeling
    pick(clickAndClunkQuiz, "c-1-sled-slop"),             // RF.2.4c spot the word that clunks
    pick(clickAndClunkQuiz, "c-4-sort-fresh"),            // RF.2.4c clicks/clunks monitoring sort
    // informational core
    pick(readToLearnQuiz, "c-1-kernel-inside"),           // RI.2.10 what the page mostly taught
    pick(readToLearnQuiz, "c-5-find-the-chapter"),        // RI.2.10 table of contents helper
    // language core
    pick(matchYourVoiceQuiz, "c-1-library-ask"),          // L.2.3 school-voice register pick
    pick(matchYourVoiceQuiz, "c-4-voice-sort"),           // L.2.3 playground/school voice sort
    // harder close
    pick(matchYourVoiceQuiz, "h-2-hallway-switch"),       // L.2.3 switch voices when the listener changes
    pick(readToLearnQuiz, "h-2-glacier-inches"),          // RI.2.10 stretched word meaning (G3 transfer)
    pick(readItOutLoudQuiz, "h-4-speak-yelled"),          // RF.2.4b speak closer (character expression read)
  ],
};
