import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for story-elements (RL.K.3) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=story-elements --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "story-elements-warmup",
  "lessonId": "story-elements",
  "lessonTitle": "Characters, Settings, and Events",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Yard Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in a yard!",
  "intro": {
    "audio": "/audio/warmups-v2/story-elements-warmup/intro.mp3",
    "script": "Today's story has a yard in it! Look at each word. If it belongs in a yard, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Yard"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "dog",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-elements-warmup/w-dog.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "grass",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-elements-warmup/w-grass.mp3"
        },
        {
          "word": "desk",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "ball",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-elements-warmup/w-ball.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        },
        {
          "word": "swing",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-elements-warmup/w-swing.mp3"
        },
        {
          "word": "boat",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-elements-warmup/w-tree.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "fence",
          "isMatch": true,
          "audio": "/audio/warmups-v2/story-elements-warmup/w-fence.mp3"
        },
        {
          "word": "lamp",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/story-elements-warmup/celebrate.mp3",
    "script": "You caught it! Dog, ball, tree, and grass. All of them belong in a yard, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/story-elements-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like dog, ball, and tree belong in a yard. Watch for them in today's lesson. You will spot them, I know it."
  }
};
