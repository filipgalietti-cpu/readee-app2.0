import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-changers (L.1.4c) by scripts/warmup-generate.ts.
// Recipe: builder. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-changers --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-changers-warmup",
  "lessonId": "word-changers",
  "lessonTitle": "Word Changers",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Word Builder",
  "recipe": "word-catch",
  "mode": "builder",
  "skin": "pond",
  "playPrompt": "Snap parts together to build words!",
  "startPrompt": "Snap parts together to build words!",
  "intro": {
    "audio": "/audio/warmups-v2/word-changers-warmup/intro.mp3",
    "script": "Word parts are floating by! Grab two parts and snap them together on the bench. If they make a real word, it goes on your shelf. Build as many words as you can! Ready? Go!",
    "cardText": "jump + ed"
  },
  "waves": [],
  "builds": [
    {
      "word": "jumped",
      "parts": [
        "jump",
        "ed"
      ],
      "wordAudio": "/audio/warmups-v2/word-changers-warmup/w-jumped.mp3"
    },
    {
      "word": "helping",
      "parts": [
        "help",
        "ing"
      ],
      "wordAudio": "/audio/warmups-v2/word-changers-warmup/w-helping.mp3"
    },
    {
      "word": "looked",
      "parts": [
        "loo",
        "ked"
      ],
      "wordAudio": "/audio/warmups-v2/word-changers-warmup/w-looked.mp3"
    },
    {
      "word": "jumping",
      "parts": [
        "jump",
        "ing"
      ],
      "wordAudio": "/audio/warmups-v2/word-changers-warmup/w-jumping.mp3"
    },
    {
      "word": "looking",
      "parts": [
        "loo",
        "king"
      ],
      "wordAudio": "/audio/warmups-v2/word-changers-warmup/w-looking.mp3"
    },
    {
      "word": "playing",
      "parts": [
        "play",
        "ing"
      ],
      "wordAudio": "/audio/warmups-v2/word-changers-warmup/w-playing.mp3"
    }
  ],
  "decoyParts": [
    "sock",
    "desk",
    "frog",
    "tree"
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-changers-warmup/celebrate.mp3",
    "script": "Wow, you snapped word parts together and built bigger words! Little parts can change what a word means. Let's take your word building power into today's lesson!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-changers-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Two word parts can make one bigger word, like jump and ed make jumped. Watch for words like that in today's lesson. You will build them, I know it."
  }
};
