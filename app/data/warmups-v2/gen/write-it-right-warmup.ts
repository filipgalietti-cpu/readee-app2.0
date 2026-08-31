import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for write-it-right (L.1.2) by scripts/warmup-generate.ts.
// Recipe: topic-scout/topic. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=write-it-right --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "write-it-right-warmup",
  "lessonId": "write-it-right",
  "lessonTitle": "Write It Right",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Dog Catch",
  "recipe": "topic-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a dog!",
  "intro": {
    "audio": "/audio/warmups-v2/write-it-right-warmup/intro.mp3",
    "script": "Today we are reading all about a dog! Look at each word. If it belongs with a dog, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Dog"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bone",
          "isMatch": true,
          "audio": "/audio/warmups-v2/write-it-right-warmup/w-bone.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "tail",
          "isMatch": true,
          "audio": "/audio/warmups-v2/write-it-right-warmup/w-tail.mp3"
        },
        {
          "word": "pencil",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "leash",
          "isMatch": true,
          "audio": "/audio/warmups-v2/write-it-right-warmup/w-leash.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "puppy",
          "isMatch": true,
          "audio": "/audio/warmups-v2/write-it-right-warmup/w-puppy.mp3"
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
          "word": "bark",
          "isMatch": true,
          "audio": "/audio/warmups-v2/write-it-right-warmup/w-bark.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "fetch",
          "isMatch": true,
          "audio": "/audio/warmups-v2/write-it-right-warmup/w-fetch.mp3"
        },
        {
          "word": "desk",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/write-it-right-warmup/celebrate.mp3",
    "script": "You caught them! Bone, leash, bark, and tail. All of them belong with a dog, and today's lesson is full of them. Let's go!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/write-it-right-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bone, leash, and bark belong with a dog. Watch for them in today's lesson. You will spot them, I know it."
  }
};
