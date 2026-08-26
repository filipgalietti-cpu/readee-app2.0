import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./double-duty-words-timings.json";

// Double Duty Words (K.L.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=double-duty-words

const A = (id: string) => `/audio/lessons-v2/double-duty-words/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/double-duty-words/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/double-duty-words/${w.toLowerCase()}.png`;

export const doubleDutyWordsImages: Record<string, string> = {
  "hook-bat-story": "A small brown bat flying in the night sky above a child swinging a wooden baseball bat.",
  "bat-flying": "A small brown bat flying with spread wings against a dark night sky with a moon.",
  "bat-baseball": "A wooden baseball bat lying next to a white baseball on green grass.",
  "duck-swimming": "A yellow duck swimming happily in blue pond water.",
  "duck-bending": "A young girl crouching down very low under a tree branch, knees bent, head lowered, hands near her head. No animals.",
  "bats": "Three small brown bats flying together in the sky.",
  "wave-ocean": "A large blue ocean wave curling over near a sandy beach.",
  "wave-hand": "A smiling child standing in a wide grassy park waving one raised hand, with blue sky and clouds filling the whole picture from edge to edge.",
  "rock-stone": "Three big smooth gray rocks together in a sunny green meadow.",
  "rock-chair": "A child rocking back and forth in a wooden rocking chair."
};

