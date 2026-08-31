import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for tell-it-back (RL.K.2) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=tell-it-back --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "tell-it-back-warmup",
  "lessonId": "tell-it-back",
  "lessonTitle": "Tell It Back",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Pigs And A Wolf Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with pigs and a wolf!",
  "intro": {
    "audio": "/audio/warmups-v2/tell-it-back-warmup/intro.mp3",
    "script": "Today's story has pigs and a wolf in it! Look at each word. If it belongs with pigs and a wolf, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Pigs And A Wolf"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "house",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tell-it-back-warmup/w-house.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "brick",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tell-it-back-warmup/w-brick.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "straw",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tell-it-back-warmup/w-straw.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "oink",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tell-it-back-warmup/w-oink.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "stick",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tell-it-back-warmup/w-stick.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "growl",
          "isMatch": true,
          "audio": "/audio/warmups-v2/tell-it-back-warmup/w-growl.mp3"
        },
        {
          "word": "zipper",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/tell-it-back-warmup/celebrate.mp3",
    "script": "You caught it! House, straw, stick, and brick. All of them belong with pigs and a wolf, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/tell-it-back-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like house, straw, and stick belong with pigs and a wolf. Watch for them in today's lesson. You will spot them, I know it."
  }
};
