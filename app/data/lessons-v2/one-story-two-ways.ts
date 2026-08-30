import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./one-story-two-ways-timings.json";

// One Story, Two Ways (RL.2.9) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=one-story-two-ways

const A = (id: string) => `/audio/lessons-v2/one-story-two-ways/${id}.mp3`;
const W = (w: string) => `/audio/lessons-v2/one-story-two-ways/words/${w.toLowerCase()}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/one-story-two-ways/${w.toLowerCase()}.png`;

export const oneStoryTwoWaysImages: Record<string, string> = {
  "magnifying glass": "A cartoon magnifying glass with a friendly eye peeking out",
  "story bones": "Simple, stylized white bones, like a skeleton outline",
  "story skin": "A colorful, patterned piece of fabric or cloth",
  "problem": "A cartoon thought bubble with a question mark inside",
  "hungry traveler": "A cartoon traveler with a backpack and a grumbling stomach",
  "fire": "A small campfire with flames",
  "stone": "A smooth, grey river stone",
  "pot of water": "A large metal cooking pot filled with clear water",
  "trick": "A cartoon lightbulb turning on, representing an idea",
  "button": "A large, round, colorful clothing button",
  "baker's wife": "A cheerful woman wearing an apron, holding a loaf of bread",
  "traveling soldier": "A cartoon soldier in uniform with a backpack",
  "town square": "A bustling town square with market stalls and buildings",
  "lesson": "An open book with a star above it, symbolizing wisdom",
  "sharing meal": "People happily eating around a table with a steaming pot",
  "old woman": "A kind-looking old woman in a simple dress",
  "a clever trick": "A cartoon lightbulb turning on, representing an idea",
  "stone or button": "A smooth river stone next to a colorful clothing button",
  "sharing is good": "Two hands sharing a piece of fruit",
  "soldier or tailor": "A cartoon soldier and a cartoon tailor standing side by side",
  "village or town": "A split image showing a quiet village on one side and a bustling town on the other",
  "people share food": "A group of happy people sharing dishes at a table",
  "detective dee": "A friendly, cartoon detective character with a trench coat and hat"
};

