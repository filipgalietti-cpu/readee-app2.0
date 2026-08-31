import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for my-first-read (RF.K.4) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=my-first-read --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "my-first-read-warmup",
  "lessonId": "my-first-read",
  "lessonTitle": "My First Read",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Pets Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with the pets!",
  "intro": {
    "audio": "/audio/warmups-v2/my-first-read-warmup/intro.mp3",
    "script": "Today's story has some cute pets in it! Look at each word. If it belongs with the pets, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Pets"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "cat",
          "isMatch": true,
          "audio": "/audio/warmups-v2/my-first-read-warmup/w-cat.mp3"
        },
        {
          "word": "moon",
          "isMatch": false
        },
        {
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/my-first-read-warmup/w-bird.mp3"
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
          "word": "dog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/my-first-read-warmup/w-dog.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "play",
          "isMatch": true,
          "audio": "/audio/warmups-v2/my-first-read-warmup/w-play.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "fish",
          "isMatch": true,
          "audio": "/audio/warmups-v2/my-first-read-warmup/w-fish.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "bone",
          "isMatch": true,
          "audio": "/audio/warmups-v2/my-first-read-warmup/w-bone.mp3"
        },
        {
          "word": "hat",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/my-first-read-warmup/celebrate.mp3",
    "script": "You caught it! Cat, dog, fish, and bird. All of them belong with the pets, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/my-first-read-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like cat, dog, and fish belong with the pets. Watch for them in today's lesson. You will spot them, I know it."
  }
};
