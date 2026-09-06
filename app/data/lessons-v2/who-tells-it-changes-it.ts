import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./who-tells-it-changes-it-timings.json";

// Who Tells It Changes It (RL.4.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=who-tells-it-changes-it
// G4-U2. FIRST PERSON VS THIRD PERSON, TWO TELLINGS OF ONE MOMENT tier of
// RL.4.6 (sibling split: whos-telling-it RL.1.6 owns G1 character-vs-narrator
// with quote marks (Rosa, Ben, the duck); two-ways-to-see RL.2.6 owns two
// characters feeling differently about one event (Rose, Ben, the storm);
// their-view-your-view RL.3.6 owns the narrator's OPINION in her word choice
// vs the characters' views vs the reader's own view (Sylvie, Elias, the marble
// run) and its "view" frame, so the taught terms here are narrator, first
// person, third person, and "view" is only used in passing; three-ways-to-
// tell-it RL.4.5 (parallel producer) says only that prose has a narrator and
// never names person, and no poem or drama term appears here; the-authors-view
// / why-authors-write are RI and untouched; words-from-the-myths RL.4.4 owns
// allusion, none here). THIS lesson owns the G4 step-up: the pronoun SIGNAL
// (I, me, my vs he, she, they and names) names the person; a first person
// narrator can know only his own thoughts and what he sees, so his reading of
// another person is a guess the reader can catch; a third person narrator
// stands outside and can go inside more than one head; the same moment told
// twice is COMPARED for what each telling can know; the signal is tapped,
// the person named against second-person / no-narrator traps, the move is
// sequenced, six sentences are sorted, the thing the first person narrator
// misses is found, the words that PROVE third person are chosen as best
// evidence, and the comparison is produced aloud. ONE fresh moment, "The
// Scratch": Cormac, ten, returns cousin Gretchen's new blue scooter with a
// scratch on the deck after the kickstand slipped outside the library; she
// goes still, looks at her own sleeve, says nothing, and he reads the silence
// as anger and offers his allowance (version A, first person, 6 complex
// sentences over two read-along pages); version B (third person, 6 sentences
// over two read-along pages) goes inside Gretchen, who had caught the deck on
// an iron gatepost on Tuesday and rubbed at it with her jacket sleeve, whose
// cuff still carries a faint blue smear, and who feels her ears go hot before
// she confesses; page five is the third person ending read by the child
// (accept mode, 55 tokens, no " my " and no " I " token). 16 sentences over 5
// pages, relative pronouns (which, that), past perfect, dialogue with an
// action beat ("Keep your allowance," she said, tugging the cuff down over her
// hand), stretch words kickstand / practicing / allowance / smear / confess,
// no digits, no contractions in read-along or speak text. Guided snippets are
// fresh (a bus pulling away, a girl and a clerk counting coins). ANCHOR
// FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: Cormac,
// Gretchen, scooter, kickstand, gatepost, deck-scratch, cuff smear, allowance
// offer, Tilly, Dex, penalty kick, goalie, referee all 0 hits (garage was
// avoided because words-from-the-myths sells one; "scratchy waltz" in
// greek-and-latin-roots is a sound, not a scratch). Keys prefixed quiz- are
// picture supports for the quiz's fresh second moment (The Penalty Kick:
// Tilly the kicker, Dex the goalie who grins when frightened).

const A = (id: string) => `/audio/lessons-v2/who-tells-it-changes-it/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/who-tells-it-changes-it/${w.toLowerCase()}.png`;

