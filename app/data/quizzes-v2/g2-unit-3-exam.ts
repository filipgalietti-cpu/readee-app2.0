import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { heartWordsQuiz } from "./heart-words-quiz";
import { readLikeYouTalkQuiz } from "./read-like-you-talk-quiz";
import { readWithYourBrainQuiz } from "./read-with-your-brain-quiz";
import { picturesTellMoreQuiz } from "./pictures-tell-more-quiz";
import { oneStoryTwoWaysQuiz } from "./one-story-two-ways-quiz";
import { theWholeStoryQuiz } from "./the-whole-story-quiz";
import { picturesThatTeachQuiz } from "./pictures-that-teach-quiz";
import { holdItUpQuiz } from "./hold-it-up-quiz";
import { bookTeamUpQuiz } from "./book-team-up-quiz";
import { wordLaddersQuiz } from "./word-ladders-quiz";
import { describeItBetterQuiz } from "./describe-it-better-quiz";
import { ruleBreakerWordsQuiz } from "./rule-breaker-words-quiz";
import { letterPerfectQuiz } from "./letter-perfect-quiz";

/**
 * GRADE 2 · UNIT 3 EXAM — 15 hand-chosen questions from the unit's quizzes
 * (all 13 standards represented, mixed formats, speak closer, easy → hard;
 * RF.2.4 doubled: comma core + expression-read speak closer; RL.2.7 doubled:
 * easier picture-read opener + core teammate pick). Every pick's stimulus is
 * fully self-contained — no "our lesson/story" recall.
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g2-unit-3-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g2Unit3Exam: QuizDef = {
  id: "g2-unit-3-exam",
  lessonId: "g2-unit-3",
  title: "Unit 3 Exam",
  standard: "G2-U3",
  askCount: 15,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // gentle open (easier picks)
    pick(heartWordsQuiz, "e-3-say-some"),                    // RF.2.3f heart word some vs same
    pick(picturesTellMoreQuiz, "e-1-rainy-day"),             // RL.2.7 picture adds the weather
    // fluency core
    pick(readLikeYouTalkQuiz, "c-1-tiny-pause"),             // RF.2.4 comma = tiny pause
    pick(readWithYourBrainQuiz, "c-2-moon-book"),            // RF.2.4a purpose changed, not the book
    // literature block
    pick(picturesTellMoreQuiz, "c-1-cold-trip"),             // RL.2.7 which teammate told you (spoken)
    pick(oneStoryTwoWaysQuiz, "c-2-welcome-gift"),           // RL.2.9 the swapped detail across tellings
    pick(theWholeStoryQuiz, "c-5-the-turn"),                 // RL.2.10 what turned the story around
    // informational block
    pick(picturesThatTeachQuiz, "c-3-igloo-cutaway"),        // RI.2.7 why a cutaway beats a photo
    pick(holdItUpQuiz, "c-1-library-point"),                 // RI.2.8 point vs the reasons under it
    // language block
    pick(wordLaddersQuiz, "c-1-window-shattered"),           // L.2.5b strongest break word
    pick(describeItBetterQuiz, "c-5-troll-noisily"),         // L.2.6 action helper vs thing helper
    pick(ruleBreakerWordsQuiz, "c-1-children"),              // L.2.1 irregular plural children
    pick(letterPerfectQuiz, "c-5-apostrophe-sort"),          // L.2.2 apostrophe-job sort
    // harder close
    pick(bookTeamUpQuiz, "h-3-disagree-point"),              // RI.2.9 spot the point two texts disagree on
    pick(readLikeYouTalkQuiz, "h-4-speak-passage"),          // RF.2.4 speak closer (two-sentence expression read)
  ],
};
