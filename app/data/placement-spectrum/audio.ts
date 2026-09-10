import { SPECTRUM_PASSAGES } from "./reading";
import language from "./language.json";
/** Fixed author scripts only; no child's name, voice or other personal data. */
export function spectrumAudioScripts(): Record<string, string> {
  const clips: Record<string, string> = {
    "reading-break": "You have read two texts. Ready to finish this part? You can finish reading now, or try another text.",
    "parent-welcome": "Welcome to Readee. This first activity helps us find a reading starting point for your child. Their school grade guides where we begin. Let them answer on their own, and stay nearby to help with the microphone. The results and first lesson are free. When you are ready, hand the device to your reader.",
    "hello-back": "Hello there! Let's read together.",
    "sound-prompt-0": "Which letter makes this sound?",
    "sound-prompt-1": "And what about this sound?",
    "sound-prompt-2": "Which letter goes with this one?",
    "sound-prompt-3": "And this sound?",
    "word-try-again": "Take your time. You can try this word again. If you do not know it, choose I don't know this word.",
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
