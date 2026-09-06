import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { knowWhyYouReadQuiz } from "./know-why-you-read-quiz";
import { proseAndPoemQuiz } from "./prose-and-poem-quiz";
import { doesThatMakeSenseQuiz } from "./does-that-make-sense-quiz";
import { whatThePictureAddsQuiz } from "./what-the-picture-adds-quiz";
import { sameHeroNewStoryQuiz } from "./same-hero-new-story-quiz";
import { theWholeChapterQuiz } from "./the-whole-chapter-quiz";
import { mapsAndPhotosQuiz } from "./maps-and-photos-quiz";
import { sentenceToSentenceQuiz } from "./sentence-to-sentence-quiz";
import { twoWritersOneTopicQuiz } from "./two-writers-one-topic-quiz";
import { shadesOfSureQuiz } from "./shades-of-sure-quiz";
import { whenAndWhereWordsQuiz } from "./when-and-where-words-quiz";
import { buildABetterSentenceQuiz } from "./build-a-better-sentence-quiz";
import { commasQuotesCapitalsQuiz } from "./commas-quotes-capitals-quiz";

/**
 * GRADE 3 · UNIT 3 EXAM — 14 hand-chosen questions from the unit's quizzes
 * (one per standard for all 13 standards + a harder speak closer on RL.3.10;
 * 1 sequence + 2 sorts + 3 speaks incl. a poetry read-aloud, 2 easier
 * word-level openers → core middle → harder speak close). Phonics, fluency,
 * and grammar are all measured at CORE band (the two easier openers are the
 * language word-level picks, as in the U2 exam). Every pick's stimulus is
 * fully self-contained: the G3 quizzes speak their second text page-by-page,
 * so each pick here carries its own page/sentence/both-texts inside the
 * narration (or on screen for the read-aloud and the silent read) and every
 * picture pick carries its own image — no "the story we just read" recall.
 * the-whole-chapter e-4 (no narration clip) is deliberately never picked.
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g3-unit-3-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g3Unit3Exam: QuizDef = {
  id: "g3-unit-3-exam",
  lessonId: "g3-unit-3",
  title: "Unit 3 Exam",
  standard: "G3-U3",
  askCount: 14,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // easier openers (word level, picture support)
    pick(shadesOfSureQuiz, "e-1-least-sure"),                  // L.3.5c the least-sure word for a no-clue moment
    pick(whenAndWhereWordsQuiz, "e-4-hawk-across-from"),       // L.3.6 the where-word that fits the hole, from the picture
    // fluency block (core)
    pick(knowWhyYouReadQuiz, "c-4-sequence-pinwheel-steps"),   // RF.3.4a read a how-to for its why, then sequence the four steps
    pick(doesThatMakeSenseQuiz, "c-4-context-clue"),           // RF.3.4c the piece of the sentence that settles a two-way word
    pick(proseAndPoemQuiz, "c-3-speak-stanza-read"),           // RF.3.4b read-aloud: a four-line stanza on screen, beat + line ends
    // literature block
    pick(whatThePictureAddsQuiz, "c-2-page-3-aspect"),         // RL.3.7 the specific part of the picture that shows the feeling
    pick(sameHeroNewStoryQuiz, "c-3-sort-same-different"),     // RL.3.9 sort: Same in Both / Different across two series books
    pick(theWholeChapterQuiz, "c-5-narrator-view-draw"),       // RL.3.10 silent read of the last page, then the narrator's view
    // informational block
    pick(mapsAndPhotosQuiz, "c-5-combine-how-far"),            // RI.3.7 words + map together: how far the bags travel
    pick(sentenceToSentenceQuiz, "c-6-speak-connection"),      // RI.3.8 speak: name the connection and the words that showed it
    pick(twoWritersOneTopicQuiz, "c-3-sort-only-or-both"),     // RI.3.9 sort: Only Text One / Only Text Two / In Both
    // language block (grammar at core)
    pick(buildABetterSentenceQuiz, "c-3-cousins-were"),        // L.3.1 subject-verb agreement fix on a spoken wrong sentence
    pick(commasQuotesCapitalsQuiz, "c-1-dialogue-marks"),      // L.3.2 the dialogue line with every mark in its place
    // harder close
    pick(theWholeChapterQuiz, "h-4-speak-why-a-draw"),         // RL.3.10 speak closer: why the draw, and what it shows about her
  ],
};
