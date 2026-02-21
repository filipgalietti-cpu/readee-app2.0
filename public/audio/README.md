# Static Audio Files

Audio files for Readee practice questions and feedback.

## Folder structure

```
public/audio/
  kindergarten/   # Kindergarten practice question audio
  feedback/       # Shared feedback audio (correct, incorrect, completion)
```

## Kindergarten question audio

Files use the standard ID prefix:
- `RL.K.1-q1.mp3` — question 1 audio
- `RL.K.1-q1-hint.mp3` — question 1 hint
- `intro.mp3` — standard intro

## Feedback audio

Shared audio in `/audio/feedback/`:

- `correct-1.mp3` ... `correct-5.mp3` — positive feedback ("Amazing!", "Brilliant!", etc.)
- `incorrect-1.mp3` ... `incorrect-3.mp3` — encouraging correction
- `complete-perfect-1.mp3` ... `complete-perfect-3.mp3` — 5/5 celebration
- `complete-good-1.mp3` ... `complete-good-3.mp3` — 4/5 celebration
- `complete-ok-1.mp3` ... `complete-ok-3.mp3` — 3/5 encouragement
- `complete-try-1.mp3` ... `complete-try-3.mp3` — 0-2/5 encouragement

## Usage in code

```ts
import { playAudio, playAudioUrl, stopAudio } from "@/lib/audio";

// Play by folder + filename
playAudio("feedback", "correct-1");  // plays /audio/feedback/correct-1.mp3

// Play from a direct URL (e.g. from question JSON)
playAudioUrl("/audio/kindergarten/RL.K.1-q1.mp3");

// Stop playback
stopAudio();
```
