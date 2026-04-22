#!/usr/bin/env node
/** G4 Language: 12 lessons (L.4.1/2/3 need MCQs) */
const addMCQs = require("./_mcq");
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";
const L = (id,title,slides,mcqIds)=>build({standardId:id,grade:"4th Grade",domain:"Language",title,slides,mcqIds});

addMCQs({standardId:"L.4.1",grade:"4th Grade",domain:"Language",description:"Demonstrate command of the conventions of standard English grammar and usage when writing or speaking",parentTip:"Pronouns, modal verbs (can, may, must), prepositions, and run-on sentences.",
  questions:[
    {type:"multiple_choice",prompt:"Which is the correct **pronoun**: ___ went to the store.",choices:["She","Her","Hers","Hims"],correct:"She",hint:"She is a subject pronoun!",difficulty:1,imagePrompt:`A cheerful cartoon girl walking into a small store with a wave. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"What kind of word is **may** in: You may go now?",choices:["modal verb","noun","adjective","adverb"],correct:"modal verb",hint:"Modal verbs help other verbs (can, may, must)!",difficulty:2,imagePrompt:`A cheerful cartoon kid holding a permission slip with a check. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which sentence has a **preposition**?",choices:["The book is on the desk.","She runs fast.","He smiled.","They ate."],correct:"The book is on the desk.",hint:"On is a preposition showing where!",difficulty:2,imagePrompt:`A cheerful cartoon book sitting on top of a wooden desk. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which is a **run-on sentence**?",choices:["I love to read I read every day.","I love to read.","I read every day, and I love it.","Reading is fun."],correct:"I love to read I read every day.",hint:"Run-ons combine sentences without proper punctuation.",difficulty:2,imagePrompt:`A cheerful cartoon long train running off the tracks. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Pick the right pronoun: My friend and ___ went to the park.",choices:["I","me","mine","my"],correct:"I",hint:"Use I as the subject!",difficulty:1,imagePrompt:`A cheerful cartoon kid pointing to themselves and a friend smiling beside them. Clean pastel background. ${IMG}`},
  ]});
L("L.4.1","Pronouns and Grammar Rules",[
  {type:"intro",heading:"Grammar Detail",imagePrompt:`A cheerful cartoon kid with grammar tools and a clipboard. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fourth grade grammar dives into pronouns, modals, prepositions, and run-ons.",displayText:"Pronouns / modals / preps / run-ons",displayDelay:3000},
  ]},
  {type:"teach",heading:"Pronouns Replace Nouns",imagePrompt:`A cheerful cartoon noun being swapped for a pronoun. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Pronouns like I, she, he, we replace nouns.",displayText:"I / she / he / we",displayDelay:2500},
    {sub:"b",tts:"Use them so we do not repeat names too much!",displayText:"Avoid repeats",displayDelay:2500},
  ]},
  {type:"teach",heading:"Modals and Run-Ons",imagePrompt:`A cheerful cartoon train with too many cars labeled run-on. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Modals like can, may, must show possibility or permission.",displayText:"can / may / must",displayDelay:2500},
    {sub:"b",tts:"Run-on sentences cram two ideas without punctuation. Fix with a period or comma.",displayText:"Fix run-ons",displayDelay:2800},
  ]},
  {type:"tip",heading:"Read It Aloud",imagePrompt:`A cheerful cartoon kid reading their own sentence out loud. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A grammar trick",displayDelay:1500},
    {sub:"b",tts:"Read aloud. If you run out of breath, it might be a run-on!",displayText:"Out of breath = run-on",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for pronouns and grammar rules!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.1-Q1","L.4.1-Q2","L.4.1-Q3","L.4.1-Q4","L.4.1-Q5"]);

addMCQs({standardId:"L.4.2",grade:"4th Grade",domain:"Language",description:"Demonstrate command of the conventions of standard English capitalization, punctuation, and spelling",parentTip:"Commas in compound sentences, quotation marks, capitalize titles.",
  questions:[
    {type:"multiple_choice",prompt:"Where does the comma go? I went to the store ___ I bought a book.",choices:["after store, before I","after I","after went","no comma needed"],correct:"after store, before I",hint:"Use a comma before a conjunction in a compound sentence!",difficulty:2,imagePrompt:`A cheerful cartoon comma character standing between two sentence cars. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"How do you write a book title?",choices:["Capitalize the important words","All lowercase","All uppercase","Just first letter only"],correct:"Capitalize the important words",hint:"Most words in a title get capitalized!",difficulty:1,imagePrompt:`A cheerful cartoon book cover with the title capitalized. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which is correctly punctuated dialogue?",choices:["\"Hello,\" she said.","Hello, she said.","\"Hello, she said.\"","Hello \"she said\"."],correct:"\"Hello,\" she said.",hint:"The comma goes inside the quotation marks!",difficulty:2,imagePrompt:`A cheerful cartoon kid waving with a speech bubble. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"What needs a capital letter?",choices:["proper nouns like names and places","every other word","just verbs","nothing in the middle"],correct:"proper nouns like names and places",hint:"Names and places always get capitals!",difficulty:1,imagePrompt:`A cheerful cartoon map with capital letter cities. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which is the correct possessive: That is the ___ ball.",choices:["dog's","dogs","dogs'","dog"],correct:"dog's",hint:"Apostrophe + S shows one dog owns it!",difficulty:1,imagePrompt:`A cheerful cartoon dog with a ball at its feet. Clean pastel background. ${IMG}`},
  ]});
L("L.4.2","Punctuation Mastery",[
  {type:"intro",heading:"Master the Marks",imagePrompt:`A cheerful cartoon punctuation orchestra all playing together. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fourth graders master punctuation rules.",displayText:"Master the marks",displayDelay:2500},
  ]},
  {type:"teach",heading:"Compound Sentence Commas",imagePrompt:`A cheerful cartoon comma joining two sentence trains. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"When two complete sentences join with and, or, but — use a comma before the conjunction.",displayText:"Comma + conjunction",displayDelay:3000},
    {sub:"b",tts:"I went to the park, and I had fun.",displayText:"...park, and I...",displayDelay:2500},
  ]},
  {type:"teach",heading:"Dialogue and Titles",imagePrompt:`A cheerful cartoon book cover with a capitalized title. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"In dialogue, commas and periods go inside the quotation marks.",displayText:"Marks inside quotes",displayDelay:2800},
    {sub:"b",tts:"In titles, capitalize all important words.",displayText:"Capitalize important words",displayDelay:2500},
  ]},
  {type:"tip",heading:"Proofread Carefully",imagePrompt:`A cheerful cartoon kid with a pencil rereading their own writing. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A proofreading trick",displayDelay:1500},
    {sub:"b",tts:"Read your work backwards, sentence by sentence. Catches more errors!",displayText:"Read backwards",displayDelay:2500},
    {sub:"c",tts:"Now you are ready for punctuation mastery!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.2-Q1","L.4.2-Q2","L.4.2-Q3","L.4.2-Q4","L.4.2-Q5"]);

addMCQs({standardId:"L.4.3",grade:"4th Grade",domain:"Language",description:"Use knowledge of language and its conventions when writing, speaking, reading, or listening",parentTip:"Match style to audience. Vary sentence length. Use precise words.",
  questions:[
    {type:"multiple_choice",prompt:"Which sentence is most precise?",choices:["The puppy bounded across the meadow.","The dog went over the grass.","The animal moved on the field.","The thing went somewhere."],correct:"The puppy bounded across the meadow.",hint:"Precise words paint a clearer picture!",difficulty:2,imagePrompt:`A cheerful cartoon puppy bounding across a green meadow. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"What is **style** in writing?",choices:["the way an author writes","the type of paper used","the font","the ink color"],correct:"the way an author writes",hint:"Style is the author's unique voice!",difficulty:2,imagePrompt:`A cheerful cartoon author with a fancy pen smiling. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Why might a writer use a short, snappy sentence?",choices:["for emphasis or impact","because they ran out of words","by accident","to confuse the reader"],correct:"for emphasis or impact",hint:"Short sentences hit hard!",difficulty:2,imagePrompt:`A cheerful cartoon punctuation mark giving a small thumbs up. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Match the style: writing to a friend versus writing a book report. The friend version should be:",choices:["more casual","more formal","longer","in another language"],correct:"more casual",hint:"Friends like casual!",difficulty:1,imagePrompt:`A cheerful cartoon kid texting a friend with a smile. Clean pastel background. ${IMG}`},
    {type:"multiple_choice",prompt:"Which word adds the strongest detail in: She felt ___?",choices:["thrilled","good","fine","okay"],correct:"thrilled",hint:"Thrilled is more vivid than good!",difficulty:2,imagePrompt:`A cheerful cartoon kid jumping with arms raised in joy. Clean pastel background. ${IMG}`},
  ]});