export const whoTellsItChangesItImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-a1": "A ten year old boy with light brown skin, short curly black hair, a green t-shirt and tan shorts walking a bright blue kick scooter along a sidewalk beside a long red brick wall on a sunny afternoon, looking down at the scooter with a worried face, one pale scratch visible across the blue deck of the scooter, a few green trees behind the wall. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-a2": { subject: "The same ten year old boy with light brown skin, short curly black hair, a green t-shirt and tan shorts standing on a front path holding the same bright blue kick scooter turned sideways so its scratched blue deck faces a twelve year old girl with pale skin, freckles, a long red braid and a yellow zip-up jacket, who sits very still on the wooden front steps of a small white house and looks down at the cuff of her own jacket sleeve, not at the boy, late afternoon light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-a1" },
  "page-b2": { subject: "A close view of the same twelve year old girl with pale skin, freckles, a long red braid and a yellow zip-up jacket sitting on the wooden front steps of the same small white house, tugging the yellow cuff of her jacket sleeve down over one hand with her other hand, a faint blue smudge on that cuff, her ears and cheeks pink, while the same ten year old boy with light brown skin, short curly black hair and a green t-shirt stands beside the bright blue kick scooter with his mouth open in the middle of talking. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-a1" },
  "quiz-penalty-spot": "A grass soccer field on an overcast day, a ten year old girl with dark brown skin, short black hair held by a red headband, a plain red jersey with no number, black shorts and shin guards bending to place a white soccer ball on the grass in front of a goal, while a ten year old boy with pale skin, messy blond hair, a plain green goalkeeper jersey with no number and big green gloves crouches on the goal line with a wide nervous grin and one boot lace hanging untied, a white net behind him, no crowd. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain jerseys with no numbers, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-goalie-relief": { subject: "The same ten year old boy with pale skin, messy blond hair, a plain green goalkeeper jersey with no number and big green gloves sitting on the grass on the goal line with his gloves resting on his knees and a relieved smile, the white soccer ball rolling away past the outside of the goalpost, the same ten year old girl with dark brown skin, a red headband and a plain red jersey standing on the penalty spot with both hands on her head, a white net, no crowd. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, plain jerseys with no numbers, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-penalty-spot" }
};

