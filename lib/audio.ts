/**
 * Static audio playback utility.
 *
 * Plays .mp3 files from Supabase Storage (production) with local fallback.
 * Uses HTML5 Audio — no external dependencies.
 */

const SUPABASE_AUDIO_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio`
    : "";

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play a static audio file by folder + name.
 * Uses Supabase Storage URL in production, falls back to local /audio/ path.
 *
 * @param folder    Folder name, e.g. "kindergarten", "feedback"
 * @param filename  File stem without extension, e.g. "RL.K.1-q1", "correct-1"
 */
export function playAudio(folder: string, filename: string): Promise<void> {
  const src = SUPABASE_AUDIO_BASE
    ? `${SUPABASE_AUDIO_BASE}/${folder}/${filename}.mp3`
    : `/audio/${folder}/${filename}.mp3`;
  return playAudioUrl(src);
}

/**
 * Play audio from a direct URL (full Supabase URL or relative path).
 *
 * @param url  Full URL or relative path, e.g. "https://...supabase.co/.../RL.K.1-q1.mp3"
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
