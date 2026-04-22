#!/usr/bin/env node
/** G4 Informational + Foundations: 13 lessons */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";
const RI = (id,title,slides,mcqIds)=>build({standardId:id,grade:"4th Grade",domain:"Informational",title,slides,mcqIds});
const RF = (id,title,slides,mcqIds)=>build({standardId:id,grade:"4th Grade",domain:"Foundational Skills",title,slides,mcqIds});

RI("RI.4.1","Finding Fact Details",[
  {type:"intro",heading:"Evidence Matters",imagePrompt:`A cheerful cartoon detective kid with a magnifying glass over a fact book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fourth grade nonfiction readers back up answers with text evidence.",displayText:"Text evidence",displayDelay:2800},
  ]},
  {type:"teach",heading:"Cite Specifically",imagePrompt:`A cheerful cartoon kid with a quote bubble citing a paragraph. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Quote the exact words or summarize the line.",displayText:"Quote or summarize",displayDelay:2500},
  ]},
  {type:"example",heading:"Inferences From Details",imagePrompt:`A cheerful cartoon kid putting two clue puzzle pieces together. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Sometimes the answer is implied. Use details to infer it.",displayText:"Implied = infer",displayDelay:2500},
  ]},
  {type:"tip",heading:"Use the Text",imagePrompt:`A cheerful cartoon highlighter with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A details trick",displayDelay:1500},
    {sub:"b",tts:"Always say: according to the text, before your answer.",displayText:"According to the text...",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to find fact details!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.1-Q1","RI.4.1-Q2","RI.4.1-Q3","RI.4.1-Q4","RI.4.1-Q5"]);

RI("RI.4.2","Main Idea Mastery",[
  {type:"intro",heading:"Main Idea + Details",imagePrompt:`A cheerful cartoon glowing umbrella with details raining down. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Main idea is the umbrella. Details are the rain underneath.",displayText:"Main = umbrella",displayDelay:2500},
  ]},
  {type:"teach",heading:"Summarize",imagePrompt:`A cheerful cartoon pencil writing a one-sentence summary. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Summarize: main idea plus the most important details.",displayText:"Main + key details",displayDelay:2500},
  ]},
  {type:"example",heading:"Across Multiple Paragraphs",imagePrompt:`A cheerful cartoon stack of three paragraphs glowing together. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"In long texts, find the main idea that ties paragraphs together.",displayText:"Tie paragraphs together",displayDelay:2800},
  ]},
  {type:"tip",heading:"Two-Sentence Test",imagePrompt:`A cheerful cartoon kid holding up two fingers next to a book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A summary trick",displayDelay:1500},
    {sub:"b",tts:"Try to summarize the whole text in two sentences. Forces you to find the heart!",displayText:"Two-sentence summary",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to master main ideas!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.2-Q1","RI.4.2-Q2","RI.4.2-Q3","RI.4.2-Q4","RI.4.2-Q5"]);

RI("RI.4.3","Explaining Procedures",[
  {type:"intro",heading:"Procedures and Sequences",imagePrompt:`A cheerful cartoon flowchart with step boxes connected by arrows. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Some texts explain how things work or how to do something.",displayText:"How things work",displayDelay:2500},
  ]},
  {type:"teach",heading:"Look for Steps",imagePrompt:`A cheerful cartoon kid with three numbered cards. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Watch for first, next, then, finally.",displayText:"First / next / then / finally",displayDelay:2800},
  ]},
  {type:"example",heading:"How a Plant Grows",imagePrompt:`A cheerful cartoon plant cycle: seed, sprout, plant. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"First a seed is planted. Then it sprouts. Finally it becomes a plant.",displayText:"Seed -> sprout -> plant",displayDelay:2800},
  ]},
  {type:"tip",heading:"Number Each Step",imagePrompt:`A cheerful cartoon pencil writing tiny numbers next to lines. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A procedure trick",displayDelay:1500},
    {sub:"b",tts:"As you read, number each step in the margin. Helps you remember the order!",displayText:"Number the steps",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to explain procedures!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.3-Q1","RI.4.3-Q2","RI.4.3-Q3","RI.4.3-Q4","RI.4.3-Q5"]);

RI("RI.4.4","Academic Word Meanings",[
  {type:"intro",heading:"School Words",imagePrompt:`A cheerful cartoon kid with a tiny notebook of academic words. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Academic words are the formal words used in school subjects.",displayText:"Subject-specific words",displayDelay:2500},
  ]},
  {type:"teach",heading:"Use Context and Roots",imagePrompt:`A cheerful cartoon word being broken into root parts. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Use context plus root word knowledge.",displayText:"Context + roots",displayDelay:2500},
  ]},
  {type:"teach",heading:"Subject Words",imagePrompt:`A cheerful cartoon kid with three labels: science, math, history. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Science: ecosystem. Math: equation. History: revolution.",displayText:"Subject vocabulary",displayDelay:2800},
  ]},
  {type:"tip",heading:"Build a Word Wall",imagePrompt:`A cheerful cartoon kid putting word cards on a wall. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A vocab trick",displayDelay:1500},
    {sub:"b",tts:"Make a word wall in your notebook. Add new words as you read.",displayText:"Word wall",displayDelay:2500},
    {sub:"c",tts:"Now you are ready for academic words!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.4-Q1","RI.4.4-Q2"]);

RI("RI.4.5","How Texts Are Built",[
  {type:"intro",heading:"Text Structures",imagePrompt:`A cheerful cartoon blueprint of a paragraph with labeled parts. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Texts are organized in patterns. Cause / effect, sequence, problem / solution.",displayText:"Patterns of organization",displayDelay:2800},
  ]},
  {type:"teach",heading:"Compare and Contrast",imagePrompt:`A cheerful cartoon Venn diagram with two overlapping circles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Compare and contrast structure shows similarities and differences.",displayText:"Same + different",displayDelay:2500},
  ]},
  {type:"teach",heading:"Problem and Solution",imagePrompt:`A cheerful cartoon kid pointing to a problem on the left and a solution on the right. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Problem and solution texts state an issue, then show how to fix it.",displayText:"Issue -> fix",displayDelay:2500},
  ]},
  {type:"tip",heading:"Look for Clue Words",imagePrompt:`A cheerful cartoon magnifying glass over signal words. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A structure trick",displayDelay:1500},
    {sub:"b",tts:"Words like however, also, because, and finally signal the structure.",displayText:"Signal words = structure",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to spot text structures!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.5-Q1","RI.4.5-Q2","RI.4.5-Q3","RI.4.5-Q4","RI.4.5-Q5"]);

RI("RI.4.6","Firsthand vs Secondhand",[
  {type:"intro",heading:"Two Kinds of Accounts",imagePrompt:`A cheerful cartoon kid telling a story vs another reading about it. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A firsthand account is from someone who was there.",displayText:"Firsthand = there",displayDelay:2500},
    {sub:"b",tts:"A secondhand account is from someone who learned about it.",displayText:"Secondhand = learned about",displayDelay:2500},
  ]},
  {type:"teach",heading:"Diary vs Article",imagePrompt:`A cheerful cartoon diary and a newspaper side by side. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A diary entry is firsthand. A history article is usually secondhand.",displayText:"Diary vs article",displayDelay:2500},
  ]},
  {type:"example",heading:"Different Details",imagePrompt:`A cheerful cartoon kid comparing two written accounts. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Firsthand has personal feelings and senses. Secondhand has more facts and dates.",displayText:"Feelings vs facts",displayDelay:2800},
  ]},
  {type:"tip",heading:"Ask: Were They There?",imagePrompt:`A cheerful cartoon kid pointing at the author bio of a book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A source trick",displayDelay:1500},
    {sub:"b",tts:"Ask: was the writer actually there? If yes, firsthand!",displayText:"Were they there?",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to tell firsthand from secondhand!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.6-Q1","RI.4.6-Q2","RI.4.6-Q3","RI.4.6-Q4","RI.4.6-Q5"]);

RI("RI.4.7","Information Across Forms",[
  {type:"intro",heading:"Info Comes in Many Forms",imagePrompt:`A cheerful cartoon collage of a graph, a photo, a video icon, and a paragraph. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Information can come in text, charts, diagrams, photos, or videos.",displayText:"Many forms",displayDelay:2800},
  ]},
  {type:"teach",heading:"Each Form Adds Something",imagePrompt:`A cheerful cartoon graph next to a paragraph with arrows showing connection. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A chart shows numbers. A photo shows something real. Words explain.",displayText:"Each adds info",displayDelay:2800},
  ]},
  {type:"example",heading:"Combine Them",imagePrompt:`A cheerful cartoon kid combining different info pieces into one notebook. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Combine all the info to get the full picture.",displayText:"Full picture",displayDelay:2500},
  ]},
  {type:"tip",heading:"Use Every Source",imagePrompt:`A cheerful cartoon kid with a clipboard checking off info sources. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A multimedia trick",displayDelay:1500},
    {sub:"b",tts:"When researching, use multiple sources. They each show different angles.",displayText:"Multiple sources",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to use info from many forms!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.7-Q1","RI.4.7-Q2","RI.4.7-Q3","RI.4.7-Q4","RI.4.7-Q5"]);

RI("RI.4.8","Author's Reasons and Evidence",[
  {type:"intro",heading:"Reasons and Evidence",imagePrompt:`A cheerful cartoon judge weighing reasons on a scale. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Authors give reasons for their points. Strong writers also give evidence.",displayText:"Reasons + evidence",displayDelay:2800},
  ]},
  {type:"teach",heading:"Reasons Tell Why",imagePrompt:`A cheerful cartoon question mark next to a thought bubble. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A reason is the why behind the point.",displayText:"Reason = why",displayDelay:2500},
  ]},
  {type:"teach",heading:"Evidence Backs It Up",imagePrompt:`A cheerful cartoon kid pointing to a graph as proof. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Evidence is proof. Facts. Examples. Statistics.",displayText:"Facts + examples",displayDelay:2500},
  ]},
  {type:"tip",heading:"Highlight Both",imagePrompt:`A cheerful cartoon highlighter circling a reason and a fact. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A reasons trick",displayDelay:1500},
    {sub:"b",tts:"Highlight reasons one color and evidence another. See how they connect!",displayText:"Two colors = see links",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to spot reasons and evidence!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.8-Q1","RI.4.8-Q2","RI.4.8-Q3","RI.4.8-Q4","RI.4.8-Q5"]);

RI("RI.4.9","Combining Two Texts",[
  {type:"intro",heading:"Two Texts Stronger Than One",imagePrompt:`Two cheerful cartoon books glowing brighter when held together. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Reading two texts on the same topic gives a stronger understanding.",displayText:"Two = stronger",displayDelay:2800},
  ]},
  {type:"teach",heading:"Combine Information",imagePrompt:`A cheerful cartoon kid blending two bowls of ingredients. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Use facts from both texts to write a stronger summary.",displayText:"Stronger summary",displayDelay:2500},
  ]},
  {type:"teach",heading:"Spot Different Angles",imagePrompt:`A cheerful cartoon mountain seen from two angles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Each text might focus on a different angle. Notice both.",displayText:"Different angles",displayDelay:2500},
  ]},
  {type:"tip",heading:"Mix the Best",imagePrompt:`A cheerful cartoon kid combining notes into one big idea web. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A combining trick",displayDelay:1500},
    {sub:"b",tts:"Take the best ideas from each text. Combine them into your own picture.",displayText:"Mix the best",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to combine two texts!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.9-Q1","RI.4.9-Q2","RI.4.9-Q3","RI.4.9-Q4","RI.4.9-Q5"]);

RI("RI.4.10","Reading Big Facts",[
  {type:"intro",heading:"Long Nonfiction",imagePrompt:`A cheerful cartoon kid carrying a thick fact book confidently. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fourth graders take on longer fact books and articles.",displayText:"Longer + harder",displayDelay:2500},
  ]},
  {type:"teach",heading:"Take Notes",imagePrompt:`A cheerful cartoon kid jotting notes from a fact book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Big facts are easier to remember when you take notes.",displayText:"Notes help",displayDelay:2500},
  ]},
  {type:"teach",heading:"Stretch Books",imagePrompt:`A cheerful cartoon kid stretching to reach a high bookshelf. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Try slightly harder books. They grow your reading muscles.",displayText:"Stretch = grow",displayDelay:2500},
  ]},
  {type:"tip",heading:"Daily Reading",imagePrompt:`A cheerful cartoon clock with a book inside. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A daily trick",displayDelay:1500},
    {sub:"b",tts:"Twenty minutes a day, all year. You will read so many big fact books!",displayText:"20 min daily = lots",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to read big facts!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.4.10-Q1","RI.4.10-Q2","RI.4.10-Q3","RI.4.10-Q4","RI.4.10-Q5"]);

RF("RF.4.3","Word Decoding Skills",[
  {type:"intro",heading:"Decoding Power",imagePrompt:`A cheerful cartoon kid holding a key opening a long word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fourth grade decoding works on long, tricky words.",displayText:"Long + tricky",displayDelay:2500},
  ]},
  {type:"teach",heading:"Use All Your Tools",imagePrompt:`A cheerful cartoon toolbox with reading tools labeled phonics, roots, prefixes. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Use phonics, syllables, and word part knowledge together.",displayText:"All your tools",displayDelay:2500},
  ]},
  {type:"example",heading:"Multisyllable Strategy",imagePrompt:`A cheerful cartoon kid drawing slashes between syllables. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Break it into chunks. Read each chunk. Then blend.",displayText:"Chunk + read + blend",displayDelay:2500},
  ]},
  {type:"tip",heading:"Read in Context",imagePrompt:`A cheerful cartoon kid reading a sentence with the new word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A decoding trick",displayDelay:1500},
    {sub:"b",tts:"After decoding, reread the whole sentence. The meaning often clicks.",displayText:"Reread for meaning",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to decode powerful words!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.4.3-Q1","RF.4.3-Q2","RF.4.3-Q3","RF.4.3-Q4","RF.4.3-Q5"]);

RF("RF.4.3a","Letter-Sound Combos",[
  {type:"intro",heading:"Big Word Combos",imagePrompt:`A cheerful cartoon multi-letter combo character. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"In long words, look for letter-sound combos you already know.",displayText:"Combos you know",displayDelay:2500},
  ]},
  {type:"teach",heading:"PH, GH, and CH",imagePrompt:`Three cheerful cartoon letter combos with smiles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"PH says F. GH can be silent. CH can sound like K in some words.",displayText:"PH = F, GH silent, CH = K sometimes",displayDelay:3000},
  ]},
  {type:"teach",heading:"Vowel Combos",imagePrompt:`A cheerful cartoon vowel pair holding hands. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Vowel combos like EA, EE, OA, OU show up everywhere.",displayText:"EA / EE / OA / OU",displayDelay:2500},
  ]},
  {type:"tip",heading:"Spot the Combos",imagePrompt:`A cheerful cartoon magnifying glass over a vowel pair. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A combo trick",displayDelay:1500},
    {sub:"b",tts:"When decoding, scan for known combos first. They are anchor points.",displayText:"Anchor points",displayDelay:2500},
    {sub:"c",tts:"Now you are ready for letter-sound combos!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.4.3a-Q1","RF.4.3a-Q2","RF.4.3a-Q3","RF.4.3a-Q4","RF.4.3a-Q5"]);

RF("RF.4.4","Smooth Reading Skills",[
  {type:"intro",heading:"Fluent Reading Pays Off",imagePrompt:`A cheerful cartoon kid reading on a stage with confident posture. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Smooth reading helps you understand more deeply.",displayText:"Smooth = deeper",displayDelay:2500},
  ]},
  {type:"teach",heading:"Pace Matches Content",imagePrompt:`A cheerful cartoon metronome adjusting tempo. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Slow down for tricky parts. Speed up for action.",displayText:"Adjust pace",displayDelay:2500},
  ]},
  {type:"teach",heading:"Expression and Phrasing",imagePrompt:`A cheerful cartoon microphone with notes coming out. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Group words into phrases. Use your voice to match the meaning.",displayText:"Phrasing + voice",displayDelay:2500},
  ]},
  {type:"tip",heading:"Read Aloud Often",imagePrompt:`A cheerful cartoon kid reading to a smiling pet. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A fluency trick",displayDelay:1500},
    {sub:"b",tts:"Read aloud to anyone — friend, family, even a pet. Builds smoothness fast!",displayText:"Read aloud daily",displayDelay:2500},
    {sub:"c",tts:"Now you are ready for smooth reading!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RF.4.4-Q1","RF.4.4-Q2","RF.4.4-Q3","RF.4.4-Q4","RF.4.4-Q5"]);
