import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for read-with-your-brain (RF.2.4a) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=read-with-your-brain --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "read-with-your-brain-warmup",
  "lessonId": "read-with-your-brain",
  "lessonTitle": "Read With Your Brain",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Bear In The Woods Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a bear in the woods!",
  "intro": {
    "audio": "/audio/warmups-v2/read-with-your-brain-warmup/intro.mp3",
    "script": "Today we are reading all about a bear in the woods! Look at each word. If it belongs with a bear in the woods, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Bear In The Woods"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "honey",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-with-your-brain-warmup/w-honey.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "river",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-with-your-brain-warmup/w-river.mp3"
        },
        {
          "word": "phone",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "basket",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-with-your-brain-warmup/w-basket.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "log",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-with-your-brain-warmup/w-log.mp3"
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
          "word": "squirrel",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-with-your-brain-warmup/w-squirrel.mp3"
        },
        {
          "word": "car",
          "isMatch": false
        },
        {
          "word": "bees",
          "isMatch": true,
          "audio": "/audio/warmups-v2/read-with-your-brain-warmup/w-bees.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/read-with-your-brain-warmup/celebrate.mp3",
    "script": "You caught them! Honey, basket, squirrel, and river. All of them belong with a bear in the woods, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/read-with-your-brain-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like honey, basket, and squirrel belong with a bear in the woods. Watch for them in today's lesson. You will spot them, I know it."
  }
};
