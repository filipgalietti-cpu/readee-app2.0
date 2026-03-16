#!/usr/bin/env node
/**
 * convert-interactive-g1-g4.js
 *
 * Converts 139 MCQs across grades 1-4 to interactive question types:
 *   - tap_to_pair (consolidated from vocab MCQs)
 *   - missing_word (in-place)
 *   - sentence_build (in-place, ordered mode)
 *   - category_sort (mixed: consolidate + in-place)
 *   - sound_machine (in-place, 1st grade only)
 *
 * Run: node scripts/convert-interactive-g1-g4.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "app", "data");
const IMAGE_BASE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public/images";

/* ── Helpers ─────────────────────────────────────────── */

function getStandard(data, standardId) {
  return data.standards.find((s) => s.standard_id === standardId);
}

/** Replace a question in-place (keeps existing audio/hint URLs) */
function replaceQuestion(standard, questionId, newFields) {
  const idx = standard.questions.findIndex((q) => q.id === questionId);
  if (idx === -1) {
    console.warn(`  ⚠ ${questionId} not found`);
    return;
  }
  const original = standard.questions[idx];
  standard.questions[idx] = {
    ...newFields,
    audio_url: original.audio_url,
    hint_audio_url: original.hint_audio_url,
  };
  console.log(`  ✓ ${questionId} → ${newFields.type}`);
}

/** Remove source MCQs from a standard, append a new consolidated question */
function consolidateQuestions(standard, sourceIds, newQuestion) {
  const before = standard.questions.length;
  standard.questions = standard.questions.filter(
    (q) => !sourceIds.includes(q.id)
  );
  standard.questions.push(newQuestion);
  console.log(
    `  ✓ ${sourceIds.join(",")} → ${newQuestion.id} (${newQuestion.type}), ${before} → ${standard.questions.length} Qs`
  );
}

