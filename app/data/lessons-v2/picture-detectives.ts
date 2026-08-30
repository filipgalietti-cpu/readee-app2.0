import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./picture-detectives-timings.json";

// Picture Detectives (RL.1.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=picture-detectives

const A = (id: string) => `/audio/lessons-v2/picture-detectives/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/picture-detectives/${w.toLowerCase()}.png`;

export const pictureDetectivesImages: Record<string, string | { subject: string; ref?: string }> = {
  "nora-card": "A cheerful girl with light brown skin and black curly hair in two puffs, wearing a yellow shirt, sitting at a wooden kitchen table making a greeting card, the folded white card standing on the table with one big red heart on its front and shiny gold glitter sparkles on the heart, a pair of scissors with red handles lying flat on the table beside the card, and a few small scraps of red paper on the table. No letters, no words, no numbers, no writing anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors.",
  "eli-steps": { subject: "A little boy with light brown skin and short black curly hair, wearing a green and white striped shirt, sitting alone on the front steps of a blue house with a white door, his chin resting in both hands, a sad face with a small frown and droopy eyes, and a small brown teddy bear sitting upright on the step right next to him. No letters, no words, no numbers, no writing anywhere.", ref: "nora-card" },
  "card-hug": { subject: "The same little boy with light brown skin, short black curly hair, and a green and white striped shirt jumping up and hugging the same girl with light brown skin, black curly hair in two puffs, and a yellow shirt, both with big happy open-mouth smiles, in front of the blue house with the white door, the girl holding up a folded white card with one big red heart and shiny gold glitter sparkles on it, and the small brown teddy bear still sitting upright on the steps. No letters, no words, no numbers, no writing anywhere.", ref: "eli-steps" },
};

