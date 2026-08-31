import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for picture-clues (RL.K.7) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=picture-clues --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "picture-clues-warmup",
  "lessonId": "picture-clues",
  "lessonTitle": "Picture Clues",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Foxy The Fox Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with foxy the fox!",
  "intro": {
    "audio": "/audio/warmups-v2/picture-clues-warmup/intro.mp3",
    "script": "Today's story has foxy the fox in it! Look at each word. If it belongs with foxy the fox, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "Foxy The Fox"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "hat",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-clues-warmup/w-hat.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "tree",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-clues-warmup/w-tree.mp3"
        },
        {
          "word": "socks",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "leaf",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-clues-warmup/w-leaf.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "bird",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-clues-warmup/w-bird.mp3"
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
          "word": "path",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-clues-warmup/w-path.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "paw",
          "isMatch": true
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/picture-clues-warmup/celebrate.mp3",
    "script": "You caught it! Hat, leaf, path, and tree. All of them belong with foxy the fox, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/picture-clues-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like hat, leaf, and path belong with foxy the fox. Watch for them in today's lesson. You will spot them, I know it."
  }
};
