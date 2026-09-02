import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { longOrShortQuiz } from "./long-or-short-quiz";
import { teamPlayersQuiz } from "./team-players-quiz";
import { prefixSuffixDecodersQuiz } from "./prefix-suffix-decoders-quiz";
import { heartWordsQuiz } from "./heart-words-quiz";
import { readLikeYouTalkQuiz } from "./read-like-you-talk-quiz";
import { clickAndClunkQuiz } from "./click-and-clunk-quiz";
import { storyShapeQuiz } from "./story-shape-quiz";
import { oneStoryTwoWaysQuiz } from "./one-story-two-ways-quiz";
import { theWholeStoryQuiz } from "./the-whole-story-quiz";
import { fableTellersQuiz } from "./fable-tellers-quiz";
import { paragraphPowerQuiz } from "./paragraph-power-quiz";
import { whyAuthorsWriteQuiz } from "./why-authors-write-quiz";
import { holdItUpQuiz } from "./hold-it-up-quiz";
import { readToLearnQuiz } from "./read-to-learn-quiz";
import { clueHuntersQuiz } from "./clue-hunters-quiz";
import { wordLaddersQuiz } from "./word-ladders-quiz";
import { matchYourVoiceQuiz } from "./match-your-voice-quiz";
import { readItOutLoudQuiz } from "./read-it-out-loud-quiz";

/**
 * GRADE 2 GRADUATION EXAM — 18 questions spanning all four units
 * (every strand: 4 phonics, 3 fluency, 4 RL, 4 RI, 3 L, read-aloud closer),
 * strongest STANDALONE pick per major skill, easy → hard. Every pick's
 * stimulus is fully self-contained — no "our lesson/story" recall.
 * ADAPTIVE OFF: the year's measure.
 * Grade finals are a standing deliverable (docs/UNIT_ROADMAP.md § Grade finals).
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`g2-final: ${quiz.id} has no question ${id}`);
  // namespace: generic per-quiz ids collide across source quizzes (SOP rule)
  return { ...q, id: `${quiz.lessonId}--${q.id}` };
}

export const g2Final: QuizDef = {
  id: "g2-final",
  lessonId: "g2-final",
  title: "Grade 2 Graduation",
  standard: "G2-FINAL",
  askCount: 18,
  adaptive: false, // fixed order — the year's measure
  questions: [
    // phonics + word analysis ramp (U1 → U3)
    pick(longOrShortQuiz, "c-1"),                          // RF.2.3a long/short vowel (tape vs tap)
    pick(teamPlayersQuiz, "c-1"),                          // RF.2.3b vowel team oo (broom vs book sound)
    pick(prefixSuffixDecodersQuiz, "c-3-sort-front-end"),  // RF.2.3d prefix/suffix position sort
    pick(heartWordsQuiz, "c-1-say-done"),                  // RF.2.3f irregular word done
    // fluency (U3 → U4)
    pick(readLikeYouTalkQuiz, "c-1-tiny-pause"),           // RF.2.4 comma = tiny pause
    pick(clickAndClunkQuiz, "c-3-kite-park"),              // RF.2.4c context confirms the fix
    // literature (U1 → U3)
    pick(storyShapeQuiz, "c-4-wagon-ending"),              // RL.2.5 ending concludes the action
    pick(oneStoryTwoWaysQuiz, "c-2-welcome-gift"),         // RL.2.9 the swapped detail across tellings
    pick(theWholeStoryQuiz, "h-1-petra-quiet"),            // RL.2.10 cross-story inference
    pick(fableTellersQuiz, "h-1"),                         // RL.2.2 moral of a fresh fable (deer)
    // informational (U1 → U4)
    pick(paragraphPowerQuiz, "c-2-p2-focus"),              // RI.2.2 paragraph focus
    pick(whyAuthorsWriteQuiz, "c-2-tern-answer"),          // RI.2.6 author's purpose
    pick(holdItUpQuiz, "c-1-library-point"),               // RI.2.8 point vs the reasons under it
    pick(readToLearnQuiz, "h-4-high-tide"),                // RI.2.10 teach-it-back speak (high tide)
    // language (U1 → U4)
    pick(clueHuntersQuiz, "c-1-mend-meaning"),             // L.2.4a context clue (mend)
    pick(wordLaddersQuiz, "c-1-window-shattered"),         // L.2.5b strongest break word
    pick(matchYourVoiceQuiz, "c-4-voice-sort"),            // L.2.3 playground/school voice sort
    // full-circle closer: a whole-passage expression read from the fluency capstone
    pick(readItOutLoudQuiz, "h-3-speak-storm"),            // RF.2.4b three-sentence read-aloud closer
  ],
};
