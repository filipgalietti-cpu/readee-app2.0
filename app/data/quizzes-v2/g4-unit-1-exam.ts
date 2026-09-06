import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { textSaysSoIKnowQuiz } from "./text-says-so-i-know-quiz";
import { themeAndSummaryQuiz } from "./theme-and-summary-quiz";
import { inDepthDetailsQuiz } from "./in-depth-details-quiz";
import { factsSaySoIKnowQuiz } from "./facts-say-so-i-know-quiz";
import { mainIdeaAndSummaryQuiz } from "./main-idea-and-summary-quiz";
import { whatHappenedAndWhyQuiz } from "./what-happened-and-why-quiz";
import { contextAtADistanceQuiz } from "./context-at-a-distance-quiz";
import { greekAndLatinRootsQuiz } from "./greek-and-latin-roots-quiz";
import { theRightToolQuiz } from "./the-right-tool-quiz";
import { longWordsFullSpeedQuiz } from "./long-words-full-speed-quiz";

/**
 * GRADE 4 · UNIT 1 EXAM — 12 hand-chosen questions from the unit's ten
 * quizzes. All ten standards covered once; the two extra slots go to the
 * unit's spine, RL.4.1 and RI.4.1 ("the text says X, so I can tell Y"),
 * which each get an easier opener plus a production speak. 2 sorts + 1
 * sequence + 3 speaks (an on-screen page read-aloud, a core "text says, so
 * I can tell" speak, a harder quote-then-tell speak); no format repeats
 * back to back except the two picture openers, which are all chooses.
 * Ramp: 2 easier picture-supported openers (explicit who / where on page
 * one of the unit's story and fact text) → core middle (decoding read-aloud
 * on a fresh page, theme vs topic vs moral, clue-or-mention sort, main idea
 * vs topic vs paragraph idea, four-step procedure sequence, root + suffix
 * meaning, thought / words / action sort, RI production speak) → harder
 * close (parts-vs-sentence G5 move taught in the stimulus, then the RL.4.1
 * quote-accurately speak on the story the exam opened with).
 * Every pick's stimulus is fully self-contained: each G4 quiz speaks the
 * page (or the story in short) inside the question, or puts the text on
 * screen for the read-aloud — no "the page we just read" recall and no
 * lesson-beat references. Ten quizzes carry a second big production item
 * (c-6 or h-4) that is deliberately LEFT FOR THE GRADE FINAL so the final is
 * not a replay: text-says c-6 (the note), facts h-4 (quote the dry-seeds
 * line), long-words h-4 (examination / organization read), and both big
 * speaks of theme-and-summary, in-depth-details, main-idea-and-summary,
 * what-happened-and-why, context-at-a-distance, greek-and-latin-roots and
 * the-right-tool.
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g4-unit-1-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g4Unit1Exam: QuizDef = {
  id: "g4-unit-1-exam",
  lessonId: "g4-unit-1",
  title: "Unit 1 Exam",
  standard: "G4-U1",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // easier openers (picture support, 3 options, page one spoken inside)
    pick(textSaysSoIKnowQuiz, "e-1-who-at-the-front"),          // RL.4.1 explicit who on page one of The Substitute
    pick(factsSaySoIKnowQuiz, "e-1-where-it-spends-the-day"),   // RI.4.1 explicit where on page one of The Rat That Never Drinks
    // core middle
    pick(longWordsFullSpeedQuiz, "c-6-speak-read-page-three"),  // RF.4.3 read-aloud: a fresh three-sentence page with four long words on screen
    pick(themeAndSummaryQuiz, "c-1-theme-choose"),              // RL.4.2 theme vs topic vs moral vs never-shown idea, story in short spoken inside
    pick(contextAtADistanceQuiz, "c-3-sort-clue-or-mention"),   // L.4.4a sort: Clue / Just Mentions It, six word groups with their sentences spoken
    pick(mainIdeaAndSummaryQuiz, "c-1-main-idea-whole-text"),   // RI.4.2 main idea vs topic vs paragraph idea vs droppable fact, whole text spoken
    pick(whatHappenedAndWhyQuiz, "c-3-steps-in-order"),         // RI.4.3 sequence: four steps of the elevator safety, page three spoken
    pick(greekAndLatinRootsQuiz, "c-1-thermal-meaning"),        // L.4.4b therm + al composed, then tested in the sentence
    pick(inDepthDetailsQuiz, "c-3-sort-thought-words-action"),  // RL.4.3 sort: Thought / Words / Action, three buckets, pages spoken
    pick(factsSaySoIKnowQuiz, "c-6-speak-text-says-water"),     // RI.4.1 speak: the text says, so I can tell (does it need to live near water)
    // harder close
    pick(theRightToolQuiz, "h-1-parts-vs-sentence-taught"),     // L.4.4 G5 move taught in the stimulus (invaluable), then applied to restive
    pick(textSaysSoIKnowQuiz, "h-4-speak-quote-then-tell"),     // RL.4.1 speak closer: quote the exact words from page two, then so I can tell
  ],
};
