# Static Audio Files

Audio files for Readee lessons. Each lesson has its own folder.

## Folder structure

```
public/audio/
  pk-L1/        # Pre-K Lesson 1
  pk-L2/        # Pre-K Lesson 2
  k-L1/         # Kindergarten Lesson 1
  k-L2/         # Kindergarten Lesson 2
  ...
  feedback/     # Shared feedback audio (correct, incorrect, completion)
```

## File naming convention

- One folder per lesson: `/audio/{lesson-id}/`
- Files named by word or letter: `cat.wav`, `a.wav`, `short-a.wav`
- Keep filenames **lowercase**
- Use **hyphens** for multi-word names: `the-cat.wav`, `short-a.wav`
- Passages: `passage-1.wav`, `passage-2.wav`
- Questions: `question-1.wav`, `question-2.wav`
- Hints: `hint-1.wav`, `hint-2.wav`

## Feedback audio

Shared audio in `/audio/feedback/`:

- `correct-1.wav`, `correct-2.wav`, ... — positive feedback
- `incorrect-1.wav`, `incorrect-2.wav`, ... — encouraging correction
- `complete-perfect.wav` — perfect score celebration
- `complete-good.wav` — good score celebration
- `complete-ok.wav` — encouragement to keep practicing

## Usage in code

```ts
import { playAudio, stopAudio } from "@/lib/audio";

// Play a word audio file
playAudio("k-L1", "cat");     // plays /audio/k-L1/cat.wav

// Play feedback
playAudio("feedback", "correct-1");

// Stop playback
stopAudio();
```
