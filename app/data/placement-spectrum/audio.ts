import pcmReview from "./pcm-review-state.json";
import listeningSelections from "./listening-selections.json";
import { ASSESSMENT_PCM } from "@/lib/audio/assessment-pcm-quality";
import { getAudioUrl } from "@/lib/audio";
import { PLACEMENT_NARRATION } from "@/app/data/placement-bank/narration";
import { SPECTRUM_PASSAGES } from "./reading";
import language from "./language.json";
/** Fixed author scripts only; no child's name, voice or other personal data. */
export function spectrumAudioScripts(): Record<string, string> {
  const clips: Record<string, string> = {
    ...Object.fromEntries(Object.entries(PLACEMENT_NARRATION).map(([key, text]) => [`narr-${key}`, text])),
    "hi-generic": "Hi! I’m Luna. Let’s read a little together.",
    "assessment-complete": "That’s everything. You did it. Let’s show your grown-up what you read.",
    "ask-name": "What is your name?",
    "nice-to-meet-you": "It’s so nice to meet you!",
    "reading-questions": "Now let’s answer a few questions about what you read.",
    "reveal-ask": "Your custom reading journey is ready. Let’s explore the lessons chosen for your reader.",
    "parent-welcome": "Welcome to Readee. This first activity helps us find a reading starting point for your child. Their school grade guides where we begin. Let them answer on their own, and stay nearby to help with the microphone. Your report will explain what we learned and where to begin. When you are ready, hand the device to your reader.",
    "hello-back": "Hello there! Let's read together.",
    "sound-prompt-0": "Which letter makes this sound?",
    "sound-prompt-1": "And what about this sound?",
    "sound-prompt-2": "Which letter goes with this one?",
    "sound-prompt-3": "And this sound?",
    "word-try-again": "I didn’t catch that. Try the word again, or tap I don’t know this word.",
    "language-intro": "Now I will read some short texts to you. Listen, then choose an answer. You can hear each one again.",
    "blend-intro": "Listen to the sounds. Put them together and say the word. You will not see the word this time.",
    "reading-intro": "Read this text out loud. Take your time. If a word is tricky, try it and keep going.",
  };
  for (const p of SPECTRUM_PASSAGES) {
    clips[`title-${p.id}`] = `This text is called ${p.title}.`;
    for (const q of p.questions) {
      clips[`q-${q.id}`] = q.prompt;
      for (const o of q.options) clips[`opt-${q.id}-${o.id}`] = o.label;
    }
  }
  for (const q of language) {
    clips[`q-${q.id}`] = `${q.text} ${q.prompt}`;
    for (const o of q.options) clips[`opt-${q.id}-${o.id}`] = o.label;
  }
  return clips;
}
export const spectrumClip = (id: string) => {
  if (pcmReview.ready && pcmReview.version === ASSESSMENT_PCM.version) {
    const selected = (listeningSelections.clips as Record<string, { url: string; listeningStatus: string }>)[id];
    if (listeningSelections.baseVersion === pcmReview.version && selected?.listeningStatus === "user-selected")
      return selected.url;
    return `/audio/assessment-voice/${ASSESSMENT_PCM.version}/${id}.wav`;
  }
  // Existing production assets remain the fallback if this release is disabled.
  if (id.startsWith("narr-")) return getAudioUrl("placement", id);
  if (id === "hi-generic") return getAudioUrl("placement", "narr-hi-generic");
  return `/audio/placement-spectrum/${id}.mp3`;
};
