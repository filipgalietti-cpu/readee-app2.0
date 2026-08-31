import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for fact-finder-basics (RI.K.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=fact-finder-basics --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "fact-finder-basics-warmup",
  "lessonId": "fact-finder-basics",
  "lessonTitle": "Fact Finder Basics",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Owls Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs if it belongs with owls, catch it!",
  "intro": {
    "audio": "/audio/warmups-v2/fact-finder-basics-warmup/intro.mp3",
    "script": "Today's story has today's book is all about owls in it! Look at each word. If it belongs if it belongs with owls, catch it, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Owls"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "awake",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finder-basics-warmup/w-awake.mp3"
        },
        {
          "word": "car",
          "isMatch": false
        },
        {
          "word": "mice",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finder-basics-warmup/w-mice.mp3"
        },
        {
          "word": "ball",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "sleep",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finder-basics-warmup/w-sleep.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "night",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finder-basics-warmup/w-night.mp3"
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
          "word": "trees",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finder-basics-warmup/w-trees.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "heads",
          "isMatch": true,
          "audio": "/audio/warmups-v2/fact-finder-basics-warmup/w-heads.mp3"
        },
        {
          "word": "juice",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/fact-finder-basics-warmup/celebrate.mp3",
    "script": "You caught it! Awake, sleep, trees, and mice. All of them belong if it belongs with owls, catch it, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/fact-finder-basics-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like awake, sleep, and trees belong if it belongs with owls, catch it. Watch for them in today's lesson. You will spot them, I know it."
  }
};
