#!/usr/bin/env node
/** G3 Language: 13 lessons (L.3.1/2/3 need MCQs) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";
const L = (id,title,slides,mcqIds)=>build({standardId:id,grade:"3rd Grade",domain:"Language",title,slides,mcqIds});

// L.3.1 — needs MCQs
addMCQs({standardId:"L.3.1",grade:"3rd Grade",domain:"Language",description:"Demonstrate command of the conventions of standard English grammar and usage when writing or speaking",parentTip:"Verb tenses, subject-verb agreement, comparatives.",
  questions:[
    {type:"multiple_choice",prompt:"Pick the right verb: Yesterday, I ___ to the park.",choices:["went","goed","gone","go"],correct:"went",hint:"Yesterday means past. The past of go is went!",difficulty:1,imagePrompt:`A cheerful cartoon kid walking toward a sunny park, smiling. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which sentence agrees correctly?",choices:["The dogs run fast.","The dogs runs fast.","The dog run fast.","The dog runned fast."],correct:"The dogs run fast.",hint:"Dogs is plural — use run, not runs.",difficulty:1,imagePrompt:`Two cheerful cartoon dogs running together with motion lines. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"What is the comparative form of **fast**?",choices:["faster","fastest","more fast","fastly"],correct:"faster",hint:"Add -er to compare two things!",difficulty:1,imagePrompt:`A cheerful cartoon rabbit racing past a slower turtle, both smiling. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which is the superlative form of **happy**?",choices:["happiest","happier","more happy","happily"],correct:"happiest",hint:"Use -est when comparing three or more.",difficulty:2,imagePrompt:`A cheerful cartoon kid jumping for joy with the biggest smile. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which sentence uses the right verb tense?",choices:["I am eating an apple now.","I were eating an apple now.","I am eat an apple now.","I am ate an apple now."],correct:"I am eating an apple now.",hint:"Now means present. Use am eating!",difficulty:2,imagePrompt:`A cheerful cartoon kid biting into a shiny red apple. Clean pastel background. ${IMG}`},
  ]});
L("L.3.1","Verb Tenses and More",[
  {type:"intro",heading:"Grammar Up a Notch",imagePrompt:`A cheerful cartoon kid stepping up onto a small podium with a sentence card. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Third graders learn more grammar moves.",displayText:"More grammar",displayDelay:2500},
    {sub:"b",tts:"Verb tenses, subject agreement, and comparing things.",displayText:"Tense / agree / compare",displayDelay:2500},
  ]},
  {type:"teach",heading:"Past, Present, Future",imagePrompt:`A cheerful cartoon clock with arrows pointing to past, now, and future. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Past: I walked. Present: I walk. Future: I will walk.",displayText:"walked / walk / will walk",displayDelay:2800},
  ]},
  {type:"teach",heading:"Compare with -ER and -EST",imagePrompt:`Three cheerful cartoon kids standing in order from short to tall. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Use -ER to compare two things. Tall, taller.",displayText:"-ER for two",displayDelay:2500},
    {sub:"b",tts:"Use -EST for three or more. Tall, taller, tallest!",displayText:"-EST for three+",displayDelay:2500},
  ]},
  {type:"tip",heading:"Say It Out Loud",imagePrompt:`A cheerful cartoon kid testing a sentence out loud. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A grammar trick",displayDelay:1500},
    {sub:"b",tts:"Read your sentence aloud. If it sounds off, try a different verb form.",displayText:"Sounds off? Adjust",displayDelay:2500},
    {sub:"c",tts:"Now you are ready for verb tenses and more!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.1-Q1","L.3.1-Q2","L.3.1-Q3","L.3.1-Q4","L.3.1-Q5"]);

// L.3.2 — needs MCQs
addMCQs({standardId:"L.3.2",grade:"3rd Grade",domain:"Language",description:"Demonstrate command of the conventions of standard English capitalization, punctuation, and spelling",parentTip:"Quotation marks for talking, commas for lists and dates.",
  questions:[
    {type:"multiple_choice",prompt:"Which uses quotation marks correctly?",choices:["Maya said, \"Hi!\"","Maya said Hi","\"Maya said\" Hi","Maya, said Hi!"],correct:"Maya said, \"Hi!\"",hint:"Wrap the spoken words in quotation marks!",difficulty:1,imagePrompt:`A cheerful cartoon kid waving hello with a tiny speech bubble that says hi. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"What punctuation is needed in a date like **March 5 2026**?",choices:["a comma between day and year","no punctuation","a period after each","a question mark"],correct:"a comma between day and year",hint:"Always put a comma between the day and year!",difficulty:1,imagePrompt:`A cheerful cartoon calendar page with a day and year highlighted. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which sentence is punctuated correctly?",choices:["I bought apples, bananas, and grapes.","I bought apples bananas and grapes.","I bought, apples, bananas, and, grapes.","I bought apples; bananas; and grapes."],correct:"I bought apples, bananas, and grapes.",hint:"Use commas to separate items in a list!",difficulty:1,imagePrompt:`Three cheerful cartoon fruits in a row with smiles. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which is **possessive** (shows owning)?",choices:["the kid's bag","the kids bag","the kids bags","the kid bags"],correct:"the kid's bag",hint:"Apostrophe + S shows owning!",difficulty:2,imagePrompt:`A cheerful cartoon kid holding their bag with a tiny apostrophe. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Where do quotation marks go in: She said hello?",choices:["She said, \"hello.\"","She, said hello","She said \"hello\"","She said hello,"],correct:"She said, \"hello.\"",hint:"Spoken words go inside quotation marks!",difficulty:2,imagePrompt:`A cheerful cartoon kid waving with a speech bubble saying hello. Clean pastel background. ${IMG}`},
  ]});
L("L.3.2","Quotes and Commas",[
  {type:"intro",heading:"Marks That Speak",imagePrompt:`A cheerful cartoon pair of quotation marks holding hands above a sentence. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Quotation marks show what someone is saying.",displayText:"Quotes = speech",displayDelay:2500},
    {sub:"b",tts:"Commas help separate ideas in a sentence.",displayText:"Commas = separate",displayDelay:2500},
  ]},
  {type:"teach",heading:"Quotation Marks",imagePrompt:`A cheerful cartoon kid talking with a speech bubble. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Wrap the spoken words. Maya said comma quote Hi quote.",displayText:`Maya said, "Hi"`,displayDelay:2800},
  ]},
  {type:"teach",heading:"Commas in Lists and Dates",imagePrompt:`A cheerful cartoon list with commas between items. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Lists: apples, bananas, and grapes.",displayText:"apples, bananas, grapes",displayDelay:2500},
    {sub:"b",tts:"Dates: March 5, 2026.",displayText:"March 5, 2026",displayDelay:2500},
  ]},
  {type:"tip",heading:"Read It Carefully",imagePrompt:`A cheerful cartoon eye looking at a sentence with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A punctuation trick",displayDelay:1500},
    {sub:"b",tts:"Reread your sentence and listen for natural pauses. That is where commas often go.",displayText:"Pauses = commas",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for quotes and commas!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.2-Q1","L.3.2-Q2","L.3.2-Q3","L.3.2-Q4","L.3.2-Q5"]);

// L.3.3 — needs MCQs
addMCQs({standardId:"L.3.3",grade:"3rd Grade",domain:"Language",description:"Use knowledge of language and its conventions when writing, speaking, reading, or listening",parentTip:"Pick words that match your audience and purpose.",
  questions:[
    {type:"multiple_choice",prompt:"Which is the strongest way to say **good**?",choices:["fantastic","fine","okay","not bad"],correct:"fantastic",hint:"Fantastic means really, really good!",difficulty:1,imagePrompt:`A cheerful cartoon kid throwing confetti with a huge smile. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"You are writing to a friend. Which is best?",choices:["Hey, what's up?","To whom it may concern,","Dear sir or madam,","Esteemed colleague,"],correct:"Hey, what's up?",hint:"Friends use casual greetings!",difficulty:1,imagePrompt:`A cheerful cartoon kid waving to a friend on the phone. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which word adds the most picture to **walked**?",choices:["strolled","went","moved","came"],correct:"strolled",hint:"Strolled means walked in a relaxed way!",difficulty:2,imagePrompt:`A cheerful cartoon kid taking a relaxed walk in a park. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Why do writers choose specific words?",choices:["to give a clearer picture","to use the longest words","to fill space","because it sounds smart"],correct:"to give a clearer picture",hint:"Specific words paint clearer pictures.",difficulty:2,imagePrompt:`A cheerful cartoon paintbrush painting a clear picture. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which sentence has the strongest verb?",choices:["The cat pounced on the toy.","The cat went on the toy.","The cat sat on the toy.","The cat was on the toy."],correct:"The cat pounced on the toy.",hint:"Pounced shows action vividly!",difficulty:2,imagePrompt:`A cheerful cartoon cat mid-pounce, leaping on a tiny toy. Clean pastel background. ${IMG}`},
  ]});
L("L.3.3","Picking the Best Words",[
  {type:"intro",heading:"Word Choice Matters",imagePrompt:`A cheerful cartoon kid choosing word cards from a colorful basket. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"The words you choose paint a picture for your reader.",displayText:"Words paint pictures",displayDelay:2500},
  ]},
  {type:"teach",heading:"Strong Verbs and Vivid Words",imagePrompt:`A cheerful cartoon kid flexing with a sparkling word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Strong verbs paint a stronger picture. Pounced beats went.",displayText:"Pounced > went",displayDelay:2500},
    {sub:"b",tts:"Specific words help your reader see exactly what you mean.",displayText:"Specific = clearer",displayDelay:2500},
  ]},
  {type:"teach",heading:"Match Your Audience",imagePrompt:`A cheerful cartoon kid with three letters labeled friend, teacher, principal. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Talking to a friend? Casual is fine.",displayText:"Friend = casual",displayDelay:2500},
    {sub:"b",tts:"Writing to a teacher or principal? Use formal words.",displayText:"Formal for teachers",displayDelay:2500},
  ]},
  {type:"tip",heading:"Try Different Words",imagePrompt:`A cheerful cartoon kid swapping a word in a sentence with a different one. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A word-swap trick",displayDelay:1500},
    {sub:"b",tts:"Reread your sentence. Could a stronger word make it more vivid?",displayText:"Stronger word?",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to pick the best words!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.3-Q1","L.3.3-Q2","L.3.3-Q3","L.3.3-Q4","L.3.3-Q5"]);

L("L.3.4","Word Meaning Detective",[
  {type:"intro",heading:"Crack the Code",imagePrompt:`A cheerful cartoon detective kid with a magnifying glass over a word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Tricky words can be cracked using clues.",displayText:"Cracked with clues",displayDelay:2500},
  ]},
  {type:"teach",heading:"Use the Sentence",imagePrompt:`A cheerful cartoon sentence with a glowing word in the middle. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"The other words in the sentence give hints.",displayText:"Sentence = hints",displayDelay:2500},
  ]},
  {type:"teach",heading:"Use Word Parts",imagePrompt:`A cheerful cartoon word puzzle splitting into prefix, root, suffix. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Break the word into chunks. Prefix, root, suffix.",displayText:"Chunks have meaning",displayDelay:2500},
  ]},
  {type:"tip",heading:"Combine Both",imagePrompt:`A cheerful cartoon kid combining two clue cards. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A word trick",displayDelay:1500},
    {sub:"b",tts:"Combine sentence clues with word parts. You will almost always crack it!",displayText:"Combine = crack it",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to detect word meanings!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.4-Q1","L.3.4-Q2"]);

L("L.3.4a","Sentence Clues",[
  {type:"intro",heading:"Clues Inside Sentences",imagePrompt:`A cheerful cartoon magnifying glass over a sentence with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Hard words often have clues right beside them.",displayText:"Beside them",displayDelay:2200},
  ]},
  {type:"teach",heading:"Synonym Hints",imagePrompt:`Two cheerful cartoon words holding hands as synonyms. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Sometimes the next sentence gives you a synonym.",displayText:"Synonym hints",displayDelay:2500},
    {sub:"b",tts:"He felt elated. He was super happy. Elated equals super happy!",displayText:"elated = super happy",displayDelay:2800},
  ]},
  {type:"example",heading:"Example Hints",imagePrompt:`A cheerful cartoon arrow pointing from a hard word to an example. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Sometimes examples help. Mammals, like cats and dogs, have fur.",displayText:"Mammals = cats, dogs",displayDelay:2500},
  ]},
  {type:"tip",heading:"Hunt for the Hint",imagePrompt:`A cheerful cartoon detective hat. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A clue trick",displayDelay:1500},
    {sub:"b",tts:"Look for words like such as, that is, or for example. Hint warning!",displayText:"Look for hint signals",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to use sentence clues!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.4a-Q1","L.3.4a-Q2"]);

L("L.3.4b","Prefix Power",[
  {type:"intro",heading:"Front-of-the-Word Power",imagePrompt:`A cheerful cartoon prefix tile snapping onto the front of a word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Prefixes change a word's meaning right at the start.",displayText:"Front change",displayDelay:2500},
  ]},
  {type:"teach",heading:"UN, RE, PRE",imagePrompt:`Three cheerful cartoon prefix tiles in a row. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"UN means not. RE means again. PRE means before.",displayText:"UN / RE / PRE",displayDelay:2800},
  ]},
  {type:"teach",heading:"DIS and MIS",imagePrompt:`A cheerful cartoon happy face vs sad face with DIS or MIS labels. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"DIS means opposite. Disagree.",displayText:"DIS = opposite",displayDelay:2500},
    {sub:"b",tts:"MIS means wrongly. Misspell.",displayText:"MIS = wrong",displayDelay:2500},
  ]},
  {type:"tip",heading:"Peel the Prefix",imagePrompt:`A cheerful cartoon banana peeling. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A prefix trick",displayDelay:1500},
    {sub:"b",tts:"Peel the prefix. What is left is the root. Add the prefix's meaning back!",displayText:"Peel + add meaning",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to use prefix power!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.4b-Q1","L.3.4b-Q2"]);

L("L.3.4c","Root Word Help",[
  {type:"intro",heading:"Roots Are Everything",imagePrompt:`A cheerful cartoon tree with deep visible roots. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"The root is the heart of the word.",displayText:"Root = heart",displayDelay:2500},
  ]},
  {type:"teach",heading:"Same Root, New Word",imagePrompt:`A cheerful cartoon tree with branches showing different word forms. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Build words from a root. Help, helper, helpful, helpless, unhelpful.",displayText:"help -> many words",displayDelay:2800},
  ]},
  {type:"example",heading:"Hand and Friend",imagePrompt:`A cheerful cartoon hand and friend characters waving. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Hand: handful, handy, handed.",displayText:"hand variants",displayDelay:2500},
    {sub:"b",tts:"Friend: friendly, friendship, unfriendly.",displayText:"friend variants",displayDelay:2500},
  ]},
  {type:"tip",heading:"Cover the Ends",imagePrompt:`A cheerful cartoon hand covering the ends of a word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A root trick",displayDelay:1500},
    {sub:"b",tts:"Cover any prefix and suffix. What is left? That is the root.",displayText:"Cover to find",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to use root word help!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.4c-Q1","L.3.4c-Q2"]);

L("L.3.4d","Using a Dictionary",[
  {type:"intro",heading:"Dictionaries Are Friends",imagePrompt:`A cheerful cartoon dictionary character with glasses smiling. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Dictionaries tell you meaning, pronunciation, and how to use a word.",displayText:"Meaning + sound + use",displayDelay:2800},
  ]},
  {type:"teach",heading:"ABC Order",imagePrompt:`A cheerful cartoon line of letters in alphabetical order. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Dictionaries are alphabetical. Find the first letter, then the next letter.",displayText:"ABC, then next letter",displayDelay:2800},
  ]},
  {type:"teach",heading:"Read the Entry",imagePrompt:`A cheerful cartoon dictionary page with one word entry highlighted. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Each entry has the word, how to say it, and the meaning.",displayText:"Word + sound + meaning",displayDelay:2800},
  ]},
  {type:"tip",heading:"Use Guide Words",imagePrompt:`A cheerful cartoon dictionary page with two big guide words at the top. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A dictionary trick",displayDelay:1500},
    {sub:"b",tts:"The two words at the top of the page show the first and last word on it. Use them to skim fast!",displayText:"Guide words = skim fast",displayDelay:3000},
    {sub:"c",tts:"Now you are ready to use a dictionary!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.4d-Q1","L.3.4d-Q2","L.3.4d-Q3","L.3.4d-Q4","L.3.4d-Q5"]);

L("L.3.5","Words With Hidden Meanings",[
  {type:"intro",heading:"Figurative Language",imagePrompt:`A cheerful cartoon word transforming into a tiny picture. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Some words mean more than what they say.",displayText:"More than words",displayDelay:2500},
    {sub:"b",tts:"Figurative language paints a picture or feeling.",displayText:"Paints pictures",displayDelay:2500},
  ]},
  {type:"teach",heading:"Similes and Metaphors",imagePrompt:`A cheerful cartoon kid as fast as a cheetah running. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Simile uses like or as. He ran like a cheetah.",displayText:"Simile = like / as",displayDelay:2500},
    {sub:"b",tts:"Metaphor says something is something else. Her smile is sunshine.",displayText:"Metaphor = is",displayDelay:2500},
  ]},
  {type:"teach",heading:"Idioms",imagePrompt:`A cheerful cartoon cat napping in a hammock. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Idioms have hidden meanings. Piece of cake means easy!",displayText:"Idiom = hidden meaning",displayDelay:2800},
  ]},
  {type:"tip",heading:"Listen and Picture",imagePrompt:`A cheerful cartoon ear and eye together with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A figurative trick",displayDelay:1500},
    {sub:"b",tts:"When words sound weird literally, look for a hidden meaning!",displayText:"Weird = hidden meaning",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for words with hidden meanings!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.5-Q1","L.3.5-Q2","L.3.5-Q3","L.3.5-Q4","L.3.5-Q5"]);

L("L.3.5a","Real and Imaginary Meanings",[
  {type:"intro",heading:"Literal vs Nonliteral",imagePrompt:`A cheerful cartoon scale with literal on one side and imaginary on the other. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Literal means exactly what it says.",displayText:"Literal = exact",displayDelay:2500},
    {sub:"b",tts:"Nonliteral is a picture in your mind.",displayText:"Nonliteral = picture",displayDelay:2500},
  ]},
  {type:"teach",heading:"Break a Leg",imagePrompt:`A cheerful cartoon performer on a stage smiling, with a friendly thumbs up. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Break a leg does not mean really break a leg!",displayText:"Not literal!",displayDelay:2500},
    {sub:"b",tts:"It is a fun way to say good luck.",displayText:"Means good luck",displayDelay:2500},
  ]},
  {type:"example",heading:"Couch Potato",imagePrompt:`A cheerful cartoon potato lying on a couch with a remote. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A couch potato is not a real potato!",displayText:"Not a real potato",displayDelay:2500},
    {sub:"b",tts:"It means someone who sits a lot.",displayText:"Means lazy on couch",displayDelay:2500},
  ]},
  {type:"tip",heading:"Spot the Picture",imagePrompt:`A cheerful cartoon kid with a thought bubble of a picture. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A meaning trick",displayDelay:1500},
    {sub:"b",tts:"If the words seem silly literally, the meaning is probably nonliteral!",displayText:"Silly literal? Nonliteral",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for real and imaginary meanings!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.5a-Q1","L.3.5a-Q2","L.3.5a-Q3","L.3.5a-Q4","L.3.5a-Q5"]);

L("L.3.5b","Words in Real Life",[
  {type:"intro",heading:"Where Do Words Live?",imagePrompt:`A cheerful cartoon kid looking around a room with labels on everyday things. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"New words come to life when you connect them to real moments.",displayText:"Connect to real life",displayDelay:2800},
  ]},
  {type:"teach",heading:"Cozy",imagePrompt:`A cheerful cartoon kid wrapped in a blanket with hot cocoa. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Cozy means warm and snug. A blanket. A small library nook.",displayText:"Cozy = warm + snug",displayDelay:2800},
  ]},
  {type:"teach",heading:"Brisk",imagePrompt:`A cheerful cartoon kid power walking with a scarf in fall. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Brisk means quick and lively. A brisk walk in cool air.",displayText:"Brisk = quick + lively",displayDelay:2800},
  ]},
  {type:"tip",heading:"Match a Memory",imagePrompt:`A cheerful cartoon thought bubble showing a real memory. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A real-life trick",displayDelay:1500},
    {sub:"b",tts:"Match each new word to a real memory or feeling. It will stick!",displayText:"Memory match = sticks",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to connect words to real life!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.5b-Q1","L.3.5b-Q2","L.3.5b-Q3","L.3.5b-Q4","L.3.5b-Q5"]);

L("L.3.5c","Word Strength Levels",[
  {type:"intro",heading:"Levels of Strength",imagePrompt:`A cheerful cartoon dial with levels going from gentle to fierce. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Some words have similar meanings but different strengths.",displayText:"Different strengths",displayDelay:2500},
  ]},
  {type:"teach",heading:"Hungry, Starving, Famished",imagePrompt:`Three cheerful cartoon kids showing rising hunger, last one really hungry. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Hungry. A bit hungry.",displayText:"Hungry = a bit",displayDelay:2200},
    {sub:"b",tts:"Starving. Really hungry!",displayText:"Starving = really",displayDelay:2200},
    {sub:"c",tts:"Famished. Extremely hungry!",displayText:"Famished = extreme",displayDelay:2200},
  ]},
  {type:"teach",heading:"Tired vs Exhausted",imagePrompt:`A cheerful cartoon kid yawning vs flopping on a bed. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Tired is normal. Exhausted is way more.",displayText:"Tired vs exhausted",displayDelay:2500},
  ]},
  {type:"tip",heading:"Pick the Right Strength",imagePrompt:`A cheerful cartoon kid choosing between three levels of color. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A strength trick",displayDelay:1500},
    {sub:"b",tts:"Match the strength of the word to the strength of the feeling.",displayText:"Match strength",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to pick the right strength!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.5c-Q1","L.3.5c-Q2","L.3.5c-Q3","L.3.5c-Q4","L.3.5c-Q5"]);

L("L.3.6","Using Conversation Words",[
  {type:"intro",heading:"Use Words in Real Talk",imagePrompt:`A cheerful cartoon kid chatting with a friend, sparkles around their words. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Use new words you learn in your conversations and writing.",displayText:"Use them daily",displayDelay:2500},
  ]},
  {type:"teach",heading:"Try New Words",imagePrompt:`A cheerful cartoon kid wearing a wizard hat tossing sparkly words. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Trying a new word once helps you remember it.",displayText:"Try once = remember",displayDelay:2500},
    {sub:"b",tts:"Use it again and it sticks for life.",displayText:"Use again = sticks",displayDelay:2500},
  ]},
  {type:"teach",heading:"Match the Setting",imagePrompt:`A cheerful cartoon kid switching between casual and formal hats. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Casual words for friends. Formal for school work.",displayText:"Casual vs formal",displayDelay:2500},
  ]},
  {type:"tip",heading:"One a Day",imagePrompt:`A cheerful cartoon calendar with a tiny new word on each day. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A vocabulary trick",displayDelay:1500},
    {sub:"b",tts:"Pick one new word a day. Use it in a sentence!",displayText:"One a day",displayDelay:2200},
    {sub:"c",tts:"Now you are ready to use conversation words!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.3.6-Q1","L.3.6-Q2","L.3.6-Q3","L.3.6-Q4","L.3.6-Q5"]);
