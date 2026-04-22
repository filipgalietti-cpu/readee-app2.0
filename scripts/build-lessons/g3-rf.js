#!/usr/bin/env node
/** G3 Foundations: 8 lessons */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";
const L = (id,title,slides,mcqIds)=>build({standardId:id,grade:"3rd Grade",domain:"Foundational Skills",title,slides,mcqIds});

L("RF.3.3","Word Analysis Skills",[
  {type:"intro",heading:"Break Words Apart",imagePrompt:`A cheerful cartoon pair of scissors cutting a long word into chunks. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Word analysis means breaking words into pieces to read them.",displayText:"Break into pieces",displayDelay:2800},
  ]},
  {type:"teach",heading:"Chunks and Parts",imagePrompt:`A cheerful cartoon word tile split into three glowing chunks. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Look for prefixes, roots, and suffixes.",displayText:"Prefix / root / suffix",displayDelay:2500},
    {sub:"b",tts:"Each chunk has a meaning and a sound.",displayText:"Meaning + sound",displayDelay:2500},
  ]},
  {type:"example",heading:"Unbelievable",imagePrompt:`A cheerful cartoon kid with eyes wide and mouth open in surprise. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Unbelievable breaks into UN + BELIEVE + ABLE.",displayText:"UN + BELIEVE + ABLE",displayDelay:2800},
    {sub:"b",tts:"Not able to be believed. Just like that, we understand!",displayText:"Not able to believe",displayDelay:2500},
  ]},
  {type:"tip",heading:"Chunk It",imagePrompt:`A cheerful cartoon kid looking at a long word and drawing lines between pieces. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A chunk trick",displayDelay:1500},
    {sub:"b",tts:"When you see a long word, mark chunks before you read it.",displayText:"Mark + read",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to analyze words!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.3-Q1","RF.3.3-Q2","RF.3.3-Q3","RF.3.3-Q4","RF.3.3-Q5"]);

L("RF.3.3a","Common Prefixes and Suffixes",[
  {type:"intro",heading:"Meet the Add-Ons",imagePrompt:`Three cheerful cartoon prefix tiles and three suffix tiles in rows. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Prefixes and suffixes show up in lots of words.",displayText:"Show up a lot",displayDelay:2500},
    {sub:"b",tts:"Knowing the common ones makes reading easier.",displayText:"Easier reading",displayDelay:2500},
  ]},
  {type:"teach",heading:"Top Prefixes",imagePrompt:`A cheerful cartoon chart with UN, RE, PRE, DIS glowing. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"UN is not. RE is again. PRE is before. DIS is the opposite.",displayText:"UN / RE / PRE / DIS",displayDelay:3000},
  ]},
  {type:"teach",heading:"Top Suffixes",imagePrompt:`A cheerful cartoon chart with ER, ING, FUL, LESS glowing. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"ER means one who does. ING means happening now.",displayText:"ER + ING",displayDelay:2500},
    {sub:"b",tts:"FUL means full of. LESS means without.",displayText:"FUL + LESS",displayDelay:2500},
  ]},
  {type:"tip",heading:"Flashcards Help",imagePrompt:`A cheerful cartoon stack of colorful flashcards with prefixes and suffixes. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A flashcard trick",displayDelay:1500},
    {sub:"b",tts:"Make flashcards of common prefixes and suffixes. Quiz yourself!",displayText:"Flashcards + quiz",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to use prefixes and suffixes!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.3a-Q1","RF.3.3a-Q2","RF.3.3a-Q3","RF.3.3a-Q4","RF.3.3a-Q5"]);

L("RF.3.3b","Latin Suffixes",[
  {type:"intro",heading:"Suffixes From Long Ago",imagePrompt:`A cheerful cartoon scroll with ancient Latin-style writing and friendly faces. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Some suffixes come from Latin, a very old language.",displayText:"From Latin",displayDelay:2500},
    {sub:"b",tts:"Learning them unlocks lots of big words.",displayText:"Unlock big words",displayDelay:2500},
  ]},
  {type:"teach",heading:"ION and TION",imagePrompt:`A cheerful cartoon word tile with -TION glowing at the end. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"TION makes a verb into a noun. Act becomes action.",displayText:"TION: action, reaction",displayDelay:2800},
    {sub:"b",tts:"Celebrate becomes celebration. Create becomes creation.",displayText:"celebration, creation",displayDelay:2800},
  ]},
  {type:"teach",heading:"ABLE and IBLE",imagePrompt:`A cheerful cartoon capable-looking kid with thumbs up. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"ABLE or IBLE means able to.",displayText:"ABLE = able to",displayDelay:2500},
    {sub:"b",tts:"Readable. Washable. Possible. Visible.",displayText:"Readable, washable",displayDelay:2500},
  ]},
  {type:"tip",heading:"Spot the Pattern",imagePrompt:`A cheerful cartoon magnifying glass over a word ending. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A Latin trick",displayDelay:1500},
    {sub:"b",tts:"When you see TION, ABLE, or IBLE, you already know part of the meaning!",displayText:"Already know a piece",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for Latin suffixes!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.3b-Q1","RF.3.3b-Q2","RF.3.3b-Q3","RF.3.3b-Q4","RF.3.3b-Q5"]);

L("RF.3.3c","Multisyllable Words",[
  {type:"intro",heading:"Big Words, No Sweat",imagePrompt:`A cheerful cartoon kid shrugging confidently at a long word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Multisyllable words have three or more syllables.",displayText:"3+ syllables",displayDelay:2500},
    {sub:"b",tts:"Long words are just small words put together.",displayText:"Small parts together",displayDelay:2500},
  ]},
  {type:"teach",heading:"Clap Them Out",imagePrompt:`A cheerful cartoon kid clapping, with three clap emojis floating. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Clap each syllable. Re-mem-ber. Three claps. Three syllables!",displayText:"Re-mem-ber = 3 claps",displayDelay:3000},
  ]},
  {type:"teach",heading:"Split Strategically",imagePrompt:`A cheerful cartoon kid marking divisions in a word with a tiny pencil. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Look for vowels. Each syllable has one vowel sound.",displayText:"Vowel per syllable",displayDelay:2500},
    {sub:"b",tts:"Split between consonants or before a single consonant.",displayText:"Split by vowels",displayDelay:2500},
  ]},
  {type:"tip",heading:"Chunk + Read",imagePrompt:`A cheerful cartoon pencil drawing slashes between syllables on a word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A chunk trick",displayDelay:1500},
    {sub:"b",tts:"Draw slashes between syllables. Read each chunk, then blend.",displayText:"Chunk + blend",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to read long words!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.3c-Q1","RF.3.3c-Q2","RF.3.3c-Q3","RF.3.3c-Q4","RF.3.3c-Q5"]);

L("RF.3.3d","Tricky Spelling Patterns",[
  {type:"intro",heading:"Sneaky Spellings",imagePrompt:`A cheerful cartoon word with a silent letter wearing a tiny ghost costume. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Some words spell the same sound in sneaky ways.",displayText:"Sneaky spellings",displayDelay:2500},
  ]},
  {type:"teach",heading:"Silent Letters",imagePrompt:`A cheerful cartoon letter K tiptoeing silently. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Silent letters like K in knee or W in write are common.",displayText:"Silent K and W",displayDelay:2500},
  ]},
  {type:"teach",heading:"OUGH Surprises",imagePrompt:`A cheerful cartoon word with O-U-G-H surrounded by question marks. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"OUGH can make many sounds! Tough, through, though, thought.",displayText:"tough, through, though",displayDelay:3000},
  ]},
  {type:"tip",heading:"Just Memorize",imagePrompt:`A cheerful cartoon brain with a bookmark. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A tricky-word trick",displayDelay:1500},
    {sub:"b",tts:"When spellings surprise you, put them on a list and practice them.",displayText:"List + practice",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for tricky spelling patterns!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.3d-Q1","RF.3.3d-Q2","RF.3.3d-Q3","RF.3.3d-Q4","RF.3.3d-Q5"]);

L("RF.3.4","Reading with Flow",[
  {type:"intro",heading:"Smooth Reading",imagePrompt:`A cheerful cartoon kid reading on a stage confidently with warm lighting. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fluent reading means smooth, accurate, and expressive.",displayText:"Smooth + accurate + expressive",displayDelay:2800},
  ]},
  {type:"teach",heading:"Reread to Improve",imagePrompt:`A cheerful cartoon kid reading the same book twice with growing confidence. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"If a passage feels bumpy, reread it.",displayText:"Reread bumpy parts",displayDelay:2500},
    {sub:"b",tts:"Each read gets smoother.",displayText:"Smoother each time",displayDelay:2500},
  ]},
  {type:"teach",heading:"Expression Matters",imagePrompt:`A cheerful cartoon microphone with a small musical note. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Use your voice to match the mood. Excited. Calm. Surprised.",displayText:"Voice = mood",displayDelay:2500},
  ]},
  {type:"tip",heading:"Read Aloud Daily",imagePrompt:`A cheerful cartoon kid reading aloud to a pet. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A fluency trick",displayDelay:1500},
    {sub:"b",tts:"Read aloud to someone — family, pet, or even a stuffed animal!",displayText:"Read aloud daily",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to read with flow!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.4-Q1","RF.3.4-Q2","RF.3.4-Q3","RF.3.4-Q4","RF.3.4-Q5"]);

L("RF.3.4a","Reading with Purpose",[
  {type:"intro",heading:"Set Your Why",imagePrompt:`A cheerful cartoon kid with a compass and a book, ready to explore. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Great readers know why they are reading.",displayText:"Know your why",displayDelay:2500},
  ]},
  {type:"teach",heading:"Match Purpose to Book",imagePrompt:`A cheerful cartoon kid at a bookshelf choosing between two books. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Different goals need different books. Stories for fun. Facts for learning.",displayText:"Fun vs learning",displayDelay:2800},
  ]},
  {type:"example",heading:"Set a Goal",imagePrompt:`A cheerful cartoon target with an arrow. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Set a specific goal. I want to find five facts about dolphins!",displayText:"Specific goal",displayDelay:2500},
  ]},
  {type:"tip",heading:"Pause Before You Open",imagePrompt:`A cheerful cartoon kid tapping their chin by a book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A purpose trick",displayDelay:1500},
    {sub:"b",tts:"Before you start, ask: what do I want from this book?",displayText:"What do I want?",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to read with purpose!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.4a-Q1","RF.3.4a-Q2","RF.3.4a-Q3","RF.3.4a-Q4","RF.3.4a-Q5"]);

L("RF.3.4b","Reading Prose and Poetry",[
  {type:"intro",heading:"Prose and Poetry",imagePrompt:`A cheerful cartoon open book on one side and a scroll of poetry on the other. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Prose is regular writing in sentences.",displayText:"Prose = sentences",displayDelay:2500},
    {sub:"b",tts:"Poetry uses short lines, rhythm, and sometimes rhyme.",displayText:"Poetry = rhythm",displayDelay:2500},
  ]},
  {type:"teach",heading:"Read Prose Smoothly",imagePrompt:`A cheerful cartoon kid reading a paragraph with confident posture. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Read prose like you are telling a story.",displayText:"Tell the story",displayDelay:2500},
  ]},
  {type:"teach",heading:"Feel the Poem",imagePrompt:`A cheerful cartoon kid reading a poem with musical notes floating around. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Poems have a beat. Follow the rhythm of the words.",displayText:"Follow the beat",displayDelay:2500},
    {sub:"b",tts:"Pause at line breaks for effect.",displayText:"Pause at breaks",displayDelay:2500},
  ]},
  {type:"tip",heading:"Adjust Your Voice",imagePrompt:`A cheerful cartoon kid adjusting a tiny dial on a microphone. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A fluency trick",displayDelay:1500},
    {sub:"b",tts:"Prose sounds like talking. Poetry sounds like music.",displayText:"Talk vs music",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to read prose and poetry!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.4b-Q1","RF.3.4b-Q2","RF.3.4b-Q3","RF.3.4b-Q4","RF.3.4b-Q5"]);

L("RF.3.4c","Self-Correcting While Reading",[
  {type:"intro",heading:"Catch Your Slips",imagePrompt:`A cheerful cartoon kid holding up a hand in a stop gesture while reading. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Great readers catch themselves when something does not fit.",displayText:"Catch yourself",displayDelay:2500},
  ]},
  {type:"teach",heading:"Stop, Think, Try",imagePrompt:`A cheerful cartoon traffic sign with stop / think / try. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Stop when it feels off.",displayText:"1: stop",displayDelay:2000},
    {sub:"b",tts:"Think: does this word fit?",displayText:"2: think",displayDelay:2000},
    {sub:"c",tts:"Try again with a word that makes sense.",displayText:"3: try again",displayDelay:2500},
  ]},
  {type:"example",heading:"Reread Part",imagePrompt:`A cheerful cartoon kid with one eyebrow raised rereading a line. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"If a sentence confuses you, reread it slowly.",displayText:"Reread slow",displayDelay:2500},
    {sub:"b",tts:"Often the meaning pops out on the second try.",displayText:"Meaning pops out",displayDelay:2500},
  ]},
  {type:"tip",heading:"Does It Make Sense?",imagePrompt:`A cheerful cartoon thought bubble with a checkmark. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A sense trick",displayDelay:1500},
    {sub:"b",tts:"After each sentence, ask: did that make sense? If not, fix it.",displayText:"Sense check",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to self-correct!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.3.4c-Q1","RF.3.4c-Q2","RF.3.4c-Q3","RF.3.4c-Q4","RF.3.4c-Q5"]);
