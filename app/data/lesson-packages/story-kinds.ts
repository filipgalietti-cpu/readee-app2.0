import type { LessonDef, SceneDef, ReferencePageDef, ChooseDef } from "@/lib/lesson-engine/types";
import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { Band } from "@/lib/lesson-engine/production/adaptive";
import { storyKinds } from "@/app/data/lessons-v2/story-kinds";
import { collectSpeech } from "@/lib/lesson-engine/delivery/content";
import { referencePageSpeech } from "@/lib/lesson-engine/delivery/reference-page";
import { spokenSentences } from "@/lib/lesson-engine/delivery/sentences";

// RL.K.5 correction approved by the founder September 14, 2026. The legacy
// source is preserved. Text type is evidenced by the words, never the subject.
export const shelfAsset = (name: string) => `/lesson-studio/story-kinds/${name}`;
const pic = (name: string) => shelfAsset(name + ".webp");
const n = (script: string) => ({ audio: "", script });
const f = (correct: string, hint: string) => ({ correct, hint, incorrect: hint });
export type ShelfBook = {
  title: string;
  text: string;
  image: string;
  alt: string;
  kind: "Storybook" | "Information book" | "Poem";
  clue: string;
};
export const shelfBooks: Record<string, ShelfBook> = {
  story: {
    title: "Hat on the Train",
    text: "Sam’s red hat fell. Dad picked it up. Sam smiled.",
    image: pic("train-story"),
    alt: "Sam smiles as Dad returns his red hat inside a train.",
    kind: "Storybook",
    clue: "We follow Sam and Dad and what happens. A story can tell about things that could really happen.",
  },
  information: {
    title: "Trains on Tracks",
    text: "Trains have wheels that run on rails. Trains carry people from place to place.",
    image: pic("train-facts"),
    alt: "A passenger train on two rails beside a station platform.",
    kind: "Information book",
    clue: "These words teach us facts about trains.",
  },
  poem: {
    title: "Clickety-Clack",
    text: "Clickety-clack, down the track.\nTrees rush past.\nHome at last!",
    image: pic("train-poem"),
    alt: "Trees and a small house seen through a moving train’s window.",
    kind: "Poem",
    clue: "Hear the beat and the matching sounds: clack, track, past, last. This poem plays with sounds.",
  },
  leaf: {
    title: "Little Yellow Boat",
    text: "One yellow leaf\nfloats on the puddle,\na little boat\nwith no one aboard.",
    image: pic("leaf-poem"),
    alt: "A yellow leaf floats like a little boat on a rain puddle.",
    kind: "Poem",
    clue: "This poem makes a picture with words. Its lines do not need to rhyme.",
  },
  pig: {
    title: "A Flying Pig",
    text: "A pig flew high. It waved bye-bye!",
    image: pic("flying-pig"),
    alt: "A storybook pig with wings waves from a soft cloud.",
    kind: "Storybook",
    clue: "This tiny story tells what a pig does. These events are make-believe. Some stories rhyme, too!",
  },
  farm: {
    title: "About Pigs",
    text: "Pigs live on farms. They roll in mud.",
    image: pic("pigs-facts"),
    alt: "Pigs cooling in a muddy patch on a farm.",
    kind: "Information book",
    clue: "This passage teaches facts about pigs. The words give us the clue, not just the pig picture.",
  },
  cat: {
    title: "The Lost Mitten",
    text: "A cat found a mitten. She carried it to Kit. Kit gave her a gentle pat.",
    image: pic("cat-story"),
    alt: "A child gently pats a cat beside a red mitten.",
    kind: "Storybook",
    clue: "We follow the cat, Kit, and what happens to the mitten.",
  },
  rain: {
    title: "Rain Song",
    text: "Tip, tap, tip!\nRain on my hood.\nDrip, drop, drip!\nRain on the wood.",
    image: pic("rain-poem"),
    alt: "Raindrops splash onto a wooden garden bench beside a yellow raincoat.",
    kind: "Poem",
    clue: "The repeating sounds and short lines make a rain song with words.",
  },
  seed: {
    title: "About Seeds",
    text: "Seeds need water to grow. A root grows down into the soil.",
    image: pic("seed-facts"),
    alt: "A seedling with a root growing into dark soil.",
    kind: "Information book",
    clue: "The words explain facts about seeds growing.",
  },
  snow: {
    title: "Snow Morning",
    text: "The garden is quiet.\nWhite blankets the path.\nMy small footprints\nare the first marks.",
    image: pic("snow-poem"),
    alt: "Small footprints lead across a snow-covered garden path.",
    kind: "Poem",
    clue: "Short lines help us picture a quiet snowy morning. This poem does not use rhyming end words.",
  },
};
const page = (key: string): ReferencePageDef => ({
  sections: [{ heading: shelfBooks[key].title, text: shelfBooks[key].text }],
});
const reveal = (key: string, sentence: string) => ({
  image: shelfBooks[key].image,
  alt: shelfBooks[key].alt,
  sentence,
});
const photo = (key: string) => ({
  id: "shelf-book",
  props: { show: "photo", image: shelfBooks[key].image, alt: shelfBooks[key].alt },
});
const kindOptions: ChooseDef["options"] = [
  { id: "story", label: "Storybook", image: shelfAsset("story-icon.svg") },
  { id: "information", label: "Information book", image: shelfAsset("information-icon.svg") },
  { id: "poem", label: "Poem", image: shelfAsset("poem-icon.svg") },
];
const kindId = (key: string) =>
  ({ Storybook: "story", "Information book": "information", Poem: "poem" })[shelfBooks[key].kind];
