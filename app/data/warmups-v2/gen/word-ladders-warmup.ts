import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for word-ladders (L.2.5b) by scripts/warmup-generate.ts.
// Recipe: family-blast/synonym. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=word-ladders --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "word-ladders-warmup",
  "lessonId": "word-ladders",
  "lessonTitle": "Word Ladders",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Word Family Blast",
  "recipe": "word-catch",
  "mode": "rule",
  "skin": "carrot",
  "playPrompt": "Catch the words that mean pull!",
  "intro": {
    "audio": "/audio/warmups-v2/word-ladders-warmup/intro.mp3",
    "script": "Family words mean almost the same thing, like pull and tug. Today's word is pull. Catch every word that means almost the same as pull. If a word does not fit the family, let it go. Ready? Go!",
    "cardText": "pull"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "tug",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-ladders-warmup/w-tug.mp3"
        },
        {
          "word": "sob",
          "isMatch": false
        },
        {
          "word": "yanked",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-ladders-warmup/w-yanked.mp3"
        },
        {
          "word": "held",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "yank",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-ladders-warmup/w-yank.mp3"
        },
        {
          "word": "whimper",
          "isMatch": false
        },
        {
          "word": "tugged",
          "isMatch": true,
          "audio": "/audio/warmups-v2/word-ladders-warmup/w-tugged.mp3"
        },
        {
          "word": "brilliant",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "haul",
          "isMatch": true
        },
        {
          "word": "wail",
          "isMatch": false
        },
        {
          "word": "clever",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/word-ladders-warmup/celebrate.mp3",
    "script": "Blast off! Tug, yank, haul, and yanked. Every one means almost the same as pull. You caught a whole word family. Let's meet more word families in today's lesson."
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/word-ladders-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Word families are sneaky. Pull, tug, and yank all mean almost the same thing. Watch for word families in today's lesson. You will catch them."
  }
};
