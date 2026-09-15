import "server-only";
import type { LessonDef } from "@/lib/lesson-engine/types";
import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import { roryLesson, roryPractice, roryPracticeCount } from "@/app/data/lesson-packages/rhyme-time";
import { pipLesson, pipPracticePool } from "@/app/data/lesson-packages/pips-tree";
import {
  beatLesson,
  beatPractice,
  beatPracticeCount,
} from "@/app/data/lesson-packages/syllable-beats";
import {
  bookLesson,
  bookPractice,
  bookPracticeCount,
} from "@/app/data/lesson-packages/book-makers";
import {
  lanternLesson,
  lanternPractice,
  lanternPracticeCount,
} from "@/app/data/lesson-packages/letter-pairs";
import {
  wormLesson,
  wormPractice,
  wormPracticeCount,
} from "@/app/data/lesson-packages/book-basics";
import {
  shelfLesson,
  shelfPractice,
  shelfPracticeCount,
} from "@/app/data/lesson-packages/story-kinds";
import {
  acornLesson,
  acornPractice,
  acornPracticeCount,
} from "@/app/data/lesson-packages/big-kid-words";
export const packages: Record<
  string,
  { lesson: LessonDef; pool: PracticeQuestion[]; count: number; flow: string; practiceFlow: string }
> = {
  "rhyme-time": {
    lesson: roryLesson,
    pool: roryPractice,
    count: roryPracticeCount,
    flow: "rhyme-time-v1",
    practiceFlow: "rhyme-time-v1-practice-three-rhymes-sun-v3",
  },
  "key-details": {
    lesson: pipLesson,
    pool: pipPracticePool,
    count: pipPracticePool.length,
    flow: "pips-tree-v3",
    practiceFlow: "pips-tree-v3-practice-luna-v4",
  },
  "syllable-beats": {
    lesson: beatLesson,
    pool: beatPractice,
    count: beatPracticeCount,
    flow: "syllable-beats-v1",
    practiceFlow: "syllable-beats-v1-practice-four-bands-v1",
  },
  "book-makers": {
    lesson: bookLesson,
    pool: bookPractice,
    count: bookPracticeCount,
    flow: "book-makers-v1",
    practiceFlow: "book-makers-v1-practice-four-bands-v1",
  },
  "letter-pairs": {
    lesson: lanternLesson,
    pool: lanternPractice,
    count: lanternPracticeCount,
    flow: "letter-pairs-v1",
    practiceFlow: "letter-pairs-v1-practice-four-bands-v1",
  },
  "book-basics": {
    lesson: wormLesson,
    pool: wormPractice,
    count: wormPracticeCount,
    flow: "book-basics-v1",
    practiceFlow: "book-basics-v1-practice-four-bands-v1",
  },
  "story-kinds": {
    lesson: shelfLesson,
    pool: shelfPractice,
    count: shelfPracticeCount,
    flow: "story-kinds-v1",
    practiceFlow: "story-kinds-v1-practice-four-bands-v1",
  },
  "big-kid-words": {
    lesson: acornLesson,
    pool: acornPractice,
    count: acornPracticeCount,
    flow: "big-kid-words-v1",
    practiceFlow: "big-kid-words-v1-practice-four-bands-v1",
  },
};
