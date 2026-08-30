import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { letterPairsQuiz } from "./letter-pairs-quiz";
import { bookBasicsQuiz } from "./book-basics-quiz";
import { rhymeTimeQuiz } from "./rhyme-time-quiz";
import { soundSlidersQuiz } from "./sound-sliders-quiz";
import { soundDetectivesQuiz } from "./sound-detectives-quiz";
import { wordMachinesQuiz } from "./word-machines-quiz";
import { letterSoundsQuiz } from "./letter-sounds-quiz";
import { snapWordsQuiz } from "./snap-words-quiz";
import { lookCloseQuiz } from "./look-close-quiz";
import { keyDetailsQuiz } from "./key-details-quiz";
import { tellItBackQuiz } from "./tell-it-back-quiz";
import { pictureCluesQuiz } from "./picture-clues-quiz";
import { whatsItAboutQuiz } from "./whats-it-about-quiz";
import { authorReasonsQuiz } from "./author-reasons-quiz";
import { namingDoingWordsQuiz } from "./naming-doing-words-quiz";

/**
 * KINDERGARTEN GRADUATION EXAM — 16 questions spanning all four units
 * (every strand: 9 RF, 3 RL, 2 RI, 1 L, + read-aloud closer), strongest pick
 * per major skill, easy → hard. ADAPTIVE OFF: this is the year's measure.
 * Grade finals are a standing deliverable (docs/UNIT_ROADMAP.md § Grade finals).
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`k-final: ${quiz.id} has no question ${id}`);
  return q;
}

export const kFinal: QuizDef = {
  id: "k-final",
  lessonId: "k-final",
  title: "Kindergarten Graduation",
  standard: "K-FINAL",
  askCount: 16,
  adaptive: false, // fixed order — the year's measure
  questions: [
    // print + letters (U1)
    pick(bookBasicsQuiz, "c-1-how-wormy-reads"),         // RF.K.1a-c print concepts
    pick(letterPairsQuiz, "c-big-b-partner"),            // RF.K.1d letter pairs
    // phonological awareness ramp (U1 → U2)
    pick(rhymeTimeQuiz, "q-cat"),                        // RF.K.2a rhyme
    pick(soundSlidersQuiz, "c-slide-t-op-word"),         // RF.K.2c blend
    pick(soundDetectivesQuiz, "c-first-sound-pig"),      // RF.K.2d isolate
    pick(wordMachinesQuiz, "c-4-can-to-fan-word"),       // RF.K.2e substitute
    // phonics + words (U2 → U3)
    pick(letterSoundsQuiz, "c-2-p-sound-recognition"),   // RF.K.3a letter sounds
    pick(snapWordsQuiz, "c-find-of"),                    // RF.K.3c sight words
    pick(lookCloseQuiz, "c-5-tap-word-for-picture"),     // RF.K.3d near-twin words
    // literature (U1 → U3)
    pick(keyDetailsQuiz, "c-1-who-story-core"),          // RL.K.1 key details
    pick(tellItBackQuiz, "c-4"),                         // RL.K.2 retell (sort)
    pick(pictureCluesQuiz, "c-4-bird-drop-choose"),      // RL.K.7 picture clues
    // informational (U4)
    pick(whatsItAboutQuiz, "c-1-identify-main-topic"),   // RI.K.2 main topic
    pick(authorReasonsQuiz, "c-3-splash-fish-why"),      // RI.K.8 author's reason
    // language (U2)
    pick(namingDoingWordsQuiz, "c-make-plural-dog"),     // K.L.1 plurals
    // full-circle closer: the first speak question we ever built
    pick(rhymeTimeQuiz, "q-say-hat"),                    // RF.K.2a read aloud (speak)
  ],
};
