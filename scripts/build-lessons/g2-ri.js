#!/usr/bin/env node
/** G2 Informational: 10 lessons (RI.2.1 - RI.2.10) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({
  standardId: "RI.2.1", grade: "2nd Grade", domain: "Informational", title: "Asking Smart Fact Questions",
  slides: [
    { type: "intro", heading: "Smart Fact Questions", imagePrompt: `A cheerful cartoon child holding a clipboard studying a friendly cartoon animal, thinking hard. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Smart readers ask questions as they read facts.", displayText: "Ask as you read", displayDelay: 2200 },
        { sub: "b", tts: "Six big ones: who, what, where, when, why, how.", displayText: "Who, what, where, when, why, how", displayDelay: 3000 },
        { sub: "c", tts: "Every one has an answer in the text.", displayText: "Answers in the text", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "Why and How Matter Most", imagePrompt: `Two cheerful cartoon giant question marks side by side, one saying Why and one saying How with tiny happy faces. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Who, what, where, and when are easy to spot.", displayText: "Easy ones", displayDelay: 2200 },
        { sub: "b", tts: "Why and how need deeper reading.", displayText: "Why + how = deeper", displayDelay: 2500 },
        { sub: "c", tts: "They help you really understand the facts.", displayText: "Really understand", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Try It", imagePrompt: `A cheerful cartoon baby seal pup splashing in cold blue water with a mama seal smiling nearby. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. Seal pups are born on ice. Their moms teach them to swim.", displayText: "Seal pups born on ice", displayDelay: 3000 },
        { sub: "b", tts: "Who? The seal pups! Where? On ice!", displayText: "Who: pups. Where: ice", displayDelay: 2500 },
        { sub: "c", tts: "Who teaches them? Their moms. Why? So they can survive!", displayText: "Mom teaches why? To survive", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Write Questions", imagePrompt: `A cheerful cartoon sticky note pad with a question mark on each page, a smiling pencil. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A question trick", displayDelay: 1500 },
        { sub: "b", tts: "Jot questions on sticky notes as you read. Then hunt for the answers!", displayText: "Sticky notes + hunt", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to ask smart fact questions!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.1-Q1","RI.2.1-Q2","RI.2.1-Q3","RI.2.1-Q4","RI.2.1-Q5"],
});

build({
  standardId: "RI.2.2", grade: "2nd Grade", domain: "Informational", title: "Finding the Big Idea",
  slides: [
    { type: "intro", heading: "Find the Big Idea", imagePrompt: `A cheerful cartoon giant lightbulb glowing brightly at the center of a desk, with papers around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Longer fact texts have lots of little ideas.", displayText: "Little ideas", displayDelay: 2000 },
        { sub: "b", tts: "But one big idea holds them all together.", displayText: "One big idea", displayDelay: 2200 },
        { sub: "c", tts: "That big idea is called the main topic.", displayText: "Main topic", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "Each Paragraph Focuses", imagePrompt: `Three cheerful cartoon paragraph blocks in a column, each glowing a different color. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Each paragraph focuses on a smaller part of the big idea.", displayText: "Paragraph = small part", displayDelay: 2800 },
        { sub: "b", tts: "Paragraph one might tell what something is.", displayText: "P1: what", displayDelay: 2500 },
        { sub: "c", tts: "Paragraph two might tell why it matters.", displayText: "P2: why", displayDelay: 2500 },
        { sub: "d", tts: "All paragraphs point back to the main topic.", displayText: "All point back", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Honey Bees", imagePrompt: `A cheerful cartoon honey bee buzzing near a flower with a tiny honey jar. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Imagine a text about honey bees.", displayText: "About honey bees", displayDelay: 2000 },
        { sub: "b", tts: "One paragraph on how they make honey. Another on where they live.", displayText: "Make + where", displayDelay: 2800 },
        { sub: "c", tts: "Main topic? Honey bees! Everything connects back to them.", displayText: "Main: honey bees", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Ask What It Is All About", imagePrompt: `A cheerful cartoon owl tilting its head asking a question, with a smile and glasses. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A main-idea trick", displayDelay: 1500 },
        { sub: "b", tts: "After you read, ask: what is this text mostly about?", displayText: "Mostly about?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to find the big idea!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.2-Q1","RI.2.2-Q2","RI.2.2-Q3","RI.2.2-Q4","RI.2.2-Q5"],
});

build({
  standardId: "RI.2.3", grade: "2nd Grade", domain: "Informational", title: "Connecting History and Science",
  slides: [
    { type: "intro", heading: "Connections Everywhere", imagePrompt: `A cheerful cartoon timeline with tiny historical and scientific icons connected by glowing lines. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books often connect things to each other.", displayText: "Things connect", displayDelay: 2200 },
        { sub: "b", tts: "Two events. Two steps. Two ideas.", displayText: "Events + steps + ideas", displayDelay: 2500 },
        { sub: "c", tts: "Let us learn how to spot the connections!", displayText: "Spot connections", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "First, Next, Last", imagePrompt: `Three cheerful cartoon numbered arrows in a row, each glowing a different bright color. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Sequence means the order things happen.", displayText: "Sequence = order", displayDelay: 2500 },
        { sub: "b", tts: "First this. Then that. Last another thing.", displayText: "First / then / last", displayDelay: 2800 },
        { sub: "c", tts: "Look for words like first, next, and finally.", displayText: "First, next, finally", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Butterfly Life Cycle", imagePrompt: `A cheerful cartoon cycle diagram with an egg, caterpillar, cocoon, and butterfly, each smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "First, a butterfly lays an egg.", displayText: "1. egg", displayDelay: 2000 },
        { sub: "b", tts: "Next, a caterpillar hatches.", displayText: "2. caterpillar", displayDelay: 2000 },
        { sub: "c", tts: "Then it forms a cocoon.", displayText: "3. cocoon", displayDelay: 2000 },
        { sub: "d", tts: "Finally, a butterfly comes out! Each step connects to the next.", displayText: "4. butterfly!", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Look for Order Words", imagePrompt: `A cheerful cartoon magnifying glass over a word list highlighting first / next / last. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A connection trick", displayDelay: 1500 },
        { sub: "b", tts: "Spot words like first, next, then, last. They mark the order!", displayText: "Order words = clues", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to connect history and science!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.3-Q1","RI.2.3-Q2","RI.2.3-Q3","RI.2.3-Q4","RI.2.3-Q5"],
});

build({
  standardId: "RI.2.4", grade: "2nd Grade", domain: "Informational", title: "Word Meanings in Texts",
  slides: [
    { type: "intro", heading: "New Words, No Fear", imagePrompt: `A cheerful cartoon kid with a magnifying glass looking at a word on a page, eyes wide with curiosity. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books sometimes use fancy words.", displayText: "Fancy words", displayDelay: 2000 },
        { sub: "b", tts: "But the text gives us clues to their meaning.", displayText: "Clues in the text", displayDelay: 2500 },
        { sub: "c", tts: "Let us learn to find them!", displayText: "Find the clues", displayDelay: 1800 },
      ]},
    { type: "teach", heading: "Definitions Right There", imagePrompt: `A cheerful cartoon sentence with a tiny definition arrow pointing to it, sparkles around. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Sometimes the text just tells you what a word means.", displayText: "Text tells you", displayDelay: 2500 },
        { sub: "b", tts: "A habitat is the place where an animal lives.", displayText: "habitat = where it lives", displayDelay: 2800 },
        { sub: "c", tts: "Those definitions are gold!", displayText: "Definitions = gold", displayDelay: 2200 },
      ]},
    { type: "example", heading: "Context Is Your Friend", imagePrompt: `A cheerful cartoon kid looking at two words linked by a glowing arrow on a page. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Other times you have to use the words around it.", displayText: "Words around it", displayDelay: 2500 },
        { sub: "b", tts: "The thirsty camel gulped a lot of water.", displayText: "Thirsty camel gulped", displayDelay: 2800 },
        { sub: "c", tts: "Gulp must mean drink fast! The thirst gave the clue.", displayText: "Gulp = drink fast", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Never Skip", imagePrompt: `A cheerful cartoon highlighter character with a smile, ready to highlight a new word. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word trick", displayDelay: 1500 },
        { sub: "b", tts: "Do not skip hard words. Slow down and look for clues.", displayText: "Slow + find clues", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to figure out word meanings!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.4-Q1","RI.2.4-Q2","RI.2.4-Q3","RI.2.4-Q4","RI.2.4-Q5"],
});

build({
  standardId: "RI.2.5", grade: "2nd Grade", domain: "Informational", title: "Finding Information Fast",
  slides: [
    { type: "intro", heading: "Text Features", imagePrompt: `A cheerful cartoon open fact book with a table of contents, heading, caption, and diagram, all glowing. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books have special parts called text features.", displayText: "Text features", displayDelay: 2500 },
        { sub: "b", tts: "They help you find facts fast.", displayText: "Find facts fast", displayDelay: 2200 },
        { sub: "c", tts: "Let us meet them!", displayText: "Meet them", displayDelay: 1800 },
      ]},
    { type: "teach", heading: "Headings and Bold", imagePrompt: `A cheerful cartoon page with a big bold heading glowing at the top and a word in bold lower down. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Headings are big words at the top of a section.", displayText: "Headings = big", displayDelay: 2500 },
        { sub: "b", tts: "They tell you what that part is about.", displayText: "About this part", displayDelay: 2500 },
        { sub: "c", tts: "Bold words are important vocabulary.", displayText: "Bold = important", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Captions and Index", imagePrompt: `A cheerful cartoon photograph with a tiny caption underneath, and a tiny index page next to it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A caption tells you about a picture.", displayText: "Caption = picture info", displayDelay: 2500 },
        { sub: "b", tts: "An index is at the back. It lists topics with page numbers.", displayText: "Index = back + pages", displayDelay: 2800 },
        { sub: "c", tts: "Use the index like a shortcut!", displayText: "Index = shortcut", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Scan First", imagePrompt: `A cheerful cartoon eye scanning across a page with a tiny motion trail. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A scanning trick", displayDelay: 1500 },
        { sub: "b", tts: "Before reading, flip through. Look at headings and pictures.", displayText: "Peek first", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to find info fast!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.5-Q1","RI.2.5-Q2","RI.2.5-Q3","RI.2.5-Q4","RI.2.5-Q5"],
});

build({
  standardId: "RI.2.6", grade: "2nd Grade", domain: "Informational", title: "Why Did the Author Write This?",
  slides: [
    { type: "intro", heading: "Authors Have a Purpose", imagePrompt: `A cheerful cartoon author in a cozy writing corner with a lightbulb over their head. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every author writes for a reason.", displayText: "Authors have reasons", displayDelay: 2200 },
        { sub: "b", tts: "We call that the author's purpose.", displayText: "Author's purpose", displayDelay: 2200 },
        { sub: "c", tts: "Usually it is to teach, to entertain, or to convince.", displayText: "Teach / entertain / convince", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "To Teach", imagePrompt: `A cheerful cartoon owl in a scholar's cap teaching from an open book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fact books want to teach us.", displayText: "Teach", displayDelay: 2000 },
        { sub: "b", tts: "They share facts, steps, and pictures that help us learn.", displayText: "Facts + pictures", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "To Entertain or Convince", imagePrompt: `A cheerful cartoon theater mask next to a tiny persuasive megaphone. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Stories entertain us. They make us laugh, cry, or wonder.", displayText: "Entertain", displayDelay: 2500 },
        { sub: "b", tts: "Some texts try to convince. They give reasons to agree with the author.", displayText: "Convince = agree", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Ask the Big Why", imagePrompt: `A cheerful cartoon giant question mark with a small smile. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A purpose trick", displayDelay: 1500 },
        { sub: "b", tts: "When you finish, ask: why did the author write this?", displayText: "Why did they write it?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to spot author purpose!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.6-Q1","RI.2.6-Q2","RI.2.6-Q3","RI.2.6-Q4","RI.2.6-Q5"],
});

build({
  standardId: "RI.2.7", grade: "2nd Grade", domain: "Informational", title: "Pictures Help Explain",
  slides: [
    { type: "intro", heading: "Pictures Do Heavy Lifting", imagePrompt: `A cheerful cartoon diagram of a flower with tiny labeled parts. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "In fact books, pictures are not just decoration.", displayText: "Not decoration", displayDelay: 2200 },
        { sub: "b", tts: "They show what words might not be able to say easily.", displayText: "Show what words cannot", displayDelay: 2800 },
        { sub: "c", tts: "Let us see how!", displayText: "Let us see", displayDelay: 1500 },
      ]},
    { type: "teach", heading: "Diagrams Show Parts", imagePrompt: `A cheerful cartoon diagram of a butterfly with labeled wings and body. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A diagram shows parts of something.", displayText: "Diagrams = parts", displayDelay: 2500 },
        { sub: "b", tts: "Arrows and labels point to each part.", displayText: "Arrows + labels", displayDelay: 2200 },
        { sub: "c", tts: "Easier to see than to read!", displayText: "See it fast", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "Maps and Photos", imagePrompt: `A cheerful cartoon world map with cute country shapes and a photo of an animal to the side. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A map shows where things are.", displayText: "Maps = where", displayDelay: 2500 },
        { sub: "b", tts: "Photos show real things close up.", displayText: "Photos = real", displayDelay: 2500 },
        { sub: "c", tts: "Together they make facts come alive!", displayText: "Facts come alive", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Match Picture to Words", imagePrompt: `A cheerful cartoon kid pointing at a picture while tracing words with their finger. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A picture trick", displayDelay: 1500 },
        { sub: "b", tts: "When you see a picture, ask: how does this match the text?", displayText: "How do they match?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to use pictures to understand facts!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.7-Q1","RI.2.7-Q2","RI.2.7-Q3","RI.2.7-Q4","RI.2.7-Q5"],
});

build({
  standardId: "RI.2.8", grade: "2nd Grade", domain: "Informational", title: "How Authors Back Up Their Points",
  slides: [
    { type: "intro", heading: "Point + Proof", imagePrompt: `A cheerful cartoon judge's gavel next to an open book with a tiny highlighted line. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When an author makes a point, they also give reasons.", displayText: "Point + reasons", displayDelay: 2500 },
        { sub: "b", tts: "The reasons back up the point.", displayText: "Back up the point", displayDelay: 2200 },
        { sub: "c", tts: "Spotting them makes you a strong reader!", displayText: "Spot = strong", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Drink Water", imagePrompt: `A cheerful cartoon glass of water with a friendly face and a small checkmark next to it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Point: you should drink water every day.", displayText: "Point: drink water", displayDelay: 2500 },
        { sub: "b", tts: "Reason one: it helps your body work.", displayText: "Reason 1: body works", displayDelay: 2500 },
        { sub: "c", tts: "Reason two: it keeps you from getting tired.", displayText: "Reason 2: no tired", displayDelay: 2500 },
        { sub: "d", tts: "Two reasons support the point!", displayText: "2 reasons = support", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Try One", imagePrompt: `A cheerful cartoon bicycle with a small smile, next to a kid wearing a helmet. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Point: riding bikes is fun and healthy.", displayText: "Point: bikes are great", displayDelay: 2500 },
        { sub: "b", tts: "Reasons? Exercise. Fresh air. Going places fast!", displayText: "Exercise, fresh air, speed", displayDelay: 2800 },
        { sub: "c", tts: "The reasons make the point stronger.", displayText: "Reasons = stronger", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Look for Because", imagePrompt: `A cheerful cartoon magnifying glass looking at the word because on a page. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A reasons trick", displayDelay: 1500 },
        { sub: "b", tts: "Watch for words like because, since, and for example. Those signal reasons!", displayText: "Because / since / for example", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to spot author's reasons!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.8-Q1","RI.2.8-Q2","RI.2.8-Q3","RI.2.8-Q4","RI.2.8-Q5"],
});

build({
  standardId: "RI.2.9", grade: "2nd Grade", domain: "Informational", title: "Comparing Two Fact Books",
  slides: [
    { type: "intro", heading: "Two Takes on One Topic", imagePrompt: `Two cheerful cartoon open fact books side by side, both about space, with a tiny bridge of arrows between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Two fact books can be about the same topic.", displayText: "Same topic", displayDelay: 2000 },
        { sub: "b", tts: "But each author picks different details.", displayText: "Different details", displayDelay: 2500 },
        { sub: "c", tts: "Reading both gives you a bigger picture.", displayText: "Bigger picture", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Same Points", imagePrompt: `A cheerful cartoon Venn diagram with two overlapping circles and a star in the middle. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Look for what both books agree on.", displayText: "Agree on...", displayDelay: 2200 },
        { sub: "b", tts: "Those are the main points everyone knows.", displayText: "Main points", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Different Details", imagePrompt: `A cheerful cartoon magnifying glass over a unique detail on one book, while a different detail glows on another. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Then look for what is special in each one.", displayText: "Special in each", displayDelay: 2500 },
        { sub: "b", tts: "One might share more pictures. The other more stories.", displayText: "Pics vs stories", displayDelay: 2800 },
        { sub: "c", tts: "Both add to what you know!", displayText: "Both add up!", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Make a Chart", imagePrompt: `A cheerful cartoon clipboard with two columns labeled Same and Different, tiny checkmarks in each. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A comparing trick", displayDelay: 1500 },
        { sub: "b", tts: "Make a two-column chart. Same on one, different on the other.", displayText: "Same / different chart", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to compare two fact books!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.9-Q1","RI.2.9-Q2","RI.2.9-Q3","RI.2.9-Q4","RI.2.9-Q5"],
});

build({
  standardId: "RI.2.10", grade: "2nd Grade", domain: "Informational", title: "Reading Facts All Year",
  slides: [
    { type: "intro", heading: "A Year of Facts", imagePrompt: `A cheerful cartoon stack of colorful fact books with a calendar behind them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Reading fact books all year makes you smarter.", displayText: "Smarter every day", displayDelay: 2500 },
        { sub: "b", tts: "Different topics build different knowledge.", displayText: "Different = more", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Pick What You Love", imagePrompt: `A cheerful cartoon kid browsing a bookshelf with three tiny thought bubbles of animals, space, and sports. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Pick fact books about things you love.", displayText: "What you love", displayDelay: 2000 },
        { sub: "b", tts: "Animals, sports, space, food, weather. Anything!", displayText: "Any topic", displayDelay: 2500 },
        { sub: "c", tts: "Love makes it fun.", displayText: "Love = fun", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "Try Stretch Books", imagePrompt: `A cheerful cartoon kid on tiptoes reaching for a book on a high shelf. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Sometimes try a harder book than usual.", displayText: "Try harder books", displayDelay: 2500 },
        { sub: "b", tts: "Stretch books grow your reading muscles.", displayText: "Stretch = grow", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "New Topic Each Week", imagePrompt: `A cheerful cartoon calendar with a different colored themed bookmark on each week. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A topic trick", displayDelay: 1500 },
        { sub: "b", tts: "Try a new topic each week. You will discover something cool!", displayText: "New topic weekly", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to read facts all year!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RI.2.10-Q1","RI.2.10-Q2","RI.2.10-Q3","RI.2.10-Q4","RI.2.10-Q5"],
});
