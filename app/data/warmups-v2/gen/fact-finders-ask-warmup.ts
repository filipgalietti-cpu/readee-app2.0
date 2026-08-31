import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fact-finders-ask (RI.2.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fact-finders-ask --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fact-finders-ask-warmup",
  "lessonId": "fact-finders-ask",
  "lessonTitle": "Fact Finders Ask",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Bird Flight Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs in bird flight, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/fact-finders-ask-warmup/intro.mp3",
    "script": "Today we are reading all about today's book is all about bird flight! Look at each word. If it belongs if it belongs in bird flight, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Bird Flight"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "flies",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finders-ask-warmup/w-flies.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "clouds",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finders-ask-warmup/w-clouds.mp3"
        },
        {
          "word": "cookie",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "wings",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finders-ask-warmup/w-wings.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        },
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finders-ask-warmup/w-wind.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "sky",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finders-ask-warmup/w-sky.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "ocean",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finders-ask-warmup/w-ocean.mp3"
        },
        {
          "word": "button",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fact-finders-ask-warmup/celebrate.mp3",
    "script": "You caught them! Flies, wings, sky, and clouds. All of them belong if it belongs in bird flight, catch it, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fact-finders-ask-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like flies, wings, and sky belong if it belongs in bird flight, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
