# Readee R&D

Ideas and explorations not yet in development. Capture cost, feasibility, and notes here so nothing gets lost.

---

## Live TTS for Sentence Builder

**Problem**: Can't pre-generate audio for every possible sentence combination — too many permutations.

**Approach**: Call Google Cloud TTS at runtime when a kid builds a sentence. Return audio and play it immediately.

**Cost**: ~$0.016 per 25 sentences (Neural2 voice). Negligible even at heavy usage.

**Implementation**:
- API route that accepts sentence text, calls Google Cloud TTS, returns audio
- Cache results per sentence string (if "The cat is big" is built twice, serve from cache)
- Use Neural2 voices for natural quality without Gemini-level cost

**Status**: Idea

---

## Live TTS for Phoneme Machine

**Problem**: Similar to Sentence Builder — blending phonemes into words/combos dynamically.

**Approach**: Hybrid — pre-save individual phonemes and common words (finite set, ~44 phonemes + word bank per grade). Use live TTS only if needed for combos.

**Notes**: Pre-saved audio sounds better for isolated phonemes. Browser Web Speech API sounds robotic — avoid.

**Status**: Idea

---
