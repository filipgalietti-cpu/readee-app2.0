// Quiz types — a quiz is a POOL of questions rendered through the same
// interaction registry as lessons, wrapped in the quiz chrome (countdown →
// bunny dance → streak flame → perfect score → performance review) with an
// ADAPTIVE difficulty ladder: start medium, right → harder, wrong → easier.

import type { AssetRef, InteractionDef } from "./types";

export interface QuizQuestion {
  id: string;
  /** Difficulty band — BACKEND-ONLY, never shown to the child (Filip spec):
   *    "easier"  = below-grade support: 2 options, picture crutches, softer ask
   *    "core"    = on-grade, matches the lesson
   *    "harder"  = SAME CONCEPT at the NEXT GRADE level (production not
   *                recognition, no picture support)
   *  The ladder starts at core; 2 straight first-try corrects step up,
   *  a miss steps down. Band crossings are strong learner-model signal. */
  band: "easier" | "core" | "harder";
  /** Fine ordering within a band (1 = easiest of the band). */
  difficulty: number;
  prompt: string;                      // short on-screen line
  narration?: { audio: AssetRef; script: string }; // spoken question (Autonoe)
  image?: AssetRef;                    // optional visual context
  interaction: InteractionDef;         // any registry interaction = a question
  /** Subtle no-spoiler nudge, played after the FIRST wrong try (legacy pattern). */
  hint?: { audio: AssetRef; script: string };
  /** "That one was tricky!" + explains the answer — played on the 2nd wrong. */
  explain?: { audio: AssetRef; script: string };
  /** ALLEY-OOP (Filip): answering this correctly makes `followUpId` the next
   *  question, overriding the ladder — e.g. read HAT aloud → "what rhymes with HAT?" */
  followUpId?: string;
}

export interface QuizDef {
  id: string;
  lessonId: string;                    // the lesson this quiz belongs to
  title: string;
  standard: string;
  /** How many questions one run asks (pool may be larger for the ladder). */
  askCount: number;
  /** false = fixed order, no ladder (unit exams are a measure, not practice). */
  adaptive: boolean;
  questions: QuizQuestion[];
}

export interface QuizResultItem {
  questionId: string;
  prompt: string;
  band: "easier" | "core" | "harder";
  difficulty: number;
  correct: boolean;
  attempts: number;
}
