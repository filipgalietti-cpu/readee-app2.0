import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-math (L.2.4b) by scripts/warmup-generate.ts.
// Recipe: builder. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-math --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-math-warmup",
  "lessonId": "word-math",
  "lessonTitle": "Word Math",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Word Builder",
  "recipe": "word-catch",
  "mode": "builder",
  "skin": "pond",
  "playPrompt": "Snap parts together to build words!",
  "startPrompt": "Snap parts together to build words!",
  "intro": {
    "audio": "/audio/warmups-v2/word-math-warmup/intro.mp3",
    "script": "Word parts are floating by! Grab two parts and snap them together on the bench. If they make a real word, it goes on your shelf. Build as many words as you can! Ready? Go!",
    "cardText": "un + tidy"
  },
  "waves": [],
  "builds": [
    {
      "word": "untidy",
      "parts": [
        "un",
        "tidy"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-untidy.mp3"
    },
    {
      "word": "unroll",
      "parts": [
        "un",
        "roll"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-unroll.mp3"
    },
    {
      "word": "unwell",
      "parts": [
        "un",
        "well"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-unwell.mp3"
    },
    {
      "word": "rewind",
      "parts": [
        "re",
        "wind"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-rewind.mp3"
    },
    {
      "word": "replant",
      "parts": [
        "re",
        "plant"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-replant.mp3"
    },
    {
      "word": "reheat",
      "parts": [
        "re",
        "heat"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-reheat.mp3"
    },
    {
      "word": "untrue",
      "parts": [
        "un",
        "true"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-untrue.mp3"
    },
    {
      "word": "retell",
      "parts": [
        "re",
        "tell"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-retell.mp3"
    },
    {
      "word": "rewrite",
      "parts": [
        "re",
        "write"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-rewrite.mp3"
    },
    {
      "word": "unwrap",
      "parts": [
        "un",
        "wrap"
      ],
      "wordAudio": "/audio/warmups-v2/word-math-warmup/w-unwrap.mp3"
    }
  ],
  "decoyParts": [
    "sock",
    "desk",
    "frog",
    "milk"
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-math-warmup/celebrate.mp3",
    "script": "Wow, you snapped word parts together and built bigger words! Little parts can change what a word means. Let's take your word building power into today's lesson!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-math-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Two word parts can make one bigger word, like un and tidy make untidy. Watch for words like that in today's lesson. You will build them, I know it."
  }
};
