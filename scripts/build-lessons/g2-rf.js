#!/usr/bin/env node
/** G2 Foundations: 10 lessons (RF.2.3/a/b/c/d/e/f + RF.2.4/a/b/c) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

// RF.2.3 phonics overview
build({
  standardId: "RF.2.3", grade: "2nd Grade", domain: "Foundational Skills", title: "Phonics and Word Skills",
  slides: [
    { type: "intro", heading: "Phonics Power", imagePrompt: `A cheerful cartoon superhero kid with a cape made of letters, standing confidently. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Phonics is knowing the sounds letters make.", displayText: "Phonics = sounds", displayDelay: 2500 },
        { sub: "b", tts: "When you know phonics, you can read new words all by yourself.", displayText: "Read on your own!", displayDelay: 2800 },
        { sub: "c", tts: "Let us grow your phonics power.", displayText: "Grow it!", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "One Letter, One Sound", imagePrompt: `A cheerful cartoon letter B with a tiny buzz next to it, smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Most letters make one sound.", displayText: "One letter = one sound", displayDelay: 2500 },
        { sub: "b", tts: "B buzzes. M hums. T taps.", displayText: "B, M, T", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Some Letters Team Up", imagePrompt: `Two cheerful cartoon letter pairs holding hands, each with a small speech bubble. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some letters team up to make one sound.", displayText: "Teams = one sound", displayDelay: 2500 },
        { sub: "b", tts: "SH in ship. CH in chip. TH in thumb.", displayText: "sh, ch, th", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Trust Your Phonics", imagePrompt: `A cheerful cartoon kid with a lightbulb above their head, holding a book confidently. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A phonics trick", displayDelay: 1500 },
        { sub: "b", tts: "When you see a new word, sound out each letter or letter team.", displayText: "Sound out each part", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to use phonics power!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.3-Q1","RF.2.3-Q2","RF.2.3-Q3","RF.2.3-Q4","RF.2.3-Q5"],
});

// RF.2.3a Long and short vowels
build({
  standardId: "RF.2.3a", grade: "2nd Grade", domain: "Foundational Skills", title: "Long and Short Vowels",
  slides: [
    { type: "intro", heading: "Two Vowel Voices", imagePrompt: `Two cheerful cartoon vowel characters, one short and chunky, one tall and elegant, smiling together. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every vowel has two voices: short and long.", displayText: "Short + long", displayDelay: 2500 },
        { sub: "b", tts: "Short sounds are quick. Long sounds say the letter's name.", displayText: "Quick vs says name", displayDelay: 2800 },
        { sub: "c", tts: "Let us listen.", displayText: "Listen!", displayDelay: 1500 },
      ]},
    { type: "teach", heading: "Short in CAT", imagePrompt: `A cheerful cartoon smiling orange cat with big eyes. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The word cat has a short A.", displayDiagram: { letters: [{text:"C"},{text:"A"},{text:"T"}], delay: 1500, revealCount: 3 }, afterPhonemes: ["short_a"], phonemeLetterIndices: [1] },
        { sub: "b", tts: "Short A says ah. Quick!", displayText: "Short A: ah", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "Long in CAKE", imagePrompt: `A cheerful cartoon pink frosted cake with a single lit candle. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The word cake has a long A.", displayDiagram: { letters: [{text:"C"},{text:"A"},{text:"K"},{text:"E"}], delay: 1500, revealCount: 4 }, afterPhonemes: ["long_a"], phonemeLetterIndices: [1] },
        { sub: "b", tts: "Long A says AY. It says its name!", displayText: "Long A: AY", displayDelay: 2500 },
        { sub: "c", tts: "A silent E at the end often signals a long vowel.", displayText: "Silent E = long vowel", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Listen Closely", imagePrompt: `A cheerful cartoon ear listening carefully with sound waves. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A vowel trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask: does the vowel say its name? Long. Or does it make a quick sound? Short.", displayText: "Name or quick?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to tell long from short vowels!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.3a-Q1","RF.2.3a-Q2","RF.2.3a-Q3","RF.2.3a-Q4","RF.2.3a-Q5"],
});

// RF.2.3b Vowel teams
build({
  standardId: "RF.2.3b", grade: "2nd Grade", domain: "Foundational Skills", title: "Vowel Team Sounds",
  slides: [
    { type: "intro", heading: "Vowel Teams", imagePrompt: `Two cheerful cartoon vowel characters holding hands with a small star between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Sometimes two vowels work together.", displayText: "Vowels team up", displayDelay: 2200 },
        { sub: "b", tts: "They make just one sound between them.", displayText: "One team = one sound", displayDelay: 2500 },
        { sub: "c", tts: "Let us meet some vowel teams.", displayText: "Meet the teams", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "EA and EE", imagePrompt: `A cheerful cartoon pea pod and a bumblebee side by side, both smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "EA says EE, like in eat or read.", displayText: "EA = EE", displayDelay: 2500 },
        { sub: "b", tts: "EE says EE too, like in bee or tree.", displayText: "EE = EE", displayDelay: 2500 },
        { sub: "c", tts: "Two different spellings, same sound!", displayText: "Same sound!", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "AI and OA", imagePrompt: `A cheerful cartoon rain cloud and a rowboat on a lake, both smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "AI says AY, like in rain or train.", displayText: "AI = AY", displayDelay: 2500 },
        { sub: "b", tts: "OA says OH, like in boat or road.", displayText: "OA = OH", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "First Vowel Talks", imagePrompt: `A cheerful cartoon first vowel character speaking into a microphone while the second stands silent behind. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A team trick", displayDelay: 1500 },
        { sub: "b", tts: "When two vowels walk together, the first one does the talking!", displayText: "First talks, second walks", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read vowel teams!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.3b-Q1","RF.2.3b-Q2","RF.2.3b-Q3","RF.2.3b-Q4","RF.2.3b-Q5"],
});

// RF.2.3c Two-syllable long vowel words
build({
  standardId: "RF.2.3c", grade: "2nd Grade", domain: "Foundational Skills", title: "Two-Syllable Long Vowel Words",
  slides: [
    { type: "intro", heading: "Long Words, Long Sounds", imagePrompt: `A cheerful cartoon word tile character stretching tall, with musical notes floating around. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Two-syllable words often have long vowel sounds.", displayText: "Often long vowels", displayDelay: 2500 },
        { sub: "b", tts: "Breaking the word into pieces helps us read them.", displayText: "Break into pieces", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Break BASEBALL", imagePrompt: `A cheerful cartoon baseball with stitches and a smile on a green field. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Baseball becomes base and ball.", displayText: "base | ball", displayDelay: 2500 },
        { sub: "b", tts: "Base has a long A. The silent E makes it long.", displayText: "base: long A", displayDelay: 2500 },
        { sub: "c", tts: "Ball has a short sound. Both pieces together? Baseball!", displayText: "baseball", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Break RAINBOW", imagePrompt: `A cheerful cartoon rainbow arching over a green hill with a tiny sun. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Rainbow becomes rain and bow.", displayText: "rain | bow", displayDelay: 2500 },
        { sub: "b", tts: "Rain has the AI team. Long A sound!", displayText: "rain: AI = AY", displayDelay: 2500 },
        { sub: "c", tts: "Bow has OW. Another long sound!", displayText: "bow: long O", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Split, Read, Blend", imagePrompt: `A cheerful cartoon pair of scissors splitting a long word tile into two pieces. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A decoding trick", displayDelay: 1500 },
        { sub: "b", tts: "Split. Read each piece. Then blend them back together!", displayText: "Split, read, blend", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read two-syllable long vowel words!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.3c-Q1","RF.2.3c-Q2","RF.2.3c-Q3","RF.2.3c-Q4","RF.2.3c-Q5"],
});

// RF.2.3d Prefixes and suffixes
build({
  standardId: "RF.2.3d", grade: "2nd Grade", domain: "Foundational Skills", title: "Prefixes and Suffixes",
  slides: [
    { type: "intro", heading: "Word Add-Ons", imagePrompt: `A cheerful cartoon word with tiny prefix and suffix puzzle pieces snapping onto it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Little pieces stick on the front and back of words.", displayText: "Front + back add-ons", displayDelay: 2500 },
        { sub: "b", tts: "The front ones are prefixes. The back ones are suffixes.", displayText: "Prefix + suffix", displayDelay: 2500 },
        { sub: "c", tts: "Each one changes the word's meaning!", displayText: "Changes meaning", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "UN and RE Prefixes", imagePrompt: `A cheerful cartoon padlock being unlocked with a magical glow. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "UN means not. Unhappy means not happy.", displayText: "UN = not", displayDelay: 2500 },
        { sub: "b", tts: "RE means again. Redo means do again.", displayText: "RE = again", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "ER and LY Suffixes", imagePrompt: `A cheerful cartoon teacher with a clipboard next to a tiny running character. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "ER means one who does. Teacher means one who teaches.", displayText: "ER = one who does", displayDelay: 2500 },
        { sub: "b", tts: "LY turns a word into how. Quickly means in a quick way.", displayText: "LY = how", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Peel It Apart", imagePrompt: `A cheerful cartoon banana peeling apart into three pieces with a tiny smile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A pieces trick", displayDelay: 1500 },
        { sub: "b", tts: "When you meet a long word, peel off the prefix and suffix. Find the root!", displayText: "Peel + find root", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read prefixes and suffixes!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.3d-Q1","RF.2.3d-Q2","RF.2.3d-Q3"],
});

// RF.2.3e Tricky spellings
build({
  standardId: "RF.2.3e", grade: "2nd Grade", domain: "Foundational Skills", title: "Tricky Spellings",
  slides: [
    { type: "intro", heading: "Silent Letters and Surprises", imagePrompt: `A cheerful cartoon letter K with a finger on its lips in a shh pose, a tiny sparkle nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some spellings are tricky. Letters hide or change sound!", displayText: "Letters hide!", displayDelay: 2500 },
        { sub: "b", tts: "These are surprises English throws at us.", displayText: "English surprises", displayDelay: 2500 },
        { sub: "c", tts: "Let us learn a few common ones.", displayText: "Common tricks", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "Silent Letters", imagePrompt: `A cheerful cartoon knee wearing a pair of glasses, a tiny letter K hiding in a bush nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "In knee, the K is silent.", displayText: "knee: silent K", displayDelay: 2500 },
        { sub: "b", tts: "In lamb, the B is silent.", displayText: "lamb: silent B", displayDelay: 2500 },
        { sub: "c", tts: "In write, the W is silent too!", displayText: "write: silent W", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "PH Makes F", imagePrompt: `A cheerful cartoon phone character with a friendly smile and tiny sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When P and H team up, they make the F sound!", displayText: "PH = F", displayDelay: 2500 },
        { sub: "b", tts: "Phone. Photo. Dolphin. All PH words that sound like F.", displayText: "phone, photo, dolphin", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Memorize the Surprises", imagePrompt: `A cheerful cartoon brain with a graduation cap, smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A spelling trick", displayDelay: 1500 },
        { sub: "b", tts: "When a word surprises you, write it down. Then practice it a few times!", displayText: "Write + practice", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read tricky spellings!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.3e-Q1","RF.2.3e-Q2","RF.2.3e-Q3","RF.2.3e-Q4","RF.2.3e-Q5"],
});

// RF.2.3f Sight words 2
build({
  standardId: "RF.2.3f", grade: "2nd Grade", domain: "Foundational Skills", title: "Sight Words Round Two",
  slides: [
    { type: "intro", heading: "More Sight Words", imagePrompt: `A cheerful cartoon shelf of colorful sight word flashcards with tiny sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "You already know some sight words. It is time for more!", displayText: "More to learn", displayDelay: 2500 },
        { sub: "b", tts: "Second grade sight words show up in every book.", displayText: "In every book", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Because and People", imagePrompt: `Two cheerful cartoon word tiles with happy faces in a row. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Because is a big word that shows up a lot.", displayDiagram: { letters: [{text:"because"}], delay: 1500 } },
        { sub: "b", tts: "People has a silent O. P-e-o-p-l-e!", displayDiagram: { letters: [{text:"people"}], delay: 1500 } },
      ]},
    { type: "teach", heading: "Again and Could", imagePrompt: `Two cheerful cartoon word tiles side by side, each with tiny sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Again has an AI but sounds like uh-gen.", displayDiagram: { letters: [{text:"again"}], delay: 1500 } },
        { sub: "b", tts: "Could has a silent L! C-o-u-l-d, sounds like kood.", displayDiagram: { letters: [{text:"could"}], delay: 1500 } },
      ]},
    { type: "tip", heading: "See Them Often", imagePrompt: `A cheerful cartoon flashcard character with a friendly smile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A sight word trick", displayDelay: 1500 },
        { sub: "b", tts: "The more often you see a sight word, the faster you know it.", displayText: "See often = learn", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready for more sight words!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.3f-Q1","RF.2.3f-Q2","RF.2.3f-Q3","RF.2.3f-Q4","RF.2.3f-Q5"],
});

// RF.2.4 Reading fluency overview
build({
  standardId: "RF.2.4", grade: "2nd Grade", domain: "Foundational Skills", title: "Reading with Flow",
  slides: [
    { type: "intro", heading: "Smooth Reading", imagePrompt: `A cheerful cartoon child reading out loud on a small stage with warm spotlight. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Great readers read smoothly, like talking.", displayText: "Smooth = good", displayDelay: 2500 },
        { sub: "b", tts: "Fluency is reading accurately, at the right speed, with expression.", displayText: "Accuracy + rate + expression", displayDelay: 3000 },
      ]},
    { type: "teach", heading: "Accuracy First", imagePrompt: `A cheerful cartoon target with an arrow in the bullseye. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Accuracy means reading the words correctly.", displayText: "Accuracy = correct words", displayDelay: 2500 },
        { sub: "b", tts: "If you get stuck, slow down and sound it out.", displayText: "Stuck = slow + sound", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Rate and Expression", imagePrompt: `A cheerful cartoon metronome swinging back and forth with a smile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Rate is how fast. Not too fast, not too slow.", displayText: "Rate = speed", displayDelay: 2500 },
        { sub: "b", tts: "Expression means using your voice to match the story.", displayText: "Expression = voice", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Read Like You Talk", imagePrompt: `A cheerful cartoon kid laughing while reading a funny book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A fluency trick", displayDelay: 1500 },
        { sub: "b", tts: "Pretend you are telling the story to a friend. Use your normal voice!", displayText: "Talk, do not recite", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read with flow!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.4-Q1","RF.2.4-Q2","RF.2.4-Q3","RF.2.4-Q4","RF.2.4-Q5"],
});

// RF.2.4a Reading with Purpose
build({
  standardId: "RF.2.4a", grade: "2nd Grade", domain: "Foundational Skills", title: "Reading with Purpose",
  slides: [
    { type: "intro", heading: "Know Your Why", imagePrompt: `A cheerful cartoon kid with a compass and a small book, looking ready to explore. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Before reading, ask yourself why.", displayText: "Ask why", displayDelay: 2000 },
        { sub: "b", tts: "Are you reading for fun? Or to learn something?", displayText: "Fun or learn?", displayDelay: 2500 },
        { sub: "c", tts: "Knowing your why helps you focus.", displayText: "Why = focus", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "Match Purpose to Book", imagePrompt: `A cheerful cartoon kid choosing between two books, a storybook and a fact book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Want an adventure? Pick a storybook.", displayText: "Adventure = story", displayDelay: 2500 },
        { sub: "b", tts: "Want to learn about tigers? Pick a fact book.", displayText: "Learn = fact", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Set a Goal", imagePrompt: `A cheerful cartoon kid crossing a finish line holding a book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Set a small reading goal.", displayText: "Set a goal", displayDelay: 2000 },
        { sub: "b", tts: "I want to learn three facts about sharks!", displayText: "3 shark facts", displayDelay: 2500 },
        { sub: "c", tts: "Now your reading has a mission.", displayText: "Mission!", displayDelay: 2000 },
      ]},
    { type: "tip", heading: "Think Before You Open", imagePrompt: `A cheerful cartoon kid tapping their chin thoughtfully next to a pile of books. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A purpose trick", displayDelay: 1500 },
        { sub: "b", tts: "Before opening a book, ask: what do I want to get out of this?", displayText: "What do I want?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read with purpose!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.4a-Q1","RF.2.4a-Q2","RF.2.4a-Q3","RF.2.4a-Q4","RF.2.4a-Q5"],
});

// RF.2.4b Smooth Out-Loud Reading
build({
  standardId: "RF.2.4b", grade: "2nd Grade", domain: "Foundational Skills", title: "Smooth Out-Loud Reading",
  slides: [
    { type: "intro", heading: "Read Out Loud Like a Pro", imagePrompt: `A cheerful cartoon kid holding a book on a small stage, with a microphone. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Reading out loud is a skill you can grow.", displayText: "Grow this skill", displayDelay: 2500 },
        { sub: "b", tts: "Three things help: accuracy, rate, and expression.", displayText: "Accuracy + rate + expression", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "Match the Mark", imagePrompt: `Three cheerful cartoon punctuation marks in a row. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Periods mean a full stop. Voice down.", displayText: ". = stop + voice down", displayDelay: 2500 },
        { sub: "b", tts: "Question marks lift your voice up.", displayText: "? = voice up", displayDelay: 2500 },
        { sub: "c", tts: "Exclamation marks mean excited!", displayText: "! = excited", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Practice Makes Smooth", imagePrompt: `A cheerful cartoon kid reading the same book twice, each time looking more confident. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Smooth reading comes from practice.", displayText: "Practice = smooth", displayDelay: 2500 },
        { sub: "b", tts: "Read the same passage a few times. It gets easier!", displayText: "Reread to grow", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Record Yourself", imagePrompt: `A cheerful cartoon kid holding a tiny microphone recording themselves reading. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A reading trick", displayDelay: 1500 },
        { sub: "b", tts: "Record yourself reading. Listen back. What sounded great?", displayText: "Listen back", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read smoothly out loud!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.4b-Q1","RF.2.4b-Q2","RF.2.4b-Q3","RF.2.4b-Q4","RF.2.4b-Q5"],
});

// RF.2.4c Self-correcting
build({
  standardId: "RF.2.4c", grade: "2nd Grade", domain: "Foundational Skills", title: "Self-Correcting While Reading",
  slides: [
    { type: "intro", heading: "Catch Yourself", imagePrompt: `A cheerful cartoon kid lifting a finger in a thinking pose next to a book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Great readers catch their own mistakes.", displayText: "Catch your own slips", displayDelay: 2500 },
        { sub: "b", tts: "When something does not make sense, they stop and fix it.", displayText: "Stop + fix", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Stop, Think, Try Again", imagePrompt: `A cheerful cartoon stop sign next to a thinking bubble and a small checkmark. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Step one: stop when it feels off.", displayText: "1: stop", displayDelay: 2000 },
        { sub: "b", tts: "Step two: think. Does that word fit?", displayText: "2: think", displayDelay: 2500 },
        { sub: "c", tts: "Step three: try again with the right word.", displayText: "3: try again", displayDelay: 2500 },
      ]},
    { type: "example", heading: "The Cat Sat", imagePrompt: `A cheerful cartoon cat sitting on a rug, with a tiny thought bubble above a reader showing a rug and a map. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "You read: the cat sat on the rug. But you said map.", displayText: "Said map, not rug", displayDelay: 2800 },
        { sub: "b", tts: "Does a cat sit on a map? No! Stop, think, try again.", displayText: "Stop, think, try", displayDelay: 2500 },
        { sub: "c", tts: "Rug! That makes sense.", displayText: "Rug!", displayDelay: 2000 },
      ]},
    { type: "tip", heading: "Ask If It Makes Sense", imagePrompt: `A cheerful cartoon kid with a smile and a thought bubble containing a checkmark. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A self-correct trick", displayDelay: 1500 },
        { sub: "b", tts: "After each sentence, ask: did that make sense?", displayText: "Did it make sense?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to self-correct while reading!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RF.2.4c-Q1","RF.2.4c-Q2","RF.2.4c-Q3","RF.2.4c-Q4","RF.2.4c-Q5"],
});
