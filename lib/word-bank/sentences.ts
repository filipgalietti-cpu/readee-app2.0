import { wordsByTags, findWord, type WordEntry } from "./words";

export interface SentenceTemplate {
  /** Fixed words + tag slots, e.g. ["The", "{animal}", "Can", "{verb}"] */
  pattern: string[];
  /** Human-readable hint */
  hint: string;
  /** Tag arrays for each slot — index maps to the placeholder order */
  slotTags: string[][];
  /** Pre-recorded audio URL (null = play word-by-word) */
  audioUrl?: string;
}

export interface GeneratedSentence {
  words: string[];
  correctSentence: string;
  hint: string;
  audioUrl?: string;
}

/** Sentence templates — slots are `{tag1+tag2}` in pattern */
export const sentenceTemplates: SentenceTemplate[] = [
  // ── Pre-recorded sentences (existing audio files) ──
  {
    pattern: ["The", "Dog", "Can", "Run"],
    hint: "What can a dog do?",
    slotTags: [],
    audioUrl: "/audio/sentences/the-dog-can-run.mp3",
  },
  {
    pattern: ["The", "Frog", "Can", "Hop"],
    hint: "What does a frog do?",
    slotTags: [],
    audioUrl: "/audio/sentences/the-frog-can-hop.mp3",
  },
  {
    pattern: ["We", "Like", "To", "Play"],
    hint: "What do we enjoy doing?",
    slotTags: [],
    audioUrl: "/audio/sentences/we-like-to-play.mp3",
  },
  {
    pattern: ["The", "Cat", "Is", "Big"],
    hint: "How big is the cat?",
    slotTags: [],
    audioUrl: "/audio/sentences/the-cat-is-big.mp3",
  },
  {
    pattern: ["Come", "See", "My", "Dog"],
    hint: "Someone wants to show you their pet!",
    slotTags: [],
    audioUrl: "/audio/sentences/come-see-my-dog.mp3",
  },
  {
    pattern: ["He", "Is", "Wet"],
    hint: "What happened to him?",
    slotTags: [],
    audioUrl: "/audio/sentences/he-is-wet.mp3",
  },
  {
    pattern: ["The", "Fox", "Is", "Red"],
    hint: "What color is the fox?",
    slotTags: [],
    audioUrl: "/audio/sentences/the-fox-is-red.mp3",
  },
  {
    pattern: ["She", "Said", "Yes"],
    hint: "What did she say?",
    slotTags: [],
    audioUrl: "/audio/sentences/she-said-yes.mp3",
  },
  {
    pattern: ["The", "Hen", "Is", "In", "The", "Mud"],
    hint: "Where is the hen?",
    slotTags: [],
    audioUrl: "/audio/sentences/the-hen-is-in-the-mud.mp3",
  },
  {
    pattern: ["We", "Can", "See", "The", "Star"],
    hint: "What is up in the sky?",
    slotTags: [],
    audioUrl: "/audio/sentences/we-can-see-the-star.mp3",
  },
  {
    pattern: ["The", "Cat", "Sat", "On", "The", "Mat"],
    hint: "Where did the cat sit?",
    slotTags: [],
    audioUrl: "/audio/sentences/the-cat-sat-on-the-mat.mp3",
  },
  {
    pattern: ["I", "Like", "To", "Read"],
    hint: "What do I enjoy?",
    slotTags: [],
    audioUrl: "/audio/sentences/i-like-to-read.mp3",
  },
  {
    pattern: ["The", "Dog", "Ran", "Fast"],
    hint: "How did the dog move?",
    slotTags: [],
    audioUrl: "/audio/sentences/the-dog-ran-fast.mp3",
  },

  // ── Dynamic templates (word-by-word audio) ──
  {
    pattern: ["The", "{animal}", "Can", "{verb}"],
    hint: "What can the animal do?",
    slotTags: [["animal", "cvc"], ["verb", "cvc"]],
  },
  {
    pattern: ["I", "See", "The", "{animal}"],
    hint: "What animal do you see?",
    slotTags: [["animal", "cvc"]],
  },
  {
    pattern: ["The", "{animal}", "Is", "{adjective}"],
    hint: "What is the animal like?",
    slotTags: [["animal", "cvc"], ["adjective", "cvc"]],
  },
  {
    pattern: ["I", "Like", "My", "{animal}"],
    hint: "What pet do you like?",
    slotTags: [["animal", "pet"]],
  },
  {
    pattern: ["Look", "At", "The", "{noun}"],
    hint: "What should you look at?",
    slotTags: [["noun", "cvc"]],
  },
  {
    pattern: ["We", "Can", "{verb}"],
    hint: "What can we do?",
    slotTags: [["verb", "cvc"]],
  },
  {
    pattern: ["He", "Can", "{verb}"],
    hint: "What can he do?",
    slotTags: [["verb", "cvc"]],
  },
  {
    pattern: ["She", "Can", "{verb}"],
    hint: "What can she do?",
    slotTags: [["verb", "cvc"]],
  },
  {
    pattern: ["I", "Have", "A", "{noun}"],
    hint: "What do you have?",
    slotTags: [["noun", "cvc"]],
  },
];

/** Check if a fixed word (not a slot) has audio in the word bank */
function fixedWordHasAudio(word: string): boolean {
  // Common articles/prepositions that don't need individual audio
  // but all our words are in the bank, so just check
  return !!findWord(word);
}

/** Check if a pattern word is a slot */
function isSlot(word: string): boolean {
  return word.startsWith("{") && word.endsWith("}");
}

/**
 * Build a sentence from a template:
 * - Fixed-word templates: return as-is
 * - Dynamic templates: pick random words matching slot tags
 * - Returns null if words can't be filled
 */
export function buildSentence(
  template: SentenceTemplate,
  usedWords: Set<string> = new Set()
): GeneratedSentence | null {
  // Fixed sentence (no slots)
  if (template.slotTags.length === 0) {
    // Verify all fixed words have audio
    for (const w of template.pattern) {
      if (!fixedWordHasAudio(w)) return null;
    }
    return {
      words: [...template.pattern],
      correctSentence: template.pattern.join(" ") + ".",
      hint: template.hint,
      audioUrl: template.audioUrl,
    };
  }

  // Dynamic sentence: fill slots
  const words: string[] = [];
  let slotIdx = 0;

  for (const part of template.pattern) {
    if (isSlot(part)) {
      const tags = template.slotTags[slotIdx];
      if (!tags) return null;
      slotIdx++;

      const candidates = wordsByTags(tags).filter(
        (w) => !usedWords.has(w.word)
      );
      if (candidates.length === 0) return null;

      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      words.push(capitalize(pick.word));
      usedWords.add(pick.word);
    } else {
      words.push(part);
    }
  }

  return {
    words,
    correctSentence: words.join(" ") + ".",
    hint: template.hint,
    audioUrl: undefined, // word-by-word playback
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
