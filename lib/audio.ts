/**
 * Static audio playback utility.
 *
 * Plays .wav files from /public/audio/{lessonId}/{filename}.wav
 * Uses HTML5 Audio — no external dependencies.
 */

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play a static audio file.
 *
 * @param lessonId  Folder name, e.g. "k-L1", "pk-L2", "feedback"
 * @param filename  File stem without extension, e.g. "cat", "short-a", "correct-1"
 *
 * @example
 *   playAudio("k-L1", "cat");        // plays /audio/k-L1/cat.wav
 *   playAudio("feedback", "correct-1"); // plays /audio/feedback/correct-1.wav
 */
export function playAudio(lessonId: string, filename: string): Promise<void> {
  return new Promise((resolve) => {
    stopAudio();

    const src = `/audio/${lessonId}/${filename}.wav`;
    const audio = new Audio(src);
    currentAudio = audio;

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    });

    audio.addEventListener("error", () => {
      // Fail silently — file may not exist yet
      if (currentAudio === audio) currentAudio = null;
      resolve();
    });

    audio.play().catch(() => {
      // Autoplay blocked or file missing — fail silently
      if (currentAudio === audio) currentAudio = null;
      resolve();
    });
  });
}

/** Stop any currently playing audio. */
export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/** Pause the currently playing audio (can be resumed). */
export function pauseAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
  }
}

/** Resume paused audio. */
export function resumeAudio(): void {
  if (currentAudio) {
    currentAudio.play().catch(() => {});
  }
}

/** Check if audio is currently playing. */
export function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}
