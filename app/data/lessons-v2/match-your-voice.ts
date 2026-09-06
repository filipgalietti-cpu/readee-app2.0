import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./match-your-voice-timings.json";

// Match Your Voice (L.2.3) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=match-your-voice
// L.2.3a register lane: playground voice (informal, relaxed, for friends and
// family) vs school voice (formal, careful and polite, for teachers, grown-ups
// you just met, notes and cards). Both voices framed as GOOD; the skill is
// matching voice to listener and moment, never "correct vs incorrect English".
// Lane grep-verified fresh: letter-perfect owns apostrophe/capital MECHANICS
// (its "Dear Gram," comma lane avoided here), look-it-up/word-solvers touch
// please/thank-you only incidentally. Characters fresh: Rafi, Otis, Mr. Soto,
// Mrs. Vale (Marco/Theo/Mrs. Chen collisions avoided).

const A = (id: string) => `/audio/lessons-v2/match-your-voice/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/match-your-voice/${w.toLowerCase()}.png`;

export const matchYourVoiceImages: Record<string, string> = {
  "recess-ball": "A sunny school playground at recess, a red rubber ball flying through the air between two happy boys, one boy with arms up ready to catch, swings and a green slide in the background, plain blue sky, no faces on objects. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "gift-envelope": "A wrapped purple birthday gift box with a big yellow bow sitting on a small wooden table, a plain white envelope with no writing leaning against the box, warm cozy living room background, no people, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "park-hoops": "A boy dribbling an orange basketball under an outdoor hoop in a green park, another happy boy waving hello as he walks up the path, trees and a wooden bench in the background, plain blue sky, no faces on objects. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere.",
  "classroom-pencils": "A teacher's wooden desk in a bright cheerful classroom with a cup of colorful pencils and a small green plant on top, a plain sunny yellow wall behind it, no people, no faces on any object. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no text anywhere."
};

