import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for pictures-tell-more (RL.2.7) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=pictures-tell-more --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "pictures-tell-more-warmup",
  "lessonId": "pictures-tell-more",
  "lessonTitle": "Pictures Tell More",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Berries Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with berries!",
  "intro": {
    "audio": "/audio/warmups-v2/pictures-tell-more-warmup/intro.mp3",
    "script": "Today's story has some berries in it! Look at each word. If it belongs with berries, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Berries"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "scoop",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-tell-more-warmup/w-scoop.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "bush",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-tell-more-warmup/w-bush.mp3"
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
          "word": "sweet",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-tell-more-warmup/w-sweet.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "juice",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-tell-more-warmup/w-juice.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "fruit",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-tell-more-warmup/w-fruit.mp3"
        },
        {
          "word": "clock",
          "isMatch": false
        },
        {
          "word": "pick",
          "isMatch": true,
          "audio": "/audio/warmups-v2/pictures-tell-more-warmup/w-pick.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/pictures-tell-more-warmup/celebrate.mp3",
    "script": "You caught it! Scoop, sweet, fruit, and bush. All of them belong with berries, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/pictures-tell-more-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like scoop, sweet, and fruit belong with berries. Watch for them in today's lesson. You will spot them, I know it."
  }
};
