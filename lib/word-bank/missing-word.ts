import { wordBank, wordsByTag } from "./words";
import type { MatchingQuestion } from "@/lib/assessment/questions";

/* ── Types ──────────────────────────────────────────── */

interface MWSentence {
  /** All words lowercase */
  words: string[];
  /** Index of the blanked word */
  blank: number;
  /** Tags used to pick 3 distractors (same part-of-speech) */
  distractorTags: string[];
  /** Hint shown on wrong answer */
  hint: string;
}

/* ── Sentence Bank ──────────────────────────────────── */

export const missingSentences: MWSentence[] = [
  // ═══════════════════════════════════════════════════
  // Missing animal noun
  // ═══════════════════════════════════════════════════
  { words: ["the", "dog", "can", "run"], blank: 1, distractorTags: ["noun"], hint: "What animal can run?" },
  { words: ["the", "frog", "can", "hop"], blank: 1, distractorTags: ["noun"], hint: "What animal can hop?" },
  { words: ["the", "bear", "is", "big"], blank: 1, distractorTags: ["noun"], hint: "What big animal is it?" },
  { words: ["i", "see", "a", "cat"], blank: 3, distractorTags: ["noun"], hint: "What animal do you see?" },
  { words: ["the", "fish", "can", "swim"], blank: 1, distractorTags: ["noun"], hint: "What animal can swim?" },
  { words: ["the", "pig", "is", "in", "the", "mud"], blank: 1, distractorTags: ["animal"], hint: "What animal is in the mud?" },
  { words: ["look", "at", "the", "bird"], blank: 3, distractorTags: ["noun"], hint: "What do you see?" },
  { words: ["i", "like", "my", "pup"], blank: 3, distractorTags: ["noun"], hint: "What pet do you like?" },
  { words: ["he", "can", "see", "the", "owl"], blank: 4, distractorTags: ["noun"], hint: "What animal does he see?" },
  { words: ["the", "fox", "ran", "to", "the", "hut"], blank: 1, distractorTags: ["animal"], hint: "What animal ran to the hut?" },
  { words: ["i", "can", "see", "a", "bug", "on", "the", "log"], blank: 4, distractorTags: ["noun"], hint: "What is on the log?" },
  { words: ["the", "ant", "is", "on", "the", "mat"], blank: 1, distractorTags: ["animal"], hint: "What is on the mat?" },
  { words: ["he", "got", "a", "pet", "pug"], blank: 4, distractorTags: ["animal"], hint: "What pet did he get?" },
  { words: ["the", "hen", "is", "in", "the", "pen"], blank: 1, distractorTags: ["animal"], hint: "What is in the pen?" },
  { words: ["a", "frog", "can", "jump"], blank: 1, distractorTags: ["noun"], hint: "What can jump?" },
  { words: ["the", "ant", "is", "not", "big"], blank: 1, distractorTags: ["animal"], hint: "What animal is small?" },
  { words: ["i", "see", "a", "crab", "on", "the", "rock"], blank: 3, distractorTags: ["animal"], hint: "What is on the rock?" },
  { words: ["the", "pup", "got", "in", "the", "tub"], blank: 1, distractorTags: ["animal"], hint: "What got in the tub?" },
  { words: ["the", "cub", "is", "in", "the", "den"], blank: 1, distractorTags: ["animal"], hint: "What is in the den?" },
  { words: ["the", "rat", "ran", "fast"], blank: 1, distractorTags: ["animal"], hint: "What animal ran fast?" },

  // ═══════════════════════════════════════════════════
  // Missing thing / food noun
  // ═══════════════════════════════════════════════════
  { words: ["he", "has", "a", "red", "hat"], blank: 4, distractorTags: ["noun"], hint: "What red thing does he have?" },
  { words: ["the", "book", "is", "on", "the", "bed"], blank: 1, distractorTags: ["noun"], hint: "What is on the bed?" },
  { words: ["she", "has", "a", "cup"], blank: 3, distractorTags: ["noun"], hint: "What does she have?" },
  { words: ["i", "see", "the", "moon"], blank: 3, distractorTags: ["noun"], hint: "What do you see in the sky?" },
  { words: ["he", "sat", "on", "the", "mat"], blank: 4, distractorTags: ["noun"], hint: "What did he sit on?" },
  { words: ["the", "pen", "is", "in", "the", "bag"], blank: 1, distractorTags: ["noun"], hint: "What is in the bag?" },
  { words: ["i", "got", "a", "red", "cap"], blank: 4, distractorTags: ["noun"], hint: "What did you get?" },
  { words: ["the", "lid", "is", "on", "the", "top"], blank: 1, distractorTags: ["noun"], hint: "What is on top?" },
  { words: ["she", "got", "a", "big", "mug"], blank: 4, distractorTags: ["noun"], hint: "What did she get?" },
  { words: ["he", "has", "a", "net"], blank: 3, distractorTags: ["noun"], hint: "What does he have?" },
  { words: ["the", "ham", "is", "in", "the", "pan"], blank: 1, distractorTags: ["noun"], hint: "What is in the pan?" },
  { words: ["i", "can", "see", "the", "van"], blank: 4, distractorTags: ["noun"], hint: "What do you see?" },
  { words: ["the", "bus", "is", "big"], blank: 1, distractorTags: ["noun"], hint: "What is big?" },
  { words: ["he", "will", "get", "the", "bag"], blank: 4, distractorTags: ["noun"], hint: "What will he get?" },
  { words: ["i", "see", "a", "big", "jet"], blank: 4, distractorTags: ["noun"], hint: "What big thing do you see?" },

  // ═══════════════════════════════════════════════════
  // Missing verb
  // ═══════════════════════════════════════════════════
  { words: ["the", "dog", "can", "dig"], blank: 3, distractorTags: ["verb"], hint: "What can the dog do?" },
  { words: ["she", "can", "kick", "the", "ball"], blank: 2, distractorTags: ["verb"], hint: "What can she do with the ball?" },
  { words: ["the", "cat", "can", "sit"], blank: 3, distractorTags: ["verb"], hint: "What can the cat do?" },
  { words: ["he", "can", "run", "fast"], blank: 2, distractorTags: ["verb"], hint: "What can he do fast?" },
  { words: ["i", "will", "help", "you"], blank: 2, distractorTags: ["verb"], hint: "What will I do?" },
  { words: ["we", "can", "play", "in", "the", "sun"], blank: 2, distractorTags: ["verb"], hint: "What can we do in the sun?" },
  { words: ["the", "cat", "sat", "on", "the", "mat"], blank: 2, distractorTags: ["verb"], hint: "What did the cat do on the mat?" },
  { words: ["i", "can", "see", "a", "big", "dog"], blank: 2, distractorTags: ["verb"], hint: "What can you do?" },
  { words: ["she", "can", "hug", "the", "dog"], blank: 2, distractorTags: ["verb"], hint: "What can she do to the dog?" },
  { words: ["he", "did", "not", "stop"], blank: 3, distractorTags: ["verb"], hint: "What did he not do?" },
  { words: ["we", "ran", "to", "the", "van"], blank: 1, distractorTags: ["verb"], hint: "What did we do?" },
  { words: ["i", "can", "eat", "a", "nut"], blank: 2, distractorTags: ["verb"], hint: "What can you do with a nut?" },
  { words: ["she", "can", "pull", "the", "net"], blank: 2, distractorTags: ["verb"], hint: "What can she do with the net?" },
  { words: ["she", "can", "tug", "the", "rug"], blank: 2, distractorTags: ["verb"], hint: "What can she do with the rug?" },
  { words: ["i", "like", "to", "read", "a", "book"], blank: 3, distractorTags: ["verb"], hint: "What do you like to do with a book?" },
  { words: ["the", "man", "can", "walk"], blank: 3, distractorTags: ["verb"], hint: "What can the man do?" },
  { words: ["we", "pat", "the", "cat"], blank: 1, distractorTags: ["verb"], hint: "What did we do to the cat?" },
  { words: ["she", "can", "ask", "him"], blank: 2, distractorTags: ["verb"], hint: "What can she do?" },
  { words: ["the", "pup", "can", "jump"], blank: 3, distractorTags: ["verb"], hint: "What can the pup do?" },
  { words: ["he", "got", "a", "big", "fish"], blank: 1, distractorTags: ["verb"], hint: "What happened?" },

  // ═══════════════════════════════════════════════════
  // Missing adjective
  // ═══════════════════════════════════════════════════
  { words: ["the", "dog", "is", "big"], blank: 3, distractorTags: ["adjective"], hint: "What is the dog like?" },
  { words: ["the", "sun", "is", "hot"], blank: 3, distractorTags: ["adjective"], hint: "How does the sun feel?" },
  { words: ["the", "dog", "got", "wet"], blank: 3, distractorTags: ["adjective"], hint: "What happened to the dog?" },
  { words: ["it", "is", "fun"], blank: 2, distractorTags: ["adjective"], hint: "How is it?" },
  { words: ["the", "hut", "is", "dim"], blank: 3, distractorTags: ["adjective"], hint: "What is the hut like?" },
  { words: ["the", "cap", "is", "red"], blank: 3, distractorTags: ["adjective"], hint: "What color is the cap?" },
  { words: ["the", "rug", "is", "tan"], blank: 3, distractorTags: ["adjective"], hint: "What color is the rug?" },
  { words: ["the", "pot", "is", "hot"], blank: 3, distractorTags: ["adjective"], hint: "How does the pot feel?" },
  { words: ["the", "cat", "is", "not", "wet"], blank: 4, distractorTags: ["adjective"], hint: "What is the cat not?" },
  { words: ["he", "ran", "fast"], blank: 2, distractorTags: ["adjective"], hint: "How did he run?" },

  // ═══════════════════════════════════════════════════
  // Missing sight / function word
  // ═══════════════════════════════════════════════════
  { words: ["i", "can", "see", "the", "dog"], blank: 0, distractorTags: ["sight", "noun"], hint: "Who can see the dog?" },
  { words: ["i", "have", "a", "red", "hat"], blank: 1, distractorTags: ["verb"], hint: "I ___ a red hat." },
  { words: ["he", "can", "help"], blank: 0, distractorTags: ["sight", "noun"], hint: "Who can help?" },
  { words: ["she", "did", "not", "run"], blank: 1, distractorTags: ["verb"], hint: "She ___ not run." },
  { words: ["i", "got", "a", "big", "hat"], blank: 1, distractorTags: ["verb"], hint: "I ___ a big hat." },
  { words: ["we", "will", "help", "him"], blank: 1, distractorTags: ["sight"], hint: "We ___ help him." },
  { words: ["he", "has", "a", "dog", "and", "a", "cat"], blank: 4, distractorTags: ["sight"], hint: "He has a dog ___ a cat." },
  { words: ["the", "pig", "is", "in", "the", "mud"], blank: 3, distractorTags: ["sight"], hint: "The pig is ___ the mud." },
  { words: ["the", "cat", "is", "on", "the", "mat"], blank: 3, distractorTags: ["sight"], hint: "The cat is ___ the mat." },
  { words: ["she", "can", "not", "see", "him"], blank: 2, distractorTags: ["sight"], hint: "She can ___ see him." },
];

