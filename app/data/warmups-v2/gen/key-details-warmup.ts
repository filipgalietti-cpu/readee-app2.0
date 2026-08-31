import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for key-details (RL.K.1) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=key-details --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "key-details-warmup",
  "lessonId": "key-details",
  "lessonTitle": "What Happened?",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Bird In A Tree Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a bird in a tree!",
  "intro": {
    "audio": "/audio/warmups-v2/key-details-warmup/intro.mp3",
    "script": "Today's story has a bird in a tree in it! Look at each word. If it belongs with a bird in a tree, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Bird In A Tree"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "bug",
          "isMatch": true,
          "audio": "/audio/warmups-v2/key-details-warmup/w-bug.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "wing",
          "isMatch": true,
          "audio": "/audio/warmups-v2/key-details-warmup/w-wing.mp3"
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
          "word": "flew",
          "isMatch": true,
          "audio": "/audio/warmups-v2/key-details-warmup/w-flew.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "leaf",
          "isMatch": true,
          "audio": "/audio/warmups-v2/key-details-warmup/w-leaf.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "nest",
          "isMatch": true,
          "audio": "/audio/warmups-v2/key-details-warmup/w-nest.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "sing",
          "isMatch": true,
          "audio": "/audio/warmups-v2/key-details-warmup/w-sing.mp3"
        },
        {
          "word": "ocean",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/key-details-warmup/celebrate.mp3",
    "script": "You caught it! Bug, flew, nest, and wing. All of them belong with a bird in a tree, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/key-details-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like bug, flew, and nest belong with a bird in a tree. Watch for them in today's lesson. You will spot them, I know it."
  }
};
