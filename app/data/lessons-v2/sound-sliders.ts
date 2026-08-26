import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./sound-sliders-timings.json";

// Sound Sliders (RF.K.2c) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=sound-sliders

const A = (id: string) => `/audio/lessons-v2/sound-sliders/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/sound-sliders/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/sound-sliders/${w.toLowerCase()}.png`;

export const soundSlidersImages: Record<string, string> = {
  "slider-sam": "A friendly, green caterpillar character with a big smile, sitting on a wavy line that looks like a slide.",
  "c": "A bright red letter 'c' on a square tile.",
  "at": "A bright blue 'at' on a square tile.",
  "cat": "A fluffy orange cat, sitting with its tail curled.",
  "b": "A bright red letter 'b' on a square tile.",
  "bat": "A brown baseball bat leaning against a wall.",
  "m": "A bright red letter 'm' on a square tile.",
  "ap": "A bright blue 'ap' on a square tile.",
  "map": "A colorful treasure map, partially unrolled, with an 'X' marking a spot.",
  "t": "A bright red letter 't' on a square tile.",
  "op": "A bright blue 'op' on a square tile.",
  "top": "A spinning toy top, colorful and in motion.",
  "s": "A bright red letter 's' on a square tile.",
  "un": "A bright blue 'un' on a square tile.",
  "sun": "A bright yellow sun with smiling rays.",
  "rug": "A colorful, patterned oval rug on a wooden floor.",
  "bug": "A friendly ladybug with black spots on a green leaf.",
  "mug": "A ceramic coffee mug with a simple handle and steam rising.",
  "cup": "A blue plastic drinking cup filled with water."
};

