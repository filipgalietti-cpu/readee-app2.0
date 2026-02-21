/**
 * Static audio playback utility.
 *
 * Plays .mp3 files from /public/audio/{folder}/{filename}.mp3
 * Uses HTML5 Audio — no external dependencies.
 */

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play a static audio file by folder + name.
 *
 * @param folder    Folder name, e.g. "kindergarten", "feedback"
 * @param filename  File stem without extension, e.g. "RL.K.1-q1", "correct-1"
 *
 * @example
 *   playAudio("kindergarten", "RL.K.1-q1"); // plays /audio/kindergarten/RL.K.1-q1.mp3
 *   playAudio("feedback", "correct-1");     // plays /audio/feedback/correct-1.mp3
 */
export function playAudio(folder: string, filename: string): Promise<void> {
  return new Promise((resolve) => {
    stopAudio();

    const src = `/audio/${folder}/${filename}.mp3`;
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

/**
 * Play a static audio file from a direct URL path.
 *
 * @param url  Full path, e.g. "/audio/kindergarten/RL.K.1-q1.mp3"
 */
export function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    stopAudio();

    const audio = new Audio(url);
    currentAudio = audio;

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    });

    audio.addEventListener("error", () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    });

    audio.play().catch(() => {
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
