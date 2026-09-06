import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { knowThemByHeartQuiz } from "./know-them-by-heart-quiz";
import { chunkByChunkQuiz } from "./chunk-by-chunk-quiz";
import { meaningMachinesQuiz } from "./meaning-machines-quiz";
import { smoothAndSureQuiz } from "./smooth-and-sure-quiz";
import { doesThatMakeSenseQuiz } from "./does-that-make-sense-quiz";
import { whyTheyDidItQuiz } from "./why-they-did-it-quiz";
import { theirViewYourViewQuiz } from "./their-view-your-view-quiz";
import { moreThanItSaysQuiz } from "./more-than-it-says-quiz";
import { pointToTheFactQuiz } from "./point-to-the-fact-quiz";
import { sentenceToSentenceQuiz } from "./sentence-to-sentence-quiz";
import { theWholeFactBookQuiz } from "./the-whole-fact-book-quiz";
import { readAroundTheWordQuiz } from "./read-around-the-word-quiz";
import { wordsForEffectQuiz } from "./words-for-effect-quiz";
import { buildABetterSentenceQuiz } from "./build-a-better-sentence-quiz";
import { commasQuotesCapitalsQuiz } from "./commas-quotes-capitals-quiz";
import { twoWritersOneTopicQuiz } from "./two-writers-one-topic-quiz";
import { theWholeChapterQuiz } from "./the-whole-chapter-quiz";
import { followTheMessageQuiz } from "./follow-the-message-quiz";

/**
 * GRADE 3 GRADUATION EXAM — 18 questions spanning all four units
 * (5 phonics/fluency incl. an on-screen two-sentence read-aloud, 4 RL incl.
 * a character, a view and a message item, 4 RI incl. the big idea and a
 * two-texts item, 4 L incl. grammar and conventions, 1 discretionary RL.3.4;
 * 2 sorts + 3 speaks), strongest STANDALONE pick per major skill, core
 * word-level openers → core middle → harder two-text / two-page close →
 * theme-and-moral production speak closer. Phonics and fluency are measured
 * at CORE band (the U2/U3 exam rule). NONE of the 18 picks was used in a
 * Grade 3 unit exam, so the final is not a replay. Every pick's stimulus is
 * fully self-contained: the G3 quizzes speak their page / both texts / the
 * chapter-in-short inside the question, or put the text on screen — no
 * "the story we just read" recall. the-whole-chapter e-4 (no narration
 * clip) is never picked. ADAPTIVE OFF: the year's measure.
 * Grade finals are a standing deliverable (docs/UNIT_ROADMAP.md § Grade finals).
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g3-final: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g3Final: QuizDef = {
  id: "g3-final",
  lessonId: "g3-final",
  title: "Grade 3 Graduation",
  standard: "G3-FINAL",
  askCount: 18,
  adaptive: false, // fixed order — the year's measure
  questions: [
    // phonics + word analysis (U2 → U1), word-level openers at core
    pick(knowThemByHeartQuiz, "c-1-wreck-word"),                // RF.3.3d irregular word wreck among look-alikes
    pick(chunkByChunkQuiz, "c-2-nutmeg-split"),                 // RF.3.3c the syllable split that follows the rule
    pick(meaningMachinesQuiz, "c-4-sort-fresh-ful-less"),       // RF.3.3a sort: Full Of (-ful) / Without (-less)
    // fluency (U2 → U3)
    pick(smoothAndSureQuiz, "c-1-speak-read-two-sentences"),    // RF.3.4 read-aloud: two sentences on screen, talking pace
    pick(doesThatMakeSenseQuiz, "c-1-minute-reading"),          // RF.3.4c a two-way word settled by the page it sits in
    // literature (U1 → U2)
    pick(whyTheyDidItQuiz, "c-2-which-action-shows-it"),        // RL.3.3 character: the line that proves the trait
    pick(theirViewYourViewQuiz, "c-1-narrator-view"),           // RL.3.6 view: what the narrator thinks of the plan
    pick(moreThanItSaysQuiz, "c-1-stomach-did-a-flip"),         // RL.3.4 nonliteral phrase, read around it (discretionary)
    // informational (U1 → U4)
    pick(pointToTheFactQuiz, "c-5-put-together-danger"),        // RI.3.1 put two sentences of the page together
    pick(sentenceToSentenceQuiz, "c-4-sort-three-kinds"),       // RI.3.8 sort: Comparison / Cause and Effect / Sequence
    pick(theWholeFactBookQuiz, "c-6-speak-big-idea"),           // RI.3.10 speak: big idea of the fact book + one detail
    // language (U1 → U3)
    pick(readAroundTheWordQuiz, "c-1-canteens-meaning"),        // L.3.4a meaning from the clue in the sentence
    pick(wordsForEffectQuiz, "c-5-detail-for-effect"),          // L.3.3 the detail placed for effect
    pick(buildABetterSentenceQuiz, "c-1-because-flashlight"),   // L.3.1 grammar: the joining word whose meaning fits
    pick(commasQuotesCapitalsQuiz, "c-3-address-commas"),       // L.3.2 conventions: commas in an address
    // harder close (U3 → U1)
    pick(twoWritersOneTopicQuiz, "h-2-put-together-applied"),   // RI.3.9 two texts: the answer that uses a fact from each
    pick(theWholeChapterQuiz, "h-2-two-pages-notebook-means"),  // RL.3.10 hold pages one and six together for the inference
    pick(followTheMessageQuiz, "h-4-speak-theme-and-moral"),    // RL.3.2 speak closer: theme in one word, moral as advice
  ],
};
