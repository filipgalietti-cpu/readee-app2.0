import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./what-the-picture-adds-timings.json";

// What the Picture Adds (RL.3.7) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=what-the-picture-adds
// G3-U3. MOOD, EMPHASIS, and the SPECIFIC-ASPECT explanation tier of RL.3.7
// (sibling split: pictures-tell-more RL.2.7 owns G2 what-the-picture-tells
// about characters, setting, and plot on The Berry Mystery; idea-illustrators
// RI.1.7 and picture-detectives RL.K.7/1.7 own the two-tellers idea; pictures-
// that-teach and diagram-detectives own informational pictures; why-they-did-it
// RL.3.3 owns character from actions). THIS lesson owns the three-step move on
// every picture: what the words say, what the picture ADDS (a mood from color
// and light, something about a character the words only hint at, what the
// place is like, a detail the words never say, or nothing new at all), and
// WHICH PART of the picture does the job, then the sentence "the picture shows
// X, so the story feels Y". ONE original story, "Fenna's First Sleepover":
// 16 sentences over 5 child-read pages (read-along 1/3/5 with images, speak
// 2/4), compound + early-complex sentences, four speech-tagged dialogue lines,
// stretch words muffled / homesick / crowded / pouring with in-text support,
// no digits. FIVE pictures planned on purpose: page-1 kitchen = SETTING
// emphasis (small, crowded, old; the words say only "the kitchen"), page-2
// living room = ADDED DETAIL (a green parrot in a cage the words never say),
// page-3 bedroom = MOOD (cold blue light and streetlight stripes make calm
// words feel lonely), page-4 = CHARACTER emphasis (the words say "I am fine",
// the picture shows the pillow squeezed tight), page-5 morning kitchen = a
// PLAIN MATCH (adds nothing new). Speak texts avoid the token " my ".
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: Fenna,
// Zora, Larkin Street, sleepover, homesick, sleeping bag, checkers, parrot
// (a root-clues sentence only), muffled, pancake on the ceiling all fresh;
// Cleo, apartment blackout, board game, warm milk, dark forest mood found
// burned and avoided. Keys prefixed quiz- are fresh stimuli for the quiz
// (Tavi, Wendell, Ms. Vasquez, The Planetarium: all 0 hits).

const A = (id: string) => `/audio/lessons-v2/what-the-picture-adds/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/what-the-picture-adds/${w.toLowerCase()}.png`;

