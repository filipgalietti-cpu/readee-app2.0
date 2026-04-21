#!/usr/bin/env node
/** G2 Literature: 9 lessons (RL.2.1 - RL.2.10, no RL.2.8) */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";

// ── RL.2.1 Story Detective Questions ───────────────────────────
build({
  standardId: "RL.2.1", grade: "2nd Grade", domain: "Literature", title: "Story Detective Questions",
  slides: [
    { type: "intro", heading: "Dig Into Stories", imagePrompt: `A cheerful cartoon child wearing a detective hat and magnifying glass, studying an open storybook. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Great readers dig for clues in every story.", displayText: "Dig for clues", displayDelay: 2000 },
        { sub: "b", tts: "We ask smart questions and hunt for the answers.", displayText: "Ask + hunt", displayDelay: 2200 },
        { sub: "c", tts: "Let us learn what to ask!", displayText: "Let us ask!", displayDelay: 1500 },
      ]},
    { type: "teach", heading: "The Big Six", imagePrompt: `Six cheerful cartoon question mark characters in a friendly row, each a different bright color. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Detectives ask six big questions.", displayText: "Six big questions", displayDelay: 2000 },
        { sub: "b", tts: "Who. What. Where. When.", displayText: "Who. What. Where. When.", displayDelay: 2500 },
        { sub: "c", tts: "And the hardest two. Why. And how!", displayText: "Why. How.", displayDelay: 2200 },
      ]},
    { type: "example", heading: "Try It On a Story", imagePrompt: `A cheerful cartoon kid reading a book under a tree, with tiny thought bubbles showing a dog and a ball. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Listen. Max the dog saw a red ball in the yard. He ran to fetch it.", displayText: "Max chased the ball", displayDelay: 3500 },
        { sub: "b", tts: "Who? Max the dog!", displayText: "Who: Max", displayDelay: 2000 },
        { sub: "c", tts: "What did he do? He ran to fetch the ball.", displayText: "What: ran to fetch", displayDelay: 2500 },
        { sub: "d", tts: "Where? In the yard! Answers right in the words.", displayText: "Where: yard", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Find It in the Words", imagePrompt: `A cheerful cartoon magnifying glass hovering over an open book with tiny sparkles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A detective trick", displayDelay: 1500 },
        { sub: "b", tts: "If you are not sure, look back at the words. The answer is usually hiding there.", displayText: "Look back at the words", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to ask story detective questions!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.1-Q1","RL.2.1-Q2","RL.2.1-Q3","RL.2.1-Q4","RL.2.1-Q5"],
});

// ── RL.2.2 Tales and Their Lessons ─────────────────────────────
build({
  standardId: "RL.2.2", grade: "2nd Grade", domain: "Literature", title: "Tales and Their Lessons",
  slides: [
    { type: "intro", heading: "Tales Teach Us", imagePrompt: `A cheerful cartoon storytelling grandparent with warm brown skin reading to two smiling grandkids on a rug. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some stories are old tales passed down for ages.", displayText: "Old tales", displayDelay: 2000 },
        { sub: "b", tts: "Fables and folktales always teach us something important.", displayText: "Fables + folktales", displayDelay: 2500 },
        { sub: "c", tts: "That something is called the lesson or moral.", displayText: "Lesson = moral", displayDelay: 2200 },
      ]},
    { type: "teach", heading: "The Tortoise and the Hare", imagePrompt: `A cheerful cartoon green tortoise crossing a finish line ahead of a surprised brown rabbit, both smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Remember the tortoise and the hare?", displayText: "Tortoise + hare", displayDelay: 2000 },
        { sub: "b", tts: "The rabbit was fast, but he stopped to nap.", displayText: "Fast rabbit napped", displayDelay: 2500 },
        { sub: "c", tts: "The slow tortoise kept going and won!", displayText: "Slow tortoise won!", displayDelay: 2500 },
        { sub: "d", tts: "The lesson? Slow and steady wins the race!", displayText: "Slow + steady = win", displayDelay: 2800 },
      ]},
    { type: "example", heading: "Retell It", imagePrompt: `A cheerful cartoon child holding a book open, telling the story to younger siblings, animated hands. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Retelling is telling a tale in your own words.", displayText: "Retell it", displayDelay: 2200 },
        { sub: "b", tts: "Start with the characters. Then what happened. Then the lesson!", displayText: "Who, what, lesson", displayDelay: 2800 },
        { sub: "c", tts: "Keep the big parts. Skip tiny details.", displayText: "Big parts only", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Find the Lesson", imagePrompt: `A cheerful cartoon owl wearing a small graduation cap sitting on a book. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A lesson trick", displayDelay: 1500 },
        { sub: "b", tts: "Ask, what did the character learn? That is your lesson!", displayText: "What did they learn?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to find story lessons!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.2-Q1","RL.2.2-Q2","RL.2.2-Q3","RL.2.2-Q4","RL.2.2-Q5"],
});

// ── RL.2.3 How Characters React ────────────────────────────────
build({
  standardId: "RL.2.3", grade: "2nd Grade", domain: "Literature", title: "How Characters React",
  slides: [
    { type: "intro", heading: "Characters Have Feelings", imagePrompt: `A cheerful cartoon group of kids of different skin tones showing different facial expressions, from happy to worried to excited. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "When things happen in a story, characters react.", displayText: "They react!", displayDelay: 2000 },
        { sub: "b", tts: "They might feel happy, scared, angry, or proud.", displayText: "Different feelings", displayDelay: 2500 },
        { sub: "c", tts: "How a character reacts tells us who they are.", displayText: "React = reveal", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Listen to Their Reaction", imagePrompt: `A cheerful cartoon child looking worried at a broken toy, then smiling brightly as a friend helps. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Sam broke his favorite toy. He was heartbroken.", displayText: "Sam: heartbroken", displayDelay: 3000 },
        { sub: "b", tts: "Heartbroken shows how deep his feeling was.", displayText: "How deep he felt", displayDelay: 2500 },
        { sub: "c", tts: "Then his friend fixed it. He was overjoyed!", displayText: "Then: overjoyed", displayDelay: 2500 },
      ]},
    { type: "example", heading: "When Problems Come", imagePrompt: `A cheerful cartoon child facing a tall stack of books, rolling up their sleeves determined. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Big problems show how characters handle tough moments.", displayText: "Problems = test", displayDelay: 2500 },
        { sub: "b", tts: "Maya had a huge pile of homework. She did not give up.", displayText: "Maya kept going", displayDelay: 2800 },
        { sub: "c", tts: "She is the kind of character who stays brave!", displayText: "Brave!", displayDelay: 2200 },
      ]},
    { type: "tip", heading: "Watch the Reactions", imagePrompt: `A cheerful cartoon magnifying glass over a tiny thought cloud containing a smiling face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A character trick", displayDelay: 1500 },
        { sub: "b", tts: "When something happens, watch what the character does next. That is their reaction!", displayText: "What do they do?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to describe how characters react!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.3-Q1","RL.2.3-Q2","RL.2.3-Q3","RL.2.3-Q4","RL.2.3-Q5"],
});

// ── RL.2.4 Words That Sing ──────────────────────────────────────
build({
  standardId: "RL.2.4", grade: "2nd Grade", domain: "Literature", title: "Words That Sing",
  slides: [
    { type: "intro", heading: "Words Have Music", imagePrompt: `A cheerful cartoon child wearing headphones, reading a book with musical notes floating out of the pages. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Writers pick words that sing. Words with a beat and sounds.", displayText: "Words that sing", displayDelay: 2500 },
        { sub: "b", tts: "Some words rhyme. Some words bounce.", displayText: "Rhyme + bounce", displayDelay: 2200 },
        { sub: "c", tts: "Let us listen to a few.", displayText: "Listen close", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "Rhymes and Beats", imagePrompt: `Two cheerful cartoon words shaped like musical notes, connected by a tiny heart. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Rhymes are words that sound the same at the end.", displayText: "Rhyme = same end", displayDelay: 2500 },
        { sub: "b", tts: "Cat and hat. Boom and zoom. Rhymes!", displayText: "cat/hat, boom/zoom", displayDelay: 2800 },
        { sub: "c", tts: "A beat is when lines have the same number of claps.", displayText: "Beat = same claps", displayDelay: 2800 },
      ]},
    { type: "example", heading: "Sensory Words", imagePrompt: `A cheerful cartoon bright glowing sun with rays warming a smiling girl's face. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some words pull in our senses.", displayText: "Use our senses", displayDelay: 2000 },
        { sub: "b", tts: "The warm sun kissed her face. We feel warm!", displayText: "Warm sun = we feel it", displayDelay: 2800 },
        { sub: "c", tts: "The thunder boomed. We hear it!", displayText: "Thunder boomed = we hear it", displayDelay: 2800 },
      ]},
    { type: "tip", heading: "Read It Aloud", imagePrompt: `A cheerful cartoon microphone with a smiling face, sparkles around it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A singing trick", displayDelay: 1500 },
        { sub: "b", tts: "Read poems out loud. You will hear the music!", displayText: "Read aloud", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to hear words that sing!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.4-Q1","RL.2.4-Q2","RL.2.4-Q3","RL.2.4-Q4","RL.2.4-Q5"],
});

// ── RL.2.5 The Shape of a Story ────────────────────────────────
build({
  standardId: "RL.2.5", grade: "2nd Grade", domain: "Literature", title: "The Shape of a Story",
  slides: [
    { type: "intro", heading: "Stories Have Shape", imagePrompt: `A cheerful cartoon mountain outline rising up to a peak and coming back down, with a little trail winding along it. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Every story has a shape. A beginning, middle, and end.", displayText: "Beginning, middle, end", displayDelay: 2800 },
        { sub: "b", tts: "The shape helps us follow along.", displayText: "Shape = follow", displayDelay: 2200 },
        { sub: "c", tts: "Let us look at each part.", displayText: "Look at each part", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "The Beginning", imagePrompt: `A cheerful cartoon sunrise over a small cottage where a smiling child is waking up. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The beginning introduces us. Who is the story about? Where are they?", displayText: "Meet + setting", displayDelay: 2800 },
        { sub: "b", tts: "It sets up the whole story.", displayText: "Sets it up", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "The Middle and End", imagePrompt: `A cheerful cartoon path curving through a green valley, with a smiling child crossing a small bridge in the middle. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The middle is where most of the action happens.", displayText: "Middle = action", displayDelay: 2500 },
        { sub: "b", tts: "There is usually a problem or a big event.", displayText: "Problem or event", displayDelay: 2500 },
        { sub: "c", tts: "The end wraps things up. How did it all turn out?", displayText: "End = wrap up", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Map the Shape", imagePrompt: `A cheerful cartoon curved arrow rising, peaking, and coming down, with three tiny stars marking beginning, middle, end. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A shape trick", displayDelay: 1500 },
        { sub: "b", tts: "As you read, ask: am I in the beginning, middle, or end?", displayText: "Where am I?", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to see the shape of a story!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.5-Q1","RL.2.5-Q2","RL.2.5-Q3","RL.2.5-Q4","RL.2.5-Q5"],
});

// ── RL.2.6 Different Points of View ────────────────────────────
build({
  standardId: "RL.2.6", grade: "2nd Grade", domain: "Literature", title: "Different Points of View",
  slides: [
    { type: "intro", heading: "Every Character Sees Differently", imagePrompt: `Two cheerful cartoon kids standing on either side of a tree, looking at the same scene from different angles, both smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "In a story, each character has their own way of seeing things.", displayText: "Own way of seeing", displayDelay: 2800 },
        { sub: "b", tts: "That is called their point of view.", displayText: "Point of view", displayDelay: 2000 },
        { sub: "c", tts: "Two characters can see the same thing very differently!", displayText: "Different views", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Two Views of a Park", imagePrompt: `A cheerful cartoon sunny park with a smiling child playing and another kid sitting sadly watching them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Tom loves the park. He thinks it is the best place ever!", displayText: "Tom: best place!", displayDelay: 2800 },
        { sub: "b", tts: "Lea feels lonely at the park. She wishes her friend was there.", displayText: "Lea: lonely", displayDelay: 2800 },
        { sub: "c", tts: "Same park, two very different points of view!", displayText: "Same place, different views", displayDelay: 2800 },
      ]},
    { type: "example", heading: "Listen for Their Feelings", imagePrompt: `A cheerful cartoon child reading a book with two tiny thought bubbles over their head showing different reactions. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "A character's point of view comes from what they feel and want.", displayText: "Feelings + wants", displayDelay: 2800 },
        { sub: "b", tts: "Listen to what they say. Watch what they do.", displayText: "Say + do", displayDelay: 2200 },
        { sub: "c", tts: "Those are clues to their point of view!", displayText: "Clues to their view", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Walk in Their Shoes", imagePrompt: `A cheerful cartoon pair of shoes with tiny stars sparkling around them. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A point-of-view trick", displayDelay: 1500 },
        { sub: "b", tts: "Imagine you are the character. How would you feel?", displayText: "Imagine being them", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to see different points of view!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.6-Q1","RL.2.6-Q2","RL.2.6-Q3","RL.2.6-Q4","RL.2.6-Q5"],
});

// ── RL.2.7 Pictures Tell More ─────────────────────────────────
build({
  standardId: "RL.2.7", grade: "2nd Grade", domain: "Literature", title: "Pictures Tell More",
  slides: [
    { type: "intro", heading: "Pictures Add to Stories", imagePrompt: `A cheerful cartoon open picture book with a bright illustration leaping off the page. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Pictures are part of the story too.", displayText: "Pictures = story", displayDelay: 2200 },
        { sub: "b", tts: "They show details the words might not say.", displayText: "Show what words miss", displayDelay: 2800 },
        { sub: "c", tts: "Let us use them together!", displayText: "Use them together", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "See the Setting", imagePrompt: `A cozy cartoon winter forest with smiling deer, bare trees, and gently falling snow. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The words might say: it was cold.", displayText: "Cold outside", displayDelay: 1800 },
        { sub: "b", tts: "The picture shows snow, bare trees, and a deer in a coat.", displayText: "Snow + bare trees", displayDelay: 2500 },
        { sub: "c", tts: "Now we know it is winter!", displayText: "Winter!", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "See the Feelings", imagePrompt: `A cheerful cartoon child sitting on a school bus with a big proud smile on their first day. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The picture shows how the character feels.", displayText: "Feelings in the picture", displayDelay: 2500 },
        { sub: "b", tts: "A huge smile means excited or proud.", displayText: "Smile = proud", displayDelay: 2500 },
        { sub: "c", tts: "Crossed arms and a frown? Maybe angry or upset.", displayText: "Frown = upset", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Pause and Look", imagePrompt: `A cheerful cartoon child pausing to look at an illustration with wide curious eyes. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A picture trick", displayDelay: 1500 },
        { sub: "b", tts: "When you read, pause on each picture. Ask, what does it add?", displayText: "What does it add?", displayDelay: 2800 },
        { sub: "c", tts: "Now you are ready to use pictures to understand stories!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.7-Q1","RL.2.7-Q2","RL.2.7-Q3","RL.2.7-Q4","RL.2.7-Q5"],
});

// ── RL.2.9 Same Story, Different Versions ──────────────────────
build({
  standardId: "RL.2.9", grade: "2nd Grade", domain: "Literature", title: "Same Story, Different Versions",
  slides: [
    { type: "intro", heading: "Stories Get Retold", imagePrompt: `Two cheerful cartoon open books next to each other with the same cartoon character drawn in two styles. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "The same story can be told in different ways.", displayText: "Different versions", displayDelay: 2500 },
        { sub: "b", tts: "Different authors. Different pictures. Sometimes different endings!", displayText: "Everything can change", displayDelay: 3000 },
        { sub: "c", tts: "Let us see what stays the same.", displayText: "What stays?", displayDelay: 2000 },
      ]},
    { type: "teach", heading: "Cinderella Everywhere", imagePrompt: `A cheerful cartoon Cinderella-like figure with warm brown skin in a sparkly dress and glass slipper, smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Cinderella has been told all over the world.", displayText: "Cinderella everywhere", displayDelay: 2500 },
        { sub: "b", tts: "Some versions have a fairy godmother. Some have a magic fish!", displayText: "Fairy or fish!", displayDelay: 2800 },
        { sub: "c", tts: "The main story is the same. The details change.", displayText: "Same story, new details", displayDelay: 2800 },
      ]},
    { type: "example", heading: "Compare Two", imagePrompt: `A cheerful cartoon Venn diagram with two overlapping circles containing tiny smiling faces, with a tiny star in the overlap. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "What is the same? The main characters. The big problem.", displayText: "Same: big stuff", displayDelay: 2800 },
        { sub: "b", tts: "What is different? The setting. The small parts. The ending sometimes.", displayText: "Different: small stuff", displayDelay: 3000 },
        { sub: "c", tts: "Both ways can be fun in their own way!", displayText: "Both fun!", displayDelay: 2200 },
      ]},
    { type: "tip", heading: "Same + Different", imagePrompt: `A cheerful cartoon kid with a clipboard and pencil, checking off items on a comparison list. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A comparing trick", displayDelay: 1500 },
        { sub: "b", tts: "Make two lists. Same on one, different on the other.", displayText: "Two lists", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to compare different story versions!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.9-Q1","RL.2.9-Q2","RL.2.9-Q3","RL.2.9-Q4","RL.2.9-Q5"],
});

// ── RL.2.10 Reading Stories All Year ───────────────────────────
build({
  standardId: "RL.2.10", grade: "2nd Grade", domain: "Literature", title: "Reading Stories All Year",
  slides: [
    { type: "intro", heading: "A Year of Stories", imagePrompt: `A cheerful cartoon calendar with a different colored book on each month, a smiling reader below. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Second graders are ready for lots of stories.", displayText: "Ready for more", displayDelay: 2000 },
        { sub: "b", tts: "Short ones. Long ones. Funny and serious.", displayText: "All kinds", displayDelay: 2200 },
        { sub: "c", tts: "Mixing them up helps your reading grow.", displayText: "Mix + grow", displayDelay: 2500 },
      ]},
    { type: "teach", heading: "Chapter Books Are Coming", imagePrompt: `A cheerful cartoon thick chapter book with a bookmark and a small kid leaning against it smiling. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "This year you will meet chapter books.", displayText: "Chapter books!", displayDelay: 2200 },
        { sub: "b", tts: "Chapter books break the story into smaller pieces.", displayText: "Small pieces", displayDelay: 2500 },
        { sub: "c", tts: "You can read one or two chapters a day!", displayText: "A chapter a day", displayDelay: 2500 },
      ]},
    { type: "example", heading: "Stretch Books", imagePrompt: `A cheerful cartoon child stretching up tall to grab a book from a high shelf, smiling with effort. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Some books feel easy. That is great for practice.", displayText: "Easy = practice", displayDelay: 2500 },
        { sub: "b", tts: "Some books feel a little hard. Those are stretch books.", displayText: "Hard = stretch", displayDelay: 2500 },
        { sub: "c", tts: "Stretch books make your reading stronger!", displayText: "Stretch = grow", displayDelay: 2500 },
      ]},
    { type: "tip", heading: "Read Every Day", imagePrompt: `A cheerful cartoon cozy armchair with a stack of colorful books beside it, a warm lamp glowing. Clean pastel background. ${IMG}`,
      steps: [
        { sub: "a", tts: "Here is a helpful trick.", displayText: "A routine trick", displayDelay: 1500 },
        { sub: "b", tts: "Find a reading spot. Read there every day.", displayText: "Same spot daily", displayDelay: 2500 },
        { sub: "c", tts: "Now you are ready to read stories all year!", displayText: "You got it!", displayDelay: 1500 },
      ]},
  ],
  mcqIds: ["RL.2.10-Q1","RL.2.10-Q2","RL.2.10-Q3","RL.2.10-Q4","RL.2.10-Q5"],
});
