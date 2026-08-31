import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for picture-or-words (RI.1.6) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=picture-or-words --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "picture-or-words-warmup",
  "lessonId": "picture-or-words",
  "lessonTitle": "Picture or Words",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Octopus Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with the octopus!",
  "intro": {
    "audio": "/audio/warmups-v2/picture-or-words-warmup/intro.mp3",
    "script": "Today we are reading all about the octopus! Look at each word. If it belongs with the octopus, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Octopus"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "ocean",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-or-words-warmup/w-ocean.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "shell",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-or-words-warmup/w-shell.mp3"
        },
        {
          "word": "hat",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "ink",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-or-words-warmup/w-ink.mp3"
        },
        {
          "word": "door",
          "isMatch": false
        },
        {
          "word": "coral",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-or-words-warmup/w-coral.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "arms",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-or-words-warmup/w-arms.mp3"
        },
        {
          "word": "lamp",
          "isMatch": false
        },
        {
          "word": "hide",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-or-words-warmup/w-hide.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/picture-or-words-warmup/celebrate.mp3",
    "script": "You caught them! Ocean, ink, arms, and shell. All of them belong with the octopus, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/picture-or-words-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like ocean, ink, and arms belong with the octopus. Watch for them in today's lesson. You will spot them, I know it."
  }
};
