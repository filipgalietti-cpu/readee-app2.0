/** One delivery profile for fixed assessment clips and personalized report speech. */
export const ASSESSMENT_VOICE = {
  version: "autonoe-pro-reading-v1",
  model: "gemini-2.5-pro-tts" as const,
  direction:
    "Speak in a calm, warm American reading-teacher voice, with clear consonants and a steady conversational pace of about 145 words per minute. Leave natural pauses between sentences and quoted texts. Do not exaggerate emphasis or rush answer choices. Read only the supplied text, without an introduction or additional words.",
};
export function assessmentSpokenText(text: string): string {
  const spoken = text
    .trim()
    .replace(/\bNia\b/g, "Nee-ah")
    .replace(/\bMOSTLY\b/g, "mostly")
    .replace(/\bDELIGHTED\b/g, "delighted");
  return spoken && !/[.!?]["”\']?$/.test(spoken) ? `${spoken}.` : spoken;
}
