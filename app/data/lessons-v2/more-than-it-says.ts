import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./more-than-it-says-timings.json";

// More Than It Says (RL.3.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=more-than-it-says
// G3-U2. LITERAL vs NONLITERAL PHRASES INSIDE A STORY tier of RL.3.4 (sibling
// split: word-pictures RL.1.4 owns G1 sensory words in a poem; word-music
// RL.2.4 owns G2 rhyme, refrain, and vivid words; read-around-the-word L.3.4a
// owns sentence-context clues for single unknown WORDS; the upcoming L.3.5a
// lesson owns literal vs nonliteral as a language skill with word
// relationships. THIS lesson owns phrases met inside ONE story: the test
// "could it be true word for word?", reading around the phrase to find what
// is happening, saying the plain version, and the heart of it, the same words
// literal on one page and nonliteral on another (the ice broke under her
// boot / the ice broke between the two of them), plus the trap phrase that
// sounds nonliteral but is literal here (standing on thin ice beside a
// creek). No idiom list; every phrase is decoded from the story around it.
// ONE original story, "The Day the Ice Broke": 15 sentences over 5
// child-read pages (read-along 1/3/5 with images, speak 2/4), compound +
// early-complex sentences, three speech-tagged dialogue lines, stretch words
// hesitated / trickled / tumbled / drifts with in-text support. Planted
// nonliteral: a blanket of snow, frozen to the spot, her heart sank, the ice
// broke (page 4), the words tumbled out, the afternoon flew by. Planted
// literal: the ice broke (page 2), standing on thin ice (the trap), water
// rushed over her sock, held out a red mitten, snow up to their knees.
// ANCHOR FRESHNESS grep-swept vs every lessons-v2 + quizzes-v2 file: Rowan,
// Elsie, Juniper Lane, snow fort, blanket of snow, frozen to the spot, heart
// sank, thin ice, ice broke, flew by, hesitated, packing snow, yellow house,
// winter break all 0 hits (Ivy, Zadie, Petra, Bruno found burned and
// avoided; pond/creek/mitten only props elsewhere). Keys prefixed quiz- are
// fresh stimuli for the quiz (Callum, Astrid, Grandpa's birthday cake:
// piece of cake, all thumbs, face fell, in hot water, slow hands all 0 hits).

const A = (id: string) => `/audio/lessons-v2/more-than-it-says/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/more-than-it-says/${w.toLowerCase()}.png`;

export const moreThanItSaysImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "A young girl with pale skin, freckles, and a red knit hat over short brown hair, wearing a blue puffy coat and holding a pair of white ice skates by the laces, standing at an open wooden farm gate with one hand on the latch, looking down a snowy slope toward a small frozen pond beside a red barn, where another girl with dark skin and a purple coat and long braids stands alone at the edge of the pond, wide fields covered in smooth deep untouched snow, a small yellow farmhouse far in the background, bright winter morning, clear pale blue sky with no sun. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-3": { subject: "The same young girl with pale skin, freckles, and a red knit hat over short brown hair in a blue puffy coat sitting on a wooden bench in the snow beside a red barn with one boot pulled off and a wet gray sock showing, looking down, while the same girl with dark skin and long braids in a purple coat sits beside her holding out one red mitten with a friendly smile, a tall man in a green flannel jacket standing on the porch of a farmhouse behind them with his arms folded, a small frozen pond with a cracked edge visible in the background, bright winter afternoon. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "page-5": { subject: "The same two girls, one with pale skin, freckles, and a red knit hat in a blue puffy coat and one with dark skin and long braids in a purple coat, standing knee deep in snow beside a big finished snow fort with two rounded rooms and a small square window opening, both girls laughing, a farmhouse porch behind them with one warm glowing porch light, deep blue dusk sky with a few stars and no moon, a red barn in the background. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-messy-counter": "A boy with brown skin and short curly hair in a striped apron standing at a kitchen counter crowded with a big mixing bowl, a carton of eggs, a bag of flour spilling over, a stick of butter, and a wooden spoon, flour dust on his cheeks and hands, wide worried eyes, a plain kitchen with a window behind him. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no labels on any package, no writing anywhere.",
  "quiz-butter-pan": "A close view of a pat of yellow butter melting into a shiny puddle in a black frying pan on a stovetop burner, a wooden spoon resting beside the pan, warm kitchen light. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no writing anywhere.",
  "quiz-oven-window": "A boy with brown skin and short curly hair in a striped apron crouching in front of a closed oven and peering through the dark glass oven door window at a round cake rising inside, his hands on his knees, a plain kitchen floor. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no dials with marks, no writing anywhere."
};