export const whoTellsItChangesIt: LessonDef = {
  id: "who-tells-it-changes-it",
  title: "Who Tells It Changes It",
  grade: "4th Grade",
  standard: "RL.4.6",
  archetype: "story-elements",
  objective: "I can find the signal words, name first or third person, say what the narrator can and cannot know, and compare two tellings of one moment.",
  concepts: [
    "the little words a teller uses are the signal: I, me, my mean first person, he, she, they and names mean third person",
    "a first person narrator is a character inside the story and can know only his own thoughts and what he sees",
    "a first person narrator can be wrong about other people, and the reader can catch the clue he cannot read",
    "a third person narrator stands outside the story and can go inside more than one head",
    "the same moment told by two narrators lets the reader know different things",
    "find the signal, name the person, say what the narrator can know",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You compared two tellings of The Scratch. First person gave you Cormac's inside view and his mistaken guess. Third person gave you Gretchen's memory too, and the same silence meant something new. From now on, find the teller before you trust the telling.",
    "title": "Who Tells It Changes It",
    "body": "You found the signal words, named first and third person, and compared what each teller could know."
  },
  scenes: [
    {
      id: "hook-page-a1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Scratch, version A, page one. Read along!",
      image: IMG("page-a1"),
      narration: { audio: A("hook-page-a1"), script: "Hello, reader. Every story has a teller, and the teller decides what you get to know. Today you will read one moment twice, told by two different tellers, and you will watch how the telling changes what a reader can know. Here is version A of The Scratch, page one. Read along with me, and notice the little word the teller uses for himself." },
      interaction: { type: "read-along", text: "I had promised Gretchen that her new scooter would come back exactly the way it left, and for six days I kept that promise. On the seventh day, the kickstand slipped while I was locking it outside the library, and the scooter tipped against the brick wall, which left a pale scratch across the blue paint of the deck. I walked it home the long way, practicing an apology that got longer at every corner.", audio: A("hook-page-a1-sentence") },
    },
    {
      id: "hook-page-a2",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Version A, page two. Read along, and watch Gretchen.",
      image: IMG("page-a2"),
      narration: { audio: A("hook-page-a2"), script: "Page two of version A. Read along with me, and watch what Gretchen does with her sleeve, because the teller sees it and cannot explain it." },
      interaction: { type: "read-along", text: "Gretchen was waiting on her front steps, and when I turned the scooter so that the scratch faced her, she went very still. She looked at the scratch for a long time, and then she looked at her own sleeve, and she did not say a single word. I knew that silence, because I had heard it from teachers, and it meant that she was too angry to speak, so I offered her every dollar of my allowance until summer.", audio: A("hook-page-a2-sentence") },
    },
    {
      id: "model-first-person",
      purpose: "model",
      gate: "none",
      prompt: "First person: a character inside tells it as I.",
      fx: {"text":"**I** knew that silence","effect":"underline"},
      narration: { audio: A("model-first-person"), script: "Here is the first thing a fourth grade reader checks. Who is telling this? Look at the little words the teller uses for himself. I had promised. I kept that promise. My allowance. A teller who says I, me, and my is a character inside the story, and we call that first person. Now the question that matters. What can a first person narrator know? He knows his own thoughts, so we get the practiced apology and the long walk home. He knows what he sees, so we get her stillness and her long look at the scratch. But he cannot get inside anyone else. When he says that her silence meant she was too angry to speak, that is a guess, and the story never says he is right. A first person narrator can be wrong about other people, and a careful reader watches for the clue the narrator cannot read. On page two there is one. She looked at her own sleeve." },
    },
    {
      id: "guided-page-b1",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "The Scratch, version B, page one. Read along!",
      narration: { audio: A("guided-page-b1"), script: "Now the same moment again, told by a different teller. This is version B, page one. Read along with me, and listen for who is telling it this time." },
      interaction: { type: "read-along", text: "Cormac turned the scooter so that the scratch faced Gretchen, and he began the apology he had practiced all the way home. Gretchen did not hear most of it, because she was staring at the pale line on the deck and remembering the iron gatepost. On Tuesday, before she had lent the scooter to anyone, she had caught the deck on the corner of that gatepost, and she had rubbed at the scratch with the sleeve of her jacket until she decided that nobody would notice.", audio: A("guided-page-b1-sentence") },
    },
    {
      id: "guided-page-b2",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Version B, page two. Read along, and watch the cuff.",
      image: IMG("page-b2"),
      narration: { audio: A("guided-page-b2"), script: "Version B, page two. Read along with me, and notice whose thoughts this teller can show." },
      interaction: { type: "read-along", text: "Now Cormac was offering her his allowance for a scratch that she had made herself, and Gretchen could feel her ears turning hot. She looked at her sleeve, which still had a faint blue smear on the cuff, and she wondered whether he would believe her. \"Keep your allowance,\" she said, tugging the cuff down over her hand, \"because that scratch was already there.\"", audio: A("guided-page-b2-sentence") },
    },
    {
      id: "model-third-person",
      purpose: "model",
      gate: "none",
      prompt: "Third person: a teller outside the story.",
      fx: {"text":"Same moment, **two tellers**","effect":"pop-words"},
      narration: { audio: A("model-third-person"), script: "Same moment, different teller. This narrator never says I. It says Cormac, Gretchen, he, and she, and it stands outside the story, so we call that third person. Here is what a third person narrator can do that a first person narrator cannot. It can go inside more than one head. On these pages it goes inside Gretchen, and we learn what Cormac could never know from where he stood. She was remembering the gatepost. She had made the scratch herself. Her ears were hot because she felt caught, not because she was angry. So the silence that Cormac read as anger was really Gretchen deciding whether to confess. Same steps, same scratch, same silence, but who tells it changes what we can know. In first person we knew Cormac's guess. In third person we also know Gretchen's secret." },
    },
    {
      id: "guided-highlight-signal",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Tap the three words that signal first person.",
      narration: { audio: A("guided-highlight-signal"), script: "Your turn to find the signal. A new sentence is on your screen, and a character is telling it. Tap every little word the teller uses for himself or herself. There are three of them, and they are the words that prove first person." },
      interaction: { type: "highlight", text: "When the bus pulled away without me, I stood on the corner holding the wrong bag, and my face went hot.", targets: ["me", "I", "my"], coachWrong: "That word names a thing or an action. Find the little words that stand for the teller." },
    },
    {
      id: "guided-choose-person-coins",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which kind of teller is this?",
      narration: { audio: A("guided-choose-person-coins"), script: "Now name the person from the signal. Four labels are on your screen. Two of them are the labels you learned today, and two of them are traps. Listen to the sentence, find the little words the teller uses, and tap the right label. Here is the sentence. The girl counted the coins twice, then slid them across the counter, and she hoped the clerk would not count them again." },
      interaction: { type: "choose", options: [{ id: "third-person", label: "third person" }, { id: "first-person", label: "first person" }, { id: "second-person", label: "second person" }, { id: "no-narrator-at-all", label: "no narrator at all" }], correctId: "third-person", coachWrong: "Find the word the teller uses for the girl, and ask whether that teller is inside the story or outside it." },
    },
    {
      id: "guided-choose-person-clerk",
      purpose: "guided",
      gate: "interaction",
      prompt: "Same coins, new teller. Which kind is it?",
      narration: { audio: A("guided-choose-person-clerk"), script: "The same coins, but a different teller. Listen again, find the signal, and tap the label. Here is the sentence. The clerk counted the coins a third time, and my face went warm while the line behind me grew longer." },
      interaction: { type: "choose", options: [{ id: "first-person", label: "first person" }, { id: "third-person", label: "third person" }, { id: "second-person", label: "second person" }, { id: "no-narrator-at-all", label: "no narrator at all" }], correctId: "first-person", coachWrong: "Find the words the teller uses for the face and the line. Does this teller stand outside the story, or inside it?" },
    },
    {
      id: "guided-choose-third-knows",
      purpose: "guided",
      gate: "interaction",
      prompt: "What could only the third person teller know?",
      narration: { audio: A("guided-choose-third-knows"), script: "Here is the comparison move. Two tellers told the same moment on the steps, and one of them could know something the other could not. Four things from the story are on your screen. Three of them Cormac could know from where he stood, so both tellers could tell them. One of them only the third person teller could reach. Tap it." },
      interaction: { type: "choose", options: [{ id: "what-gretchen-remembered", label: "what gretchen remembered" }, { id: "what-the-scratch-looked-like", label: "what the scratch looked like" }, { id: "what-cormac-had-practiced", label: "what cormac had practiced" }, { id: "where-gretchen-was-waiting", label: "where gretchen was waiting" }], correctId: "what-gretchen-remembered", coachWrong: "Cormac could see that, or he did it himself, so the first person teller could tell it too. Find the one that lives inside Gretchen's head." },
    },
    {
      id: "apply-sequence-the-move",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Put the three steps of the move in order.",
      narration: { audio: A("apply-sequence-the-move"), script: "The move you have been making has three steps, and they only work in one order. Drag the three steps into the order a reader does them." },
      interaction: { type: "sequence", items: [{ id: "find-the-signal-words", label: "find the signal words" }, { id: "name-the-person", label: "name the person" }, { id: "say-what-it-can-know", label: "say what it can know" }], order: ["find-the-signal-words", "name-the-person", "say-what-it-can-know"], coachWrong: "A reader cannot name the person before finding the signal, and cannot say what the teller knows before naming the person." },
    },
    {
      id: "apply-sort-first-third",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: First Person, or Third Person?",
      narration: { audio: A("apply-sort-first-third"), script: "Six sentences are on your screen, each with its own teller. Find the little words in each one. If the teller uses the words for himself or herself, drag it to First Person. If the teller stands outside and uses names or the words for someone else, drag it to Third Person." },
      interaction: { type: "sort", buckets: ["First Person","Third Person"], items: [{ label: "i heard the gate slam", bucket: "First Person" }, { label: "she heard the gate slam", bucket: "Third Person" }, { label: "nobody had warned me", bucket: "First Person" }, { label: "he hid behind the fence", bucket: "Third Person" }, { label: "the mud soaked my boots", bucket: "First Person" }, { label: "the twins found her hat", bucket: "Third Person" }], coachWrong: "Hunt for the little word. I, me, and my mean the teller is inside. He, she, and names mean the teller is outside." },
    },
    {
      id: "apply-page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page five: Cormac stared at the blue smear on the cuff and then at the scratch on the deck, and the apology drained slowly out of his face. Gretchen told him about the gatepost and the jacket sleeve. For a moment neither cousin said anything at all. Then both of them started laughing at the same time.",
      narration: { audio: A("apply-page-5-read"), script: "The story ends in third person, and this page is yours. Read all four sentences out loud, and notice that this teller can show both cousins at once." },
      interaction: { type: "speak", text: "Cormac stared at the blue smear on the cuff and then at the scratch on the deck and the apology drained slowly out of his face Gretchen told him about the gatepost and the jacket sleeve For a moment neither cousin said anything at all Then both of them started laughing at the same time" },
    },
    {
      id: "apply-choose-narrator-misses",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does the first person teller not know here?",
      narration: { audio: A("apply-choose-narrator-misses"), script: "Back to version A for the sharpest question. Listen to Cormac's line again, and remember that he is the teller. Then tap the thing he does not know, the thing only version B could tell you. Here is his line. She looked at the scratch for a long time, and then she looked at her own sleeve, and she did not say a single word." },
      interaction: { type: "choose", options: [{ id: "she-made-the-scratch-herself", label: "she made the scratch herself" }, { id: "the-kickstand-had-slipped", label: "the kickstand had slipped" }, { id: "the-scooter-was-gretchens", label: "the scooter was gretchen's" }, { id: "she-was-waiting-on-the-steps", label: "she was waiting on the steps" }], correctId: "she-made-the-scratch-herself", coachWrong: "Cormac knew that one, because he saw it or did it himself. Find the thing he could not see, the thing that was inside Gretchen." },
    },
    {
      id: "apply-choose-best-evidence-third",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words prove version B is third person?",
      narration: { audio: A("apply-choose-best-evidence-third"), script: "Best evidence. Four pieces of version B, page two, are on your screen, and all four are really there. Only one of them holds the signal, the little words a teller uses for someone else. The rest name things, or come from inside quotation marks, where Gretchen is talking and the words are hers, not the teller's. Tap the words that prove third person." },
      interaction: { type: "choose", options: [{ id: "she-looked-at-her-sleeve", label: "she looked at her sleeve" }, { id: "keep-your-allowance", label: "keep your allowance" }, { id: "a-faint-blue-smear", label: "a faint blue smear" }, { id: "already-there", label: "already there" }], correctId: "she-looked-at-her-sleeve", coachWrong: "Those words name a thing, or Gretchen is saying them out loud. Find the piece where the teller uses a little word for Gretchen." },
    },
    {
      id: "challenge-speak-compare",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Compare the two tellings. Say what each teller lets us know.",
      narration: { audio: A("challenge-speak-compare"), script: "Last one, and you make the comparison out loud. Tap the mic, then say, in first person we know, and finish it with what Cormac's telling lets you know. After that, say, in third person we also know, and finish it with what only Gretchen's page could tell you." },
      interaction: { type: "speak", text: "first third person narrator narrators cormac gretchen know knows knew known thoughts thinking guess guessed remembered remembering scratch sleeve cuff smear gatepost tuesday apology allowance angry silent silence ears hot secret confess inside only also both" },
    },
    {
      id: "celebrate-who-tells-it",
      purpose: "celebrate",
      gate: "none",
      prompt: "Who tells it changes it.",
      fx: {"text":"**Who tells it** changes it","effect":"fireworks"},
      narration: { audio: A("celebrate-who-tells-it"), script: "You read one moment twice today. When Cormac told it, you got his thoughts, his guess, and nothing else, because a first person teller can only know what he sees and thinks. When a teller outside the story told it, you got inside Gretchen too, and the silence changed its meaning. Find the signal. Name the person. Say what the teller can know. Who tells it changes it." },
    },
  ],
};