export const whatThePictureAddsImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A very small, crowded, old-fashioned kitchen seen from the doorway: copper and steel pots and pans hanging from hooks on every wall, wooden shelves stuffed full of plain clear glass jars of beans and rice with absolutely no labels, no paper tags, and no stickers on any jar, an old chipped white stove with a big steaming soup pot, faded flowered wallpaper peeling at one corner, a tiny wooden table wedged into the corner with three mismatched chairs, a woman with dark brown skin, round glasses, and an orange apron stirring the pot, and two girls squeezed together in the doorway: one with light brown skin and a long black braid wearing a yellow hoodie and a small backpack, and one with dark brown skin and short curly hair with a purple headband wearing a green striped shirt, warm evening lamplight. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no labels on any jar, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-2": { subject: "The same two girls, one with light brown skin, a long black braid, and a yellow hoodie, and one with dark brown skin, short curly hair, and a purple headband in a green striped shirt, sitting cross-legged on a round braided rug in a cozy living room playing a game of checkers on a plain red and black checkered board between them, a big bowl of popcorn beside them, a tall wobbly tower of stacked pillows tipping over behind them, and by the window a large green parrot sitting in a tall brass birdcage on a stand, watching the game, warm lamplight. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-3": { subject: "A dark bedroom at night filled with cold blue shadows, pale stripes of white streetlight falling through window blinds across the wooden floor, the same girl with dark brown skin and short curly hair asleep in her bed against the far wall with her eyes closed, and the same girl with light brown skin and a long black braid lying alone in a striped sleeping bag on the floor near the window with her eyes wide open, staring at the ceiling, a closed bedroom door, no lamp lit, everything blue and shadowy. Bright 2D cartoon illustration, bold clean outlines, deep blue and gray colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-2" },
  "page-4": { subject: "The same dark blue bedroom at night, the same girl with light brown skin and a long black braid sitting up in her striped sleeping bag on the floor with her knees pulled up, both arms squeezing a white pillow tightly against her chest, her eyes wide and shiny, and a tall man with dark brown skin, a short beard, and a blue sweater sitting on the end of the bed nearby holding a glass of water and talking to her gently, the other girl still asleep in the bed behind him, soft light from the open doorway. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-3" },
  "page-5": { subject: "The same very small crowded old-fashioned kitchen the next morning, a window on the right wall with bright golden sunbeams streaming in and pouring across the wooden floor, the same two girls, one with light brown skin and a long black braid in a yellow hoodie and one with dark brown skin, short curly hair, and a purple headband, both SITTING DOWN on chairs at the tiny wooden table with plates of pancakes in front of them, laughing and looking up, the same tall man with dark brown skin, a short beard, and a blue sweater standing at the stove holding an empty frying pan and staring up at the ceiling, one round golden pancake pressed completely flat against the ceiling directly above him, and the same woman with dark brown skin, round glasses, and an orange apron standing on top of a red wooden chair beside the table, the chair fully visible under her feet, stretching one arm straight up to peel the pancake off the ceiling, laughing, pots hanging on every wall, shelves full of plain jars, no pets anywhere. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no labels on any jar, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-lobby": "A bright round museum lobby with a curved white wall and a shiny floor, a line of eight third grade children in colorful jackets waiting with a teacher with light brown skin and a long dark ponytail in a red cardigan counting them with one raised finger, and beside the wide open doors a very large old-fashioned brass telescope on a tall wooden tripod stand pointing up, tall windows showing blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no posters, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-dome": "The inside of a planetarium theater: a huge round dark dome ceiling filled with thousands of tiny white stars and a pale band of the Milky Way, rows of red reclining seats seen from behind with children looking up, every face and every seat washed in deep calm blue light, nothing else lit. Bright 2D cartoon illustration, bold clean outlines, deep blue colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-tavi": { subject: "A close view inside the same planetarium theater of two boys in red reclining seats: a boy with light brown skin and short black hair in a blue jacket leaning far forward in his seat with his mouth open in amazement, his eyes huge and shining, both hands gripping the armrests, and beside him a boy with pale skin and freckles wearing a green baseball cap turned to look at him with a small grin, the house lights on, the dome ceiling plain and pale above them. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no logos on the cap, no signs, no writing anywhere.", ref: "quiz-dome" },
  "quiz-steps": { subject: "The same class of third grade children sitting in the bright noon sun on the wide gray stone front steps of a round white building with a domed roof, eating lunch from open lunch boxes, the same teacher with light brown skin, a long dark ponytail, and a red cardigan handing a red apple to one child, the same boy with light brown skin and a blue jacket and the same boy with a green baseball cap sitting side by side biting into red apples, no bus anywhere, clear blue sky. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "quiz-lobby" }
};

export const whatThePictureAdds: LessonDef = {
  id: "what-the-picture-adds",
  title: "What the Picture Adds",
  grade: "3rd Grade",
  standard: "RL.3.7",
  archetype: "story-elements",
  objective: "I can explain what a picture adds to the words of a story and point to the part of the picture that does it.",
  concepts: [
    "what the words say, what the picture adds, which part does it",
    "color and light add a mood",
    "a face or a body can show what a character really feels",
    "a picture can show what a place is like",
    "a picture can add a detail the words never say, or nothing new at all",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read Fenna's First Sleepover and put every picture to work. You said what the words told you, you said what the picture added, and you pointed to the exact part of the picture that did the job. A mood from the light, a feeling from a squeezed pillow, a crowded kitchen, a parrot the words never mentioned. That is how a third grade reader reads the pictures.",
    "title": "The Picture Did Its Job",
    "body": "You explained what each picture added to the story and pointed to the part of the picture that did it."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "Fenna's First Sleepover, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. In a third grade story, the pictures do a job that the words leave open. A picture can set a mood. It can show something about a character or a place that the words only hint at. It can add a detail the words never say. And some pictures add nothing new at all, which a good reader can say too. Here is page one of Fenna's First Sleepover. Read along with me, and then look hard at the picture." },
      interaction: { type: "read-along", text: "On Friday afternoon, Dad dropped Fenna off at the gray house on Larkin Street for her very first sleepover. Zora pulled her straight down the hall to the kitchen, where Zora's mom was stirring a pot of soup on the stove. \"Welcome, Fenna,\" she said, \"and grab a bowl, because in this house everybody eats the minute they walk in.\"", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-three-steps",
      purpose: "model",
      gate: "none",
      prompt: "What the words say. What the picture adds. Which part does it.",
      image: IMG("page-1"),
      narration: { audio: A("model-three-steps"), script: "Here is how I read a picture, in three steps. Step one is what the words say. They say Zora pulled Fenna to the kitchen, where her mom was stirring soup. Just a kitchen. Step two is what the picture adds. Look at it. Pots hang from every wall, the shelves are stuffed with jars, the stove is old and chipped, and the whole room could barely hold four people. The picture adds something about the setting. This kitchen is small, crowded, and old. Step three is which part of the picture does the job. Not the soup, and not Zora's shirt. The pots on every wall and the stuffed shelves. Then I say it in one sentence. The picture shows pots on every wall and shelves stuffed full, so the kitchen feels crowded and old. What the words say, what the picture adds, which part does it." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: After dinner, the girls played checkers on the living room rug until Zora had won four games in a row. Then Zora's dad made popcorn, and they built a tower of pillows so tall that it fell over twice. Fenna laughed harder than she had laughed all week.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and remember what they say, because the picture for this page comes next." },
      interaction: { type: "speak", text: "After dinner the girls played checkers on the living room rug until Zora had won four games in a row Then Zora's dad made popcorn and they built a tower of pillows so tall that it fell over twice Fenna laughed harder than she had laughed all week" },
    },
    {
      id: "guided-choose-page-2-adds",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does page two's picture add?",
      image: IMG("page-2"),
      narration: { audio: A("guided-choose-page-2-adds"), script: "Page two's words tell about checkers, popcorn, and a tower of pillows. Here is the picture that goes with page two. Look at every part of it, and compare each thing you see with what the words said. Four jobs are on your screen. Tap the job this picture does." },
      interaction: { type: "choose", options: [{ id: "a-detail-the-words-never-say", label: "a detail the words never say" }, { id: "a-mood-the-words-do-not-have", label: "a mood the words do not have" }, { id: "what-the-place-is-like", label: "what the place is like" }, { id: "nothing-new-at-all", label: "nothing new at all" }], correctId: "a-detail-the-words-never-say", coachWrong: "Look again at every corner of the picture, and check each thing against the words. Is there something here that page two never mentioned?" },
    },
    {
      id: "guided-choose-page-2-aspect",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which part of the picture is the detail the words never say?",
      image: IMG("page-2"),
      narration: { audio: A("guided-choose-page-2-aspect"), script: "Now point to the exact part. Four parts of this picture are on your screen, and all four are really in it. Three of them are in the words too. Only one of them is the detail that page two never mentions. Tap that part." },
      interaction: { type: "choose", options: [{ id: "the-parrot-in-the-cage", label: "the parrot in the cage" }, { id: "the-pile-of-pillows", label: "the pile of pillows" }, { id: "the-checkers-board", label: "the checkers board" }, { id: "the-bowl-of-popcorn", label: "the bowl of popcorn" }], correctId: "the-parrot-in-the-cage", coachWrong: "The words on page two already tell you about that. Find the part of the picture that the words never mention." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, then look at the picture.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Here is page three. Read along with me, and when you finish, look at the colors in the picture." },
      interaction: { type: "read-along", text: "At bedtime, Zora's mom turned off the lamp and closed the door. \"Good night, you two,\" she said from the hall. Zora fell asleep in about a minute, but Fenna lay in her sleeping bag on the floor and listened to the muffled sound of cars passing on the street below, a soft, faraway sound that was nothing like the quiet of home.", audio: A("page-3-read-sentence") },
    },
    {
      id: "guided-choose-page-3-feeling",
      purpose: "guided",
      gate: "interaction",
      prompt: "What feeling does page three's picture give?",
      image: IMG("page-3"),
      narration: { audio: A("guided-choose-page-3-feeling"), script: "Page three's picture does its job with color and light. The words are calm. Look at the colors, look at where the light falls, and ask what feeling they give the page. Four feelings are on your screen. Tap the one this picture gives." },
      interaction: { type: "choose", options: [{ id: "lonely-and-far-from-home", label: "lonely and far from home" }, { id: "bright-and-cheerful", label: "bright and cheerful" }, { id: "angry-and-loud", label: "angry and loud" }, { id: "silly-and-giggly", label: "silly and giggly" }], correctId: "lonely-and-far-from-home", coachWrong: "Look at the colors again. Are they warm and bright, or cold and dark? Then look at Fenna, all alone on the floor with her eyes open." },
    },
    {
      id: "guided-choose-page-3-aspect",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which part of the picture makes that feeling?",
      image: IMG("page-3"),
      narration: { audio: A("guided-choose-page-3-aspect"), script: "Now point to the part that does it. Four parts of this picture are on your screen, and all four are really in it. Only one of them is what makes the page feel the way it feels. Tap that part." },
      interaction: { type: "choose", options: [{ id: "the-cold-blue-light", label: "the cold blue light" }, { id: "the-striped-sleeping-bag", label: "the striped sleeping bag" }, { id: "the-closed-door", label: "the closed door" }, { id: "zoras-bed", label: "zora's bed" }], correctId: "the-cold-blue-light", coachWrong: "That part is in the picture, but it is a thing. A mood comes from color and light. Which part is about color and light?" },
    },
    {
      id: "page-4-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Sometime after midnight, Zora's dad came up for a glass of water and found Fenna sitting up. \"Do you want to call home?\" he asked. \"No, I am fine,\" said Fenna, so he sat on the end of the bed and told her about the summer he got homesick at camp.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and listen closely to what Fenna says about herself, because the picture may not agree." },
      interaction: { type: "speak", text: "Sometime after midnight Zora's dad came up for a glass of water and found Fenna sitting up Do you want to call home he asked No I am fine said Fenna so he sat on the end of the bed and told her about the summer he got homesick at camp" },
    },
    {
      id: "apply-choose-page-4-adds",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does page four's picture add?",
      image: IMG("page-4"),
      narration: { audio: A("apply-choose-page-4-adds"), script: "Page four's words say that Fenna told Zora's dad she was fine. Here is the picture for page four. Compare what the words say with what you see. Four jobs are on your screen. Tap the job this picture does." },
      interaction: { type: "choose", options: [{ id: "something-about-a-character", label: "something about a character" }, { id: "what-the-place-is-like", label: "what the place is like" }, { id: "a-detail-the-words-never-say", label: "a detail the words never say" }, { id: "nothing-new-at-all", label: "nothing new at all" }], correctId: "something-about-a-character", coachWrong: "Fenna said one thing with her words. Look at what she is doing in the picture. Does the picture tell you more about her?" },
    },
    {
      id: "apply-choose-page-4-aspect",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which part of the picture shows how Fenna really feels?",
      image: IMG("page-4"),
      narration: { audio: A("apply-choose-page-4-aspect"), script: "Now point to the part. Four parts of this picture are on your screen, and all four are really in it. Only one of them shows how Fenna really feels, no matter what she said. Tap that part." },
      interaction: { type: "choose", options: [{ id: "the-pillow-squeezed-tight", label: "the pillow squeezed tight" }, { id: "the-glass-of-water", label: "the glass of water" }, { id: "the-end-of-the-bed", label: "the end of the bed" }, { id: "the-striped-sleeping-bag", label: "the striped sleeping bag" }], correctId: "the-pillow-squeezed-tight", coachWrong: "That part is in the picture, but it does not tell you what Fenna feels. Look at what her arms and her body are doing." },
    },
    {
      id: "apply-sort-mood-or-detail",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Adds Mood, or Adds a Detail?",
      narration: { audio: A("apply-sort-mood-or-detail"), script: "Here are six things a picture might show. Read each one and ask what it adds. Color and light add a mood. A thing the words never say adds a detail. Drag each one to Adds Mood or to Adds a Detail." },
      interaction: { type: "sort", buckets: ["Adds Mood","Adds a Detail"], items: [{ label: "cold blue light on the floor", bucket: "Adds Mood" }, { label: "a parrot in a cage", bucket: "Adds a Detail" }, { label: "gold sunlight on the table", bucket: "Adds Mood" }, { label: "a cat asleep on the stairs", bucket: "Adds a Detail" }, { label: "one dim lamp in a dark hall", bucket: "Adds Mood" }, { label: "a mouse hole in the wall", bucket: "Adds a Detail" }], coachWrong: "Ask what that one is. If it is about color or light, it adds a mood. If it is a thing the words never said, it adds a detail." },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the ending. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is the last page. Read along with me, and keep the picture in the corner of your eye." },
      interaction: { type: "read-along", text: "When Fenna opened her eyes, morning sunlight was pouring across the floor, and Zora was already up. They ate pancakes at the crowded little table, and Zora's dad flipped one so high that it stuck to the ceiling. Everybody laughed, even Zora's mom, who had to climb right up on the table to peel it off. \"Can I come back next Friday?\" Fenna asked, and nobody at the table said no.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-page-5-adds",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does page five's picture add?",
      image: IMG("page-5"),
      narration: { audio: A("apply-choose-page-5-adds"), script: "Here is the picture for page five. Compare every part of it with the words on page five, the sunlight, the pancakes, the table. Four answers are on your screen. Tap what this picture adds." },
      interaction: { type: "choose", options: [{ id: "nothing-new-at-all", label: "nothing new at all" }, { id: "a-mood-the-words-do-not-have", label: "a mood the words do not have" }, { id: "a-pet-the-words-never-say", label: "a pet the words never say" }, { id: "how-big-the-kitchen-is", label: "how big the kitchen is" }], correctId: "nothing-new-at-all", coachWrong: "Check that answer against the words. Do the words already say it, or is it not in the picture at all? Some pictures only show what the words said." },
    },
    {
      id: "challenge-speak-one-picture",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Pick one picture from the story. Say what it adds, and which part does it.",
      narration: { audio: A("challenge-speak-one-picture"), script: "Last one, out loud. Think back over the pictures in Fenna's First Sleepover, and pick one. Tap the mic. Say what that picture adds to the words, and say which part of the picture does the job. Start with, the picture shows." },
      interaction: { type: "speak", text: "kitchen small crowded old pots shelves jars stove parrot cage bird bedroom dark blue light shadows window blinds lonely alone scared sad strange pillow hugging squeezing squeezed arms eyes worried homesick fine nervous mood detail character setting feels feel" },
    },
    {
      id: "celebrate-picture-jobs",
      purpose: "celebrate",
      gate: "none",
      prompt: "What the words say. What the picture adds. Which part does it.",
      fx: {"text":"What the picture **adds**","effect":"fireworks"},
      narration: { audio: A("celebrate-picture-jobs"), script: "Today you put every picture to work. You said what the words told you, you said what the picture added, and you pointed to the exact part that did the job. Cold blue light made a calm page feel lonely. A squeezed pillow told the truth when the words said fine. Stuffed shelves made a kitchen feel crowded and old. A parrot showed up that the words never mentioned. And one picture added nothing new, and you said so. From now on, every picture in a book has to answer to you." },
    },
  ],
};