export const moreThanItSays: LessonDef = {
  id: "more-than-it-says",
  title: "More Than It Says",
  grade: "3rd Grade",
  standard: "RL.3.4",
  archetype: "story-elements",
  objective: "I can tell when a phrase in a story means exactly what it says or more than it says, and I can say the plain version.",
  concepts: [
    "the test: could this phrase be true word for word, right here in the story",
    "read around the phrase to find what is happening",
    "say the plain version",
    "the same words can mean what they say on one page and more on another",
    "the story decides, not the phrase",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read The Day the Ice Broke and ran one test on every phrase in it. Could this be true word for word? When it could not, you read around it and said the plain version. When it could, you let it mean exactly what it says. That is how a third grade reader handles words that mean more than they say.",
    "title": "The Story Decides",
    "body": "You tested phrases, read around them, and said the plain version of the ones that mean more than they say."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Day the Ice Broke, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. Some phrases in a story mean exactly what they say. Others mean more than they say, and a third grade reader can tell which is which and say what they really mean. Here is page one of The Day the Ice Broke. Read along with me, and notice any phrase that could not be true word for word." },
      interaction: { type: "read-along", text: "On the first Saturday of winter break, a blanket of snow covered every field on Juniper Lane, and the pond behind Rowan's barn had finally frozen. Rowan grabbed her skates and ran for the gate, but she hesitated there, one hand on the latch, when she saw a girl she did not know standing at the edge of the pond. It was Elsie, who had moved into the yellow house in November, and Rowan stood frozen to the spot, because she never knew what to say to new people.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-the-test",
      purpose: "model",
      gate: "none",
      prompt: "Test it. Read around it. Say it plain.",
      fx: {"text":"**Test** it. **Read around** it. Say it **plain**.","effect":"pop-words"},
      narration: { audio: A("model-the-test"), script: "Here is the test I run on a phrase. Page one says, a blanket of snow covered every field. Could that be true word for word? A blanket is the cloth on a bed, and nobody spread a giant bed cover across the fields. So this phrase cannot be true word for word, and that tells me it means more than it says. Readers call the word for word meaning literal, and the more than it says meaning nonliteral. Next I read around the phrase and ask what is happening. It is the first Saturday of winter break, and the pond has finally frozen. So the snow lies over everything the way a blanket lies over a bed, smooth and thick, covering it all. That is the plain version. Three steps. Test it. Read around it. Say it plain." },
    },
    {
      id: "guided-choose-frozen-to-the-spot",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does frozen to the spot mean here?",
      fx: {"text":"Rowan stood **frozen to the spot**, because she never knew what to say to new people.","effect":"glow"},
      narration: { audio: A("guided-choose-frozen-to-the-spot"), script: "Your turn to run the test. Page one says, Rowan stood frozen to the spot. Could that be true word for word? Think about it. Then read around it. She had just seen a girl she did not know, and the sentence tells you she never knew what to say to new people. Four plain versions are on your screen. Tap the one this story supports." },
      interaction: { type: "choose", options: [{ id: "too-shy-to-move-or-speak", label: "too shy to move or speak" }, { id: "her-boots-froze-to-the-snow", label: "her boots froze to the snow" }, { id: "she-was-shivering-from-cold", label: "she was shivering from cold" }, { id: "she-was-stuck-in-deep-snow", label: "she was stuck in deep snow" }], correctId: "too-shy-to-move-or-speak", coachWrong: "Read around the phrase again. The sentence tells you why she stopped, and it is not about the weather or the snow." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: Elsie waved, so Rowan made herself walk down to the pond. Near the place where the creek trickled in, Rowan was standing on thin ice, and it cracked under her boot with a sharp snap. The ice broke into pieces, cold water rushed over her sock, and her heart sank, because Dad had said that one crack meant no skating.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and listen for a phrase that could not be true word for word." },
      interaction: { type: "speak", text: "Elsie waved so Rowan made herself walk down to the pond Near the place where the creek trickled in Rowan was standing on thin ice and it cracked under her boot with a sharp snap The ice broke into pieces cold water rushed over her sock and her heart sank because Dad had said that one crack meant no skating" },
    },
    {
      id: "guided-choose-heart-sank",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does her heart sank mean here?",
      fx: {"text":"cold water rushed over her sock, and **her heart sank**","effect":"underline"},
      narration: { audio: A("guided-choose-heart-sank"), script: "Page two says, her heart sank. Run the test. A heart stays right where it is inside a person, so this phrase cannot be true word for word. Now read around it. The ice just broke, water is in her boot, and Dad had a rule about cracks. Four plain versions are on your screen. Tap the one the story supports." },
      interaction: { type: "choose", options: [{ id: "she-suddenly-felt-let-down", label: "she suddenly felt let down" }, { id: "her-chest-hurt-from-the-cold", label: "her chest hurt from the cold" }, { id: "she-fell-down-in-the-water", label: "she fell down in the water" }, { id: "she-felt-her-heart-beat-fast", label: "she felt her heart beat fast" }], correctId: "she-suddenly-felt-let-down", coachWrong: "Read around the phrase again. Think about what Rowan wanted to do today, and what the crack in the ice means for that." },
    },
    {
      id: "guided-choose-which-words",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which words on page two tell you what her heart sank means?",
      narration: { audio: A("guided-choose-which-words"), script: "You found the plain version. Now prove it. A strong reader can point to the exact words that told her. Four groups of words from page two are on your screen, and every one of them is really on the page. Only one of them tells you why her heart sank. Tap that one." },
      interaction: { type: "choose", options: [{ id: "one-crack-meant-no-skating", label: "one crack meant no skating" }, { id: "where-the-creek-trickled-in", label: "where the creek trickled in" }, { id: "made-herself-walk-down", label: "made herself walk down" }, { id: "with-a-sharp-snap", label: "with a sharp snap" }], correctId: "one-crack-meant-no-skating", coachWrong: "Those words are on page two, but they do not tell you what Rowan just lost. Find the words that tell what the crack means for her day." },
    },
    {
      id: "model-thin-ice-trap",
      purpose: "model",
      gate: "none",
      prompt: "Not every phrase that sounds like more is more.",
      fx: {"text":"standing on thin ice: **exactly** what it says, here","effect":"cross-out"},
      narration: { audio: A("model-thin-ice-trap"), script: "Now a warning. Not every phrase that sounds like more is more. Page two says, Rowan was standing on thin ice. A careless reader hears that phrase and says, I know that one, it means she is in trouble. But watch the test. Read around it. Near the place where the creek trickled in, the ice was thin, and it cracked under her boot. She really was standing on real ice, and it really was thin. Here it means exactly what it says. The story decides, not the phrase." },
    },
    {
      id: "page-3-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and watch who sits down.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three. Read along with me, and watch what Elsie does." },
      interaction: { type: "read-along", text: "\"No skating today,\" said Dad from the porch, \"so hang those up and find something else to do.\" Rowan sat down hard on the bench with one wet foot and did not look up, until Elsie sat down beside her and held out a red mitten. \"Your sock is soaked,\" Elsie said, \"and I have never built a snow fort in my whole life, so maybe you could show me.\"", audio: A("page-3-read-sentence") },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Rowan laughed, and just like that, the ice broke between the two of them. The words tumbled out of her, all about snow forts and secret tunnels and the best packing snow, and Elsie listened to every one. They rolled snow into walls taller than the fence, and the afternoon flew by.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud. Something on this page happened once already, on page two, and you will need both pages in a minute." },
      interaction: { type: "speak", text: "Rowan laughed and just like that the ice broke between the two of them The words tumbled out of her all about snow forts and secret tunnels and the best packing snow and Elsie listened to every one They rolled snow into walls taller than the fence and the afternoon flew by" },
    },
    {
      id: "apply-sort-says-or-more",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Means What It Says, or Means More?",
      narration: { audio: A("apply-sort-says-or-more"), script: "Here are six phrases from the story. Read each one and run the test. Could it be true word for word, right here in this story? If it could, drag it to Means What It Says. If it could not, and it means more, drag it to Means More." },
      interaction: { type: "sort", buckets: ["Means What It Says","Means More"], items: [{ label: "a blanket of snow", bucket: "Means More" }, { label: "held out a red mitten", bucket: "Means What It Says" }, { label: "her heart sank", bucket: "Means More" }, { label: "standing on thin ice", bucket: "Means What It Says" }, { label: "the words tumbled out", bucket: "Means More" }, { label: "water rushed over her sock", bucket: "Means What It Says" }], coachWrong: "Run the test again. Go back to the page it came from and ask, could this really happen, word for word, right there in the story?" },
    },
    {
      id: "apply-choose-ice-broke-twice",
      purpose: "apply",
      gate: "interaction",
      prompt: "Where does the ice broke mean more than it says?",
      fx: {"text":"Page two: **the ice broke**. Page four: **the ice broke**.","effect":"word-swap"},
      narration: { audio: A("apply-choose-ice-broke-twice"), script: "The same words showed up twice in this story. On page two, the ice broke. On page four, the ice broke again. Same three words, but the test gives a different answer each time. Read around each one. Four sentences from the story are on your screen, and only one of them uses the ice breaking to mean more than it says. Tap that one." },
      interaction: { type: "choose", options: [{ id: "the-ice-broke-between-them", label: "the ice broke between them" }, { id: "the-ice-broke-into-pieces", label: "the ice broke into pieces" }, { id: "standing-on-thin-ice", label: "standing on thin ice" }, { id: "the-pond-would-freeze-solid", label: "the pond would freeze solid" }], correctId: "the-ice-broke-between-them", coachWrong: "Read around that one. Is there real ice in that sentence, ice you could touch? Then it means what it says. Find the ice that nobody could touch." },
    },
    {
      id: "page-5-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page five, the ending. Read along!",
      image: IMG("page-5"),
      narration: { audio: A("page-5-read"), script: "Here is the last page. Read along with me, and keep running the test." },
      interaction: { type: "read-along", text: "When the porch light came on, the fort had two rooms and a window, and both girls had waded through drifts of snow up to their knees. \"Same time tomorrow?\" asked Elsie, and Rowan nodded before the question was even finished. The pond would freeze solid again in a day or two, Dad said, but Rowan had already found something better than skating.", audio: A("page-5-read-sentence") },
    },
    {
      id: "apply-choose-afternoon-flew-by",
      purpose: "apply",
      gate: "interaction",
      prompt: "What does the afternoon flew by mean here?",
      fx: {"text":"They rolled snow into walls taller than the fence, and **the afternoon flew by**.","effect":"glow"},
      narration: { audio: A("apply-choose-afternoon-flew-by"), script: "Page four ends with, the afternoon flew by. Run the test yourself. Can an afternoon grow wings? No, so it means more. Now read around it. They were building walls taller than the fence, and the very next thing that happens is the porch light coming on. Four plain versions are on your screen. Tap the one this story supports." },
      interaction: { type: "choose", options: [{ id: "the-time-went-by-fast", label: "the time went by fast" }, { id: "a-bird-flew-over-the-fort", label: "a bird flew over the fort" }, { id: "the-wind-blew-all-afternoon", label: "the wind blew all afternoon" }, { id: "the-girls-ran-home-fast", label: "the girls ran home fast" }], correctId: "the-time-went-by-fast", coachWrong: "Read around it again. They were busy building, and then it was already dark. What does that tell you about the afternoon?" },
    },
    {
      id: "apply-choose-means-what-it-says",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which phrase means exactly what it says?",
      narration: { audio: A("apply-choose-means-what-it-says"), script: "One more test, the other way around. Four phrases from the story are on your screen. Three of them mean more than they say. One of them means exactly what it says, and you could have seen it with your own eyes in the story. Tap that one." },
      interaction: { type: "choose", options: [{ id: "snow-up-to-their-knees", label: "snow up to their knees" }, { id: "frozen-to-the-spot", label: "frozen to the spot" }, { id: "the-afternoon-flew-by", label: "the afternoon flew by" }, { id: "the-ice-broke-between-them", label: "the ice broke between them" }], correctId: "snow-up-to-their-knees", coachWrong: "Run the test. Could that one be true word for word, right there in the story? If it could not, it is not the one." },
    },
    {
      id: "challenge-speak-words-tumbled-out",
      purpose: "challenge",
      gate: "interaction",
      prompt: "What does the words tumbled out mean here? Say the plain version, then the clue.",
      narration: { audio: A("challenge-speak-words-tumbled-out"), script: "Last one, out loud. Page four says, the words tumbled out of her. Words cannot really tumble like rocks down a hill, so it means more. Tap the mic. Say the plain version of that phrase, then say the words from the story that told you. Start with, it means." },
      interaction: { type: "speak", text: "talked talking talk said saying spoke speaking spilled poured fast quickly quick lot lots many stopped shy chattered chatter excited rushed everything snow forts tunnels listened" },
    },
    {
      id: "celebrate-the-story-decides",
      purpose: "celebrate",
      gate: "none",
      prompt: "The story decides, not the phrase.",
      fx: {"text":"The **story** decides","effect":"fireworks"},
      narration: { audio: A("celebrate-the-story-decides"), script: "Today you ran one test on every phrase. Could it be true word for word? When it could not, you read around it and said the plain version. When it could, like thin ice beside a creek, you let it mean exactly what it says. And you watched the same three words, the ice broke, mean two different things on two different pages. The story decides. From now on, so do you." },
    },
  ],
};
