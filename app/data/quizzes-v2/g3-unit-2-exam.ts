import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { chunkByChunkQuiz } from "./chunk-by-chunk-quiz";
import { knowThemByHeartQuiz } from "./know-them-by-heart-quiz";
import { smoothAndSureQuiz } from "./smooth-and-sure-quiz";
import { moreThanItSaysQuiz } from "./more-than-it-says-quiz";
import { partsThatBuildQuiz } from "./parts-that-build-quiz";
import { theirViewYourViewQuiz } from "./their-view-your-view-quiz";
import { expertWordsQuiz } from "./expert-words-quiz";
import { searchLikeAProQuiz } from "./search-like-a-pro-quiz";
import { theAuthorsViewQuiz } from "./the-authors-view-quiz";
import { checkTheDictionaryQuiz } from "./check-the-dictionary-quiz";
import { wordConnectionsQuiz } from "./word-connections-quiz";
import { sayingsThatMeanMoreQuiz } from "./sayings-that-mean-more-quiz";
import { wordsInActionQuiz } from "./words-in-action-quiz";

/**
 * GRADE 3 · UNIT 2 EXAM — 14 hand-chosen questions from the unit's quizzes
 * (one per standard for all 13 standards + a harder speak closer on RI.3.6;
 * 1 sequence + 1 sort + 3 speaks incl. a read-aloud, 2 easier openers →
 * core middle → harder speak close). The phonics and fluency picks are all
 * CORE band this time (the U1 exam's easier RF openers measured below grade).
 * Every pick's stimulus is fully self-contained: the G3 quizzes speak their
 * second text page-by-page, so each pick here carries its own page/entry/
 * sentence inside the narration (or on screen for the read-aloud) — no "the
 * story we just read" recall. ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g3-unit-2-exam: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g3Unit2Exam: QuizDef = {
  id: "g3-unit-2-exam",
  lessonId: "g3-unit-2",
  title: "Unit 2 Exam",
  standard: "G3-U2",
  askCount: 14,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // easier openers (word level / one text feature)
    pick(wordConnectionsQuiz, "e-1-opposite-deep"),            // L.3.5 opposite of deep, from the sentence
    pick(searchLikeAProQuiz, "e-3-which-section-babies"),      // RI.3.5 contents read aloud, pick the section
    // phonics + fluency block (core)
    pick(chunkByChunkQuiz, "c-3-sequence-elastic"),            // RF.3.3c sequence the chunks of elastic
    pick(knowThemByHeartQuiz, "c-2-drought-fits"),             // RF.3.3d ough look-alikes in a sentence gap
    pick(smoothAndSureQuiz, "c-5-speak-read-dialogue"),        // RF.3.4 read-aloud: two lines of dialogue on screen
    // literature block
    pick(moreThanItSaysQuiz, "c-3-sort-says-or-more"),         // RL.3.4 sort: means what it says / means more
    pick(partsThatBuildQuiz, "c-2-point-to-the-part"),         // RL.3.5 point to the part with term + number
    pick(theirViewYourViewQuiz, "c-5-reader-disagree"),        // RL.3.6 detail that lets a reader disagree with the narrator
    // informational block
    pick(expertWordsQuiz, "c-3-soda-straws-trap"),             // RI.3.4 everyday phrase with an expert meaning
    pick(theAuthorsViewQuiz, "c-4-fact-to-disagree"),          // RI.3.6 fact a reader could use against the author
    // language block
    pick(checkTheDictionaryQuiz, "c-3-spoke-meaning"),         // L.3.4d numbered meaning that fits the sentence
    pick(sayingsThatMeanMoreQuiz, "c-2-last-straw-two-ways"),  // L.3.5a literal straw vs the saying
    pick(wordsInActionQuiz, "c-6-speak-talkative"),            // L.3.5b speak: real-life example + because
    // harder close
    pick(theAuthorsViewQuiz, "h-4-speak-point-and-reason"),    // RI.3.6 speak closer: the point, then the fact that holds it up
  ],
};