export const oneStoryTwoWays: LessonDef = {
  id: "one-story-two-ways",
  title: "One Story, Two Ways",
  grade: "2nd Grade",
  standard: "RL.2.9",
  archetype: "comprehension",
  objective: "You will compare two stories to find what is the same and what is different!",
  concepts: ["Compare and contrast stories","Identify story elements (characters, problem, solution, lesson)","Understand cultural differences in storytelling"],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Great job, Story Detective! You found the story bones and the story skin. Remember, stories from different places can teach us the same big lessons. Keep comparing and contrasting every story you read!",
    "title": "Amazing Story Detective!",
    "body": "You've mastered finding the heart of a story and seeing how cultures make it unique!"
  },
  scenes: [
    {
      id: "intro-hook",
      purpose: "hook",
      gate: "read-along",
      prompt: "Listen closely to our mission!",
      image: IMG("magnifying glass"),
      narration: { audio: A("intro-hook"), script: "Hello, Story Detectives! I'm Detective Dee, and we have a fun mission today. We're going to read two stories and find their story bones and story skin." },
      interaction: { type: "read-along", text: "Every story has important **story bones**. These are the main parts that make the story work, like the characters, the problem, and the lesson. Stories also have **story skin**. This is what makes each story special, like the names, the setting, and the foods. Let's start our detective work!", audio: A("intro-hook-sentence") },
    },
    {
      id: "story-one-read",
      purpose: "model",
      layout: "full",
      gate: "read-along",
      prompt: "Read the first story, 'Stone Soup'.",
      narration: { audio: A("story-one-read"), script: "Our first story is a classic tale called 'Stone Soup'. Read it carefully to find its story bones and skin. I'll read along with you." },
      interaction: { type: "read-along", text: "A hungry **traveling soldier** came to a village. He saw an **old woman** and asked for food, but she said, \"I have nothing to share.\" The soldier smiled. \"Then I will make **stone soup**!\" he declared. He pulled a smooth stone from his bag and asked for a large **pot of water**.\n\nSoon, a fire crackled, and the water boiled. The soldier tasted the soup. \"It's good, but a few carrots would make it better!\" A villager offered carrots. Later, he said, \"A potato or two would be perfect!\" Another villager brought potatoes. Soon, everyone was bringing something: onions, salt, and pepper. The pot was full of delicious soup.\n\nFinally, the soldier said, \"The stone is ready!\" He removed the stone. Everyone gathered, bowls in hand. They shared the tasty soup, laughing and talking. The **lesson** was clear: even a little bit from everyone makes a big, wonderful meal.", audio: A("story-one-read-sentence") },
    },
    {
      id: "story-one-problem",
      purpose: "guided",
      gate: "interaction",
      prompt: "What was the main problem in 'Stone Soup'?",
      image: IMG("problem"),
      narration: { audio: A("story-one-problem"), script: "You just read about the soldier and the stone soup. Think about the beginning of the story. What was the big problem?" },
      interaction: { type: "choose", options: [{ id: "the fire would not light.", label: "THE FIRE WOULD NOT LIGHT.", audio: W("The fire would not light.") }, { id: "the soldier was very hungry.", label: "THE SOLDIER WAS VERY HUNGRY.", audio: W("The soldier was very hungry.") }, { id: "the stone was too small.", label: "THE STONE WAS TOO SMALL.", audio: W("The stone was too small.") }, { id: "the pot was not clean.", label: "THE POT WAS NOT CLEAN.", audio: W("The pot was not clean.") }], correctId: "the soldier was very hungry.", coachWrong: "Think about what the soldier needed most when he first arrived in the village." },
    },
    {
      id: "story-one-trick-speak",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tell why making stone soup was a clever trick.",
      image: IMG("trick"),
      narration: { audio: A("story-one-trick-speak"), script: "The soldier was very clever! He got everyone to share. Why was making 'stone soup' such a good trick? Tap the mic and tell me." },
      interaction: { type: "speak", text: "The soldier pretended to make soup from a stone so people would add food." },
    },
    {
      id: "story-two-read",
      purpose: "model",
      layout: "full",
      gate: "read-along",
      prompt: "Read the second story, 'Button Soup'.",
      narration: { audio: A("story-two-read"), script: "Great job, Story Detective! Now, let's read our second story, 'Button Soup'. See if you can spot the story bones and story skin in this new tale." },
      interaction: { type: "read-along", text: "A hungry **traveling tailor** arrived in a bustling **town square**. He saw the **baker's wife** and asked for a bite to eat, but she sighed, \"I have no extra food.\" The tailor winked. \"Then I will make **button soup**!\" he announced. He pulled a shiny button from his pocket and asked for a big **pot of water**.\n\nSoon, a small fire warmed the pot, and the water began to bubble. The tailor sniffed the steam. \"It smells good, but a few chopped onions would make it even better!\" A shopkeeper offered onions. Later, he said, \"Some cabbage would truly perfect it!\" Another person brought cabbage. Soon, many folks were adding something: salt, pepper, and fresh herbs. The pot was soon overflowing with wonderful soup.\n\nFinally, the tailor said, \"The button is ready!\" He carefully took out the button. Everyone gathered in the town square, holding their bowls. They shared the hearty soup, full of chatter and smiles. The **lesson** was clear: when everyone gives a little, there is plenty for all.", audio: A("story-two-read-sentence") },
    },
    {
      id: "story-two-problem",
      purpose: "guided",
      gate: "interaction",
      prompt: "What was the main problem in 'Button Soup'?",
      image: IMG("problem"),
      narration: { audio: A("story-two-problem"), script: "You just read 'Button Soup'. What was the big problem at the start of this story? Choose the best answer." },
      interaction: { type: "choose", options: [{ id: "the tailor was very hungry.", label: "THE TAILOR WAS VERY HUNGRY.", audio: W("The tailor was very hungry.") }, { id: "the button was hard to find.", label: "THE BUTTON WAS HARD TO FIND.", audio: W("The button was hard to find.") }, { id: "the baker's wife was busy.", label: "THE BAKER'S WIFE WAS BUSY.", audio: W("The baker's wife was busy.") }, { id: "the pot was too heavy.", label: "THE POT WAS TOO HEAVY.", audio: W("The pot was too heavy.") }], correctId: "the tailor was very hungry.", coachWrong: "What did the tailor need most when he came to the town?" },
    },
    {
      id: "story-two-trick-speak",
      purpose: "guided",
      gate: "interaction",
      prompt: "Tell why making button soup was a clever trick.",
      image: IMG("trick"),
      narration: { audio: A("story-two-trick-speak"), script: "Just like the soldier, the tailor had a smart idea! Why was making 'button soup' a good trick? Tap the mic and tell me." },
      interaction: { type: "speak", text: "The tailor pretended to make soup from a button to get people to share their food." },
    },
    {
      id: "compare-bones",
      purpose: "apply",
      gate: "interaction",
      prompt: "What story bone is the SAME in both 'Stone Soup' and 'Button Soup'?",
      image: IMG("story bones"),
      narration: { audio: A("compare-bones"), script: "Now let's compare! Think about the main parts, the story bones. What was the same in both stories?" },
      interaction: { type: "choose", options: [{ id: "a soldier made the soup.", label: "A SOLDIER MADE THE SOUP.", audio: W("A soldier made the soup.") }, { id: "the main character was hungry.", label: "THE MAIN CHARACTER WAS HUNGRY.", audio: W("The main character was hungry.") }, { id: "they used a stone to start.", label: "THEY USED A STONE TO START.", audio: W("They used a stone to start.") }, { id: "the setting was a town square.", label: "THE SETTING WAS A TOWN SQUARE.", audio: W("The setting was a town square.") }], correctId: "the main character was hungry.", coachWrong: "Remember, 'story bones' are the big, important parts that don't change much. Which of these happened in both stories?" },
    },
    {
      id: "compare-skin",
      purpose: "apply",
      gate: "interaction",
      prompt: "What story skin is DIFFERENT between the two stories?",
      image: IMG("story skin"),
      narration: { audio: A("compare-skin"), script: "Great job finding a story bone! Now, let's look at the story skin. What was different about the two stories?" },
      interaction: { type: "choose", options: [{ id: "the characters learned a lesson.", label: "THE CHARACTERS LEARNED A LESSON.", audio: W("The characters learned a lesson.") }, { id: "people shared their food.", label: "PEOPLE SHARED THEIR FOOD.", audio: W("People shared their food.") }, { id: "a special item made the soup.", label: "A SPECIAL ITEM MADE THE SOUP.", audio: W("A special item made the soup.") }, { id: "the main character was clever.", label: "THE MAIN CHARACTER WAS CLEVER.", audio: W("The main character was clever.") }], correctId: "a special item made the soup.", coachWrong: "Think about the unique details that changed between the two stories. What was one detail that was different?" },
    },
    {
      id: "sort-bones-skin",
      purpose: "challenge",
      layout: "full",
      gate: "interaction",
      prompt: "Sort the story parts into 'Story Bones' or 'Story Skin'.",
      narration: { audio: A("sort-bones-skin"), script: "You are doing amazing, Story Detective! Now, put your skills to the test. Drag each part to show if it's a story bone or story skin." },
      interaction: { type: "sort", buckets: ["Story Bones","Story Skin"], items: [{ label: "HUNGRY TRAVELER", bucket: "Story Bones", audio: W("Hungry traveler") }, { label: "OLD WOMAN", bucket: "Story Skin", audio: W("Old woman") }, { label: "A CLEVER TRICK", bucket: "Story Bones", audio: W("A clever trick") }, { label: "STONE OR BUTTON", bucket: "Story Skin", audio: W("Stone or Button") }, { label: "SHARING IS GOOD", bucket: "Story Bones", audio: W("Sharing is good") }, { label: "SOLDIER OR TAILOR", bucket: "Story Skin", audio: W("Soldier or Tailor") }, { label: "VILLAGE OR TOWN", bucket: "Story Skin", audio: W("Village or Town") }, { label: "PEOPLE SHARE FOOD", bucket: "Story Bones", audio: W("People share food") }], coachWrong: "Remember, 'story bones' are the main, unchanging parts, and 'story skin' is what makes each story unique and different." },
    },
    {
      id: "celebrate-success",
      purpose: "celebrate",
      gate: "none",
      prompt: "You are a fantastic Story Detective!",
      image: IMG("detective dee"),
      fx: {"text":"You are a super star at comparing stories!","effect":"fireworks"},
      narration: { audio: A("celebrate-success"), script: "You did it! You found the story bones and the story skin in two different tales. You are a super star at comparing stories! Keep exploring the wonderful world of books!" },
    },
  ],
};
