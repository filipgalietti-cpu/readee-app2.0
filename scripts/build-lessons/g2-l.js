#!/usr/bin/env node
/** G2 Language: 14 lessons (L.2.1/2/3 need MCQs; L.2.4/5/6 variants have them) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

// L.2.1 Sentence Skills — NEEDS MCQs
addMCQs({
  standardId: "L.2.1", grade: "2nd Grade", domain: "Language",
  description: "Demonstrate command of the conventions of standard English grammar and usage",
  parentTip: "Collective nouns (group, team) act as one thing. Irregular verbs like ran, flew just have to be memorized.",
  questions: [
    { type: "multiple_choice", prompt: "Pick the right word: The team ___ to the field.", choices: ["runs", "run", "running", "ran to"], correct: "runs", hint: "Team is one group, so use runs!", difficulty: 1, imagePrompt: `A cheerful cartoon sports team running onto a bright green field. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which is the past tense of **fly**?", choices: ["flew", "flied", "flyed", "flying"], correct: "flew", hint: "Fly is irregular. Yesterday it flew!", difficulty: 1, imagePrompt: `A cheerful cartoon bird mid-flight with a long trail of tiny sparkles. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which sentence is correct?", choices: ["I am happy today.", "I happy today.", "Me am happy.", "I is happy."], correct: "I am happy today.", hint: "Use \"I am\" for yourself!", difficulty: 1, imagePrompt: `A cheerful cartoon kid giving a big thumbs up with a wide smile. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What is a **collective noun**?", choices: ["a word for a group", "a long sentence", "a big letter", "a verb"], correct: "a word for a group", hint: "Team, herd, flock — words that name groups.", difficulty: 2, imagePrompt: `A cheerful cartoon herd of sheep all smiling together. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Past tense of **eat**?", choices: ["ate", "eated", "eats", "eating"], correct: "ate", hint: "Eat is irregular! Yesterday I ate.", difficulty: 2, imagePrompt: `A cheerful cartoon empty plate with a tiny fork and a satisfied smile. Clean pastel background. ${IMG}` },
  ],
});
build({
  standardId: "L.2.1", grade: "2nd Grade", domain: "Language", title: "Sentence Skills",
  slides: [
    { type: "intro", heading: "Grammar Grows Up", imagePrompt: `A cheerful cartoon group of letter characters in a line, each holding hands. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Second graders learn more sentence skills.", displayText: "More skills", displayDelay: 2000 },
        { sub: "b", tts: "Collective nouns, irregular verbs, and tricky pronouns.", displayText: "Collective, irregular, pronoun", displayDelay: 2800 },
        { sub: "c", tts: "Let us meet them!", displayText: "Meet them", displayDelay: 1500 },
      ]},
    { type: "teach", heading: "Collective Nouns", imagePrompt: `A cheerful cartoon flock of birds flying together in a V formation, all smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A collective noun names a group as one thing.", displayText: "Group = one", displayDelay: 2500 },
        { sub: "b", tts: "Team. Herd. Flock. Family.", displayText: "team, herd, flock, family", displayDelay: 2500 },
        { sub: "c", tts: "Use a singular verb with them. The team runs!", displayText: "Team runs, not run", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Irregular Verbs", imagePrompt: `A cheerful cartoon kid pointing at a tiny calendar yesterday box with a bird flying. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Most past tense verbs add E D. But some are irregular!", displayText: "Some are tricky", displayDelay: 2500 },
        { sub: "b", tts: "Yesterday I ate. I ran. I flew.", displayText: "ate, ran, flew", displayDelay: 2500 },
        { sub: "c", tts: "Those do not follow the E D rule. Memorize!", displayText: "Memorize these", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Listen for What Sounds Right", imagePrompt: `A cheerful cartoon ear listening carefully with tiny sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A grammar trick", displayDelay: 1500 },
        { sub: "b", tts: "Say the sentence out loud. Does it sound right? Your ear often knows!", displayText: "Say it out loud", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to use strong sentence skills!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.1-Q1","L.2.1-Q2","L.2.1-Q3","L.2.1-Q4","L.2.1-Q5"],
});

// L.2.2 Apostrophes and Commas — NEEDS MCQs
addMCQs({
  standardId: "L.2.2", grade: "2nd Grade", domain: "Language",
  description: "Demonstrate command of the conventions of capitalization, punctuation, and spelling when writing",
  parentTip: "An apostrophe shows ownership (dog's bone) or a contraction (can't). Commas separate items in a list.",
  questions: [
    { type: "multiple_choice", prompt: "Which shows the dog owns the bone?", choices: ["the dog's bone", "the dogs bone", "the dog bone", "the dogs' bone"], correct: "the dog's bone", hint: "Apostrophe + S shows one dog owns it!", difficulty: 1, imagePrompt: `A cheerful cartoon dog holding a bone in its mouth, smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "What does **can't** mean?", choices: ["can not", "could not", "will not", "cannot yet"], correct: "can not", hint: "The apostrophe replaces the missing letters from cannot.", difficulty: 1, imagePrompt: `A cheerful cartoon letter O with a tiny apostrophe floating above it. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which sentence uses commas correctly?", choices: ["I like apples, bananas, and grapes.", "I like apples bananas and grapes.", "I, like apples, bananas, and, grapes.", "I like, apples, bananas, and grapes."], correct: "I like apples, bananas, and grapes.", hint: "Commas separate items in a list!", difficulty: 2, imagePrompt: `Three cheerful cartoon fruits in a row, an apple, banana, and grapes, each smiling. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "**Let's** is short for:", choices: ["let us", "let is", "let as", "let it"], correct: "let us", hint: "The apostrophe replaces the U in us.", difficulty: 1, imagePrompt: `A cheerful cartoon group of friends linking arms, ready to go. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Where do you put a comma in a list?", choices: ["between each item", "at the start", "at the end", "never"], correct: "between each item", hint: "Commas live between each item to keep them apart!", difficulty: 1, imagePrompt: `A cheerful cartoon line of smiling items separated by tiny cartoon commas. Clean pastel background. ${IMG}` },
  ],
});
build({
  standardId: "L.2.2", grade: "2nd Grade", domain: "Language", title: "Apostrophes and Commas",
  slides: [
    { type: "intro", heading: "Tiny Marks, Big Jobs", imagePrompt: `A cheerful cartoon apostrophe and comma character side by side, both with happy faces. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Two tiny marks do big jobs in sentences.", displayText: "Tiny but mighty", displayDelay: 2500 },
        { sub: "b", tts: "Apostrophes and commas.", displayText: "' and ,", displayDelay: 2000 },
        { sub: "c", tts: "Let us learn both!", displayText: "Learn both", displayDelay: 1500 },
      ]},
    { type: "teach", heading: "Apostrophes Show Owning", imagePrompt: `A cheerful cartoon dog sitting proudly next to its bone, with a tiny apostrophe and S floating. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Add an apostrophe and an S to show owning.", displayText: "' + s = owning", displayDelay: 2500 },
        { sub: "b", tts: "The dog's bone. The girl's book.", displayText: "dog's, girl's", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Apostrophes in Contractions", imagePrompt: `A cheerful cartoon two-word pair squishing together into one word with a tiny apostrophe. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "An apostrophe can also replace missing letters.", displayText: "' = missing letters", displayDelay: 2500 },
        { sub: "b", tts: "Can not becomes can't. Do not becomes don't.", displayText: "can't, don't", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Commas Separate Lists", imagePrompt: `A cheerful cartoon trio of fruit with tiny cartoon commas between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Commas separate items in a list.", displayText: "Commas = separate", displayDelay: 2500 },
        { sub: "b", tts: "I like apples, bananas, and grapes!", displayText: "apples, bananas, grapes", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to use apostrophes and commas!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.2-Q1","L.2.2-Q2","L.2.2-Q3","L.2.2-Q4","L.2.2-Q5"],
});

// L.2.3 Choosing Words to Sound Right — NEEDS MCQs
addMCQs({
  standardId: "L.2.3", grade: "2nd Grade", domain: "Language",
  description: "Use knowledge of language and its conventions when writing, speaking, reading, or listening",
  parentTip: "Formal vs casual. Match your words to your reader.",
  questions: [
    { type: "multiple_choice", prompt: "If you are writing to a teacher, which sounds best?", choices: ["Thank you for your help.", "Thanks a bunch!", "Thx a lot.", "Yo thanks."], correct: "Thank you for your help.", hint: "Teachers appreciate formal words!", difficulty: 1, imagePrompt: `A cheerful cartoon kid handing a thank you note to a smiling teacher. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which word is most formal?", choices: ["assist", "help", "lend a hand", "back up"], correct: "assist", hint: "Assist is a formal way to say help.", difficulty: 2, imagePrompt: `A cheerful cartoon kid in a necktie helping another with a book. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which sentence sounds too casual for a school essay?", choices: ["Yeah, it's super cool.", "It is very interesting.", "It was a fine experience.", "I enjoyed it."], correct: "Yeah, it's super cool.", hint: "Yeah and super cool sound like talking with friends.", difficulty: 2, imagePrompt: `A cheerful cartoon kid with a clipboard thinking about different word choices. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Which word is a stronger way to say **big**?", choices: ["enormous", "kinda big", "big-ish", "medium"], correct: "enormous", hint: "Enormous means very, very big!", difficulty: 1, imagePrompt: `A cheerful cartoon giant elephant standing next to a tiny mouse. Clean pastel background. ${IMG}` },
    { type: "multiple_choice", prompt: "Why does word choice matter?", choices: ["words carry different feelings", "to look smart", "to be funny", "to use long words"], correct: "words carry different feelings", hint: "Each word has a tone and feeling!", difficulty: 2, imagePrompt: `A cheerful cartoon paint palette with different shades of color representing different tones. Clean pastel background. ${IMG}` },
  ],
});
build({
  standardId: "L.2.3", grade: "2nd Grade", domain: "Language", title: "Choosing Words to Sound Right",
  slides: [
    { type: "intro", heading: "Pick Your Words", imagePrompt: `A cheerful cartoon kid choosing from a basket of colorful word cards. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The words you pick change how your message sounds.", displayText: "Words change tone", displayDelay: 2500 },
        { sub: "b", tts: "Some words sound friendly. Some sound formal.", displayText: "Friendly vs formal", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Formal and Casual", imagePrompt: `A cheerful cartoon kid in formal clothes next to the same kid in casual clothes. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Formal words are for teachers, letters, and essays.", displayText: "Formal = serious", displayDelay: 2500 },
        { sub: "b", tts: "Casual words are for friends and family.", displayText: "Casual = everyday", displayDelay: 2500 },
        { sub: "c", tts: "Thank you vs. Thanks. Both are nice. One is more formal.", displayText: "Thank you vs thanks", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Stronger Words", imagePrompt: `A cheerful cartoon kid flexing a muscle next to a sparkly word. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Stronger words paint a stronger picture.", displayText: "Strong = vivid", displayDelay: 2500 },
        { sub: "b", tts: "Instead of big, try enormous. Instead of sad, try heartbroken.", displayText: "Big -> enormous", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Know Your Reader", imagePrompt: `A cheerful cartoon kid holding up different letters for different people. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word trick", displayDelay: 1500 },
        { sub: "b", tts: "Think about who will read your words. Then pick words that fit!", displayText: "Who is reading?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to choose words to sound just right!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.3-Q1","L.2.3-Q2","L.2.3-Q3","L.2.3-Q4","L.2.3-Q5"],
});

// L.2.4 Word Meaning Detective
build({
  standardId: "L.2.4", grade: "2nd Grade", domain: "Language", title: "Word Meaning Detective",
  slides: [
    { type: "intro", heading: "Figure It Out", imagePrompt: `A cheerful cartoon detective kid with a magnifying glass over a word. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Good readers figure out tricky words.", displayText: "Figure it out", displayDelay: 2000 },
        { sub: "b", tts: "They use clues from the sentence and the word itself.", displayText: "Sentence + word clues", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Sentence Clues", imagePrompt: `A cheerful cartoon kid looking at a magnifying glass over a sentence. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Read the whole sentence. The other words give hints.", displayText: "Other words = hints", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Word Parts", imagePrompt: `A cheerful cartoon word divided into prefix, root, and suffix pieces. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Break the word into pieces. Prefix, root, suffix.", displayText: "Pieces = clues", displayDelay: 2500 },
        { sub: "b", tts: "Each piece can tell you part of the meaning.", displayText: "Part = meaning", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Detective Mindset", imagePrompt: `A cheerful cartoon detective hat with a tiny magnifying glass next to it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word trick", displayDelay: 1500 },
        { sub: "b", tts: "Combine sentence clues and word parts. You can almost always figure it out!", displayText: "Both clues = answer", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to be a word meaning detective!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.4-Q1"],
});

// L.2.4a Sentence Clues
build({
  standardId: "L.2.4a", grade: "2nd Grade", domain: "Language", title: "Sentence Clues",
  slides: [
    { type: "intro", heading: "Clues in Sentences", imagePrompt: `A cheerful cartoon magnifying glass hovering over a sentence with tiny sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The sentence around a word gives hints.", displayText: "Around = clues", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Listen for the Hint", imagePrompt: `A cheerful cartoon ear listening to tiny words with sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The grumpy kid frowned and crossed his arms.", displayText: "Grumpy kid frowned", displayDelay: 2800 },
        { sub: "b", tts: "Grumpy must mean unhappy. The frown and crossed arms told us.", displayText: "Grumpy = unhappy", displayDelay: 2800 },
      ]},
    { type: "example", heading: "Try Another", imagePrompt: `A cheerful cartoon kid stretching high to reach a shelf. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "She stretched her arm up to reach the high shelf.", displayText: "Stretched to reach", displayDelay: 2800 },
        { sub: "b", tts: "Stretched means made herself longer! The shelf was up high.", displayText: "Stretched = made longer", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Read the Whole Sentence", imagePrompt: `A cheerful cartoon eye reading left to right across a page. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A clue trick", displayDelay: 1500 },
        { sub: "b", tts: "Never skip words. The clues are in the whole sentence.", displayText: "Read it all", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to use sentence clues!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.4a-Q1","L.2.4a-Q2","L.2.4a-Q3"],
});

// L.2.4b Prefix Power
build({
  standardId: "L.2.4b", grade: "2nd Grade", domain: "Language", title: "Prefix Power",
  slides: [
    { type: "intro", heading: "Little Prefix, Big Change", imagePrompt: `A cheerful cartoon prefix tile snapping onto the front of a word, with sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A prefix is a small word piece at the front.", displayText: "Prefix = front piece", displayDelay: 2500 },
        { sub: "b", tts: "Adding one changes the word's meaning.", displayText: "Changes meaning", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "UN Means Not", imagePrompt: `A cheerful cartoon happy face next to a sad face with a tiny UN tile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "UN means not. Unhappy is not happy.", displayText: "UN = not", displayDelay: 2500 },
        { sub: "b", tts: "Unlock, unsafe, unkind — all start with UN.", displayText: "unlock, unsafe, unkind", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "RE Means Again", imagePrompt: `A cheerful cartoon circular arrow spinning around a word tile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "RE means again. Redo means do again.", displayText: "RE = again", displayDelay: 2500 },
        { sub: "b", tts: "Rewrite, reread, replay.", displayText: "rewrite, reread, replay", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Peel Off the Prefix", imagePrompt: `A cheerful cartoon banana peeling apart revealing the fruit inside. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A prefix trick", displayDelay: 1500 },
        { sub: "b", tts: "When you see a long word, peel off the prefix. See if the root word looks familiar!", displayText: "Peel off the prefix", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to use prefix power!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.4b-Q1","L.2.4b-Q2"],
});

// L.2.4c Root Word Help
build({
  standardId: "L.2.4c", grade: "2nd Grade", domain: "Language", title: "Root Word Help",
  slides: [
    { type: "intro", heading: "Find the Root", imagePrompt: `A cheerful cartoon tree with visible roots underground, each root a glowing letter. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The root is the main part of a word.", displayText: "Root = main part", displayDelay: 2500 },
        { sub: "b", tts: "Knowing the root helps you figure out lots of words.", displayText: "Root = many words", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "One Root, Many Words", imagePrompt: `A cheerful cartoon tree with different leaves labeled with related words coming from the same root. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The root play gives us: play, playing, played, player.", displayText: "play -> playing, played, player", displayDelay: 3000 },
        { sub: "b", tts: "All share the same meaning of play!", displayText: "Same meaning", displayDelay: 2200 },
      ]},
    { type: "example", heading: "Help and Helpful", imagePrompt: `A cheerful cartoon kid helping another kid with a box. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Help. Helper. Helpful. Helpless. All from help!", displayText: "help + endings", displayDelay: 2800 },
        { sub: "b", tts: "The root tells you they all connect to helping.", displayText: "Root = connection", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Cover and Discover", imagePrompt: `A cheerful cartoon hand covering the ends of a word, revealing the middle. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A root trick", displayDelay: 1500 },
        { sub: "b", tts: "Cover the prefix and suffix. What is left? That is the root!", displayText: "Cover to find", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to use root words!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.4c-Q1","L.2.4c-Q2","L.2.4c-Q3"],
});

// L.2.4d Compound Words
build({
  standardId: "L.2.4d", grade: "2nd Grade", domain: "Language", title: "Compound Word Power",
  slides: [
    { type: "intro", heading: "Two Words, One Word", imagePrompt: `Two cheerful cartoon word tiles snapping together with sparkles to form one big tile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Compound words are two words stuck together.", displayText: "Two words = one", displayDelay: 2500 },
        { sub: "b", tts: "You can use both pieces to guess the meaning!", displayText: "Pieces = meaning", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Rainbow", imagePrompt: `A cheerful cartoon rain cloud on one side and a bow on the other, both merging into a colorful rainbow. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Rainbow! Rain plus bow.", displayText: "rain + bow = rainbow", displayDelay: 2500 },
        { sub: "b", tts: "A bow of color in the rain. Makes sense!", displayText: "Color bow in rain", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Sunflower, Toothbrush", imagePrompt: `A cheerful cartoon sunflower next to a smiling toothbrush. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Sunflower. A flower that loves the sun.", displayText: "sun + flower", displayDelay: 2500 },
        { sub: "b", tts: "Toothbrush. A brush for your teeth.", displayText: "tooth + brush", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Split It Apart", imagePrompt: `A cheerful cartoon word tile splitting in half with a tiny zipper. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A compound trick", displayDelay: 1500 },
        { sub: "b", tts: "See a long word? Look for two smaller words inside!", displayText: "Two smaller words", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to read compound words!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.4d-Q1","L.2.4d-Q2","L.2.4d-Q3","L.2.4d-Q4","L.2.4d-Q5"],
});

// L.2.4e Glossary
build({
  standardId: "L.2.4e", grade: "2nd Grade", domain: "Language", title: "Using a Glossary",
  slides: [
    { type: "intro", heading: "Glossaries Help", imagePrompt: `A cheerful cartoon open book showing a glossary page at the back with alphabetical words. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A glossary is like a mini dictionary at the back of a book.", displayText: "Mini dictionary", displayDelay: 2500 },
        { sub: "b", tts: "It defines the important words used in the book.", displayText: "Defines words", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Alphabetical Order", imagePrompt: `A cheerful cartoon line of letters A B C D arranged in order with small smiles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Glossaries are in ABC order.", displayText: "ABC order", displayDelay: 2000 },
        { sub: "b", tts: "So you can find a word fast. Just use the alphabet!", displayText: "Find it fast", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Look and Learn", imagePrompt: `A cheerful cartoon kid finger pointing at a word in a glossary, lightbulb above their head. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "See a bold word in the book? Flip to the glossary!", displayText: "Bold -> glossary", displayDelay: 2500 },
        { sub: "b", tts: "You will find the meaning right there.", displayText: "Meaning = there", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Use It Often", imagePrompt: `A cheerful cartoon glossary tab with a bookmark and sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A glossary trick", displayDelay: 1500 },
        { sub: "b", tts: "Put a bookmark at the glossary so you can flip there fast!", displayText: "Bookmark it", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to use a glossary!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.4e-Q1","L.2.4e-Q2","L.2.4e-Q3","L.2.4e-Q4","L.2.4e-Q5"],
});

// L.2.5 Word Connections
build({
  standardId: "L.2.5", grade: "2nd Grade", domain: "Language", title: "Word Connections",
  slides: [
    { type: "intro", heading: "Words Connect", imagePrompt: `Two cheerful cartoon words connected by a tiny heart. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Words connect to each other in all kinds of ways.", displayText: "Word connections", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Synonyms and Antonyms", imagePrompt: `A cheerful cartoon pair of words holding hands (synonyms) and another pair back-to-back (antonyms). Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Synonyms mean almost the same. Happy and glad.", displayText: "Synonyms = same", displayDelay: 2500 },
        { sub: "b", tts: "Antonyms are opposites. Hot and cold.", displayText: "Antonyms = opposite", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Groups of Words", imagePrompt: `Three cheerful cartoon items in one basket, all the same category. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some words go together because they are in the same group.", displayText: "Same group", displayDelay: 2500 },
        { sub: "b", tts: "Dog, cat, fish. All animals!", displayText: "All animals", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Make Connections", imagePrompt: `A cheerful cartoon kid drawing lines between word cards. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A connection trick", displayDelay: 1500 },
        { sub: "b", tts: "When you meet a new word, think: what words is this similar to?", displayText: "Similar to what?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to make word connections!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.5-Q1","L.2.5-Q2","L.2.5-Q3","L.2.5-Q4","L.2.5-Q5"],
});

// L.2.5a Words in Real Life
build({
  standardId: "L.2.5a", grade: "2nd Grade", domain: "Language", title: "Words in Real Life",
  slides: [
    { type: "intro", heading: "Words Everywhere", imagePrompt: `A cheerful cartoon kid looking around a room with tiny labels on everything. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Words live in real life, not just books.", displayText: "Not just books", displayDelay: 2500 },
        { sub: "b", tts: "Great readers match words to things they know.", displayText: "Match to real life", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Delicious", imagePrompt: `A cheerful cartoon plate of cookies with steam rising and tiny hearts. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Delicious means really yummy.", displayText: "Delicious = yummy", displayDelay: 2500 },
        { sub: "b", tts: "Warm cookies. A fresh peach. Your favorite meal. All delicious!", displayText: "Yummy things", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "Exhausted", imagePrompt: `A cheerful cartoon kid yawning and flopping onto a bed after a long day. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Exhausted means super tired.", displayText: "Exhausted = very tired", displayDelay: 2500 },
        { sub: "b", tts: "After a long soccer game. After running around all day. Exhausted!", displayText: "Very tired days", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Picture It", imagePrompt: `A cheerful cartoon thought bubble with a tiny real-life scene inside. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A real-life trick", displayDelay: 1500 },
        { sub: "b", tts: "When you learn a new word, think of a real moment that matches it.", displayText: "Real moment match", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to connect words to real life!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.5a-Q1","L.2.5a-Q2","L.2.5a-Q3","L.2.5a-Q4","L.2.5a-Q5"],
});

// L.2.5b Shades of Meaning
build({
  standardId: "L.2.5b", grade: "2nd Grade", domain: "Language", title: "Shades of Meaning",
  slides: [
    { type: "intro", heading: "Different Shades", imagePrompt: `A cheerful cartoon paint palette with five shades of the same color. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Words can mean almost the same thing but have different strengths.", displayText: "Different strengths", displayDelay: 2500 },
        { sub: "b", tts: "Like different shades of the same color.", displayText: "Like paint shades", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Angry and Furious", imagePrompt: `Two cheerful cartoon faces, one with a frown and one with steam coming out of ears. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Angry means upset.", displayText: "Angry = upset", displayDelay: 2200 },
        { sub: "b", tts: "Furious means very, very angry!", displayText: "Furious = extreme", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Happy, Joyful, Thrilled", imagePrompt: `Three cheerful cartoon kids, one smiling a little, one big smiling, one jumping for joy. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Happy. A small, warm feeling.", displayText: "Happy = small smile", displayDelay: 2500 },
        { sub: "b", tts: "Joyful. A bigger, fuller feeling.", displayText: "Joyful = bigger", displayDelay: 2500 },
        { sub: "c", tts: "Thrilled. You are bursting with it!", displayText: "Thrilled = bursting", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Pick the Right Shade", imagePrompt: `A cheerful cartoon kid picking a paint color from a palette carefully. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A shade trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask: how strong is the feeling? Then pick the word that matches!", displayText: "Match the strength", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to pick the right shade of meaning!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.5b-Q1","L.2.5b-Q2","L.2.5b-Q3","L.2.5b-Q4","L.2.5b-Q5"],
});

// L.2.6 Using Smart Words
build({
  standardId: "L.2.6", grade: "2nd Grade", domain: "Language", title: "Using Smart Words",
  slides: [
    { type: "intro", heading: "Fancy Words Rock", imagePrompt: `A cheerful cartoon kid wearing a wizard hat, holding a sparkly word scroll. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When you learn a new word, use it!", displayText: "Use new words!", displayDelay: 2200 },
        { sub: "b", tts: "The more you use a word, the more it sticks.", displayText: "Use = stick", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Match Your Words to the Moment", imagePrompt: `A cheerful cartoon kid thinking with two word bubbles labeled formal and casual. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Different situations call for different words.", displayText: "Match the moment", displayDelay: 2500 },
        { sub: "b", tts: "Talking to a friend? Use chill words. Writing an essay? Use fancier ones.", displayText: "Friend vs essay", displayDelay: 2800 },
      ]},
    { type: "example", heading: "Happy Family", imagePrompt: `A cheerful cartoon family hugging with tiny sparkles around them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Instead of happy, you could say joyful, thrilled, or proud.", displayText: "Happy -> joyful, thrilled, proud", displayDelay: 2800 },
        { sub: "b", tts: "Each one paints a slightly different picture!", displayText: "Different pictures", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Try a New Word Each Day", imagePrompt: `A cheerful cartoon kid ticking off a word on a fun calendar. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A vocab trick", displayDelay: 1500 },
        { sub: "b", tts: "Pick one new word each day. Use it in a sentence!", displayText: "New word daily", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to use smart words!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["L.2.6-Q1","L.2.6-Q2","L.2.6-Q3","L.2.6-Q4","L.2.6-Q5"],
});
