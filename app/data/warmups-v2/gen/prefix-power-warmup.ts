import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for prefix-power (L.1.4b) by scripts/warmup-generate.ts.
// Recipe: builder. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=prefix-power --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "prefix-power-warmup",
  "lessonId": "prefix-power",
  "lessonTitle": "Prefix Power",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Word Builder",
  "recipe": "word-catch",
  "mode": "builder",
  "skin": "workshop",
  "playPrompt": "Snap parts together to build words!",
  "startPrompt": "Snap parts together to build words!",
  "intro": {
    "audio": "/audio/warmups-v2/prefix-power-warmup/intro.mp3",
    "script": "Word parts are floating by! Grab two parts and snap them together on the bench. If they make a real word, it goes on your shelf. Build as many words as you can! Ready? Go!",
    "cardText": "care + ful"
  },
  "waves": [],
  "builds": [
    {
      "word": "careful",
      "parts": [
        "care",
        "ful"
      ],
      "wordAudio": "/audio/warmups-v2/prefix-power-warmup/w-careful.mp3"
    },
    {
      "word": "unhappy",
      "parts": [
        "un",
        "happy"
      ],
      "wordAudio": "/audio/warmups-v2/prefix-power-warmup/w-unhappy.mp3"
    },
    {
      "word": "untie",
      "parts": [
        "un",
        "tie"
      ],
      "wordAudio": "/audio/warmups-v2/prefix-power-warmup/w-untie.mp3"
    },
    {
      "word": "replay",
      "parts": [
        "re",
        "play"
      ],
      "wordAudio": "/audio/warmups-v2/prefix-power-warmup/w-replay.mp3"
    },
    {
      "word": "joyful",
      "parts": [
        "joy",
        "ful"
      ],
      "wordAudio": "/audio/warmups-v2/prefix-power-warmup/w-joyful.mp3"
    },
    {
      "word": "helpful",
      "parts": [
        "help",
        "ful"
      ],
      "wordAudio": "/audio/warmups-v2/prefix-power-warmup/w-helpful.mp3"
    }
  ],
  "decoyParts": [
    "sock",
    "desk",
    "frog",
    "milk"
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/prefix-power-warmup/celebrate.mp3",
    "script": "Wow, you snapped word parts together and built bigger words! Little parts can change what a word means. Let's take your word building power into today's lesson!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/prefix-power-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Two word parts can make one bigger word, like care and ful make careful. Watch for words like that in today's lesson. You will build them, I know it."
  }
};
