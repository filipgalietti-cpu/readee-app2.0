import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for two-kinds-of-books (RL.1.5) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=two-kinds-of-books --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "two-kinds-of-books-warmup",
  "lessonId": "two-kinds-of-books",
  "lessonTitle": "Two Kinds of Books",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Frog Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a frog!",
  "intro": {
    "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/intro.mp3",
    "script": "Today's story has a frog in it! Look at each word. If it belongs with a frog, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Frog"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/w-water.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "pond",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/w-pond.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "bugs",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/w-bugs.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "green",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/w-green.mp3"
        },
        {
          "word": "book",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "tongue",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/w-tongue.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "swim",
          "isMatch": true,
          "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/w-swim.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/celebrate.mp3",
    "script": "You caught it! Water, bugs, tongue, and pond. All of them belong with a frog, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/two-kinds-of-books-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like water, bugs, and tongue belong with a frog. Watch for them in today's lesson. You will spot them, I know it."
  }
};
