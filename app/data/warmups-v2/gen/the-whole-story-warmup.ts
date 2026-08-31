import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for the-whole-story (RL.2.10) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=the-whole-story --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "the-whole-story-warmup",
  "lessonId": "the-whole-story",
  "lessonTitle": "The Whole Story",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Farm Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs on a farm!",
  "intro": {
    "audio": "/audio/warmups-v2/the-whole-story-warmup/intro.mp3",
    "script": "Today's story has a farm in it! Look at each word. If it belongs on a farm, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Farm"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "sheep",
          "isMatch": true,
          "audio": "/audio/warmups-v2/the-whole-story-warmup/w-sheep.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "creek",
          "isMatch": true,
          "audio": "/audio/warmups-v2/the-whole-story-warmup/w-creek.mp3"
        },
        {
          "word": "castle",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "barn",
          "isMatch": true,
          "audio": "/audio/warmups-v2/the-whole-story-warmup/w-barn.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "meadow",
          "isMatch": true,
          "audio": "/audio/warmups-v2/the-whole-story-warmup/w-meadow.mp3"
        },
        {
          "word": "robot",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "gate",
          "isMatch": true,
          "audio": "/audio/warmups-v2/the-whole-story-warmup/w-gate.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        },
        {
          "word": "farmer",
          "isMatch": true,
          "audio": "/audio/warmups-v2/the-whole-story-warmup/w-farmer.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/the-whole-story-warmup/celebrate.mp3",
    "script": "You caught it! Sheep, barn, gate, and creek. All of them belong on a farm, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/the-whole-story-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like sheep, barn, and gate belong on a farm. Watch for them in today's lesson. You will spot them, I know it."
  }
};
