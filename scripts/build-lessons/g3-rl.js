#!/usr/bin/env node
/** G3 Literature: 9 lessons */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

build({ standardId: "RL.3.1", grade: "3rd Grade", domain: "Literature", title: "Asking Smart Story Questions",
  slides: [
    { type: "intro", heading: "Prove It With the Text", imagePrompt: `A cheerful cartoon detective child holding an open book with a magnifying glass, finger pointing to a line. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Third-grade readers do more than answer questions.", displayText: "Do more than answer", displayDelay: 2500 },
        { sub: "b", tts: "They prove their answers with quotes from the text.", displayText: "Prove it with text", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Ask, Answer, Prove", imagePrompt: `A cheerful cartoon kid pointing to a glowing sentence with a quote bubble. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Ask a question. Find the answer. Then point to the exact words that prove it.", displayText: "Ask / answer / prove", displayDelay: 2800 },
      ]},
    { type: "example", heading: "Try One", imagePrompt: `A cheerful cartoon child reading a page with a tiny highlighter. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Question: how did Maya feel? Answer: proud. Proof: the text said she beamed with pride.", displayText: "Q / A / proof in text", displayDelay: 3000 },
      ]},
    { type: "tip", heading: "Point to the Words", imagePrompt: `A cheerful cartoon finger pointing at a word on a page. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A proof trick", displayDelay: 1500 },
        { sub: "b", tts: "When you answer, literally point back to the words that show it!", displayText: "Point + show", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to ask smart story questions!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.1-Q1","RL.3.1-Q2","RL.3.1-Q3","RL.3.1-Q4","RL.3.1-Q5"] });

build({ standardId: "RL.3.2", grade: "3rd Grade", domain: "Literature", title: "Folktales and Their Lessons",
  slides: [
    { type: "intro", heading: "Old Stories, Big Lessons", imagePrompt: `A cheerful cartoon storyteller around a campfire with kids of different skin tones listening. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Folktales, fables, and myths have been told for centuries.", displayText: "Passed down", displayDelay: 2500 },
        { sub: "b", tts: "They each teach an important lesson.", displayText: "Each teaches", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "Fables Use Animals", imagePrompt: `A cheerful cartoon fox and crow facing each other with tiny thought bubbles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Fables often use talking animals to teach a lesson.", displayText: "Animals = lesson", displayDelay: 2500 },
        { sub: "b", tts: "The fox and the crow teaches us: do not trust flattery.", displayText: "Trust -> not flattery", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "Myths Explain Things", imagePrompt: `A cheerful cartoon sky with a myth-style sun character pulling a chariot across it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Myths explain big things like how seasons came to be.", displayText: "Myths = explain", displayDelay: 2500 },
        { sub: "b", tts: "They teach values too, like courage or kindness.", displayText: "Teach values", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "What Did They Learn?", imagePrompt: `A cheerful cartoon owl in a scholar's cap with a tiny book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A lesson trick", displayDelay: 1500 },
        { sub: "b", tts: "At the end, ask: what did the character learn? That is the message!", displayText: "What did they learn?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to find lessons in folktales!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.2-Q1","RL.3.2-Q2","RL.3.2-Q3","RL.3.2-Q4","RL.3.2-Q5"] });

build({ standardId: "RL.3.3", grade: "3rd Grade", domain: "Literature", title: "What Characters Are Like",
  slides: [
    { type: "intro", heading: "Characters Drive Stories", imagePrompt: `A cheerful cartoon kid at the wheel of a colorful story-car, bright sun above. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Characters' actions shape what happens in the story.", displayText: "Actions shape story", displayDelay: 2500 },
        { sub: "b", tts: "Their traits, feelings, and choices push the plot forward.", displayText: "Traits + feelings + choices", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "Traits Are Who They Are", imagePrompt: `A cheerful cartoon kid with three badges floating: kind, brave, curious. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Character traits are their personality. Brave, kind, curious, selfish.", displayText: "Traits = personality", displayDelay: 2800 },
        { sub: "b", tts: "We find traits by watching what they do and say.", displayText: "Do + say = trait", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Brave Nia", imagePrompt: `A cheerful cartoon girl with warm brown skin climbing a tall ladder to help a cat in a tree. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Nia climbed a tall ladder to save a kitten.", displayText: "Nia climbed to save", displayDelay: 2500 },
        { sub: "b", tts: "That action tells us she is brave and caring!", displayText: "Brave + caring", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Watch Their Choices", imagePrompt: `A cheerful cartoon kid at a fork in the road with two colorful signs. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A character trick", displayDelay: 1500 },
        { sub: "b", tts: "What does the character choose to do? Their choices reveal who they are.", displayText: "Choices = traits", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to describe characters!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.3-Q1","RL.3.3-Q2","RL.3.3-Q3","RL.3.3-Q4","RL.3.3-Q5"] });

build({ standardId: "RL.3.4", grade: "3rd Grade", domain: "Literature", title: "Word Meanings in Stories",
  slides: [
    { type: "intro", heading: "Story Words Can Be Tricky", imagePrompt: `A cheerful cartoon kid holding a magnifying glass over an open story page with a sparkly word. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some words in stories have special meanings.", displayText: "Special meanings", displayDelay: 2500 },
        { sub: "b", tts: "Literal means exactly what it says. Nonliteral is a picture in words.", displayText: "Literal vs nonliteral", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "Raining Cats and Dogs", imagePrompt: `A cheerful cartoon rainstorm with smiling cartoon cats and dogs lightly falling from the clouds as a joke. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Raining cats and dogs does not really mean animals falling!", displayText: "Not literal!", displayDelay: 2500 },
        { sub: "b", tts: "It is a nonliteral way to say it is raining really hard.", displayText: "Really hard rain", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Her Heart Raced", imagePrompt: `A cheerful cartoon heart with running legs, sprinting with sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Her heart raced! Her heart did not run a real race.", displayText: "Heart did not run", displayDelay: 2500 },
        { sub: "b", tts: "It means she was very excited or scared!", displayText: "Excited or scared", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Ask: Does It Make Real Sense?", imagePrompt: `A cheerful cartoon kid with a thought bubble asking wait, what?. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A word trick", displayDelay: 1500 },
        { sub: "b", tts: "If the words seem weird when taken literally, think about what the author really means!", displayText: "Probably nonliteral", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to unlock story word meanings!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.4-Q1","RL.3.4-Q2","RL.3.4-Q3"] });

build({ standardId: "RL.3.5", grade: "3rd Grade", domain: "Literature", title: "Parts of Stories and Poems",
  slides: [
    { type: "intro", heading: "Stories and Poems Have Parts", imagePrompt: `A cheerful cartoon open book with clearly labeled chapter markers and a poem with stanzas. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Stories, plays, and poems are organized into parts.", displayText: "Organized parts", displayDelay: 2500 },
        { sub: "b", tts: "Knowing the parts helps us talk about them.", displayText: "Parts = words to use", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Chapters and Scenes", imagePrompt: `A cheerful cartoon book with chapter page dividers in different colors. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Chapters divide a story into bigger parts.", displayText: "Chapter = big part", displayDelay: 2500 },
        { sub: "b", tts: "Plays use scenes instead of chapters.", displayText: "Scenes in plays", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Stanzas and Lines", imagePrompt: `A cheerful cartoon poem on a page with highlighted stanzas in different pastel colors. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Poems use lines and stanzas.", displayText: "Lines + stanzas", displayDelay: 2500 },
        { sub: "b", tts: "A stanza is a group of lines, like a paragraph in a poem.", displayText: "Stanza = group of lines", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Use the Right Word", imagePrompt: `A cheerful cartoon kid pointing confidently at a book saying chapter. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A parts trick", displayDelay: 1500 },
        { sub: "b", tts: "When talking about stories, use words like chapter, scene, line, or stanza!", displayText: "Chapter, scene, line, stanza", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to name the parts of stories and poems!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.5-Q1","RL.3.5-Q2","RL.3.5-Q3","RL.3.5-Q4","RL.3.5-Q5"] });

build({ standardId: "RL.3.6", grade: "3rd Grade", domain: "Literature", title: "My View vs the Narrator's",
  slides: [
    { type: "intro", heading: "Two Views", imagePrompt: `A cheerful cartoon kid on one side and a narrator character on the other, both looking at the same book differently. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The narrator has a view. You have your own view too!", displayText: "Two views", displayDelay: 2500 },
        { sub: "b", tts: "They might agree. They might not!", displayText: "Agree or not", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "What the Narrator Thinks", imagePrompt: `A cheerful cartoon narrator holding a mic and a scroll. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The narrator tells the story from their view. Their feelings and opinions show.", displayText: "Narrator's feelings + opinions", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "What You Think", imagePrompt: `A cheerful cartoon kid with a thought bubble containing a big heart. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Readers have their own feelings and opinions too.", displayText: "You have yours", displayDelay: 2500 },
        { sub: "b", tts: "Good readers notice when they disagree with the narrator!", displayText: "Notice disagreements", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Separate the Two", imagePrompt: `A cheerful cartoon Venn diagram with the narrator view and reader view. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A view trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask: is that what the narrator thinks, or what I think?", displayText: "Narrator or me?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to tell views apart!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.6-Q1","RL.3.6-Q2","RL.3.6-Q3","RL.3.6-Q4","RL.3.6-Q5"] });

build({ standardId: "RL.3.7", grade: "3rd Grade", domain: "Literature", title: "Pictures and Mood",
  slides: [
    { type: "intro", heading: "Pictures Set the Mood", imagePrompt: `A cheerful cartoon book with two pages, one bright and sunny, one moody and purple. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Illustrations do more than show. They set the mood.", displayText: "Pictures = mood", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Bright vs Dark", imagePrompt: `Two cheerful cartoon scenes side by side, one bright sunny with smiling flowers, one rainy with shadowy clouds. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Bright colors feel happy or exciting.", displayText: "Bright = happy", displayDelay: 2500 },
        { sub: "b", tts: "Dark or cold colors feel sad or scary.", displayText: "Dark = sad/scary", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Storm on the Page", imagePrompt: `A cheerful cartoon stormy sky with purple clouds above a small house, lightning in the distance. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A stormy picture tells us the mood is tense.", displayText: "Storm = tense mood", displayDelay: 2500 },
        { sub: "b", tts: "We feel the tension just by looking!", displayText: "Feel the tension", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Feel the Colors", imagePrompt: `A cheerful cartoon kid with a thought bubble full of rainbow colors. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A mood trick", displayDelay: 1500 },
        { sub: "b", tts: "When you see an illustration, ask: how does this make me feel?", displayText: "How do I feel?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to read the mood in pictures!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.7-Q1","RL.3.7-Q2","RL.3.7-Q3","RL.3.7-Q4","RL.3.7-Q5"] });

build({ standardId: "RL.3.9", grade: "3rd Grade", domain: "Literature", title: "Comparing Themes and Plots",
  slides: [
    { type: "intro", heading: "Themes Across Stories", imagePrompt: `Two cheerful cartoon books side by side with a shared star between them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Different stories can share the same theme.", displayText: "Shared themes", displayDelay: 2500 },
        { sub: "b", tts: "Think: bravery, friendship, perseverance.", displayText: "Bravery, friendship...", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Same Theme, Different Story", imagePrompt: `A cheerful cartoon brave knight on one side and a brave astronaut on the other. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Two stories about bravery can look very different.", displayText: "Brave knight + astronaut", displayDelay: 2500 },
        { sub: "b", tts: "Same idea — courage. Different plots and settings.", displayText: "Same idea, different worlds", displayDelay: 2800 },
      ]},
    { type: "teach", heading: "Compare What Matters", imagePrompt: `A cheerful cartoon Venn diagram with two overlapping circles and a star in the center. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Compare themes, settings, and plots side by side.", displayText: "Themes, settings, plots", displayDelay: 2800 },
        { sub: "b", tts: "Look for the big ideas that run through both.", displayText: "Big ideas in both", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Find the Big Idea", imagePrompt: `A cheerful cartoon magnifying glass over a big star. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A comparing trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask: what big idea do both stories share? That is the theme!", displayText: "Shared big idea", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to compare themes and plots!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.9-Q1","RL.3.9-Q2","RL.3.9-Q3","RL.3.9-Q4","RL.3.9-Q5"] });

build({ standardId: "RL.3.10", grade: "3rd Grade", domain: "Literature", title: "Reading Stories All Year",
  slides: [
    { type: "intro", heading: "A Year of Reading", imagePrompt: `A cheerful cartoon calendar with a bookmark on each month and a stack of books. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Third graders read stories and poems all year.", displayText: "All year long", displayDelay: 2500 },
        { sub: "b", tts: "Your reading gets stronger with every book.", displayText: "Stronger each book", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Mix Up Your Reading", imagePrompt: `A cheerful cartoon bookshelf with diverse book covers. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Mix stories. Short ones, long ones, adventures, poems, and plays.", displayText: "Mix it up", displayDelay: 2800 },
        { sub: "b", tts: "Different kinds stretch your brain differently.", displayText: "Different stretches", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Climb Stretch Books", imagePrompt: `A cheerful cartoon kid climbing a ladder of books, each step a bigger book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A stretch book is a little hard. That is good!", displayText: "Stretch = grow", displayDelay: 2500 },
        { sub: "b", tts: "When stuck, ask a grown-up or reread slowly.", displayText: "Reread / ask", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Daily Reading", imagePrompt: `A cheerful cartoon cozy reading chair with a lamp and a warm blanket. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A habit trick", displayDelay: 1500 },
        { sub: "b", tts: "Pick a daily reading time. Even fifteen minutes adds up over a year!", displayText: "15 min daily", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to read stories all year!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ], mcqIds: ["RL.3.10-Q1","RL.3.10-Q2","RL.3.10-Q3","RL.3.10-Q4","RL.3.10-Q5"] });
