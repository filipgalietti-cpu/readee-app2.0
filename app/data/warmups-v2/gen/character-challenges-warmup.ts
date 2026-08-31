import type { WarmupDef } from "@/lib/warmup-engine/types";

// AUTO-GENERATED warm-up for character-challenges (RL.2.3) by scripts/warmup-generate.ts.
// Recipe: topic-scout/story. Regenerate: npx tsx scripts/warmup-generate.ts --lesson=character-challenges --force
// PURE DATA. Audio recorded + whisper-verified by the generator.

export const warmupDef: WarmupDef = {
  "id": "character-challenges-warmup",
  "lessonId": "character-challenges",
  "lessonTitle": "Character Challenges",
  "playSeconds": 45,
  "carrots": 2,
  "title": "Lost Dog Catch",
  "recipe": "story-scout",
  "mode": "rule",
  "skin": "sky",
  "playPrompt": "Catch what belongs with a lost dog!",
  "intro": {
    "audio": "/audio/warmups-v2/character-challenges-warmup/intro.mp3",
    "script": "Today's story has a lost dog in it! Look at each word. If it belongs with a lost dog, catch it. If it does not belong, let it float away. Ready? Go!",
    "cardText": "A Lost Dog"
  },
  "waves": [
    {
      "tiles": [
        {
          "word": "leash",
          "isMatch": true,
          "audio": "/audio/warmups-v2/character-challenges-warmup/w-leash.mp3"
        },
        {
          "word": "desk",
          "isMatch": false
        },
        {
          "word": "run",
          "isMatch": true,
          "audio": "/audio/warmups-v2/character-challenges-warmup/w-run.mp3"
        },
        {
          "word": "train",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "bark",
          "isMatch": true,
          "audio": "/audio/warmups-v2/character-challenges-warmup/w-bark.mp3"
        },
        {
          "word": "spoon",
          "isMatch": false
        },
        {
          "word": "rain",
          "isMatch": true,
          "audio": "/audio/warmups-v2/character-challenges-warmup/w-rain.mp3"
        },
        {
          "word": "apple",
          "isMatch": false
        }
      ]
    },
    {
      "tiles": [
        {
          "word": "paws",
          "isMatch": true
        },
        {
          "word": "pizza",
          "isMatch": false
        },
        {
          "word": "home",
          "isMatch": true,
          "audio": "/audio/warmups-v2/character-challenges-warmup/w-home.mp3"
        },
        {
          "word": "lamp",
          "isMatch": false
        }
      ]
    }
  ],
  "celebrate": {
    "audio": "/audio/warmups-v2/character-challenges-warmup/celebrate.mp3",
    "script": "You caught it! Leash, bark, paws, and run. All of them belong with a lost dog, and they are waiting in today's story. Let's go read it!"
  },
  "celebrateZero": {
    "audio": "/audio/warmups-v2/character-challenges-warmup/celebrate-zero.mp3",
    "script": "Good warm up! Words like leash, bark, and paws belong with a lost dog. Watch for them in today's lesson. You will spot them, I know it."
  }
};