/** Process one grade file */
function processGrade(filename, conversions) {
  console.log(`\n── ${filename} ──`);
  const filePath = path.join(DATA_DIR, filename);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const before = data.total_questions;

  for (const conv of conversions) {
    const standard = getStandard(data, conv.standardId);
    if (!standard) {
      console.warn(`  ⚠ Standard ${conv.standardId} not found`);
      continue;
    }
    if (conv.action === "replace") {
      replaceQuestion(standard, conv.questionId, conv.newFields);
    } else if (conv.action === "consolidate") {
      consolidateQuestions(standard, conv.sourceIds, conv.newQuestion);
    }
  }

  data.total_questions = data.standards.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ${before} → ${data.total_questions} total questions`);
}

/* ══════════════════════════════════════════════════════════
   1ST GRADE CONVERSIONS
   ══════════════════════════════════════════════════════════ */

const G1_CONVERSIONS = [
  /* ── tap_to_pair (consolidate) ─────────────────────── */
  {
    action: "consolidate",
    standardId: "RI.1.4",
    sourceIds: ["RI.1.4-Q1", "RI.1.4-Q2", "RI.1.4-Q3", "RI.1.4-Q5"],
    newQuestion: {
      id: "RI.1.4-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["hibernation", "enormous", "nocturnal", "sprinted"],
      right_items: [
        "A long winter sleep",
        "Very big",
        "Active at night",
        "Ran very fast",
      ],
      correct_pairs: {
        hibernation: "A long winter sleep",
        enormous: "Very big",
        nocturnal: "Active at night",
        sprinted: "Ran very fast",
      },
      correct:
        "hibernation→A long winter sleep, enormous→Very big, nocturnal→Active at night, sprinted→Ran very fast",
      hint: "Match each word to what it means!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "L.1.4",
    sourceIds: ["L.1.4-Q1", "L.1.4-Q2", "L.1.4-Q4", "L.1.4-Q5"],
    newQuestion: {
      id: "L.1.4-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["tiny", "furious", "slippery", "peeked"],
      right_items: [
        "Very small",
        "Very angry",
        "Easy to slide on",
        "Looked quickly",
      ],
      correct_pairs: {
        tiny: "Very small",
        furious: "Very angry",
        slippery: "Easy to slide on",
        peeked: "Looked quickly",
      },
      correct:
        "tiny→Very small, furious→Very angry, slippery→Easy to slide on, peeked→Looked quickly",
      hint: "Think about what each word means!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "L.1.4a",
    sourceIds: [
      "L.1.4a-Q1",
      "L.1.4a-Q2",
      "L.1.4a-Q3",
      "L.1.4a-Q4",
      "L.1.4a-Q5",
    ],
    newQuestion: {
      id: "L.1.4a-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["famished", "sweltering", "cheerful", "exhausted", "timid"],
      right_items: [
        "Very hungry",
        "Very hot",
        "Happy",
        "Very tired",
        "Shy or scared",
      ],
      correct_pairs: {
        famished: "Very hungry",
        sweltering: "Very hot",
        cheerful: "Happy",
        exhausted: "Very tired",
        timid: "Shy or scared",
      },
      correct:
        "famished→Very hungry, sweltering→Very hot, cheerful→Happy, exhausted→Very tired, timid→Shy or scared",
      hint: "Use clues from the word to figure out the meaning!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "L.1.4b",
    sourceIds: ["L.1.4b-Q1", "L.1.4b-Q2", "L.1.4b-Q3", "L.1.4b-Q5"],
    newQuestion: {
      id: "L.1.4b-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["unhappy", "redo", "unkind", "reread"],
      right_items: ["Not happy", "Do again", "Not kind", "Read again"],
      correct_pairs: {
        unhappy: "Not happy",
        redo: "Do again",
        unkind: "Not kind",
        reread: "Read again",
      },
      correct:
        "unhappy→Not happy, redo→Do again, unkind→Not kind, reread→Read again",
      hint: "'Un-' means not. 'Re-' means again.",
      difficulty: 1,
    },
  },

  /* ── missing_word (in-place) ───────────────────────── */
  {
    action: "replace",
    standardId: "RF.1.4c",
    questionId: "RF.1.4c-Q1",
    newFields: {
      id: "RF.1.4c-Q1",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: ["The", "bird", "flew", "over", "the", "___"],
      blank_index: 5,
      missing_choices: ["Tree", "Chair", "Book", "Cup"],
      correct: "Tree",
      hint: "Where do birds usually fly over?",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "RF.1.4c",
    questionId: "RF.1.4c-Q3",
    newFields: {
      id: "RF.1.4c-Q3",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: ["I", "drank", "a", "glass", "of", "___"],
      blank_index: 5,
      missing_choices: ["Rocks", "Paper", "Milk", "Shoes"],
      correct: "Milk",
      hint: "What do people drink?",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "RF.1.4c",
    questionId: "RF.1.4c-Q5",
    newFields: {
      id: "RF.1.4c-Q5",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: ["The", "sun", "is", "very", "___"],
      blank_index: 4,
      missing_choices: ["Wet", "Cold", "Dark", "Bright"],
      correct: "Bright",
      hint: "Think about what the sun is like — does it give light?",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "L.1.6",
    questionId: "L.1.6-Q1",
    newFields: {
      id: "L.1.6-Q1",
      type: "missing_word",
      prompt: "Pick the best word to complete the sentence.",
      sentence_words: [
        "The",
        "___",
        "elephant",
        "sprayed",
        "water",
        "with",
        "its",
        "trunk.",
      ],
      blank_index: 1,
      missing_choices: ["Quiet", "Enormous", "Tiny", "Fast"],
      correct: "Enormous",
      hint: "Elephants are very big. Which word means very big?",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "L.1.6",
    questionId: "L.1.6-Q3",
    newFields: {
      id: "L.1.6-Q3",
      type: "missing_word",
      prompt: "Pick the best word to complete the sentence.",
      sentence_words: [
        "She",
        "was",
        "___",
        "to",
        "get",
        "a",
        "new",
        "puppy.",
      ],
      blank_index: 2,
      missing_choices: ["Excited", "Bored", "Sad", "Angry"],
      correct: "Excited",
      hint: "Getting a new puppy is a happy thing!",
      difficulty: 1,
    },
  },

  /* ── sentence_build (ordered, in-place) ────────────── */
  {
    action: "replace",
    standardId: "L.1.5d",
    questionId: "L.1.5d-Q2",
    newFields: {
      id: "L.1.5d-Q2",
      type: "sentence_build",
      prompt: "Put in order from quietest to loudest",
      words: ["whisper", "talk", "shout"],
      correct: "whisper talk shout",
      hint: "Which is the quietest? Which is the loudest?",
      ordered: true,
      difficulty: 2,
    },
  },
  {
    action: "replace",
    standardId: "L.1.5d",
    questionId: "L.1.5d-Q5",
    newFields: {
      id: "L.1.5d-Q5",
      type: "sentence_build",
      prompt: "Put in order from coldest to hottest",
      words: ["freezing", "warm", "hot"],
      correct: "freezing warm hot",
      hint: "Start with the coldest temperature and end with the hottest.",
      ordered: true,
      difficulty: 2,
    },
  },

  /* ── category_sort ─────────────────────────────────── */
  {
    action: "consolidate",
    standardId: "RL.1.5",
    sourceIds: ["RL.1.5-Q1", "RL.1.5-Q2", "RL.1.5-Q5"],
    newQuestion: {
      id: "RL.1.5-Q6",
      type: "category_sort",
      prompt: "Sort each description into the right category!",
      categories: ["Storybook", "Informational"],
      category_items: {
        Storybook: [
          "A talking rabbit who goes on an adventure",
          "Once upon a time, a brave knight saved a dragon",
        ],
        Informational: [
          "Facts about how plants grow",
          "A book that teaches about the water cycle",
        ],
      },
      items: [
        "A talking rabbit who goes on an adventure",
        "Facts about how plants grow",
        "Once upon a time, a brave knight saved a dragon",
        "A book that teaches about the water cycle",
      ],
      correct: "correct",
      hint: "Stories are made up with characters. Informational books teach real facts!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "L.1.5a",
    sourceIds: ["L.1.5a-Q1", "L.1.5a-Q3"],
    newQuestion: {
      id: "L.1.5a-Q6",
      type: "category_sort",
      prompt: "Sort the words — which ones are colors?",
      categories: ["Colors", "Not Colors"],
      category_items: {
        Colors: ["Red", "Blue", "Green"],
        "Not Colors": ["Dog", "Apple", "Chair"],
      },
      items: ["Red", "Dog", "Blue", "Apple", "Green", "Chair"],
      correct: "correct",
      hint: "Red, blue, and green are all colors!",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "L.1.5",
    questionId: "L.1.5-Q5",
    newFields: {
      id: "L.1.5-Q5",
      type: "category_sort",
      prompt: "Sort the words — which ones are fruits?",
      categories: ["Fruits", "Not Fruits"],
      category_items: {
        Fruits: ["Apple", "Banana", "Grape"],
        "Not Fruits": ["Chair", "Book", "Lamp"],
      },
      items: ["Apple", "Chair", "Banana", "Book", "Grape", "Lamp"],
      correct: "correct",
      hint: "Fruits grow on trees or vines and you can eat them!",
      difficulty: 1,
    },
  },

  /* ── sound_machine (in-place) ──────────────────────── */
  {
    action: "replace",
    standardId: "RF.1.2b",
    questionId: "RF.1.2b-Q1",
    newFields: {
      id: "RF.1.2b-Q1",
      type: "sound_machine",
      prompt: "Blend these sounds to make a word!",
      target_word: "sit",
      phonemes: ["/s/", "/i/", "/t/"],
      distractors: ["/a/", "/p/"],
      correct: "/s/ /i/ /t/",
      hint: "Say each sound, then push them together fast.",
      difficulty: 1,
      image_url: `${IMAGE_BASE}/1st-grade/RF.1.2b/RF.1.2b-Q1.png`,
    },
  },
  {
    action: "replace",
    standardId: "RF.1.2b",
    questionId: "RF.1.2b-Q2",
    newFields: {
      id: "RF.1.2b-Q2",
      type: "sound_machine",
      prompt: "Blend these sounds to make a word!",
      target_word: "flag",
      phonemes: ["/f/", "/l/", "/a/", "/g/"],
      distractors: ["/s/", "/p/"],
      correct: "/f/ /l/ /a/ /g/",
      hint: "Say /f/ /l/ together, then /a/ /g/.",
      difficulty: 2,
      image_url: `${IMAGE_BASE}/1st-grade/RF.1.2b/RF.1.2b-Q2.png`,
    },
  },
  {
    action: "replace",
    standardId: "RF.1.2b",
    questionId: "RF.1.2b-Q3",
    newFields: {
      id: "RF.1.2b-Q3",
      type: "sound_machine",
      prompt: "Blend these sounds to make a word!",
      target_word: "stop",
      phonemes: ["/s/", "/t/", "/o/", "/p/"],
      distractors: ["/a/", "/m/"],
      correct: "/s/ /t/ /o/ /p/",
      hint: "/s/ /t/ blend together, then /o/ /p/.",
      difficulty: 2,
      image_url: `${IMAGE_BASE}/1st-grade/RF.1.2b/RF.1.2b-Q3.png`,
    },
  },
  {
    action: "replace",
    standardId: "RF.1.2b",
    questionId: "RF.1.2b-Q4",
    newFields: {
      id: "RF.1.2b-Q4",
      type: "sound_machine",
      prompt: "Blend these sounds to make a word!",
      target_word: "drip",
      phonemes: ["/d/", "/r/", "/i/", "/p/"],
      distractors: ["/a/", "/t/"],
      correct: "/d/ /r/ /i/ /p/",
      hint: "Start with /d/ /r/ together, then add /i/ /p/.",
      difficulty: 2,
      image_url: `${IMAGE_BASE}/1st-grade/RF.1.2b/RF.1.2b-Q4.png`,
    },
  },
  {
    action: "replace",
    standardId: "RF.1.2b",
    questionId: "RF.1.2b-Q5",
    newFields: {
      id: "RF.1.2b-Q5",
      type: "sound_machine",
      prompt: "Blend these sounds to make a word!",
      target_word: "grab",
      phonemes: ["/g/", "/r/", "/a/", "/b/"],
      distractors: ["/u/", "/s/"],
      correct: "/g/ /r/ /a/ /b/",
      hint: "/g/ /r/ together, then /a/ /b/.",
      difficulty: 2,
      image_url: `${IMAGE_BASE}/1st-grade/RF.1.2b/RF.1.2b-Q5.png`,
    },
  },
];

/* ══════════════════════════════════════════════════════════
   2ND GRADE CONVERSIONS
   ══════════════════════════════════════════════════════════ */

const G2_CONVERSIONS = [
  /* ── tap_to_pair (consolidate) ─────────────────────── */
  {
    action: "consolidate",
    standardId: "RF.2.3d",
    sourceIds: ["RF.2.3d-Q1", "RF.2.3d-Q3", "RF.2.3d-Q5"],
    newQuestion: {
      id: "RF.2.3d-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["unkind", "reread", "careless"],
      right_items: ["Not kind", "Read again", "Not careful"],
      correct_pairs: {
        unkind: "Not kind",
        reread: "Read again",
        careless: "Not careful",
      },
      correct:
        "unkind→Not kind, reread→Read again, careless→Not careful",
      hint: "Look at the prefix or suffix for clues!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "L.2.4",
    sourceIds: ["L.2.4-Q1", "L.2.4-Q2", "L.2.4-Q3", "L.2.4-Q4", "L.2.4-Q5"],
    newQuestion: {
      id: "L.2.4-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["tiny", "bat", "exhausted", "ring", "bright"],
      right_items: [
        "Very small",
        "A stick for hitting a ball",
        "Very tired",
        "To make a sound",
        "Shining with a lot of light",
      ],
      correct_pairs: {
        tiny: "Very small",
        bat: "A stick for hitting a ball",
        exhausted: "Very tired",
        ring: "To make a sound",
        bright: "Shining with a lot of light",
      },
      correct:
        "tiny→Very small, bat→A stick for hitting a ball, exhausted→Very tired, ring→To make a sound, bright→Shining with a lot of light",
      hint: "Think about what each word means in context!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "L.2.4a",
    sourceIds: ["L.2.4a-Q2", "L.2.4a-Q3", "L.2.4a-Q5"],
    newQuestion: {
      id: "L.2.4a-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["famished", "cautious", "hilarious"],
      right_items: ["Very hungry", "Careful", "Very funny"],
      correct_pairs: {
        famished: "Very hungry",
        cautious: "Careful",
        hilarious: "Very funny",
      },
      correct:
        "famished→Very hungry, cautious→Careful, hilarious→Very funny",
      hint: "Use clues from the sentence to figure out the meaning!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "L.2.4b",
    sourceIds: ["L.2.4b-Q1", "L.2.4b-Q2", "L.2.4b-Q4", "L.2.4b-Q5"],
    newQuestion: {
      id: "L.2.4b-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["unhappy", "retell", "unlock", "disagree"],
      right_items: [
        "Not happy",
        "Tell again",
        "Open with a key",
        "To not agree",
      ],
      correct_pairs: {
        unhappy: "Not happy",
        retell: "Tell again",
        unlock: "Open with a key",
        disagree: "To not agree",
      },
      correct:
        "unhappy→Not happy, retell→Tell again, unlock→Open with a key, disagree→To not agree",
      hint: "'Un-' means not, 're-' means again, 'dis-' means not!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "L.2.4c",
    sourceIds: ["L.2.4c-Q2", "L.2.4c-Q4", "L.2.4c-Q5"],
    newQuestion: {
      id: "L.2.4c-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["painter", "joyful", "movement"],
      right_items: [
        "A person who paints",
        "Full of joy",
        "The act of moving",
      ],
      correct_pairs: {
        painter: "A person who paints",
        joyful: "Full of joy",
        movement: "The act of moving",
      },
      correct:
        "painter→A person who paints, joyful→Full of joy, movement→The act of moving",
      hint: "Look at the suffix: '-er' means a person who, '-ful' means full of, '-ment' means the act of!",
      difficulty: 1,
    },
  },

  /* ── missing_word (in-place) ───────────────────────── */
  {
    action: "replace",
    standardId: "RF.2.4c",
    questionId: "RF.2.4c-Q2",
    newFields: {
      id: "RF.2.4c-Q2",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: ["The", "bird", "flew", "to", "its", "___"],
      blank_index: 5,
      missing_choices: ["Best", "Test", "Desk", "Nest"],
      correct: "Nest",
      hint: "Where do birds live? Use the rest of the sentence to decide.",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "RF.2.4c",
    questionId: "RF.2.4c-Q4",
    newFields: {
      id: "RF.2.4c-Q4",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: ["The", "cat", "climbed", "up", "the", "tall", "___"],
      blank_index: 6,
      missing_choices: ["Tree", "Cloud", "Book", "Spoon"],
      correct: "Tree",
      hint: "What tall thing can a cat climb?",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "RF.2.4c",
    questionId: "RF.2.4c-Q5",
    newFields: {
      id: "RF.2.4c-Q5",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: [
        "The",
        "family",
        "lives",
        "in",
        "a",
        "big",
        "___",
        "on",
        "the",
        "hill.",
      ],
      blank_index: 6,
      missing_choices: ["Hope", "House", "Hose", "Horse"],
      correct: "House",
      hint: "A family lives in a ____. Which word makes sense?",
      difficulty: 2,
    },
  },
  {
    action: "replace",
    standardId: "L.2.6",
    questionId: "L.2.6-Q3",
    newFields: {
      id: "L.2.6-Q3",
      type: "missing_word",
      prompt: "Pick the best adjective to fill the blank.",
      sentence_words: ["The", "___", "storm", "knocked", "down", "trees."],
      blank_index: 1,
      missing_choices: ["Happily", "Powerful", "Gently", "Slowly"],
      correct: "Powerful",
      hint: "You need a word that describes the storm. Which word tells you what kind of storm?",
      difficulty: 1,
    },
  },

  /* ── sentence_build (ordered, in-place) ────────────── */
  {
    action: "replace",
    standardId: "L.2.5b",
    questionId: "L.2.5b-Q1",
    newFields: {
      id: "L.2.5b-Q1",
      type: "sentence_build",
      prompt: "Put in order from least strong to most strong",
      words: ["toss", "throw", "hurl"],
      correct: "toss throw hurl",
      hint: "Tossing is gentle, throwing is normal, hurling is very powerful!",
      ordered: true,
      difficulty: 2,
    },
  },
  {
    action: "replace",
    standardId: "L.2.5b",
    questionId: "L.2.5b-Q4",
    newFields: {
      id: "L.2.5b-Q4",
      type: "sentence_build",
      prompt: "Put in order from quietest to loudest",
      words: ["whisper", "talk", "yell"],
      correct: "whisper talk yell",
      hint: "Start with the softest voice and end with the loudest.",
      ordered: true,
      difficulty: 1,
    },
  },

  /* ── category_sort (in-place) ──────────────────────── */
  {
    action: "replace",
    standardId: "L.2.5",
    questionId: "L.2.5-Q3",
    newFields: {
      id: "L.2.5-Q3",
      type: "category_sort",
      prompt: "Sort the words — which ones are about weather?",
      categories: ["Weather", "Not Weather"],
      category_items: {
        Weather: ["Rain", "Snow", "Sunny"],
        "Not Weather": ["Jump", "Book", "Dog"],
      },
      items: ["Rain", "Jump", "Snow", "Book", "Sunny", "Dog"],
      correct: "correct",
      hint: "Which words would you hear in a weather report?",
      difficulty: 1,
    },
  },
];

/* ══════════════════════════════════════════════════════════
   3RD GRADE CONVERSIONS
   ══════════════════════════════════════════════════════════ */

const G3_CONVERSIONS = [
  /* ── tap_to_pair (consolidate) ─────────────────────── */
  {
    action: "consolidate",
    standardId: "RL.3.4",
    sourceIds: ["RL.3.4-Q1", "RL.3.4-Q2", "RL.3.4-Q5"],
    newQuestion: {
      id: "RL.3.4-Q6",
      type: "tap_to_pair",
      prompt: "Match each expression to its meaning!",
      left_items: [
        "on top of the world",
        "let the cat out of the bag",
        "bit at their faces",
      ],
      right_items: [
        "Extremely happy",
        "Reveal a secret",
        "Sharp and painful",
      ],
      correct_pairs: {
        "on top of the world": "Extremely happy",
        "let the cat out of the bag": "Reveal a secret",
        "bit at their faces": "Sharp and painful",
      },
      correct:
        "on top of the world→Extremely happy, let the cat out of the bag→Reveal a secret, bit at their faces→Sharp and painful",
      hint: "These are figurative expressions — they don't mean what they literally say!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.3.4",
    sourceIds: ["L.3.4-Q2", "L.3.4-Q3", "L.3.4-Q4", "L.3.4-Q5"],
    newQuestion: {
      id: "L.3.4-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning in context!",
      left_items: ["light (candle)", "elaborate", "current (river)", "parched"],
      right_items: [
        "To set fire to",
        "Complex and detailed",
        "The flow of water",
        "Extremely dry",
      ],
      correct_pairs: {
        "light (candle)": "To set fire to",
        elaborate: "Complex and detailed",
        "current (river)": "The flow of water",
        parched: "Extremely dry",
      },
      correct:
        "light (candle)→To set fire to, elaborate→Complex and detailed, current (river)→The flow of water, parched→Extremely dry",
      hint: "Think about how each word is used in the sentence!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.3.4a",
    sourceIds: ["L.3.4a-Q1", "L.3.4a-Q2", "L.3.4a-Q3", "L.3.4a-Q4"],
    newQuestion: {
      id: "L.3.4a-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["benevolent", "abandoned", "camouflaged", "fragile"],
      right_items: [
        "Kind and generous",
        "Left behind",
        "Disguised to blend in",
        "Easily broken",
      ],
      correct_pairs: {
        benevolent: "Kind and generous",
        abandoned: "Left behind",
        camouflaged: "Disguised to blend in",
        fragile: "Easily broken",
      },
      correct:
        "benevolent→Kind and generous, abandoned→Left behind, camouflaged→Disguised to blend in, fragile→Easily broken",
      hint: "Use context clues to match each word to its definition!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.3.4b",
    sourceIds: ["L.3.4b-Q1", "L.3.4b-Q2", "L.3.4b-Q4", "L.3.4b-Q5"],
    newQuestion: {
      id: "L.3.4b-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["uncomfortable", "misspell", "encourage", "disappearance"],
      right_items: [
        "Not comfortable",
        "To spell wrongly",
        "To give courage",
        "The act of disappearing",
      ],
      correct_pairs: {
        uncomfortable: "Not comfortable",
        misspell: "To spell wrongly",
        encourage: "To give courage",
        disappearance: "The act of disappearing",
      },
      correct:
        "uncomfortable→Not comfortable, misspell→To spell wrongly, encourage→To give courage, disappearance→The act of disappearing",
      hint: "Break each word into its prefix, root, and suffix for clues!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.3.4c",
    sourceIds: ["L.3.4c-Q1", "L.3.4c-Q2", "L.3.4c-Q4", "L.3.4c-Q5"],
    newQuestion: {
      id: "L.3.4c-Q6",
      type: "tap_to_pair",
      prompt: "Match each root or word to its meaning!",
      left_items: ["-action", "transport", "bicycle", "companion"],
      right_items: [
        "The process of doing",
        "To carry across",
        "Two wheels",
        "Being together",
      ],
      correct_pairs: {
        "-action": "The process of doing",
        transport: "To carry across",
        bicycle: "Two wheels",
        companion: "Being together",
      },
      correct:
        "-action→The process of doing, transport→To carry across, bicycle→Two wheels, companion→Being together",
      hint: "Latin and Greek roots give clues: '-tion' = process, 'trans-' = across, 'bi-' = two, 'com-' = together!",
      difficulty: 2,
    },
  },

  /* ── missing_word (in-place) ───────────────────────── */
  {
    action: "replace",
    standardId: "RL.3.5",
    questionId: "RL.3.5-Q2",
    newFields: {
      id: "RL.3.5-Q2",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: [
        "In",
        "a",
        "play,",
        "when",
        "the",
        "setting",
        "changes,",
        "a",
        "new",
        "___",
        "begins.",
      ],
      blank_index: 9,
      missing_choices: ["Scene", "Chapter", "Paragraph", "Stanza"],
      correct: "Scene",
      hint: "Plays are divided into acts and these smaller parts.",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "RF.3.4c",
    questionId: "RF.3.4c-Q3",
    newFields: {
      id: "RF.3.4c-Q3",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: [
        "The",
        "scientist",
        "used",
        "a",
        "microscope",
        "to",
        "examine",
        "the",
        "tiny",
        "___",
      ],
      blank_index: 9,
      missing_choices: ["Mountain", "Building", "Organisms", "Elephant"],
      correct: "Organisms",
      hint: "A microscope looks at TINY things. Which answer is something tiny a scientist would study?",
      difficulty: 2,
    },
  },
  {
    action: "replace",
    standardId: "L.3.6",
    questionId: "L.3.6-Q3",
    newFields: {
      id: "L.3.6-Q3",
      type: "missing_word",
      prompt: "Pick the best word to replace 'said' in this sentence.",
      sentence_words: [
        "\"I",
        "can't",
        "believe",
        "it!\"",
        "___",
        "Maria.",
      ],
      blank_index: 4,
      missing_choices: ["Whispered", "Said", "Exclaimed", "Mumbled"],
      correct: "Exclaimed",
      hint: "She can't believe it! That shows surprise and excitement.",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "L.3.6",
    questionId: "L.3.6-Q5",
    newFields: {
      id: "L.3.6-Q5",
      type: "missing_word",
      prompt: "Pick the most specific word to complete the sentence.",
      sentence_words: [
        "The",
        "___",
        "cheetah",
        "sprinted",
        "across",
        "the",
        "savanna.",
      ],
      blank_index: 1,
      missing_choices: ["Nice", "Fast", "Quick", "Swift"],
      correct: "Swift",
      hint: "'Swift' is the most vivid and precise for describing a cheetah's speed.",
      difficulty: 2,
    },
  },

  /* ── sentence_build (ordered, in-place) ────────────── */
  {
    action: "replace",
    standardId: "L.3.5c",
    questionId: "L.3.5c-Q1",
    newFields: {
      id: "L.3.5c-Q1",
      type: "sentence_build",
      prompt: "Put in order from least certain to most certain",
      words: ["wondered", "suspected", "knew"],
      correct: "wondered suspected knew",
      hint: "Wondering is just curious. Suspecting is thinking it might be true. Knowing is being certain!",
      ordered: true,
      difficulty: 2,
    },
  },
  {
    action: "replace",
    standardId: "L.3.5c",
    questionId: "L.3.5c-Q3",
    newFields: {
      id: "L.3.5c-Q3",
      type: "sentence_build",
      prompt: "Put in order from least scared to most scared",
      words: ["uneasy", "nervous", "terrified"],
      correct: "uneasy nervous terrified",
      hint: "Uneasy is mild, nervous is moderate, terrified is extreme fear!",
      ordered: true,
      difficulty: 2,
    },
  },

  /* ── category_sort ─────────────────────────────────── */
  {
    action: "replace",
    standardId: "RL.3.5",
    questionId: "RL.3.5-Q5",
    newFields: {
      id: "RL.3.5-Q5",
      type: "category_sort",
      prompt: "Match each structural part to its text type!",
      categories: ["Play/Drama", "Poem", "Novel"],
      category_items: {
        "Play/Drama": ["Scene", "Stage directions"],
        Poem: ["Stanza", "Verse"],
        Novel: ["Chapter", "Paragraph"],
      },
      items: [
        "Scene",
        "Stanza",
        "Chapter",
        "Stage directions",
        "Verse",
        "Paragraph",
      ],
      correct: "correct",
      hint: "Plays use scenes, poems use stanzas, and novels use chapters!",
      difficulty: 1,
    },
  },
  {
    action: "consolidate",
    standardId: "RI.3.3",
    sourceIds: ["RI.3.3-Q3", "RI.3.3-Q4"],
    newQuestion: {
      id: "RI.3.3-Q6",
      type: "category_sort",
      prompt: "Sort these into Cause or Effect!",
      categories: ["Cause", "Effect"],
      category_items: {
        Cause: ["Temperatures rose globally", "Ice caps melted"],
        Effect: ["Sea levels rose", "Coastal flooding increased"],
      },
      items: [
        "Temperatures rose globally",
        "Sea levels rose",
        "Ice caps melted",
        "Coastal flooding increased",
      ],
      correct: "correct",
      hint: "A cause is what MAKES something happen. An effect is what HAPPENS as a result.",
      difficulty: 2,
    },
  },
];

/* ══════════════════════════════════════════════════════════
   4TH GRADE CONVERSIONS
   ══════════════════════════════════════════════════════════ */

const G4_CONVERSIONS = [
  /* ── tap_to_pair (consolidate) ─────────────────────── */
  {
    action: "consolidate",
    standardId: "RI.4.4",
    sourceIds: ["RI.4.4-Q1", "RI.4.4-Q3", "RI.4.4-Q4", "RI.4.4-Q5"],
    newQuestion: {
      id: "RI.4.4-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: [
        "excavated",
        "interdependent",
        "metamorphosis",
        "famine",
      ],
      right_items: [
        "Dug up carefully",
        "Depending on each other",
        "A dramatic change in form",
        "Extreme widespread hunger",
      ],
      correct_pairs: {
        excavated: "Dug up carefully",
        interdependent: "Depending on each other",
        metamorphosis: "A dramatic change in form",
        famine: "Extreme widespread hunger",
      },
      correct:
        "excavated→Dug up carefully, interdependent→Depending on each other, metamorphosis→A dramatic change in form, famine→Extreme widespread hunger",
      hint: "Use context clues and word parts to match each word!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.4.4a",
    sourceIds: ["L.4.4a-Q1", "L.4.4a-Q2", "L.4.4a-Q3", "L.4.4a-Q5"],
    newQuestion: {
      id: "L.4.4a-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its meaning!",
      left_items: ["unprecedented", "resilient", "meticulous", "verbose"],
      right_items: [
        "Never happened before",
        "Able to recover",
        "Extremely careful",
        "Using too many words",
      ],
      correct_pairs: {
        unprecedented: "Never happened before",
        resilient: "Able to recover",
        meticulous: "Extremely careful",
        verbose: "Using too many words",
      },
      correct:
        "unprecedented→Never happened before, resilient→Able to recover, meticulous→Extremely careful, verbose→Using too many words",
      hint: "Use context clues from the sentence around each word!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.4.4b",
    sourceIds: ["L.4.4b-Q1", "L.4.4b-Q2", "L.4.4b-Q3", "L.4.4b-Q5"],
    newQuestion: {
      id: "L.4.4b-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its root meaning!",
      left_items: [
        "predict (dict=say)",
        "autograph (graph=write)",
        "interrupt (rupt=break)",
        "benefactor (bene=good)",
      ],
      right_items: [
        "To say before",
        "Own handwriting of name",
        "To break into",
        "A person who does good",
      ],
      correct_pairs: {
        "predict (dict=say)": "To say before",
        "autograph (graph=write)": "Own handwriting of name",
        "interrupt (rupt=break)": "To break into",
        "benefactor (bene=good)": "A person who does good",
      },
      correct:
        "predict→To say before, autograph→Own handwriting of name, interrupt→To break into, benefactor→A person who does good",
      hint: "Use the Latin/Greek root in parentheses to figure out the meaning!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.4.5a",
    sourceIds: ["L.4.5a-Q1", "L.4.5a-Q2", "L.4.5a-Q3", "L.4.5a-Q4"],
    newQuestion: {
      id: "L.4.5a-Q6",
      type: "tap_to_pair",
      prompt: "Match each simile or metaphor to its meaning!",
      left_items: [
        "smile bright as sun",
        "time is money",
        "dancer like water",
        "heart of stone",
      ],
      right_items: [
        "Both are bright and warm",
        "Time is valuable",
        "Smooth and graceful",
        "Cold and unfeeling",
      ],
      correct_pairs: {
        "smile bright as sun": "Both are bright and warm",
        "time is money": "Time is valuable",
        "dancer like water": "Smooth and graceful",
        "heart of stone": "Cold and unfeeling",
      },
      correct:
        "smile bright as sun→Both are bright and warm, time is money→Time is valuable, dancer like water→Smooth and graceful, heart of stone→Cold and unfeeling",
      hint: "Think about what the two things being compared have in common!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.4.5b",
    sourceIds: ["L.4.5b-Q1", "L.4.5b-Q2", "L.4.5b-Q3", "L.4.5b-Q5"],
    newQuestion: {
      id: "L.4.5b-Q6",
      type: "tap_to_pair",
      prompt: "Match each idiom or proverb to its meaning!",
      left_items: [
        "book by cover",
        "actions > words",
        "arm and leg",
        "when it rains",
      ],
      right_items: [
        "Don't judge by appearance",
        "What you do matters more",
        "Very expensive",
        "Problems come all at once",
      ],
      correct_pairs: {
        "book by cover": "Don't judge by appearance",
        "actions > words": "What you do matters more",
        "arm and leg": "Very expensive",
        "when it rains": "Problems come all at once",
      },
      correct:
        "book by cover→Don't judge by appearance, actions > words→What you do matters more, arm and leg→Very expensive, when it rains→Problems come all at once",
      hint: "These sayings have hidden meanings — think about what they really teach!",
      difficulty: 2,
    },
  },
  {
    action: "consolidate",
    standardId: "L.4.5c",
    sourceIds: ["L.4.5c-Q1", "L.4.5c-Q2", "L.4.5c-Q5"],
    newQuestion: {
      id: "L.4.5c-Q6",
      type: "tap_to_pair",
      prompt: "Match each word to its synonym or antonym!",
      left_items: ["courageous", "generous", "expand"],
      right_items: [
        "Brave (synonym)",
        "Selfish (antonym)",
        "Contract (antonym)",
      ],
      correct_pairs: {
        courageous: "Brave (synonym)",
        generous: "Selfish (antonym)",
        expand: "Contract (antonym)",
      },
      correct:
        "courageous→Brave (synonym), generous→Selfish (antonym), expand→Contract (antonym)",
      hint: "Synonyms mean the same, antonyms mean the opposite!",
      difficulty: 2,
    },
  },

  /* ── missing_word (in-place) ───────────────────────── */
  {
    action: "replace",
    standardId: "RL.4.5",
    questionId: "RL.4.5-Q2",
    newFields: {
      id: "RL.4.5-Q2",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: [
        "Stanzas",
        "are",
        "similar",
        "to",
        "___",
        "in",
        "prose.",
      ],
      blank_index: 4,
      missing_choices: ["Sentences", "Titles", "Paragraphs", "Chapters"],
      correct: "Paragraphs",
      hint: "Stanzas group lines in a poem, just like ___ group sentences in prose.",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "RL.4.5",
    questionId: "RL.4.5-Q5",
    newFields: {
      id: "RL.4.5-Q5",
      type: "missing_word",
      prompt: "Pick the right word to fill the blank.",
      sentence_words: [
        "A",
        "verse",
        "in",
        "a",
        "poem",
        "is",
        "similar",
        "to",
        "a",
        "___",
        "in",
        "a",
        "novel.",
      ],
      blank_index: 9,
      missing_choices: ["Chapter", "Setting", "Line or sentence", "Character"],
      correct: "Line or sentence",
      hint: "A verse is a single line of poetry — similar to a sentence in prose.",
      difficulty: 2,
    },
  },
  {
    action: "replace",
    standardId: "L.4.5c",
    questionId: "L.4.5c-Q4",
    newFields: {
      id: "L.4.5c-Q4",
      type: "missing_word",
      prompt: "Pick the best word to replace 'said' — the character is angry!",
      sentence_words: [
        "\"That's",
        "not",
        "fair!\"",
        "___",
        "Marcus.",
      ],
      blank_index: 3,
      missing_choices: ["Whispered", "Sighed", "Mumbled", "Shouted"],
      correct: "Shouted",
      hint: "An angry person saying 'That's not fair!' would most likely raise their voice!",
      difficulty: 1,
    },
  },
  {
    action: "replace",
    standardId: "L.4.6",
    questionId: "L.4.6-Q3",
    newFields: {
      id: "L.4.6-Q3",
      type: "missing_word",
      prompt: "Replace 'nice' with a more precise word.",
      sentence_words: [
        "The",
        "___",
        "sunset",
        "painted",
        "the",
        "sky",
        "in",
        "shades",
        "of",
        "orange",
        "and",
        "pink.",
      ],
      blank_index: 1,
      missing_choices: ["Good", "Nice", "Spectacular", "Okay"],
      correct: "Spectacular",
      hint: "A sunset that paints the sky deserves a more vivid word than 'nice'!",
      difficulty: 1,
    },
  },

  /* ── sentence_build (ordered, in-place) ────────────── */
  {
    action: "replace",
    standardId: "RI.4.3",
    questionId: "RI.4.3-Q2",
    newFields: {
      id: "RI.4.3-Q2",
      type: "sentence_build",
      prompt: "Put the vaccine steps in the correct order",
      words: [
        "Vaccine introduces weak virus",
        "Immune system learns to fight it",
        "Body is prepared for the real virus",
      ],
      correct:
        "Vaccine introduces weak virus Immune system learns to fight it Body is prepared for the real virus",
      hint: "First comes the vaccine, then the body learns, then it's ready.",
      ordered: true,
      difficulty: 2,
    },
  },

  /* ── category_sort (consolidate) ───────────────────── */
  {
    action: "consolidate",
    standardId: "RI.4.5",
    sourceIds: ["RI.4.5-Q1", "RI.4.5-Q2", "RI.4.5-Q3", "RI.4.5-Q4"],
    newQuestion: {
      id: "RI.4.5-Q6",
      type: "category_sort",
      prompt: "Sort each passage description into its text structure!",
      categories: [
        "Problem & Solution",
        "Chronological",
        "Compare & Contrast",
        "Cause & Effect",
      ],
      category_items: {
        "Problem & Solution": [
          "Too much trash in the ocean → recycling programs",
        ],
        Chronological: ["First, next, then, finally"],
        "Compare & Contrast": [
          "Hurricanes vs tornadoes: similarly, however",
        ],
        "Cause & Effect": [
          "Temperature dropped → pipes burst → basement flooded",
        ],
      },
      items: [
        "Too much trash in the ocean → recycling programs",
        "First, next, then, finally",
        "Hurricanes vs tornadoes: similarly, however",
        "Temperature dropped → pipes burst → basement flooded",
      ],
      correct: "correct",
      hint: "Look for signal words: problem/solution, first/next/then, similarly/however, because/as a result!",
      difficulty: 2,
    },
  },
];

/* ══════════════════════════════════════════════════════════
   RUN ALL CONVERSIONS
   ══════════════════════════════════════════════════════════ */

console.log("=== Converting MCQs to Interactive Types (Grades 1-4) ===\n");

processGrade("1st-grade-standards-questions.json", G1_CONVERSIONS);
processGrade("2nd-grade-standards-questions.json", G2_CONVERSIONS);
processGrade("3rd-grade-standards-questions.json", G3_CONVERSIONS);
processGrade("4th-grade-standards-questions.json", G4_CONVERSIONS);

/* ── Summary ─────────────────────────────────────────── */

const totalConversions =
  G1_CONVERSIONS.length +
  G2_CONVERSIONS.length +
  G3_CONVERSIONS.length +
  G4_CONVERSIONS.length;

console.log(`\n=== Done! ${totalConversions} conversion operations applied. ===`);