export const matchYourVoice: LessonDef = {
  id: "match-your-voice",
  title: "Match Your Voice",
  grade: "2nd Grade",
  standard: "L.2.3",
  archetype: "vocabulary",
  objective: "I can match my playground voice and my school voice to the listener and the moment.",
  concepts: ["playground voice is relaxed, short, and easy: hey, wanna, see ya (friends and family)", "school voice is careful and polite: please, may I, could you, full sentences (teachers, grown-ups you just met, notes and cards)", "neither voice is wrong: good talkers match the voice to the listener and the moment", "the same message can wear either voice"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You can match your voice to any moment now. Playground voice for friends, short and relaxed. School voice for teachers and thank-you cards, careful and polite. Both are good voices. The smart move is picking the one that fits the listener and the moment.",
    "title": "Voice Matcher!",
    "body": "You spotted both voices, sorted them, and spoke each one at just the right moment."
  },
  scenes: [
    {
      id: "hook-same-ball",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Read Rafi's two asks with me.",
      image: IMG("recess-ball"),
      narration: { audio: A("hook-same-ball"), script: "Hello, reader. You already own two voices, and today you will learn when to use each one. Rafi asked for the same ball two times in one day, but he did not ask the same way twice. Read what happened, and listen for the switch." },
      interaction: { type: "read-along", text: "At recess, Rafi called to his friend Otis. \"Hey! Toss me the ball!\" The ball sailed over, easy as that. After lunch, the ball rolled behind the principal, Mr. Soto. Rafi stood up tall. \"Excuse me, Mr. Soto. Could you please pass me the ball?\" Rafi wanted the same ball both times, but he asked in two very different ways.", audio: A("hook-same-ball-sentence") },
    },
    {
      id: "model-playground-voice",
      purpose: "model",
      gate: "none",
      prompt: "Playground voice is short, relaxed, and easy.",
      fx: {"text":"**Hey!** Toss me the ball!","effect":"pop-words"},
      narration: { audio: A("model-playground-voice"), script: "That first ask was Rafi's playground voice. It is short, relaxed, and easy. It loves little words like hey, wanna, and see ya. Friends and family hear this voice all the time, and it is a good voice. It is exactly right for recess, the park, and the lunch table with your buddies." },
    },
    {
      id: "model-school-voice",
      purpose: "model",
      gate: "none",
      prompt: "School voice is careful and polite.",
      fx: {"text":"**Could you please** pass me the ball?","effect":"underline"},
      narration: { audio: A("model-school-voice"), script: "The second ask was Rafi's school voice. It is careful and polite. It uses words like please, may I, and could you, and it speaks in full sentences. Teachers, the principal, and grown-ups you just met hear this voice. Now here is the secret. Neither voice is wrong. Good talkers match the voice to the listener and the moment." },
    },
    {
      id: "guided-spot-school",
      purpose: "guided",
      gate: "interaction",
      prompt: "Four kids asked someone to play. Which ask is school voice?",
      narration: { audio: A("guided-spot-school"), script: "Time to spot the voices. Four kids asked someone to play a game. Three used the playground voice. Only one used the school voice, careful and polite, in a full sentence. Read each ask. Tap the school voice." },
      interaction: { type: "choose", options: [{ id: "would-you-like-to-play", label: "would you like to play?" }, { id: "wanna-play", label: "wanna play?" }, { id: "come-play-dude", label: "come play, dude!" }, { id: "get-over-here-and-play", label: "get over here and play!" }], correctId: "would-you-like-to-play", coachWrong: "That ask is playground voice, short and relaxed. You want the careful, polite ask. Try again!" },
    },
    {
      id: "guided-card-grandma",
      purpose: "guided",
      gate: "interaction",
      prompt: "Rafi is writing a thank-you card to Grandma. Which line fits?",
      image: IMG("gift-envelope"),
      narration: { audio: A("guided-card-grandma"), script: "Now match the voice to the moment. Grandma mailed Rafi a birthday gift, and he is writing her a thank-you card. A card is careful writing, so it wants the school voice. Read each line. Tap the one that belongs in the card." },
      interaction: { type: "choose", options: [{ id: "thank-you-for-the-gift", label: "thank you for the gift." }, { id: "you-rock-grandma", label: "you rock, grandma!" }, { id: "best-gift-ever-dude", label: "best gift ever, dude!" }, { id: "epic-gift-high-five", label: "epic gift! high five!" }], correctId: "thank-you-for-the-gift", coachWrong: "That line is fun playground voice for a friend. A card wants careful, polite words. Try again!" },
    },
    {
      id: "guided-park-friend",
      purpose: "guided",
      gate: "interaction",
      prompt: "Rafi spots his best friend at the park. Which hello fits?",
      image: IMG("park-hoops"),
      narration: { audio: A("guided-park-friend"), script: "The playground voice gets its turn, because it is never wrong at the park. Rafi spots his best friend Otis shooting hoops. Old friends use the relaxed voice, short and easy. Read each hello. Tap the one that fits two best friends." },
      interaction: { type: "choose", options: [{ id: "hey-wanna-shoot-hoops", label: "hey! wanna shoot hoops?" }, { id: "good-afternoon-sir", label: "good afternoon, sir." }, { id: "it-is-nice-to-meet-you", label: "it is nice to meet you." }, { id: "may-i-join-your-game", label: "may i join your game?" }], correctId: "hey-wanna-shoot-hoops", coachWrong: "That hello is careful school voice. Best friends at the park keep it short and relaxed. Try again!" },
    },
    {
      id: "apply-sort-voices",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each line: playground voice or school voice.",
      narration: { audio: A("apply-sort-voices"), script: "Sorting time. Read each line and say it in your head. Is it short and relaxed, for friends? Or careful and polite, for a teacher or a grown-up you just met? Drag each line to its voice." },
      interaction: { type: "sort", buckets: ["Playground Voice","School Voice"], items: [{ label: "wanna come?", bucket: "Playground Voice" }, { label: "would you like to come?", bucket: "School Voice" }, { label: "see ya!", bucket: "Playground Voice" }, { label: "have a good day.", bucket: "School Voice" }, { label: "no way!", bucket: "Playground Voice" }, { label: "no, thank you.", bucket: "School Voice" }], coachWrong: "Say the line in your head. Would you say it to your buddy, or to your teacher? Try again!" },
    },
    {
      id: "apply-school-clothes",
      purpose: "apply",
      gate: "interaction",
      prompt: "Rafi asks his teacher for a pencil. Which ask is school voice?",
      image: IMG("classroom-pencils"),
      narration: { audio: A("apply-school-clothes"), script: "Same message, new voice. At recess, Rafi might tell Otis, gimme a pencil. Now Rafi is asking his teacher, Mrs. Vale, so the message needs polite words and a full sentence. Read each ask. Tap the school voice way." },
      interaction: { type: "choose", options: [{ id: "may-i-borrow-a-pencil", label: "may i borrow a pencil?" }, { id: "i-want-a-pencil", label: "i want a pencil." }, { id: "toss-me-a-pencil", label: "toss me a pencil!" }, { id: "got-a-pencil-for-me", label: "got a pencil for me?" }], correctId: "may-i-borrow-a-pencil", coachWrong: "That one still sounds like recess. The teacher ask wants polite words in a full sentence. Try again!" },
    },
    {
      id: "apply-match-moments",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which moment wants your playground voice?",
      narration: { audio: A("apply-match-moments"), script: "Voices match moments, not just people. Three of these moments want the careful school voice. Only one is a playground voice moment, loud, relaxed, and just for fun. Read each moment. Tap the playground voice moment." },
      interaction: { type: "choose", options: [{ id: "cheering-at-a-soccer-game", label: "cheering at a soccer game" }, { id: "meeting-the-new-principal", label: "meeting the new principal" }, { id: "a-card-for-your-teacher", label: "a card for your teacher" }, { id: "asking-a-librarian-for-help", label: "asking a librarian for help" }], correctId: "cheering-at-a-soccer-game", coachWrong: "That moment calls for careful, polite words. Find the loud, just-for-fun moment. Try again!" },
    },
    {
      id: "challenge-speak-playground",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say a playground voice hello to a friend.",
      narration: { audio: A("challenge-speak-playground"), script: "Challenge time. Your best friend just walked into the park. Give them a playground voice hello, short, easy, and friendly. Tap the mic and say your hello." },
      interaction: { type: "speak", text: "hey hiya sup wassup howdy hello what's whats" },
    },
    {
      id: "challenge-speak-school",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Ask for help in your school voice.",
      narration: { audio: A("challenge-speak-school"), script: "Last challenge. You are stuck on a tricky page, and your teacher is close by. Ask for help in your school voice, careful and polite, in a full sentence. Tap the mic and ask your question." },
      interaction: { type: "speak", text: "please could may would excuse pardon help" },
    },
    {
      id: "celebrate-two-voices",
      purpose: "celebrate",
      gate: "none",
      prompt: "You can match your voice!",
      fx: {"text":"**Hey!** or **Could you please?**","effect":"fireworks"},
      narration: { audio: A("celebrate-two-voices"), script: "You can match your voice now. Your playground voice is short and relaxed, perfect for friends and family. Your school voice is careful and polite, perfect for teachers, thank-you cards, and grown-ups you just met. Both voices are good ones. Pick the one that fits the listener and the moment, and you will always sound just right." },
    },
  ],
};