function classify(
  id: string,
  key: string,
  prompt = "Which kind of text did you hear?",
  choices = kindOptions,
): SceneDef {
  return {
    id,
    purpose: "guided",
    gate: "interaction",
    evidence: "assessed",
    prompt,
    referencePage: page(key),
    narration: n(prompt + " Listen to the page. Then choose."),
    interaction: {
      type: "choose",
      autoReadChoices: true,
      options: choices,
      correctId: kindId(key),
      success: reveal(key, shelfBooks[key].kind),
    },
    feedback: f(
      shelfBooks[key].clue,
      "Listen to what the words do. Do they tell events, teach facts, or play with sounds and word pictures?",
    ),
  };
}
function question(
  id: string,
  key: string,
  prompt: string,
  labels: string[],
  correct: number,
  explanation: string,
  hint: string,
): SceneDef {
  return {
    id,
    purpose: "guided",
    gate: "interaction",
    evidence: "assessed",
    prompt,
    referencePage: page(key),
    narration: n(prompt),
    interaction: {
      type: "choose",
      autoReadChoices: true,
      options: labels.map((label, i) => ({ id: String(i), label })),
      correctId: String(correct),
      success: reveal(key, labels[correct]),
    },
    feedback: f(explanation, hint),
  };
}
function model(id: string, key: string, prompt: string, script: string): SceneDef {
  return {
    id,
    purpose: "model",
    gate: "none",
    evidence: "demonstration",
    prompt,
    visual: { id: "shelf-book", props: { show: "book", book: key, explanation: script } },
    narration: n(`${prompt} ${shelfBooks[key].title}. ${shelfBooks[key].text} ${script}`),
  };
}
function read(id: string, text: string, key: string): SceneDef {
  return {
    id,
    purpose: "guided",
    gate: "interaction",
    evidence: "practice",
    prompt: "Read with Luna.",
    narration: n(
      "Read with Luna. Tap the microphone and follow the words. You can hear them first if you need help.",
    ),
    interaction: {
      type: "speak",
      mode: "read",
      text,
      allowHear: true,
      autoStop: true,
      completionPolicy: "practice-coverage",
      success: reveal(key, text),
    },
    feedback: f(
      "You followed the words! Now see the picture they tell us about.",
      "Listen, then try each word with Luna.",
    ),
  };
}
function respond(
  id: string,
  prompt: string,
  rubricId: string,
  context: string,
  key: string,
  correct: string,
  hint: string,
): SceneDef {
  return {
    id,
    purpose: "guided",
    gate: "interaction",
    evidence: "practice",
    prompt,
    context,
    narration: n(prompt + " Tap the microphone and tell Luna in your own words."),
    interaction: {
      type: "speak",
      mode: "respond",
      text: prompt,
      rubricId,
      unclearScript: "I did not catch that idea yet. Try telling me again, or move on.",
      success: reveal(key, correct),
    },
    feedback: f(correct, hint),
  };
}
export const shelfWarmup = {
  title: "Window Seat Book Match",
  nextLabel: "Open the books",
  seconds: 45,
  largeBoard: 12,
  compactBoard: 8,
  backdrop: pic("workbench"),
  tileName: "book" as const,
  invitation: "What’s inside these little books?",
  greeting:
    "Welcome to Window Seat Book Match! Find the matching pictures. Tap Let’s play to get started.",
  intro:
    "Open two little books. A match earns two carrots! If they do not match, they close again. Remember where the pictures are. Ready?",
  finish: "You found matching pictures! Now let’s open some books and listen to what is inside.",
  emptyFinish: "Good exploring! Now let’s open some books and listen to what is inside.",
  labels: ["Cat", "Sun", "Leaf", "Star", "Flower", "Carrot"],
  pictures: ["cat", "sun", "leaf", "star", "blossom", "carrot"].map(
    (x) => `/icons/fluent/${x}.svg`,
  ),
};
export const shelfWelcome =
  "Welcome to the Book Explorer’s Shelf! Play a quick book matching game. Then open books with Luna and discover stories, facts, and poems.";