/* ── Helpers ─────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

let nextMwId = 1;

/**
 * Build the audio URL for a sentence.
 * Reuses existing files in /audio/sentences/ when available.
 */
function sentenceAudioUrl(words: string[]): string {
  return `/audio/sentences/${words.join("-")}.mp3`;
}

/* ── Generator ───────────────────────────────────────── */

/**
 * Generate a single missing-word question.
 * Picks a random sentence, creates 4 choices (1 correct + 3 distractors).
 */
export function generateMissingWord(
  usedSentences: Set<number> = new Set()
): MatchingQuestion | null {
  const available = missingSentences
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => !usedSentences.has(i));

  if (available.length === 0) return null;

  const { s, i: sentenceIdx } = available[Math.floor(Math.random() * available.length)];
  usedSentences.add(sentenceIdx);

  const correctWord = s.words[s.blank];

  // Pick 3 distractors from the word bank
  const distractorPool = s.distractorTags.length === 1
    ? wordsByTag(s.distractorTags[0])
    : wordBank.filter((w) => s.distractorTags.some((t) => w.tags.includes(t)));

  const candidates = shuffle(
    distractorPool
      .filter((w) => w.word !== correctWord && !s.words.includes(w.word))
  );

  if (candidates.length < 3) return null;

  const distractors = candidates.slice(0, 3).map((w) => w.word);
  const choices = shuffle([correctWord, ...distractors]);

  // Build display words (capitalized, with sentence case)
  const displayWords = s.words.map((w, idx) =>
    idx === 0 ? capitalize(w) : w
  );

  return {
    id: `gen-mw-${nextMwId++}`,
    type: "missing_word",
    prompt: "Pick the missing word!",
    sentenceWords: displayWords.map(capitalize),
    blankIndex: s.blank,
    missingChoices: choices.map(capitalize),
    sentenceHint: s.hint,
    sentenceAudioUrl: sentenceAudioUrl(s.words),
  };
}

/**
 * Reset the ID counter (call at start of a fresh generation run).
 */
export function resetMissingWordIds() {
  nextMwId = 1;
}
