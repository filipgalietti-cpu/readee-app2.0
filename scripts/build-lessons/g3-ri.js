#!/usr/bin/env node
/** G3 Informational: 10 lessons */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

const L = (id,title,slides,mcqIds)=>build({standardId:id,grade:"3rd Grade",domain:"Informational",title,slides,mcqIds});

L("RI.3.1","Asking Smart Fact Questions",[
  {type:"intro",heading:"Prove It With Facts",imagePrompt:`A cheerful cartoon detective kid studying a fact book with glowing highlights. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Third-grade readers back up answers with the text itself.",displayText:"Back it up",displayDelay:2500},
    {sub:"b",tts:"Pointing to the words makes your answer strong.",displayText:"Point = strong",displayDelay:2500},
  ]},
  {type:"teach",heading:"Six Big Questions",imagePrompt:`Six cheerful cartoon question marks in a row. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Who, what, where, when, why, how. Ask them all.",displayText:"Who/what/where/when/why/how",displayDelay:2800},
    {sub:"b",tts:"Why and how go deepest.",displayText:"Why + how = deepest",displayDelay:2500},
  ]},
  {type:"example",heading:"Cite the Text",imagePrompt:`A cheerful cartoon kid holding a quote bubble over a book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Where do bees live? Say: the text says bees live in hives.",displayText:"Text says: in hives",displayDelay:2800},
    {sub:"b",tts:"Always name what the text actually said.",displayText:"Name the exact words",displayDelay:2500},
  ]},
  {type:"tip",heading:"Use Quotes",imagePrompt:`A cheerful cartoon kid with two quote mark characters, each holding a tiny highlighter. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A citing trick",displayDelay:1500},
    {sub:"b",tts:"Use the words: according to the text, to prove your point.",displayText:"According to the text...",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to ask smart fact questions!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.1-Q1","RI.3.1-Q2","RI.3.1-Q3","RI.3.1-Q4","RI.3.1-Q5"]);

L("RI.3.2","Main Idea and Key Details",[
  {type:"intro",heading:"Main Idea = Big Idea",imagePrompt:`A cheerful cartoon glowing lightbulb over a fact book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"The main idea is what the text is mostly about.",displayText:"Mostly about",displayDelay:2500},
    {sub:"b",tts:"Key details are facts that support the main idea.",displayText:"Details support",displayDelay:2500},
  ]},
  {type:"teach",heading:"Dogs as Helpers",imagePrompt:`A cheerful cartoon service dog with a vest helping a smiling owner. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Imagine a text about dogs as helpers.",displayText:"Dogs help people",displayDelay:2500},
    {sub:"b",tts:"Details: guide dogs. Therapy dogs. Search and rescue dogs.",displayText:"Guide, therapy, rescue",displayDelay:2800},
    {sub:"c",tts:"Main idea: dogs help people in many ways.",displayText:"Main: dogs help",displayDelay:2500},
  ]},
  {type:"example",heading:"Summary Sentences",imagePrompt:`A cheerful cartoon kid writing a one-line summary. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A good summary is one sentence on the main idea plus two or three key details.",displayText:"Main + 2-3 details",displayDelay:2800},
  ]},
  {type:"tip",heading:"Summarize It",imagePrompt:`A cheerful cartoon pencil writing on a clean page. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A summary trick",displayDelay:1500},
    {sub:"b",tts:"After reading, write one sentence: this text is about blank because blank.",displayText:"Fill in the blank",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to find main ideas!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.2-Q1","RI.3.2-Q2","RI.3.2-Q3","RI.3.2-Q4","RI.3.2-Q5"]);

L("RI.3.3","Connecting Events and Ideas",[
  {type:"intro",heading:"Events Connect",imagePrompt:`A cheerful cartoon chain of events with tiny numbered arrows. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Events and ideas in nonfiction often connect.",displayText:"They connect",displayDelay:2200},
    {sub:"b",tts:"Cause and effect. Sequence. Compare and contrast.",displayText:"Cause / sequence / compare",displayDelay:2800},
  ]},
  {type:"teach",heading:"Cause and Effect",imagePrompt:`A cheerful cartoon glass tipping over causing water to spill. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"One thing causes another. The water spilled because the glass tipped.",displayText:"Tipped -> spilled",displayDelay:2800},
    {sub:"b",tts:"Look for because, so, as a result.",displayText:"Because / so / as a result",displayDelay:2500},
  ]},
  {type:"teach",heading:"Sequence",imagePrompt:`A cheerful cartoon timeline with three numbered dots and small icons. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Sequence is the order of events.",displayText:"Order = sequence",displayDelay:2500},
    {sub:"b",tts:"First, next, then, finally.",displayText:"First / next / then / finally",displayDelay:2500},
  ]},
  {type:"tip",heading:"Map It Out",imagePrompt:`A cheerful cartoon flowchart with colorful connector boxes. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A connection trick",displayDelay:1500},
    {sub:"b",tts:"Draw boxes and arrows to show how events connect.",displayText:"Boxes + arrows",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to connect events and ideas!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.3-Q1","RI.3.3-Q2","RI.3.3-Q3","RI.3.3-Q4","RI.3.3-Q5"]);

L("RI.3.4","Academic Word Meanings",[
  {type:"intro",heading:"Big Words, No Fear",imagePrompt:`A cheerful cartoon kid with a tiny dictionary and a magnifying glass. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Academic words are the fancy words used in school.",displayText:"Academic = school words",displayDelay:2500},
    {sub:"b",tts:"Each subject has its own set — science, history, math.",displayText:"Subject-specific",displayDelay:2500},
  ]},
  {type:"teach",heading:"Context Clues Again",imagePrompt:`A cheerful cartoon magnifying glass over an underlined word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Context clues still work. The words around a big word give hints.",displayText:"Context = hints",displayDelay:2500},
  ]},
  {type:"teach",heading:"Word Parts Help",imagePrompt:`A cheerful cartoon word split into three puzzle pieces. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Break the word into prefix, root, suffix.",displayText:"Prefix + root + suffix",displayDelay:2500},
    {sub:"b",tts:"Photograph has photo (light) + graph (writing). A writing with light!",displayText:"photo + graph",displayDelay:2800},
  ]},
  {type:"tip",heading:"Keep a Word List",imagePrompt:`A cheerful cartoon notebook with a happy face on it. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A vocab trick",displayDelay:1500},
    {sub:"b",tts:"Keep a little notebook of new words. Write each one with a picture or example.",displayText:"Notebook + picture",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for academic words!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.4-Q1","RI.3.4-Q2","RI.3.4-Q3","RI.3.4-Q4","RI.3.4-Q5"]);

L("RI.3.5","Using Text Features",[
  {type:"intro",heading:"Text Feature Power",imagePrompt:`A cheerful cartoon open book with highlighted table of contents, heading, caption, and index. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Text features help you find facts fast.",displayText:"Find facts fast",displayDelay:2500},
  ]},
  {type:"teach",heading:"Hyperlinks and Search",imagePrompt:`A cheerful cartoon magnifying glass with a tiny link icon. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Online texts have search tools and hyperlinks.",displayText:"Search + links",displayDelay:2500},
    {sub:"b",tts:"Use search to jump to the exact topic you need.",displayText:"Jump to topic",displayDelay:2500},
  ]},
  {type:"teach",heading:"Index and TOC",imagePrompt:`A cheerful cartoon index page with glowing topic words. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"The index at the back lists topics and pages.",displayText:"Index = back",displayDelay:2500},
    {sub:"b",tts:"The table of contents up front shows chapters.",displayText:"TOC = front",displayDelay:2500},
  ]},
  {type:"tip",heading:"Preview Before Reading",imagePrompt:`A cheerful cartoon eye scanning a page with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A preview trick",displayDelay:1500},
    {sub:"b",tts:"Flip through the book first. Note headings, bold words, and pictures.",displayText:"Flip + note",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to use text features!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.5-Q1","RI.3.5-Q2","RI.3.5-Q3","RI.3.5-Q4","RI.3.5-Q5"]);

L("RI.3.6","Author's Point of View",[
  {type:"intro",heading:"Whose View Is It?",imagePrompt:`A cheerful cartoon author typing with a thought bubble vs a reader with their own thought bubble. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Every author has a point of view.",displayText:"Author's view",displayDelay:2500},
    {sub:"b",tts:"You have your own view too. Notice when you agree or disagree.",displayText:"Agree or disagree",displayDelay:2800},
  ]},
  {type:"teach",heading:"Look for Opinion Words",imagePrompt:`A cheerful cartoon speech bubble with the word best glowing inside. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Words like best, most important, or should signal opinion.",displayText:"Best / should = opinion",displayDelay:2800},
    {sub:"b",tts:"Those are the author's view, not your view!",displayText:"Author's view",displayDelay:2500},
  ]},
  {type:"example",heading:"Think for Yourself",imagePrompt:`A cheerful cartoon kid tapping their chin with a lightbulb. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"After reading, ask yourself: do I agree with the author?",displayText:"Do I agree?",displayDelay:2500},
    {sub:"b",tts:"It is OK to disagree!",displayText:"OK to disagree",displayDelay:2200},
  ]},
  {type:"tip",heading:"Highlight Opinions",imagePrompt:`A cheerful cartoon highlighter character. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A view trick",displayDelay:1500},
    {sub:"b",tts:"Circle opinion words as you read. That is where the author shows their view.",displayText:"Circle opinions",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to spot author's view!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.6-Q1","RI.3.6-Q2","RI.3.6-Q3","RI.3.6-Q4","RI.3.6-Q5"]);

L("RI.3.7","Illustrations Tell Stories Too",[
  {type:"intro",heading:"Pictures Add Info",imagePrompt:`A cheerful cartoon fact book with a diagram leaping off the page. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Illustrations in fact books add real information.",displayText:"Add info",displayDelay:2200},
    {sub:"b",tts:"Charts, maps, and diagrams show things the words might not.",displayText:"Charts / maps / diagrams",displayDelay:2800},
  ]},
  {type:"teach",heading:"Diagrams Show Parts",imagePrompt:`A cheerful cartoon diagram of a plant with labeled parts. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A diagram labels the parts of something.",displayText:"Diagrams label parts",displayDelay:2500},
  ]},
  {type:"teach",heading:"Charts and Graphs",imagePrompt:`A cheerful cartoon bar chart with happy bars and a tiny smiling graph. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Charts compare numbers or amounts.",displayText:"Charts compare",displayDelay:2500},
    {sub:"b",tts:"They tell a story of the data.",displayText:"Data story",displayDelay:2200},
  ]},
  {type:"tip",heading:"Read Every Caption",imagePrompt:`A cheerful cartoon magnifying glass over a tiny caption under a photo. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A caption trick",displayDelay:1500},
    {sub:"b",tts:"Read every caption. They often add facts not in the main text!",displayText:"Captions = extra facts",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to use illustrations!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.7-Q1","RI.3.7-Q2","RI.3.7-Q3","RI.3.7-Q4","RI.3.7-Q5"]);

L("RI.3.8","Logical Connections",[
  {type:"intro",heading:"How Sentences Connect",imagePrompt:`A cheerful cartoon chain of sentences linked by glowing arrows. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Sentences in a text are not random. They link logically.",displayText:"Logical links",displayDelay:2500},
    {sub:"b",tts:"Each sentence adds to or follows the one before.",displayText:"Sentences build",displayDelay:2500},
  ]},
  {type:"teach",heading:"Signal Words",imagePrompt:`A cheerful cartoon row of signal words like because, however, also glowing. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Words like also, however, and because signal connections.",displayText:"Also / however / because",displayDelay:2800},
    {sub:"b",tts:"They tell you how the next sentence relates.",displayText:"Relate = connect",displayDelay:2500},
  ]},
  {type:"example",heading:"However",imagePrompt:`A cheerful cartoon signpost showing two paths labeled expected and surprise. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"However means a twist or surprise is coming.",displayText:"However = surprise",displayDelay:2500},
    {sub:"b",tts:"The day was sunny. However, a storm was coming.",displayText:"Sunny... however...",displayDelay:2500},
  ]},
  {type:"tip",heading:"Circle the Signals",imagePrompt:`A cheerful cartoon pencil circling a glowing signal word. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A signal trick",displayDelay:1500},
    {sub:"b",tts:"As you read, circle signal words. They show how ideas connect.",displayText:"Circle = see links",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to spot logical connections!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.8-Q1","RI.3.8-Q2","RI.3.8-Q3","RI.3.8-Q4","RI.3.8-Q5"]);

L("RI.3.9","Comparing Two Texts",[
  {type:"intro",heading:"Read Twice, Know More",imagePrompt:`Two cheerful cartoon fact books side by side with a shared star above. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Two texts on the same topic teach you more than one.",displayText:"More than one = more info",displayDelay:2800},
    {sub:"b",tts:"Each author picks different details to share.",displayText:"Different details",displayDelay:2500},
  ]},
  {type:"teach",heading:"Main Points",imagePrompt:`A cheerful cartoon Venn diagram with overlapping circles and a glowing center. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Look for main points both books share. Those are the core facts.",displayText:"Shared = core",displayDelay:2500},
  ]},
  {type:"teach",heading:"Differences",imagePrompt:`A cheerful cartoon kid comparing two open books with a clipboard. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Notice what each book shares that the other does not.",displayText:"What is unique?",displayDelay:2500},
    {sub:"b",tts:"Different angles give you a fuller picture.",displayText:"Fuller picture",displayDelay:2500},
  ]},
  {type:"tip",heading:"T-Chart",imagePrompt:`A cheerful cartoon T-chart with two columns and cartoon checkmarks. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A comparing trick",displayDelay:1500},
    {sub:"b",tts:"Draw a T-chart. Same on one side. Different on the other.",displayText:"Same / different chart",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to compare two texts!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.9-Q1","RI.3.9-Q2","RI.3.9-Q3","RI.3.9-Q4","RI.3.9-Q5"]);

L("RI.3.10","Reading Facts All Year",[
  {type:"intro",heading:"All-Year Facts",imagePrompt:`A cheerful cartoon kid with a pile of fact books labeled with seasons. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fact books all year keep your brain growing.",displayText:"Brain grows",displayDelay:2500},
  ]},
  {type:"teach",heading:"Harder Books",imagePrompt:`A cheerful cartoon kid climbing a small ladder of books. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"This year try a few harder books.",displayText:"Try harder ones",displayDelay:2500},
    {sub:"b",tts:"They will stretch what you know.",displayText:"Stretch = learn",displayDelay:2500},
  ]},
  {type:"teach",heading:"Different Topics",imagePrompt:`A cheerful cartoon kid holding fact books about bugs, sports, and space. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Try new topics. Science. History. Sports. Cooking.",displayText:"Try new topics",displayDelay:2500},
  ]},
  {type:"tip",heading:"Read Daily",imagePrompt:`A cheerful cartoon clock with a book inside. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A daily trick",displayDelay:1500},
    {sub:"b",tts:"Read a little every day. Even fifteen minutes adds up.",displayText:"15 min daily",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to read facts all year!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RI.3.10-Q1","RI.3.10-Q2","RI.3.10-Q3","RI.3.10-Q4","RI.3.10-Q5"]);
