/**
 * Readee.ai voice catalog.
 *
 * Maps Gemini TTS prebuilt voices to friendly student-facing names so
 * teachers and parents can pick a narrator instead of looking at a
 * mythology dictionary. Each voice has a sample clip that plays in the
 * picker UI.
 *
 * Sample clips live at audio/voice-samples/{id}.wav in Supabase Storage,
 * generated once via scripts/generate-voice-samples.js. If a sample
 * isn't generated yet, the picker falls back to a play button that
 * silently does nothing rather than playing the wrong voice.
 */

export type VoiceId = "sage" | "rio" | "riley" | "marcus" | "kai" | "lily";

export type Voice = {
  id: VoiceId;
  /** Friendly student-facing name. */
  name: string;
  /** What it sounds like, in plain English. */
  blurb: string;
  /** Best for what — guides teachers/parents who don't know voices. */
  bestFor: string;
  /** Underlying Gemini TTS prebuilt voice name (passed to the API). */
  geminiVoice: string;
};

export const VOICES: Voice[] = [
  {
    id: "sage",
    name: "Sage",
    blurb: "Warm, friendly, clear. Our default — sounds like a favorite teacher.",
    bestFor: "Most passages, K-4",
    geminiVoice: "Autonoe",
  },
  {
    id: "rio",
    name: "Rio",
    blurb: "Bright, youthful, energetic. Lots of personality.",
    bestFor: "Adventures, fast-paced stories",
    geminiVoice: "Puck",
  },
  {
    id: "riley",
    name: "Riley",
    blurb: "Neutral, even-paced, easy to follow. Calm.",
    bestFor: "Informational passages, science / social studies",
    geminiVoice: "Kore",
  },
  {
    id: "marcus",
    name: "Marcus",
    blurb: "Deeper, narrator voice. Storyteller energy.",
    bestFor: "Longer stories, fables, mysteries",
    geminiVoice: "Charon",
  },
  {
    id: "kai",
    name: "Kai",
    blurb: "Lively and fun. Adds energy without being over the top.",
    bestFor: "Sports, animals, action passages",
    geminiVoice: "Fenrir",
  },
  {
    id: "lily",
    name: "Lily",
    blurb: "Bright, gentle, expressive. Reads with warmth.",
    bestFor: "Picture-book style passages, K-1",
    geminiVoice: "Aoede",
  },
];

export const DEFAULT_VOICE_ID: VoiceId = "sage";

export function getVoice(id: VoiceId | string | null | undefined): Voice {
  if (!id) return VOICES[0];
  const hit = VOICES.find((v) => v.id === id);
  return hit ?? VOICES[0];
}

/** Public Supabase URL pattern for voice samples. */
export function voiceSampleUrl(id: VoiceId): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/audio/voice-samples/${id}.wav`;
}
