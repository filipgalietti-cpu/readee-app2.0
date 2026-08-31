import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for one-story-two-ways (RL.2.9) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=one-story-two-ways --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "one-story-two-ways-warmup",
  "lessonId": "one-story-two-ways",
  "lessonTitle": "One Story, Two Ways",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Soup Pot Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs in the soup pot!",
  "intro": {
    "audio": "/audio/warmups-v2/one-story-two-ways-warmup/intro.mp3",
    "script": "Today's story has a soup pot in it! Look at each word. If it belongs in the soup pot, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "The Soup Pot"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "water",
          "isMatch": true,
          "audio": "/audio/warmups-v2/one-story-two-ways-warmup/w-water.mp3"
        },
        {
          "word": "shoe",
          "isMatch": false
        },
        {
          "word": "button",
          "isMatch": true,
          "audio": "/audio/warmups-v2/one-story-two-ways-warmup/w-button.mp3"
        },
        {
          "word": "moon",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "food",
          "isMatch": true,
          "audio": "/audio/warmups-v2/one-story-two-ways-warmup/w-food.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        },
        {
          "word": "potato",
          "isMatch": true,
          "audio": "/audio/warmups-v2/one-story-two-ways-warmup/w-potato.mp3"
        },
        {
          "word": "swing",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "stone",
          "isMatch": true,
          "audio": "/audio/warmups-v2/one-story-two-ways-warmup/w-stone.mp3"
        },
        {
          "word": "desk",
          "isMatch": false
        },
        {
          "word": "zebra",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/one-story-two-ways-warmup/celebrate.mp3",
    "script": "You caught it! Water, food, stone, and button. All of them belong in the soup pot, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/one-story-two-ways-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like water, food, and stone belong in the soup pot. Watch for them in today's lesson. You will spot them, I know it."
  }
};
