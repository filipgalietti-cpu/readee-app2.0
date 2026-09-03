/**
 * PLACEMENT NARRATION - everything Luna says during the placement that is not
 * the child's name (the name pack is synthesized per child at signup) and not
 * a question or option (those live with the bank). Examiner register: name the
 * activity, never the test; neutral acknowledgements, never praise tied to a
 * right answer (DIBELS and Acadience script no praise at all; Amira coaches
 * "praise effort"). The framing line is Filip's decided wording, verbatim.
 *
 * Each key becomes one clip: public/audio/placement/narr-<key>.mp3, verified by
 * Whisper in scripts/placement-tts.ts. Change a line here, rerun the script.
 */
export const PLACEMENT_NARRATION = {
  // Stage 0: greeting is the name pack ("Hi, Maya"); these two are the
  // no-name fallbacks when a child's pack clip is missing.
  "hi-generic": "Hi there! I'm so glad you're here.",
  "climb-generic": "Wow, look how far you climbed.",
  "intro-frame": "Let's read some words together. Some will be easy and some will be tricky, and that's exactly how I learn about you.",
  "mic-check": "First, let's make sure I can hear you. Say hello to me!",
  "mic-heard": "I heard you. Let's begin.",
  "mic-again": "Hmm, I could not hear that. Let's try once more. Say hello!",
  "warmup-word": "Here is a practice word. Read it out loud when you see it.",
  "warmup-done": "That was just practice. Now the real words.",

  // Stage 2: word lists
  "words-intro": "Read each word out loud when it appears. If you do not know a word, say I don't know, and we will go to the next one.",
  "words-next-list": "Here comes the next set of words.",
  "words-easier": "Let's try some different words.",
  "words-done": "That's all the words. Nice work.",

  // Stage 1: foundations (K and 1st, or anyone whose lists land at K)
  "found-intro": "Now let's play with sounds.",
  "letter-sounds-intro": "I will say a sound. Tap the letter that makes that sound.",
  "letter-sounds-prompt": "Which letter makes this sound?",
  "blending-intro": "Now I will say some sounds. Tap the word they make.",
  "blending-prompt": "Which word do these sounds make?",
  "nonsense-intro": "These next words are make-believe words. Sound them out the best you can.",

  // Stage 3: passage
  "passage-intro": "Now a story. Read it out loud the best you can, all the way to the end. If you get stuck, keep going.",
  "passage-stop": "You can stop there.",
  "passage-done": "You read the whole thing. Nice work.",
  "passage-second": "One more story. This one is a little harder. Just do your best.",

  // Stage 4: comprehension
  "comp-intro": "Now three questions about the story. I will read each one to you. Tap your answer.",
  "comp-intro-read": "Now three questions about the story. Read each one and tap your answer. Tap the little speaker if you want me to read one to you.",
  "listen-intro": "Now I will read you a story. Listen carefully. Then I will ask you two questions.",
  "listen-questions": "Here come the questions.",

  // Stage 5: close (the celebration with the name is in the name pack)
  "close": "That's everything. You did it.",
  "handoff": "Now hand the screen to a grown-up, so I can show them what you did today.",

  // Neutral acknowledgements between items (examiner mode: not tied to correctness)
  "ack-1": "Okay.",
  "ack-2": "Next one.",
  "ack-3": "Keep going.",
  "ack-4": "Got it.",
} as const;

export type NarrationKey = keyof typeof PLACEMENT_NARRATION;

/** Luna announces the story by name before the child reads it. */
export const titleLine = (title: string): string => `This story is called ${title}.`;