export const doubleDutyWords: LessonDef = {
  id: "double-duty-words",
  title: "Double Duty Words",
  grade: "Kindergarten",
  standard: "K.L.4",
  archetype: "vocabulary",
  objective: "I can learn that some words have two jobs!",
  concepts: ["homonyms","inflectional endings","context clues"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Amazing job, Word Wizard! You found so many words that do double duty. You also learned that little endings like \"s\" and \"ed\" can help you know what a word means. Keep being a word detective!",
    "title": "You're a Double Duty Word Wizard!",
    "body": "You mastered words with two meanings and used clues like -s and -ed!"
  },
  scenes: [
    {
      id: "hook-read-along-bat",
      purpose: "hook",
      gate: "none",
      prompt: "Listen to our word story!",
      image: IMG("hook-bat-story"),
      narration: { audio: A("hook-read-along-bat"), script: "Welcome to Word Wizard Academy! We're learning about words that do double duty today. Listen closely to our story about a bat. Watch the words light up while I read, and follow along with your eyes!" },
      interaction: { type: "read-along", text: "A bat can fly high in the night sky. I can swing a bat to hit a ball.", audio: A("hook-read-along-bat-sentence") },
    },
    {
      id: "model-choose-bat-animal",
      purpose: "model",
      gate: "interaction",
      prompt: "Find the flying **bat**!",
      fx: {"text":"That tricky word, **bat**, has two jobs!","effect":"underline"},
      narration: { audio: A("model-choose-bat-animal"), script: "That tricky word, bat, has two jobs! First, a bat can be an animal that flies. Look at the pictures and tap the one that shows a flying bat." },
      interaction: { type: "choose", options: [{ id: "bat-flying", label: "BAT", audio: W("bat"), image: IMG("bat-flying") }, { id: "bat-baseball", label: "BAT", audio: W("bat"), image: IMG("bat-baseball") }], correctId: "bat-flying", coachWrong: "That's a bat for playing ball! Find the animal bat that flies." },
    },
    {
      id: "model-choose-bat-action",
      purpose: "model",
      gate: "interaction",
      prompt: "Find the **bat** for hitting!",
      fx: {"text":"If someone **bats** a ball, we know it's about playing.","effect":"underline"},
      narration: { audio: A("model-choose-bat-action"), script: "Great job! Now, a bat can also be something you use to play ball. If someone bats a ball, we know it's about playing. Tap the bat we use to hit a ball." },
      interaction: { type: "choose", options: [{ id: "bat-baseball", label: "BAT", audio: W("bat"), image: IMG("bat-baseball") }, { id: "bat-flying", label: "BAT", audio: W("bat"), image: IMG("bat-flying") }], correctId: "bat-baseball", coachWrong: "That's the animal bat! Find the bat for hitting a ball." },
    },
    {
      id: "guided-choose-duck-animal",
      purpose: "guided",
      gate: "interaction",
      prompt: "Find the swimming **duck**!",
      fx: {"text":"Let's try another double duty word: **duck**.","effect":"underline"},
      narration: { audio: A("guided-choose-duck-animal"), script: "Wow, you're becoming a word wizard! Let's try another double duty word: duck. A duck is a bird that swims. Tap the duck swimming in the water." },
      interaction: { type: "choose", options: [{ id: "duck-swimming", label: "DUCK", audio: W("duck"), image: IMG("duck-swimming") }, { id: "duck-bending", label: "DUCK", audio: W("duck"), image: IMG("duck-bending") }], correctId: "duck-swimming", coachWrong: "That's someone ducking down! Find the duck that swims." },
    },
    {
      id: "guided-choose-duck-action",
      purpose: "guided",
      gate: "interaction",
      prompt: "Who is **ducking** down?",
      fx: {"text":"If you **ducked** under something, you bent down.","effect":"underline"},
      narration: { audio: A("guided-choose-duck-action"), script: "Yes, that's a duck! But \"duck\" can also mean to bend down quickly. If you ducked under something, you bent down. Tap the picture of someone ducking down low." },
      interaction: { type: "choose", options: [{ id: "duck-bending", label: "DUCK", audio: W("duck"), image: IMG("duck-bending") }, { id: "duck-swimming", label: "DUCK", audio: W("duck"), image: IMG("duck-swimming") }], correctId: "duck-bending", coachWrong: "That's the swimming duck! Find the person bending down low." },
    },
    {
      id: "guided-transform-bats",
      purpose: "guided",
      gate: "interaction",
      prompt: "Make BAT mean more than one!",
      fx: {"text":"Add **s** to make it more than one!","effect":"magic"},
      narration: { audio: A("guided-transform-bats"), script: "Here is a word wizard trick. Endings are clues! When we add s to the end of a word, it means more than one. One bat. Two bats! Your turn. Tap the s to make bat mean more than one." },
      interaction: {
        type: "transform", base: "BAT", add: "S", result: "BATS", changeIndex: 2,
        options: ["S", "E", "T"], labels: { added: "means more than one!" },
        imageBefore: IMG("bat-flying"), imageAfter: IMG("bats"),
        successAudio: W("bats"), coachWrong: "Remember, we add s to the end to mean more than one. Try again!",
      },
    },
    {
      id: "apply-speak-bats",
      purpose: "apply",
      gate: "interaction",
      prompt: "Say the word for more than one!",
      image: IMG("bats"),
      narration: { audio: A("apply-speak-bats"), script: "Look at the picture. There is more than one flying friend up there. What word means more than one bat? Say it into the microphone, nice and clear." },
      interaction: { type: "speak", text: "bats" },
    },
    {
      id: "apply-choose-wave-ocean",
      purpose: "apply",
      gate: "interaction",
      prompt: "The **wave** splashed!",
      fx: {"text":"The big **wave** splashed on the sand.","effect":"underline"},
      narration: { audio: A("apply-choose-wave-ocean"), script: "You're a super word detective! Now, let's look at the word wave. Listen to this sentence. The big wave splashed on the sand. Tap the picture that matches the sentence." },
      interaction: { type: "choose", options: [{ id: "wave-ocean", label: "WAVE", audio: W("wave"), image: IMG("wave-ocean") }, { id: "wave-hand", label: "WAVE", audio: W("wave"), image: IMG("wave-hand") }], correctId: "wave-ocean", coachWrong: "That's a hand waving! Find the wave made of water." },
    },
    {
      id: "apply-choose-wave-action",
      purpose: "apply",
      gate: "interaction",
      prompt: "We **waved** goodbye!",
      fx: {"text":"We **waved** goodbye to Grandma.","effect":"underline"},
      narration: { audio: A("apply-choose-wave-action"), script: "Wonderful! Wave can also mean moving your hand to say hello or goodbye. Listen. We waved goodbye to Grandma. The ed ending tells us it already happened. Tap the picture that matches the sentence." },
      interaction: { type: "choose", options: [{ id: "wave-hand", label: "WAVE", audio: W("wave"), image: IMG("wave-hand") }, { id: "wave-ocean", label: "WAVE", audio: W("wave"), image: IMG("wave-ocean") }], correctId: "wave-hand", coachWrong: "That's the ocean wave! Find the hand saying goodbye." },
    },
    {
      id: "challenge-choose-rock-stone",
      purpose: "challenge",
      gate: "interaction",
      prompt: "We sat on the **rocks**.",
      fx: {"text":"We sat on the big gray **rocks**.","effect":"bounce"},
      narration: { audio: A("challenge-choose-rock-stone"), script: "You're ready for a challenge, Word Wizard! Listen to this sentence. We sat on the big gray rocks by the pond. The s tells us there is more than one. Tap the picture that matches the sentence." },
      interaction: { type: "choose", options: [{ id: "rock-stone", label: "ROCK", audio: W("rock"), image: IMG("rock-stone") }, { id: "rock-chair", label: "ROCK", audio: W("rock"), image: IMG("rock-chair") }], correctId: "rock-stone", coachWrong: "That's someone rocking in a chair! Find the hard stones you can sit on." },
    },
    {
      id: "challenge-choose-rock-action",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Ben **rocked** in his chair.",
      fx: {"text":"Ben **rocked** back and forth.","effect":"bounce"},
      narration: { audio: A("challenge-choose-rock-action"), script: "You got it! One more. Listen. Ben rocked back and forth in his chair. The ed ending tells us it already happened. Tap the picture that matches the sentence." },
      interaction: { type: "choose", options: [{ id: "rock-chair", label: "ROCK", audio: W("rock"), image: IMG("rock-chair") }, { id: "rock-stone", label: "ROCK", audio: W("rock"), image: IMG("rock-stone") }], correctId: "rock-chair", coachWrong: "Those are the hard stones! Find the picture that shows rocking back and forth." },
    },
    {
      id: "celebrate-lesson-complete",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You're a Word Wizard!",
      fx: {"text":"You're a **Double Duty** Word Wizard!","effect":"fireworks"},
      narration: { audio: A("celebrate-lesson-complete"), script: "Amazing job, Word Wizard! You found so many words that do double duty. You also learned that little endings like \"s\" and \"ed\" can help you know what a word means. Keep being a word detective!" },
    },
  ],
};