export const shelfCompletion =
  "You opened books and listened for clues! Now you are ready to practice with new stories, facts, and poems. Let’s explore!";
export const shelfLearned = [
  "Storybooks tell about characters and what happens.",
  "Information books teach us facts.",
  "Poems play with sounds, feelings, and word pictures.",
  "We open and listen. A cover is not enough!",
];
const bookMatch: SceneDef = {
  id: "match-book-clues",
  purpose: "guided",
  gate: "interaction",
  evidence: "practice",
  prompt: "Match our books to their clues.",
  narration: n(
    "Match our books to their clues. You heard all three train books. Tap a book and its clue, then press Check.",
  ),
  interaction: {
    type: "match",
    autoPlayOnSelect: true,
    pairs: [
      { left: "Hat on the Train", right: "Sam gets his hat back" },
      { left: "Trains on Tracks", right: "Facts about train wheels" },
      { left: "Clickety-Clack", right: "A beat made with words" },
    ],
    images: {
      "Hat on the Train": { src: shelfBooks.story.image, alt: shelfBooks.story.alt },
      "Trains on Tracks": { src: shelfBooks.information.image, alt: shelfBooks.information.alt },
      "Clickety-Clack": { src: shelfBooks.poem.image, alt: shelfBooks.poem.alt },
    },
    success: reveal("story", "The same train can appear in different kinds of books!"),
  },
  feedback: f(
    "You used the words inside each book. The same train can appear in different kinds of books!",
    "Remember the hat story, the wheel facts, and the clickety-clack poem.",
  ),
};
const shelfSort: SceneDef = {
  id: "shelve-our-books",
  purpose: "guided",
  gate: "interaction",
  evidence: "practice",
  prompt: "Put our books on their shelves.",
  narration: n(
    "Put our books on their shelves. Tap a book, then tap its shelf. You can also drag it. Listen to the whole page again if you need a reminder.",
  ),
  interaction: {
    type: "sort",
    showImages: true,
    buckets: ["Storybook", "Information book", "Poem"],
    bucketImages: Object.fromEntries(kindOptions.map((o) => [o.label, o.image!])),
    items: ["story", "information", "poem"].map((key) => ({
      label: shelfBooks[key].title,
      spoken: shelfBooks[key].title + ". " + shelfBooks[key].text,
      bucket: shelfBooks[key].kind,
      image: shelfBooks[key].image,
      explanation: shelfBooks[key].clue,
    })),
    coachWrong: "Think about what you heard inside. Follow events, learn facts, or hear a poem.",
  },
  feedback: f(
    "Three books, three ways to explore a train!",
    "Listen to the words inside the book again.",
  ),
};
export const shelfLesson: LessonDef = {
  ...storyKinds,
  id: "story-kinds-coached-v1",
  title: "The Book Explorer’s Shelf",
  standard: "RL.K.5",
  objective:
    "With listening support, recognize storybooks and poems from actual text, using information passages as a contrast. Realistic subjects and rhyme are not exclusive genre tests. Oral rehearsal is separate from independent decoding.",
  timings: undefined,
  completion: {
    script: shelfCompletion,
    title: "Ready to explore new books!",
    body: "Listen for clues inside each book.",
  },
  scenes: [
    {
      id: "welcome-shelf",
      purpose: "hook",
      gate: "none",
      evidence: "demonstration",
      prompt: "What’s inside a book?",
      visual: {
        id: "shelf-book",
        props: {
          show: "photo",
          image: pic("opening"),
          alt: "A sunlit library window seat with three inviting books and a toy train.",
        },
      },
      narration: n(
        "What’s inside a book? A story to follow? Facts to learn? A poem to enjoy? We cannot tell just by looking at its cover. Let’s open it!",
      ),
    },
    {
      id: "open-three-books",
      purpose: "model",
      gate: "interaction",
      evidence: "demonstration",
      prompt: "Open a book. Listen inside.",
      visual: { id: "shelf-book", props: { show: "closed", explorer: true } },
      narration: n(
        "Open a book. Listen inside. These covers show the same picture: a red hat and a train. Do the words inside do the same thing? Tap each book and listen.",
      ),
      interaction: {
        type: "transform",
        control: "toggle",
        startUnselected: true,
        presentation: "book-covers",
        base: "",
        add: "",
        result: "",
        changeIndex: 0,
        states: ["story", "information", "poem"].map((key) => ({
          id: key,
          label: shelfBooks[key].title,
          image: shelfAsset("shared-train-cover.webp"),
          text: "",
          script: shelfBooks[key].title + ". " + shelfBooks[key].text,
          visual: { show: "book", book: key },
        })),
      },
    },
    question(
      "story-clue",
      "story",
      "What makes this a story?",
      ["It has a train", "Things happen to Sam", "It teaches about rails"],
      1,
      "We follow Sam, Dad, and what happens to the hat. A story can be about something that could really happen.",
      "What happens to Sam’s hat? A train picture alone cannot tell us the kind of book.",
    ),
    model(
      "facts-inside",
      "information",
      "These words teach us facts.",
      "An information book helps us learn about a topic. This one tells us about trains.",
    ),
    { ...classify("find-facts", "information"), evidence: "practice" },
    model(
      "hear-poem",
      "poem",
      "Listen to this poem.",
      "Hear the clickety-clack beat! Poets choose sounds and words to help us hear, picture, and feel something.",
    ),
    question(
      "poem-clue",
      "poem",
      "What do these poem words help you hear?",
      ["A train’s clacking beat", "Sam looking for his hat", "Facts about wheels"],
      0,
      "Clickety-clack helps us hear the train’s beat. The sounds are part of this poem.",
      "Listen to clickety-clack, down the track. What sound do those words make?",
    ),
    bookMatch,
    model(
      "poem-no-rhyme",
      "leaf",
      "A poem does not have to rhyme.",
      "Did the last words rhyme? They did not need to. These short lines help us picture a leaf as a little boat. Some poems rhyme. Some do not.",
    ),
    shelfSort,
    question(
      "choose-for-facts",
      "information",
      "Which book helps us learn train facts?",
      ["Clickety-Clack", "Hat on the Train", "Trains on Tracks"],
      2,
      "Trains on Tracks teaches us how trains run and what they carry. We chose it for its words.",
      "Think about the book that tells us about wheels and rails.",
    ),
    read("read-hat", "Sam got his hat.", "story"),
    {
      id: "shelf-celebrate",
      purpose: "celebrate",
      gate: "none",
      evidence: "demonstration",
      prompt: "You found clues inside books!",
      visual: { id: "shelf-book", props: { show: "shelves" } },
      narration: n(
        "You found clues inside books! Storybooks tell events. Information books teach facts. Poems play with words. Some books mix these together! Now let’s try new books and share ideas with Luna.",
      ),
    },
  ],
};
const pq = (scene: SceneDef, band: Band): PracticeQuestion => ({
  id: "shelf-check/" + scene.id,
  standard: "RL.K.5",
  band,
  difficulty: { easier: 1, core: 2, harder: 3, challenging: 4 }[band],
  scene: { ...scene, evidence: "assessed" },
});
// First two core tasks guarantee non-MCQ practice on every adaptive path.
export const shelfChecks: PracticeQuestion[] = [
  pq(
    {
      ...bookMatch,
      id: "01-match-transfer",
      prompt: "Match each page to its clue.",
      narration: n(
        "Match each page to its clue. Listen to the words on each card, then match what they do. Press Check when you are ready.",
      ),
      interaction: {
        type: "match",
        autoPlayOnSelect: true,
        pairs: [
          { left: "A cat found a mitten. Kit gave her a pat.", right: "Tells what happens" },
          { left: "Seeds need water to grow.", right: "Teaches a fact" },
          { left: "Tip, tap, tip! Drip, drop, drip!", right: "Plays with rain sounds" },
        ],
        images: {
          "A cat found a mitten. Kit gave her a pat.": {
            src: shelfBooks.cat.image,
            alt: shelfBooks.cat.alt,
          },
          "Seeds need water to grow.": { src: shelfBooks.seed.image, alt: shelfBooks.seed.alt },
          "Tip, tap, tip! Drip, drop, drip!": {
            src: shelfBooks.rain.image,
            alt: shelfBooks.rain.alt,
          },
        },
        success: reveal("cat", "You matched a story, a fact, and a poem!"),
      },
      feedback: f(
        "The cat found a mitten. That is a story. Seeds need water to grow. That is a fact. Tip, tap! Drip, drop! Those poem words sound like rain.",
        "Listen to each card. What do its words do?",
      ),
    },
    "core",
  ),
  pq(
    {
      ...shelfSort,
      id: "02-sort-transfer",
      prompt: "Shelve these tiny texts.",
      narration: n(
        "Shelve these tiny texts. Listen to each card, then choose its shelf. You can tap or drag.",
      ),
      interaction: {
        type: "sort",
        showImages: true,
        buckets: ["Storybook", "Information book", "Poem"],
        bucketImages: Object.fromEntries(kindOptions.map((o) => [o.label, o.image!])),
        items: [
          {
            label: "A cat found a mitten.",
            spoken: "A cat found a mitten. She took it to Kit.",
            bucket: "Storybook",
            image: shelfBooks.cat.image,
            explanation: "We follow what the cat does.",
          },
          {
            label: "Seeds need water.",
            spoken: "Seeds need water. A root grows into the soil.",
            bucket: "Information book",
            image: shelfBooks.seed.image,
            explanation: "These words teach facts about seeds.",
          },
          {
            label: "Tip, tap, tip!",
            spoken: "Tip, tap, tip! Drip, drop, drip! Rain is making music.",
            bucket: "Poem",
            image: shelfBooks.rain.image,
            explanation: "These lines play with rain sounds.",
          },
        ],
        coachWrong: "Listen to the whole card again. What do the words do?",
      },
      feedback: f(
        "You used clues in the texts to find their shelves.",
        "Listen to the words before choosing a shelf.",
      ),
    },
    "core",
  ),
  ...["cat", "rain", "seed", "leaf"].map((key, i) => pq(classify("core-" + i, key), "core")),
  ...["cat", "farm", "rain", "story", "seed", "snow"].map((key, i) =>
    pq(classify("easy-" + i, key, `Listen. Which kind of text is this?`), "easier"),
  ),
  pq(
    question(
      "hard-real",
      "cat",
      "Could a story tell about a real cat?",
      [
        "Yes, stories can have real things",
        "No, cats only go in fact books",
        "Only if the cat can fly",
      ],
      0,
      "Stories can tell about events that could really happen. We follow the cat and Kit.",
      "Think about Sam and his hat. Stories do not have to be impossible.",
    ),
    "harder",
  ),
  pq(classify("hard-freeverse", "snow"), "harder"),
  pq(
    question(
      "hard-rhyming-story",
      "pig",
      "Why can this be a tiny story?",
      ["Every rhyme is a fact", "It tells what the pig does", "A pink cover makes a story"],
      1,
      "It tells events about a character. These rhyming lines can be read as a tiny story and a poem.",
      "What did the pig do in this little story? The events matter more than the cover.",
    ),
    "harder",
  ),
  pq(
    question(
      "hard-leaf",
      "leaf",
      "What helps us enjoy this poem?",
      ["A list of boat facts", "A leaf becomes a word picture", "All its end words rhyme"],
      1,
      "The poet helps us imagine the floating leaf as a little boat. A poem does not have to rhyme.",
      "Picture the leaf on the puddle. What does the poet call it?",
    ),
    "harder",
  ),
  pq(
    question(
      "challenge-shared",
      "information",
      "Another book has a train on its cover. What should we do?",
      ["Call every train book a fact book", "Guess from its color", "Open it and listen inside"],
      2,
      "We need the words inside. Trains can be in stories, information books, and poems.",
      "A cover gives a clue about the topic. Does it tell us what the words inside do?",
    ),
    "challenging",
  ),
  pq(
    question(
      "challenge-purpose",
      "snow",
      "Which clue helps us recognize this poem?",
      ["It makes a snowy word picture", "Snow is always make-believe", "Every poem has to rhyme"],
      0,
      "The short lines help us picture and feel the quiet snow. This poem does not rhyme.",
      "Listen to white blankets the path and the first footprints. What can you picture?",
    ),
    "challenging",
  ),
];
export const shelfClosing: PracticeQuestion[] = [
  read("read-cat", "The cat sat.", "cat"),
  read("read-seed", "A seed can grow.", "seed"),
  respond(
    "explain",
    "How can you find out what kind of book it is?",
    "shelf-inside-v1",
    "A train can appear in a storybook, an information book, or a poem.",
    "information",
    "You can open the book and listen to or read its words.",
    "Think about what we did after looking at the covers.",
  ),
  respond(
    "your-choice",
    "Which book would you choose? Why?",
    "shelf-choice-v1",
    "We explored Hat on the Train, a story about Sam and his hat; Trains on Tracks, facts about trains; and Clickety-Clack, a train poem.",
    "story",
    "Thanks for telling me which books you like! Readers can enjoy different books.",
    "Which would you like: a storybook, a fact book, or a poem? Tell Luna your choice. You can tell us why, too.",
  ),
].map((scene) => ({
  id: "shelf-response/" + scene.id,
  standard: "RL.K.5",
  band: "core",
  difficulty: 2,
  phase: "reading-finish",
  scene,
}));
// Opinion feedback returns to the shared library, not an illustration of a book
// the child may not have chosen. Preferences are never scored as mastery.
const preference = shelfClosing.at(-1)!.scene.interaction;
if (preference?.type === "speak") {
  preference.unclearScript = "I am not sure which book you mean yet. Would you like a storybook, a fact book, or a poem? Try telling Luna, or move on.";
  preference.responseReveals = {
    story: reveal("story", "You like storybooks! You can follow the characters and find out what happens."),
    information: reveal("information", "You like fact books! They help us learn about the world."),
    poem: reveal("poem", "You like poems! Poems can play with sounds and help us imagine."),
  };
  preference.success = {
    image: pic("opening"),
    alt: "The library window seat with several inviting books.",
    sentence: "Thanks for telling me which books you like! Readers can enjoy different books.",
  };
}
export const shelfPractice = [...shelfChecks, ...shelfClosing];
export const shelfPracticeCount = 12;
export const shelfPracticeDone =
  "You listened to new texts and shared ideas with Luna. Your book explorer carrots are ready!";
