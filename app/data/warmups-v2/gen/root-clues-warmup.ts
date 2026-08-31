import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for root-clues (L.2.4c) by scripts/warmup-generate.ts.
// Recipe: builder. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=root-clues --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "root-clues-warmup",
  "lessonId": "root-clues",
  "lessonTitle": "Root Clues",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Word Builder",
  "recipe": "word-catch",
  "mode": "builder",
  "skin": "workshop",
  "playPrompt": "Snap parts together to build words!",
  "startPrompt": "Snap parts together to build words!",
  "intro": {
    "audio": "/audio/warmups-v2/root-clues-warmup/intro.mp3",
    "script": "Word parts are floating by! Grab two parts and snap them together on the bench. If they make a real word, it goes on your shelf. Build as many words as you can! Ready? Go!",
    "cardText": "far + mer"
  },
  "waves": [],
  "builds": [
    {
      "word": "farmer",
      "parts": [
        "far",
        "mer"
      ],
      "wordAudio": "/audio/warmups-v2/root-clues-warmup/w-farmer.mp3"
    },
    {
      "word": "farming",
      "parts": [
        "far",
        "ming"
      ],
      "wordAudio": "/audio/warmups-v2/root-clues-warmup/w-farming.mp3"
    },
    {
      "word": "camping",
      "parts": [
        "cam",
        "ping"
      ],
      "wordAudio": "/audio/warmups-v2/root-clues-warmup/w-camping.mp3"
    },
    {
      "word": "camper",
      "parts": [
        "cam",
        "per"
      ],
      "wordAudio": "/audio/warmups-v2/root-clues-warmup/w-camper.mp3"
    },
    {
      "word": "garden",
      "parts": [
        "gar",
        "den"
      ],
      "wordAudio": "/audio/warmups-v2/root-clues-warmup/w-garden.mp3"
    }
  ],
  "decoyParts": [
    "sock",
    "desk",
    "frog",
    "milk"
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/root-clues-warmup/celebrate.mp3",
    "script": "Wow, you snapped word parts together and built bigger words! Little parts can change what a word means. Let's take your word building power into today's lesson!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/root-clues-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Two word parts can make one bigger word, like far and mer make farmer. Watch for words like that in today's lesson. You will build them, I know it."
  }
};
