import { SPECTRUM_PASSAGES } from "./reading";
import language from "./language.json";
/** Fixed author scripts only; no child's name, voice or other personal data. */
export function spectrumAudioScripts(): Record<string, string> {
  const clips: Record<string, string> = {
    "language-intro": "Now I will read some short texts to you. Listen, then choose an answer. You can hear each one again.",
    "blend-intro": "Listen to the sounds. Put them together and say the word. You will not see the word this time.",
    "reading-intro": "Read this text out loud. Take your time. If a word is tricky, try it and keep going.",
  };
  for (const p of SPECTRUM_PASSAGES.filter(p => !p.legacy)) {
    clips[`title-${p.id}`] = `This text is called ${p.title}.`;
    for (const q of p.questions) {
      clips[`q-${q.id}`] = q.prompt;
      for (const o of q.options) clips[`opt-${q.id}-${o.id}`] = o.label;
    }
  }
  for (const q of language) {
    if (q.promptAudio) clips[`q-${q.id}`] = q.prompt;
    else if (q.audio.startsWith("/audio/placement-spectrum/")) clips[`q-${q.id}`] = `${q.text} ${q.prompt}`;
    for (const o of q.options) clips[`opt-${q.id}-${o.id}`] = o.label;
  }
  return clips;
}
export const spectrumClip = (id: string) => `/audio/placement-spectrum/${id}.mp3`;
