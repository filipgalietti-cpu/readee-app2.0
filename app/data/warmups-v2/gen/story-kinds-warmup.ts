import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for story-kinds (RL.K.5) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=story-kinds --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "story-kinds-warmup",
  "lessonId": "story-kinds",
  "lessonTitle": "Kinds of Books",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Pigs Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with pigs!",
  "intro": {
    "audio": "/audio/warmups-v2/story-kinds-warmup/intro.mp3",
    "script": "Today's story has pigs in it! Look at each word. If it belongs with pigs, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Pigs"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "farm",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-kinds-warmup/w-farm.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "pink",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-kinds-warmup/w-pink.mp3"
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
          "word": "mud",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-kinds-warmup/w-mud.mp3"
        },
        {
          "word": "table",
          "isMatch": false
        },
        {
          "word": "snout",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-kinds-warmup/w-snout.mp3"
        },
        {
          "word": "flower",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "oink",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-kinds-warmup/w-oink.mp3"
        },
        {
          "word": "banana",
          "isMatch": false
        },
        {
          "word": "dirty",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-kinds-warmup/w-dirty.mp3"
        },
        {
          "word": "clock",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/story-kinds-warmup/celebrate.mp3",
    "script": "You caught it! Farm, mud, oink, and pink. All of them belong with pigs, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/story-kinds-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like farm, mud, and oink belong with pigs. Watch for them in today's lesson. You will spot them, I know it."
  }
};
