import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for book-makers (RL.K.6) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=book-makers --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "book-makers-warmup",
  "lessonId": "book-makers",
  "lessonTitle": "Who Made This Book?",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Bookworm Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a bookworm!",
  "intro": {
    "audio": "/audio/warmups-v2/book-makers-warmup/intro.mp3",
    "script": "Today's story has a bookworm in it in it! Look at each word. If it belongs with a bookworm, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Bookworm"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "book",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-makers-warmup/w-book.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        },
        {
          "word": "story",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-makers-warmup/w-story.mp3"
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
          "word": "page",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-makers-warmup/w-page.mp3"
        },
        {
          "word": "chair",
          "isMatch": false
        },
        {
          "word": "words",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-makers-warmup/w-words.mp3"
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
          "word": "read",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-makers-warmup/w-read.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "cover",
          "isMatch": true,
          "audio": "/audio/warmups-v2/book-makers-warmup/w-cover.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/book-makers-warmup/celebrate.mp3",
    "script": "You caught it! Book, page, read, and story. All of them belong with a bookworm, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/book-makers-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like book, page, and read belong with a bookworm. Watch for them in today's lesson. You will spot them, I know it."
  }
};
