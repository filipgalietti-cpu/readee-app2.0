import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { sentenceShapesQuiz } from "./sentence-shapes-quiz";
import { blendBuildersQuiz } from "./blend-builders-quiz";
import { askItFindItQuiz } from "./ask-it-find-it-quiz";
import { storyMessageQuiz } from "./story-message-quiz";
import { topicSpotterQuiz } from "./topic-spotter-quiz";
import { sentenceCluesQuiz } from "./sentence-clues-quiz";
import { prefixPowerQuiz } from "./prefix-power-quiz";
import { smoothReaderQuiz } from "./smooth-reader-quiz";
import { checkAndFixQuiz } from "./check-and-fix-quiz";
import { wordPicturesQuiz } from "./word-pictures-quiz";
import { magicTeamsQuiz } from "./magic-teams-quiz";
import { whosTellingItQuiz } from "./whos-telling-it-quiz";
import { textFeatureFindersQuiz } from "./text-feature-finders-quiz";
import { wordBreakersQuiz } from "./word-breakers-quiz";
import { proveItQuiz } from "./prove-it-quiz";
import { trickyWordsQuiz } from "./tricky-words-quiz";
import { storyPoemPartyQuiz } from "./story-poem-party-quiz";

/**
 * GRADE 1 GRADUATION EXAM — 16 questions spanning all five units
 * (every strand: 7 RF, 4 RL, 3 RI, 2 L, read-aloud closer), strongest pick
 * per major skill, easy → hard. ADAPTIVE OFF: the year's measure.
 * Grade finals are a standing deliverable (docs/UNIT_ROADMAP.md § Grade finals).
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g1-final: ${quiz.id} has no question ${id}`);
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g1Final: QuizDef = {
  id: "g1-final",
  lessonId: "g1-final",
  title: "Grade 1 Graduation",
  standard: "G1-FINAL",
  askCount: 16,
  adaptive: false, // fixed order — the year's measure
  questions: [
    // print + phonics ramp (U1 → U4)
    pick(sentenceShapesQuiz, "c-1-capital-letter-application"), // RF.1.1a sentence features
    pick(blendBuildersQuiz, "c-identify-blend-word"),           // RF.1.2b blends
    pick(magicTeamsQuiz, "c-2"),                                // RF.1.3c long vowels
    pick(wordBreakersQuiz, "c-2"),                              // RF.1.3e two-syllable decode
    pick(trickyWordsQuiz, "c-real-way-said"),                   // RF.1.3g irregular words
    pick(smoothReaderQuiz, "c-1-smooth-pace"),                  // RF.1.4b fluency
    pick(checkAndFixQuiz, "c-2-fix-ran"),                       // RF.1.4c self-correct
    // literature (U1 → U5)
    pick(askItFindItQuiz, "c-why-dot-hide"),                    // RL.1.1 why-question
    pick(storyMessageQuiz, "c-message-identify"),               // RL.1.2 central message
    pick(wordPicturesQuiz, "c-touch-choose"),                   // RL.1.4 sensory words
    pick(whosTellingItQuiz, "c-2-narrator-he-they"),            // RL.1.6 narrator
    // informational (U1 → U4)
    pick(topicSpotterQuiz, "c-1-main-topic"),                   // RI.1.2 main topic
    pick(textFeatureFindersQuiz, "c-2"),                        // RI.1.5 text features
    pick(proveItQuiz, "c-1-find-point-bikes"),                  // RI.1.8 author's point
    // language (U1)
    pick(sentenceCluesQuiz, "c-1-gleeful-meaning"),             // L.1.4a context clues
    // full-circle closer: read a poem line from the year's last story aloud
    pick(storyPoemPartyQuiz, "h-rhyme-with-near"),              // RL.1.10 rhyme production closer
  ],
};