export const pictureDetectives: LessonDef = {
  id: "picture-detectives",
  title: "Picture Detectives",
  grade: "1st Grade",
  standard: "RL.1.7",
  archetype: "inference",
  objective: "I can use the words and the picture together to describe a story.",
  concepts: ["words tell part of the story","the picture tells more","combine both to describe characters, setting, and events"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "What a picture detective you are! Words tell part of a story. Pictures tell more. When you put them together, you can describe the characters, the setting, and everything that happened.",
    "title": "Picture Detective!",
    "body": "You can use words and pictures together to describe a story."
  },
  scenes: [
    {
      id: "hook-two-tellers",
      purpose: "hook",
      gate: "none",
      prompt: "Every story has two tellers.",
      fx: {"text":"The **words** tell part. The **picture** tells more.","effect":"pop-words"},
      narration: { audio: A("hook-two-tellers"), script: "Hello, detective! Today we read a story about Nora and her little brother Eli. Every story page has two tellers. The words tell part of the story. The picture tells more. Your detective job: use both tellers to describe who, where, and what happened." },
    },
    {
      id: "read-page-one",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page one.",
      image: IMG("nora-card"),
      narration: { audio: A("read-page-one"), script: "Open our story, detective. Here is page one. Read the words, and keep your eyes on the picture. The picture always knows more." },
      interaction: { type: "read-along", text: "Nora made a card. It was for Eli.", audio: A("read-page-one-sentence") },
    },
    {
      id: "model-detective",
      purpose: "model",
      gate: "none",
      prompt: "Watch me use both tellers.",
      image: IMG("nora-card"),
      narration: { audio: A("model-detective"), script: "Watch me be a detective on page one. The words say: Nora made a card. It was for Eli. That is part of the story. Now I look at the picture for more. I see gold glitter on the card. I see scissors on the table. The words never said that. Now I put both tellers together: Nora sat at a table and made a glitter card for Eli. The words told part. The picture told more." },
    },
    {
      id: "guided-heart-detail",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which teller gave you this detail?",
      image: IMG("nora-card"),
      narration: { audio: A("guided-heart-detail"), script: "Your turn, detective. The words of page one say: Nora made a card. It was for Eli. Here is a detail: the card has a big red heart. Which teller gave you that detail? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "the-picture", label: "the picture" }, { id: "the-words", label: "the words" }, { id: "both-tellers", label: "both tellers" }], correctId: "the-picture", coachWrong: "Say page one in your head: Nora made a card. It was for Eli. Did those words say anything about a heart? Now check with your eyes. Try again!" },
    },
    {
      id: "speak-read-page-two",
      purpose: "guided",
      gate: "interaction",
      prompt: "Read page two out loud.",
      image: IMG("eli-steps"),
      narration: { audio: A("speak-read-page-two"), script: "Time for page two. It is short, and it is all yours. Tap the mic and read page two out loud, nice and clear." },
      interaction: { type: "speak", text: "Eli sat on the steps and waited for Nora" },
    },
    {
      id: "guided-eli-feel",
      purpose: "guided",
      gate: "interaction",
      prompt: "How did Eli feel while he waited?",
      image: IMG("eli-steps"),
      narration: { audio: A("guided-eli-feel"), script: "You read page two yourself. The words say Eli sat and waited for Nora. The words do not say how he felt. His face in the picture does. Look at Eli's face. How did he feel while he waited? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "sad", label: "sad" }, { id: "happy", label: "happy" }, { id: "mad", label: "mad" }], correctId: "sad", coachWrong: "The words only tell what Eli did. His face in the picture tells how he felt. Look at his mouth and his eyes. Try again!" },
    },
    {
      id: "apply-setting",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where did Eli wait?",
      image: IMG("eli-steps"),
      narration: { audio: A("apply-setting"), script: "Here is a setting question. The words of page two say Eli sat on the steps. The picture shows even more about where he sat. Look all around Eli. Which card describes the setting best? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "steps-blue-house", label: "on the steps of a blue house" }, { id: "sand-at-beach", label: "on the sand at the beach" }, { id: "rug-in-room", label: "on a rug in his room" }], correctId: "steps-blue-house", coachWrong: "The words say Eli sat on the steps. The picture shows what the steps belong to. Look behind Eli. Try again!" },
    },
    {
      id: "read-page-three",
      purpose: "apply",
      gate: "interaction",
      prompt: "Read page three.",
      image: IMG("card-hug"),
      narration: { audio: A("read-page-three"), script: "Turn to page three, detective. This is the big moment. Read the words, and watch the picture for extra clues." },
      interaction: { type: "read-along", text: "Nora ran out with the card. Eli jumped up. He gave her a big hug.", audio: A("read-page-three-sentence") },
    },
    {
      id: "apply-card-detail",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which teller gave you this detail?",
      image: IMG("card-hug"),
      narration: { audio: A("apply-card-detail"), script: "One more detail, from page three: Nora had the card. Careful, this one is tricky. Think about what the words of page three said. Then check the picture too. Which teller gave you that detail? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "both-tellers", label: "both tellers" }, { id: "the-words", label: "the words" }, { id: "the-picture", label: "the picture" }], correctId: "both-tellers", coachWrong: "Did the words say Nora ran out with the card? Now look at the picture. Can you see the card there too? Maybe more than one teller told you. Try again!" },
    },
    {
      id: "apply-sort-tellers",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Which teller told each detail?",
      narration: { audio: A("apply-sort-tellers"), script: "Now sort like a detective. Page three said: Nora ran out with the card. Eli jumped up. He gave her a big hug. Think back to the picture too. Read each detail card. Drag it to the teller that told it." },
      interaction: { type: "sort", buckets: ["Words","Picture"], items: [{ label: "Eli jumped up", bucket: "Words" }, { label: "the card has glitter", bucket: "Picture" }, { label: "Nora ran out", bucket: "Words" }, { label: "a teddy bear sat there", bucket: "Picture" }], coachWrong: "Which teller gave you that detail? If page three said it, drag it to Words. If you only saw it, drag it to Picture. Try again!" },
    },
    {
      id: "challenge-describe-nora",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Which card best describes Nora?",
      image: IMG("card-hug"),
      narration: { audio: A("challenge-describe-nora"), script: "Time to describe a character. Think about everything Nora did in the story. Then look at her face in the picture. Put both tellers together. Which card best describes Nora? Read each card. Tap your answer." },
      interaction: { type: "choose", options: [{ id: "kind-sister", label: "kind, she made a gift" }, { id: "mad-sister", label: "mad, she lost the card" }, { id: "sleepy-sister", label: "sleepy, she stayed in bed" }], correctId: "kind-sister", coachWrong: "Think about what Nora did in the story. Then look at her face in the picture. Put the words and the picture together. Try again!" },
    },
    {
      id: "challenge-speak-eli-feel",
      purpose: "challenge",
      gate: "interaction",
      prompt: "How did Eli feel at the end?",
      image: IMG("card-hug"),
      narration: { audio: A("challenge-speak-eli-feel"), script: "Last case, detective. At the end, the words say Eli jumped up and gave Nora a big hug. The picture shows his face. Put both tellers together. Tap the mic and say how Eli felt at the end." },
      interaction: { type: "speak", text: "happy glad joyful excited" },
    },
    {
      id: "celebrate-picture-detective",
      purpose: "celebrate",
      layout: "full",
      gate: "none",
      prompt: "You are a Picture Detective!",
      fx: {"text":"You are a **Picture Detective**!","effect":"fireworks"},
      narration: { audio: A("celebrate-picture-detective"), script: "You did it, picture detective! The words told you what Nora and Eli did. The pictures told you about the glitter, the sad face, and the big smiles. When you read a story, use both tellers. Ask: what do the words say? And what does the picture show?" },
    },
  ],
};
