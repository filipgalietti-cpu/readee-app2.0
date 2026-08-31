import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for same-and-different (RL.K.9) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=same-and-different --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "same-and-different-warmup",
  "lessonId": "same-and-different",
  "lessonTitle": "Same & Different",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Animal Friends Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with animal friends!",
  "intro": {
    "audio": "/audio/warmups-v2/same-and-different-warmup/intro.mp3",
    "script": "Today's story has animal friends in it! Look at each word. If it belongs with animal friends, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Animal Friends"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "cat",
          "isMatch": true,
          "audio": "/audio/warmups-v2/same-and-different-warmup/w-cat.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "bunny",
          "isMatch": true,
          "audio": "/audio/warmups-v2/same-and-different-warmup/w-bunny.mp3"
        },
        {
          "word": "clock",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "dog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/same-and-different-warmup/w-dog.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "bone",
          "isMatch": true,
          "audio": "/audio/warmups-v2/same-and-different-warmup/w-bone.mp3"
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
          "word": "mouse",
          "isMatch": true,
          "audio": "/audio/warmups-v2/same-and-different-warmup/w-mouse.mp3"
        },
        {
          "word": "jacket",
          "isMatch": false
        },
        {
          "word": "grass",
          "isMatch": true,
          "audio": "/audio/warmups-v2/same-and-different-warmup/w-grass.mp3"
        },
        {
          "word": "lamp",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/same-and-different-warmup/celebrate.mp3",
    "script": "You caught it! Cat, dog, mouse, and bunny. All of them belong with animal friends, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/same-and-different-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like cat, dog, and mouse belong with animal friends. Watch for them in today's lesson. You will spot them, I know it."
  }
};