export const soundSliders: LessonDef = {
  id: "sound-sliders",
  title: "Sound Sliders",
  grade: "Kindergarten",
  standard: "RF.K.2c",
  archetype: "phonics",
  objective: "I can slide sounds together to make a word and break a word into its parts!",
  concepts: ["blend and segment onsets and rimes of single-syllable spoken words: hear the first sound and the rest of the word separately (c...at), slide them together to make the whole word (cat), and break a whole word back into its two chunks"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You did it! You learned how to slide sounds together to make a whole word. You also learned how to break a word into its sound parts. You are a super sound slider!",
    "title": "You are a Sound Slider!",
    "body": "Fantastic work blending and segmenting word parts!"
  },
  scenes: [
    {
      id: "intro-slider-sam",
      purpose: "hook",
      gate: "none",
      prompt: "Meet Slider Sam!",
      image: IMG("slider-sam"),
      fx: {"text":"Slider Sam loves to **slide sounds together**!","effect":"pop-words"},
      narration: { audio: A("intro-slider-sam"), script: "Hello! This is Slider Sam. Sam loves to play with sounds. Listen to Sam's story about sliding sounds together!" },
    },
    {
      id: "model-blend-cat",
      purpose: "model",
      layout: "full",
      gate: "interaction",
      prompt: "Watch Sam slide sounds!",
      narration: { audio: A("model-blend-cat"), script: "Sam is going to show you how to slide sounds. First, tap the c to hear its sound. Then tap at. Then tap the whole word cat to slide them together!" },
      interaction: { type: "sequence", items: [{ id: "c", label: "c", audio: W("c"), image: IMG("c") }, { id: "at", label: "AT", audio: W("at"), image: IMG("at") }, { id: "cat", label: "CAT", audio: W("cat"), image: IMG("cat") }], order: ["c","at","cat"], coachWrong: "Listen to the sounds and watch Sam slide them together. Try again!" },
    },
    {
      id: "guided-blend-bat",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Help Sam slide sounds!",
      narration: { audio: A("guided-blend-bat"), script: "Great job watching Sam! Now it's your turn to help. Let's slide 'b' and 'at' together. Tap the 'b' sound, then 'at', then the whole word 'bat'." },
      interaction: { type: "sequence", items: [{ id: "b", label: "b", audio: W("b"), image: IMG("b") }, { id: "at", label: "AT", audio: W("at"), image: IMG("at") }, { id: "bat", label: "BAT", audio: W("bat"), image: IMG("bat") }], order: ["b","at","bat"], coachWrong: "Remember to tap the first sound, then the second sound, then the whole word. You can do it!" },
    },
    {
      id: "guided-blend-map",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Slide more sounds!",
      narration: { audio: A("guided-blend-map"), script: "You're getting so good at this! Let's slide two more sounds. Listen for 'm' and 'ap'. Then slide them to make 'map'." },
      interaction: { type: "sequence", items: [{ id: "m", label: "m", audio: W("m"), image: IMG("m") }, { id: "ap", label: "AP", audio: W("ap"), image: IMG("ap") }, { id: "map", label: "MAP", audio: W("map"), image: IMG("map") }], order: ["m","ap","map"], coachWrong: "Tap the two sound parts in order, then the whole word. Give it another try!" },
    },
    {
      id: "apply-blend-top",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Make a new word!",
      narration: { audio: A("apply-blend-top"), script: "Fantastic! Now try this one all by yourself. Slide 't' and 'op'. What word do you hear?" },
      interaction: { type: "sequence", items: [{ id: "t", label: "t", audio: W("t"), image: IMG("t") }, { id: "op", label: "OP", audio: W("op"), image: IMG("op") }, { id: "top", label: "TOP", audio: W("top"), image: IMG("top") }], order: ["t","op","top"], coachWrong: "Listen to the sounds and slide them in your mind. Then tap them in order!" },
    },
    {
      id: "apply-blend-sun",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Slide sounds, make a word!",
      narration: { audio: A("apply-blend-sun"), script: "You are a super sound slider! Here's another one. Listen for 's' and 'un'. Slide them together to make a word." },
      interaction: { type: "sequence", items: [{ id: "s", label: "s", audio: W("s"), image: IMG("s") }, { id: "un", label: "UN", audio: W("un"), image: IMG("un") }, { id: "sun", label: "SUN", audio: W("sun"), image: IMG("sun") }], order: ["s","un","sun"], coachWrong: "Remember to listen carefully to each sound and then slide them to make the word. Try again!" },
    },
    {
      id: "model-segment-cat",
      purpose: "model",
      layout: "full",
      gate: "interaction",
      prompt: "Watch Sam break words!",
      narration: { audio: A("model-segment-cat"), script: "We can also break words apart! Let's break cat into its two parts. Tap the whole word cat first. Then tap its first sound, c. Then tap the rest, at." },
      interaction: { type: "sequence", items: [{ id: "cat", label: "CAT", audio: W("cat"), image: IMG("cat") }, { id: "c", label: "c", audio: W("c"), image: IMG("c") }, { id: "at", label: "AT", audio: W("at"), image: IMG("at") }], order: ["cat","c","at"], coachWrong: "Watch Sam. First, we hear the whole word. Then we break it into its two sounds. Try again!" },
    },
    {
      id: "guided-segment-sun",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Help Sam break words!",
      narration: { audio: A("guided-segment-sun"), script: "Wonderful! Now let's help Sam break a word. Listen to 'sun'. Then, help Sam break it into its two parts: 's' and 'un'." },
      interaction: { type: "sequence", items: [{ id: "sun", label: "SUN", audio: W("sun"), image: IMG("sun") }, { id: "s", label: "s", audio: W("s"), image: IMG("s") }, { id: "un", label: "UN", audio: W("un"), image: IMG("un") }], order: ["sun","s","un"], coachWrong: "First tap the whole word 'sun'. Then tap its two sound parts. You can do it!" },
    },
    {
      id: "apply-segment-map",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Break this word!",
      narration: { audio: A("apply-segment-map"), script: "You are doing great at breaking words apart! Here is a word for you to break all by yourself. Listen to 'map'. Break it into its two sound parts." },
      interaction: { type: "sequence", items: [{ id: "map", label: "MAP", audio: W("map"), image: IMG("map") }, { id: "m", label: "m", audio: W("m"), image: IMG("m") }, { id: "ap", label: "AP", audio: W("ap"), image: IMG("ap") }], order: ["map","m","ap"], coachWrong: "Remember to tap the whole word first, then the two sounds you hear in it. Try again!" },
    },
    {
      id: "challenge-blend-rug",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Listen and choose!",
      narration: { audio: A("challenge-blend-rug"), script: "Now for a challenge! Listen carefully. Rrr. Ug. Slide those two sounds together in your mind. Which picture shows the word you made?" },
      interaction: { type: "choose", options: [{ id: "rug", label: "RUG", audio: W("rug"), image: IMG("rug") }, { id: "bug", label: "BUG", audio: W("bug"), image: IMG("bug") }, { id: "mug", label: "MUG", audio: W("mug"), image: IMG("mug") }], correctId: "rug", coachWrong: "Listen to 'r' and 'ug'. Slide them together in your mind. Which picture matches?" },
    },
    {
      id: "challenge-blend-bug",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Listen and choose!",
      narration: { audio: A("challenge-blend-bug"), script: "Another super sound challenge! Listen. B. Ug. Slide those sounds together. Which picture shows your word?" },
      interaction: { type: "choose", options: [{ id: "bug", label: "BUG", audio: W("bug"), image: IMG("bug") }, { id: "rug", label: "RUG", audio: W("rug"), image: IMG("rug") }, { id: "cup", label: "CUP", audio: W("cup"), image: IMG("cup") }], correctId: "bug", coachWrong: "Listen to 'b' and 'ug'. What word do those sounds make when they slide together? Pick the picture!" },
    },
    {
      id: "challenge-say-mug",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say the whole word!",
      narration: { audio: A("challenge-say-mug"), script: "Last one, and this time you get to SAY it! Listen. Mmm. Ug. Slide those sounds together and say the whole word out loud!" },
      interaction: { type: "speak", text: "mug" },
    },
    {
      id: "celebrate-sounds",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a Sound Slider!",
      image: IMG("slider-sam"),
      fx: {"text":"You are a **SUPER SOUND SLIDER**!","effect":"rainbow"},
      narration: { audio: A("celebrate-sounds"), script: "You did it! You learned how to slide sounds together to make a whole word. You also learned how to break a word into its sound parts. You are a super sound slider!" },
    },
  ],
};
