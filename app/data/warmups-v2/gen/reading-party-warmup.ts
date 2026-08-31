import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for reading-party (RL.K.10) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=reading-party --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "reading-party-warmup",
  "lessonId": "reading-party",
  "lessonTitle": "Reading Party",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Animal Friends Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with animal friends!",
  "intro": {
    "audio": "/audio/warmups-v2/reading-party-warmup/intro.mp3",
    "script": "Today's story has animal friends in it! Look at each word. If it belongs with animal friends, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Animal Friends"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "fox",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-party-warmup/w-fox.mp3"
        },
        {
          "word": "toast",
          "isMatch": false
        },
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-party-warmup/w-tree.mp3"
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
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-party-warmup/w-bird.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "play",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-party-warmup/w-play.mp3"
        },
        {
          "word": "zipper",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "nest",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-party-warmup/w-nest.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "pals",
          "isMatch": true,
          "audio": "/audio/warmups-v2/reading-party-warmup/w-pals.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/reading-party-warmup/celebrate.mp3",
    "script": "You caught it! Fox, bird, nest, and tree. All of them belong with animal friends, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/reading-party-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like fox, bird, and nest belong with animal friends. Watch for them in today's lesson. You will spot them, I know it."
  }
};
