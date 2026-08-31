import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fact-party-g1 (RI.1.10) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fact-party-g1 --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fact-party-g1-warmup",
  "lessonId": "fact-party-g1",
  "lessonTitle": "Fact Finder Finale",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Lighthouses Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with lighthouses!",
  "intro": {
    "audio": "/audio/warmups-v2/fact-party-g1-warmup/intro.mp3",
    "script": "Today we are reading all about lighthouses! Look at each word. If it belongs with lighthouses, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Lighthouses"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "light",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-party-g1-warmup/w-light.mp3"
        },
        {
          "word": "banana",
          "isMatch": false
        },
        {
          "word": "ocean",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-party-g1-warmup/w-ocean.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "tower",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-party-g1-warmup/w-tower.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "keeper",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-party-g1-warmup/w-keeper.mp3"
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
          "word": "ship",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-party-g1-warmup/w-ship.mp3"
        },
        {
          "word": "crayon",
          "isMatch": false
        },
        {
          "word": "waves",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-party-g1-warmup/w-waves.mp3"
        },
        {
          "word": "socks",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fact-party-g1-warmup/celebrate.mp3",
    "script": "You caught them! Light, tower, ship, and ocean. All of them belong with lighthouses, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fact-party-g1-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like light, tower, and ship belong with lighthouses. Watch for them in today's lesson. You will spot them, I know it."
  }
};
