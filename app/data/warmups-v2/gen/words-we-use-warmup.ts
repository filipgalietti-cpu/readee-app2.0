import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for words-we-use (L.1.6) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=words-we-use --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "words-we-use-warmup",
  "lessonId": "words-we-use",
  "lessonTitle": "Words We Use",
  "playSeconds": 45,
  "carrots": 2,
  "title": "My Day Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in your day!",
  "intro": {
    "audio": "/audio/warmups-v2/words-we-use-warmup/intro.mp3",
    "script": "Today we are reading all about a day! Look at each word. If it belongs in your day, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "My Day"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "lunch",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-we-use-warmup/w-lunch.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "coat",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-we-use-warmup/w-coat.mp3"
        },
        {
          "word": "pirate",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "sun",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-we-use-warmup/w-sun.mp3"
        },
        {
          "word": "dinosaur",
          "isMatch": false
        },
        {
          "word": "sleepy",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-we-use-warmup/w-sleepy.mp3"
        },
        {
          "word": "volcano",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "play",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-we-use-warmup/w-play.mp3"
        },
        {
          "word": "castle",
          "isMatch": false
        },
        {
          "word": "hat",
          "isMatch": true,
          "audio": "/audio/warmups-v2/words-we-use-warmup/w-hat.mp3"
        },
        {
          "word": "planet",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/words-we-use-warmup/celebrate.mp3",
    "script": "You caught them! Lunch, sun, play, and coat. All of them belong in your day, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/words-we-use-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like lunch, sun, and play belong in your day. Watch for them in today's lesson. You will spot them, I know it."
  }
};