export const shelfPerfectDone =
  "Every book question, first try! Three extra carrots for your careful thinking!";
export const shelfTimingTexts = [
  ...new Set(
    [...shelfLesson.scenes, ...shelfPractice.map((q) => q.scene)].flatMap((s) => [
      s.narration!.script,
      ...referencePageSpeech(s.referencePage),
      ...(s.interaction && 'success' in s.interaction && s.interaction.success ? [s.interaction.success.sentence] : []),
      ...(s.interaction?.type === 'sort' ? [...s.interaction.buckets,...s.interaction.items.map(item=>item.spoken??item.label)] : []),
      ...(s.context ? [s.context, ...spokenSentences(s.context)] : []),
      ...(s.interaction?.type === "transform" ? s.interaction.states!.map((x) => x.script) : []),
      ...(s.interaction?.type === "speak" ? [s.interaction.text, ...Object.values(s.interaction.responseReveals ?? {}).map(reveal => reveal.sentence)] : []),
      ...(s.interaction?.type === "choose" && s.interaction.autoReadChoices
        ? s.interaction.options.map((x) => x.spoken ?? x.label)
        : []),
      ...(s.interaction?.type === "match"
        ? s.interaction.pairs.flatMap((x) => [x.left, x.right])
        : []),
    ]),
  ),
];
export const shelfSpeech = collectSpeech(
  [shelfLesson, { ...shelfLesson, scenes: shelfPractice.map((q) => q.scene) }],
  [
    shelfWelcome,
    shelfCompletion,
    shelfPracticeDone,
    shelfPerfectDone,
    ...shelfLearned,
    ...shelfTimingTexts,
    shelfWarmup.greeting,
    shelfWarmup.intro,
    shelfWarmup.finish,
    shelfWarmup.emptyFinish,
    ...shelfWarmup.labels,
    "Let’s learn this together.",
    "We’ll try this again another time. Let’s keep going.",
    "Listen to the story again.",
    "You finished this question.",
    "Let’s try the next question.",
    "Open it and listen to the words.",
    "I would choose the poem because I like the train sounds.",
    "I like fact books.",
  ],
);
export const shelfSpeechStyles: Record<string, string> = {
  [shelfLesson.scenes.find((s) => s.id === "poem-no-rhyme")!.narration!.script]:
    "Read EVERY word of the supplied script from beginning to end in a friendly American teacher voice. The script includes a short poem AND the teaching explanation after it. Do not stop after with no one aboard. Continue with Did the last words rhyme through Some poems rhyme. Some do not. Keep a natural conversational pace. No paraphrases, skipped sentences, singing, music or extra words.",
  "A seed can grow.":
    "Read the full four-word sentence exactly. Include the first word A, pronounced uh, clearly before seed can grow. Friendly natural American voice. No omitted words, added words, singing or explanation.",
  "Pigs live on farms.":
    "Read the exact four words clearly in natural American English. Pigs starts with a P, never K. No added words, explanation or singing.",

  "A cat found a mitten. Kit gave her a pat.":
    "Friendly American reading teacher. Speak the exact text clearly at a natural conversational pace. Cat and pat rhyme with hat, with a short A vowel, never pet or tat. Kit is the child’s name. No added words or explanations.",
  "A cat found a mitten. She took it to Kit.":
    "Friendly American reading teacher. Read the exact text naturally and clearly. Cat starts with a clear K sound, not tat. Kit is a child’s name. No added words, spelling or singing.",
  "You matched a story, a fact, and a poem!":
    "Read the exact sentence in a natural friendly American voice. Pronounce matched in the past tense, with its final T sound clear. No added words.",
  Poem: "Say only the supplied word once, naturally and clearly in American English: poem, POH-um, with the long O vowel and a light second syllable. Do not say palm. No explanation, spelling, singing or stretching.",
  "Sam looking for his hat":
    "Read only the supplied phrase in a friendly clear American voice. Hat has the short A vowel as in cat, with a clear final T, not hand or head. Do not explain, spell, sing or add words.",
};

// Exact short readings: the title is not an invitation to invent a poem.
const explorerInteraction = shelfLesson.scenes.find(scene => scene.id === "open-three-books")!.interaction;
if (explorerInteraction?.type === "transform") {
  for (const state of explorerInteraction.states ?? []) {
    shelfSpeechStyles[state.script] = "Friendly natural American Autonoe reading teacher. Read ONLY the supplied title and printed text, word for word, exactly once. This is a fixed quotation, not a creative writing prompt. Stop immediately after the last printed word. No extra poem lines, explanations, singing, preamble or repeated text. Gentle expressive conversational pace.";
  }
}
