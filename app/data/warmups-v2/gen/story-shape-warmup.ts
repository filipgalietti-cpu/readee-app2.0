import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for story-shape (RL.2.5) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=story-shape --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "story-shape-warmup",
  "lessonId": "story-shape",
  "lessonTitle": "Story Shape",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Stuck Kite Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a stuck kite!",
  "intro": {
    "audio": "/audio/warmups-v2/story-shape-warmup/intro.mp3",
    "script": "Today's story has a stuck kite in it! Look at each word. If it belongs with a stuck kite, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Stuck Kite"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "string",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-shape-warmup/w-string.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "wind",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-shape-warmup/w-wind.mp3"
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
          "word": "branch",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-shape-warmup/w-branch.mp3"
        },
        {
          "word": "toast",
          "isMatch": false
        },
        {
          "word": "sky",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-shape-warmup/w-sky.mp3"
        },
        {
          "word": "juice",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "stick",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-shape-warmup/w-stick.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "pull",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-shape-warmup/w-pull.mp3"
        },
        {
          "word": "sleep",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/story-shape-warmup/celebrate.mp3",
    "script": "You caught it! String, branch, stick, and wind. All of them belong with a stuck kite, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/story-shape-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like string, branch, and stick belong with a stuck kite. Watch for them in today's lesson. You will spot them, I know it."
  }
};
