import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for picture-detectives (RL.1.7) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=picture-detectives --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "picture-detectives-warmup",
  "lessonId": "picture-detectives",
  "lessonTitle": "Picture Detectives",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Card Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a card!",
  "intro": {
    "audio": "/audio/warmups-v2/picture-detectives-warmup/intro.mp3",
    "script": "Today's story has a special card in it! Look at each word. If it belongs with a card, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Card"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "paper",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-detectives-warmup/w-paper.mp3"
        },
        {
          "word": "rocket",
          "isMatch": false
        },
        {
          "word": "gift",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-detectives-warmup/w-gift.mp3"
        },
        {
          "word": "zebra",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "glue",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-detectives-warmup/w-glue.mp3"
        },
        {
          "word": "ocean",
          "isMatch": false
        },
        {
          "word": "friend",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-detectives-warmup/w-friend.mp3"
        },
        {
          "word": "pizza",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "heart",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-detectives-warmup/w-heart.mp3"
        },
        {
          "word": "truck",
          "isMatch": false
        },
        {
          "word": "draw",
          "isMatch": true,
          "audio": "/audio/warmups-v2/picture-detectives-warmup/w-draw.mp3"
        },
        {
          "word": "cloud",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/picture-detectives-warmup/celebrate.mp3",
    "script": "You caught it! Paper, glue, heart, and gift. All of them belong with a card, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/picture-detectives-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like paper, glue, and heart belong with a card. Watch for them in today's lesson. You will spot them, I know it."
  }
};