L("L.4.3","Word Choice for Style",[
  {type:"intro",heading:"Find Your Style",imagePrompt:`A cheerful cartoon kid holding a paint palette of word choices. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Style is the way you choose to write.",displayText:"Style = your way",displayDelay:2500},
  ]},
  {type:"teach",heading:"Precise Words",imagePrompt:`A cheerful cartoon kid swapping a vague word for a precise one. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Precise words paint clearer pictures. Bounded beats went.",displayText:"Precise > vague",displayDelay:2500},
  ]},
  {type:"teach",heading:"Vary Sentence Length",imagePrompt:`A cheerful cartoon row of sentences of different lengths. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Mix short and long sentences. It keeps writing fresh.",displayText:"Mix lengths",displayDelay:2500},
    {sub:"b",tts:"A short sentence. Hits hard. Then a longer one weaves the idea together more gently.",displayText:"Short = punch. Long = flow.",displayDelay:3000},
  ]},
  {type:"tip",heading:"Match Audience",imagePrompt:`A cheerful cartoon kid switching between casual and formal letters. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A style trick",displayDelay:1500},
    {sub:"b",tts:"Match your style to your reader. Casual for friends. Formal for school.",displayText:"Match the reader",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to choose words for style!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.3-Q1","L.4.3-Q2","L.4.3-Q3","L.4.3-Q4","L.4.3-Q5"]);

L("L.4.4","Word Meaning Detective",[
  {type:"intro",heading:"Crack New Words",imagePrompt:`A cheerful cartoon detective kid with a magnifying glass over a glowing word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Use sentence clues, word parts, and reference materials together.",displayText:"All your tools",displayDelay:2500},
  ]},
  {type:"teach",heading:"Combine Strategies",imagePrompt:`A cheerful cartoon kid holding three tool icons together. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Try context first. Then word parts. Then look it up if you are still stuck.",displayText:"Context -> parts -> lookup",displayDelay:2800},
  ]},
  {type:"example",heading:"Inflectional Endings",imagePrompt:`A cheerful cartoon word tile with an -ing suffix snapping on. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Endings like -ing, -ed, -s tell you tense and number.",displayText:"-ing / -ed / -s",displayDelay:2500},
  ]},
  {type:"tip",heading:"Track Your Words",imagePrompt:`A cheerful cartoon vocabulary notebook. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A vocab trick",displayDelay:1500},
    {sub:"b",tts:"Keep a vocab notebook. Definition, sentence, and a tiny picture for each word.",displayText:"Notebook + picture",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to detect word meanings!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.4-Q1","L.4.4-Q2","L.4.4-Q3","L.4.4-Q4","L.4.4-Q5"]);

L("L.4.4a","Sentence Clues",[
  {type:"intro",heading:"Clues in Context",imagePrompt:`A cheerful cartoon magnifying glass over a glowing sentence. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Sentence clues are everywhere if you slow down.",displayText:"Slow down to see",displayDelay:2500},
  ]},
  {type:"teach",heading:"Synonyms and Examples",imagePrompt:`A cheerful cartoon equals sign between two word tiles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Look for synonyms. Like, in other words, that is. These signal a definition!",displayText:"Like / that is = synonym",displayDelay:2800},
  ]},
  {type:"example",heading:"Antonyms Help Too",imagePrompt:`A cheerful cartoon happy face vs sad face linked by an opposite arrow. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Sometimes the opposite is given. Unlike, but, however.",displayText:"Unlike / but / however",displayDelay:2500},
  ]},
  {type:"tip",heading:"Hunt the Hint",imagePrompt:`A cheerful cartoon detective with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A clue trick",displayDelay:1500},
    {sub:"b",tts:"Circle signal words like for example, in other words, however!",displayText:"Circle signals",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to use sentence clues!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.4a-Q1","L.4.4a-Q2"]);

L("L.4.4b","Greek and Latin Roots",[
  {type:"intro",heading:"Roots From Long Ago",imagePrompt:`A cheerful cartoon scroll with Greek and Latin letters. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Many big English words come from Greek and Latin roots.",displayText:"Greek + Latin",displayDelay:2500},
    {sub:"b",tts:"Knowing roots unlocks tons of vocabulary!",displayText:"Unlock vocab",displayDelay:2500},
  ]},
  {type:"teach",heading:"Common Roots",imagePrompt:`A cheerful cartoon root system with labels glowing. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Bio means life. Photo means light. Telephone — far sound.",displayText:"bio / photo / tele",displayDelay:2800},
  ]},
  {type:"teach",heading:"Aqua and Geo",imagePrompt:`A cheerful cartoon water droplet and earth globe characters. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Aqua means water. Aquarium = water place.",displayText:"aqua = water",displayDelay:2500},
    {sub:"b",tts:"Geo means earth. Geography = writing about earth.",displayText:"geo = earth",displayDelay:2500},
  ]},
  {type:"tip",heading:"Learn Roots, Win Big",imagePrompt:`A cheerful cartoon kid with a gold trophy of vocab. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A root trick",displayDelay:1500},
    {sub:"b",tts:"One root unlocks many words. Aqua: aquarium, aquatic, aqueduct!",displayText:"One root = many words",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for Greek and Latin roots!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.4b-Q1","L.4.4b-Q2"]);

L("L.4.4c","Reference Materials",[
  {type:"intro",heading:"Use the Right Reference",imagePrompt:`A cheerful cartoon shelf with a dictionary, thesaurus, and glossary. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Dictionaries, thesauri, and glossaries each help differently.",displayText:"Different references",displayDelay:2800},
  ]},
  {type:"teach",heading:"Dictionary",imagePrompt:`A cheerful cartoon dictionary with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A dictionary gives meaning, sound, and how to use the word.",displayText:"Meaning + sound + use",displayDelay:2800},
  ]},
  {type:"teach",heading:"Thesaurus",imagePrompt:`A cheerful cartoon thesaurus character offering synonyms in a list. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A thesaurus gives synonyms — words with similar meanings.",displayText:"Thesaurus = synonyms",displayDelay:2500},
  ]},
  {type:"tip",heading:"Pick the Right One",imagePrompt:`A cheerful cartoon kid choosing between three reference books. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A reference trick",displayDelay:1500},
    {sub:"b",tts:"Need a meaning? Dictionary. Need a different word? Thesaurus.",displayText:"Meaning vs synonym",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to use reference materials!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.4c-Q1","L.4.4c-Q2","L.4.4c-Q3","L.4.4c-Q4","L.4.4c-Q5"]);

L("L.4.5","Figurative Language",[
  {type:"intro",heading:"Beyond Literal",imagePrompt:`A cheerful cartoon word transforming into a tiny picture. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Figurative language paints pictures with words.",displayText:"Paints with words",displayDelay:2500},
  ]},
  {type:"teach",heading:"Three Common Tools",imagePrompt:`A cheerful cartoon toolbox labeled simile, metaphor, idiom. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Similes use like or as. Metaphors say it is. Idioms have hidden meanings.",displayText:"Simile / metaphor / idiom",displayDelay:3000},
  ]},
  {type:"example",heading:"Examples",imagePrompt:`A cheerful cartoon cheetah with a kid running fast next to it. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"He ran like a cheetah. Simile.",displayText:"like cheetah = simile",displayDelay:2500},
    {sub:"b",tts:"Time is money. Metaphor.",displayText:"is money = metaphor",displayDelay:2500},
    {sub:"c",tts:"Piece of cake. Idiom for easy.",displayText:"cake = easy = idiom",displayDelay:2500},
  ]},
  {type:"tip",heading:"Hunt the Picture",imagePrompt:`A cheerful cartoon thought cloud with a tiny image inside. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A figurative trick",displayDelay:1500},
    {sub:"b",tts:"When words sound weird literally, they are usually figurative!",displayText:"Weird literal = figurative",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for figurative language!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.5-Q1","L.4.5-Q2","L.4.5-Q3","L.4.5-Q4","L.4.5-Q5"]);

L("L.4.5a","Similes and Metaphors",[
  {type:"intro",heading:"Comparing With Pictures",imagePrompt:`A cheerful cartoon two objects connected by an equals sign with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Similes and metaphors compare two things to paint a picture.",displayText:"Compare = picture",displayDelay:2800},
  ]},
  {type:"teach",heading:"Simile = Like or As",imagePrompt:`A cheerful cartoon kid as quiet as a mouse. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A simile uses like or as. As busy as a bee.",displayText:"Like / as = simile",displayDelay:2500},
  ]},
  {type:"teach",heading:"Metaphor = Is",imagePrompt:`A cheerful cartoon kid with a glowing star labeled my heart. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A metaphor says one thing IS another. My heart is a star.",displayText:"X is Y = metaphor",displayDelay:2500},
  ]},
  {type:"tip",heading:"Spot the Bridge Word",imagePrompt:`A cheerful cartoon bridge connecting two cliffs labeled like. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A figurative trick",displayDelay:1500},
    {sub:"b",tts:"See like or as? Simile. See is or are connecting unlike things? Metaphor.",displayText:"Bridge word check",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for similes and metaphors!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.5a-Q1","L.4.5a-Q2"]);

L("L.4.5b","Idioms and Sayings",[
  {type:"intro",heading:"Sayings With Hidden Meaning",imagePrompt:`A cheerful cartoon idiom card with a hidden picture behind it. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Idioms are sayings whose meaning is hidden.",displayText:"Hidden meaning",displayDelay:2500},
  ]},
  {type:"teach",heading:"It's Raining Cats and Dogs",imagePrompt:`A cheerful cartoon rain with friendly cartoon cats and dogs. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Means it is raining hard, not actually animals!",displayText:"Means rain hard",displayDelay:2500},
  ]},
  {type:"teach",heading:"Break a Leg",imagePrompt:`A cheerful cartoon performer on a stage smiling. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Means good luck before a performance!",displayText:"Means good luck",displayDelay:2500},
  ]},
  {type:"tip",heading:"Learn Them as Phrases",imagePrompt:`A cheerful cartoon kid memorizing phrase cards. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"An idiom trick",displayDelay:1500},
    {sub:"b",tts:"Idioms must be learned as phrases. Memorize a few each week!",displayText:"Memorize phrases",displayDelay:2500},
    {sub:"c",tts:"Now you are ready for idioms and sayings!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.5b-Q1","L.4.5b-Q2"]);

L("L.4.5c","Word Strength Levels",[
  {type:"intro",heading:"Levels of Words",imagePrompt:`A cheerful cartoon dial showing three strengths of color. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Synonyms have shades of strength.",displayText:"Shades of strength",displayDelay:2500},
  ]},
  {type:"teach",heading:"Glance, Look, Stare",imagePrompt:`A cheerful cartoon eye with three intensities. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Glance is quick. Look is normal. Stare is intense!",displayText:"glance / look / stare",displayDelay:2800},
  ]},
  {type:"teach",heading:"Whisper, Talk, Yell",imagePrompt:`Three cheerful cartoon kids with rising voice loudness. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Whisper is soft. Talk is normal. Yell is loud!",displayText:"whisper / talk / yell",displayDelay:2500},
  ]},
  {type:"tip",heading:"Match the Intensity",imagePrompt:`A cheerful cartoon kid choosing the right shade from a palette. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A strength trick",displayDelay:1500},
    {sub:"b",tts:"Pick the word strength that matches the actual feeling.",displayText:"Match the feeling",displayDelay:2500},
    {sub:"c",tts:"Now you are ready for word strength levels!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.5c-Q1","L.4.5c-Q2","L.4.5c-Q3"]);

L("L.4.6","Using Big Vocabulary",[
  {type:"intro",heading:"Use Your Big Words",imagePrompt:`A cheerful cartoon kid wearing a wizard hat throwing word sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Knowing big words helps. Using them helps even more.",displayText:"Use them!",displayDelay:2500},
  ]},
  {type:"teach",heading:"Try New Words Out",imagePrompt:`A cheerful cartoon kid testing a new word with a smile. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Try new words in your speaking and writing.",displayText:"Speak + write",displayDelay:2500},
    {sub:"b",tts:"They become yours after you use them.",displayText:"Use = own",displayDelay:2200},
  ]},
  {type:"teach",heading:"Match Words to Setting",imagePrompt:`A cheerful cartoon kid switching between casual and formal hats. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Casual for chats. Academic for school.",displayText:"Casual vs academic",displayDelay:2500},
  ]},
  {type:"tip",heading:"Word a Day",imagePrompt:`A cheerful cartoon calendar with a new word on each day. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A vocab trick",displayDelay:1500},
    {sub:"b",tts:"One new word a day. Use it three times!",displayText:"One a day, use 3x",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to use big vocabulary!",displayText:"You got it!",displayDelay:1500},
  ]},
],["L.4.6-Q1","L.4.6-Q2","L.4.6-Q3","L.4.6-Q4","L.4.6-Q5"]);
