import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./there-or-told-about-it-timings.json";

// There, or Told About It (RI.4.6) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=there-or-told-about-it
// G4-U2. FIRSTHAND VS SECONDHAND ACCOUNT OF ONE EVENT tier of RI.4.6 (sibling
// split: the-authors-view RI.3.6 owns fact vs the author's opinion and the
// reader's own view, none of which is taught here; who-tells-it-changes-it
// RL.4.6 owns first person / third person NARRATION in stories, so those
// terms never appear and the child is told once that the I-words are the
// same ones known from stories; the-shape-of-the-facts RI.4.5 owns text
// structure, so no shape is named; why-authors-write RI.2.6 owns purpose).
// THIS lesson owns: a firsthand account is by someone who was THERE (a diary)
// and a secondhand account is by someone who was TOLD ABOUT IT (a town
// history entry); the signals of each (I and we, the senses, feeling in the
// moment vs the town, the scientists, the counting); the FOCUS of each (one
// girl's afternoon at the pool vs the whole event, its cause, its size, its
// aftermath); the INFORMATION only one can give (a witness-only detail vs a
// research-only fact); where the two agree; the words that best PROVE an
// account is firsthand; and the comparison produced aloud with one focus
// difference and one information difference. ONE event told twice, "The
// Dunmore Hailstorm": the diary of a girl at the town pool with her cousin
// Cato on the hot Saturday the sky went green (7 complex sentences over two
// read-along pages, first person, sensory and feeling detail, the witness-
// only fact of the walnut-sized stone with a ring inside it now in her
// freezer), and the entry from the town's history book (6 sentences over two
// read-along pages plus a 3-sentence child-read aftermath page at 54 tokens,
// no " my "; third person overview, the updraft that layers the ice, about
// six minutes along a path four miles long, more than a hundred windows,
// several barn roofs, nobody seriously hurt, the pool closed for the weekend,
// the council's new roof, the memorial race). Every fact about hail is true
// (updrafts carry drops into freezing air, stones grow in layers that show as
// rings, walnut-sized hail breaks windows and dents roofs). No digits, no
// contractions in read-along or speak text, no real people, no real town.
// Fresh guided snippets: a ceiling tile in a gym (firsthand), the old park
// bandstand (secondhand). ANCHOR FRESHNESS grep-swept vs every lessons-v2 +
// quizzes-v2 file: firsthand, secondhand, diary, encyclopedia, witness,
// Dunmore, Cato, Carlotta, town pool, lifeguard, snack bar, updraft, tin roof,
// green sky, bandstand, ceiling tile, sinkhole, Ashby, Kester, Tamar all 0
// hits (a hailstorm flattens a garden in one sentence of character-challenges-
// quiz, and hail is a vowel-team tile in team-players-quiz; neither carries
// the event). No quiz pictures: the quiz answers from spoken text.

const A = (id: string) => `/audio/lessons-v2/there-or-told-about-it/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/there-or-told-about-it/${w.toLowerCase()}.png`;

export const thereOrToldAboutItImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-f1": "An outdoor town swimming pool on a summer afternoon under a strange greenish gray sky, a ten year old girl with light brown skin and short black curly hair in a blue swimsuit standing on the wet concrete deck wrapped in a red towel, beside her a ten year old boy with light brown skin and short black hair in green swim trunks, both looking up at the sky, a lifeguard in a red shirt standing up on a tall white lifeguard chair with a whistle at her mouth, a few small white hailstones bouncing on the concrete, other swimmers climbing out of the pool and running toward a small snack bar hut with a corrugated tin roof at the edge of the deck, a chain link fence and green trees behind. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-f2": { subject: "The same ten year old girl with light brown skin and short black curly hair in a blue swimsuit and red towel standing under the corrugated tin roof of the same snack bar hut, holding up one large white hailstone the size of a walnut between her finger and thumb and looking at it closely, the same ten year old boy with light brown skin and short black hair in green swim trunks beside her with both hands pressed over his ears, big white hailstones bouncing on the pool deck in front of them, the whole concrete deck around the pool covered in a layer of white hailstones with faint steam rising, the sky dark gray. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-f1" },
  "page-s1": "A wide view from far away of a small town of low houses and a white church steeple in a green valley with farm fields and a few red barns around it, seen from a hillside, and above the town an enormous dark towering storm cloud rising very high like a mountain of cloud with a flat spreading top, its top lit white by the sun and its bottom dark gray, a curtain of white falling from the cloud over the middle of the town, blue sky at the far edges. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no people, no arrows, no symbols, no letters, no words, no numbers, no signs, no writing anywhere.",
  "page-s2": { subject: "A quiet street in the same small town of low houses just after a storm, the ground and lawns covered in white hailstones, a house with one large broken front window with a jagged hole, a red barn behind it with a dented metal roof, a man in a yellow work vest sweeping white hailstones off a concrete pool deck with a wide push broom beside a chain link fence, the sky clearing to pale blue with the dark cloud moving away at the edge. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no letters, no words, no numbers, no signs, no writing anywhere.", ref: "page-s1" }
};

export const thereOrToldAboutIt: LessonDef = {
  id: "there-or-told-about-it",
  title: "There, or Told About It",
  grade: "4th Grade",
  standard: "RI.4.6",
  archetype: "inference",
  objective: "I can tell a firsthand account from a secondhand account of the same event, say what each one focuses on, and find the information only one of them gives.",
  concepts: [
    "a firsthand account is written by someone who was there",
    "a secondhand account is written by someone who was told about it later",
    "firsthand signals: I and we, the senses, feeling in the moment",
    "secondhand signals: the town, the scientists, the counting, the whole event",
    "the firsthand focus is one person in the moment; the secondhand focus is the whole event",
    "each account gives information the other cannot",
    "read both and you get the moment and the whole event",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "You read one hailstorm told twice. The diary was firsthand, written by a girl who was there, so it focused on one afternoon at the pool and gave you the sting, the noise, and the stone in her freezer. The entry was secondhand, written by someone who was told about it, so it focused on the whole town and gave you the cause and the count. Read both, and you get the moment and the whole event.",
    "title": "There, or Told About It",
    "body": "You named a firsthand and a secondhand account from their signals, compared what each one focuses on, and found the information only one of them could give."
  },
  scenes: [
    {
      id: "hook-diary-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The diary, page one. Read along!",
      image: IMG("page-f1"),
      narration: { audio: A("hook-diary-page-1"), script: "Hello, reader. Today one event gets told twice, by two different writers, and your job is to notice what changes when the writer changes. The first writer was there. She kept a diary, and this is her page for one Saturday in June. Here is the diary, page one. Read along with me, and keep track of the words she uses for herself." },
      interaction: { type: "read-along", text: "Today the sky over the town pool turned a strange green, which is a color I did not know a sky could be. I was drying off beside Cato, who had just beaten me in our race, when the air went cold all at once and the lifeguard blew her whistle three times. The first stones bounced off the concrete like popcorn, and everybody ran for the roof of the snack bar, laughing, because none of us understood yet.", audio: A("hook-diary-page-1-sentence") },
    },
    {
      id: "hook-diary-page-2",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The diary, page two. Read along, and watch her hand.",
      image: IMG("page-f2"),
      narration: { audio: A("hook-diary-page-2"), script: "Here is the second page of the diary. Read along with me, and notice what she can hear and feel that nobody else could have written down." },
      interaction: { type: "read-along", text: "Then the big stones came, and the noise on the tin roof was so loud that I could not hear Cato shouting right beside me. One of them hit the back of the hand that I had left sticking out past the edge of the roof, and it stung like a bee for the rest of the afternoon. When it finally stopped, the whole pool deck was white and steaming, and I picked up a stone the size of a walnut that had a white ring inside it like the rings of a tree. I wrapped it in a towel, and it is sitting in our freezer right now.", audio: A("hook-diary-page-2-sentence") },
    },
    {
      id: "model-witness-signals",
      purpose: "model",
      gate: "none",
      prompt: "Firsthand: the writer was there.",
      fx: {"text":"**Firsthand** means the writer was there","effect":"pop-words"},
      narration: { audio: A("model-witness-signals"), script: "This diary is a firsthand account. Firsthand means the writer was there, standing inside the event while it happened. You can tell from three signals. The first signal is the words I and we, the same words you know from stories told by a character. She says I was drying off, and she says everybody ran, and none of us understood. The second signal is the senses. She tells what she heard, the noise on the tin roof, and what she felt, the sting on the back of her hand. The third signal is feeling in the moment. Everybody was laughing, because nobody understood yet. Because she was there, her focus is small and close. It is what one girl saw and felt at the pool on one afternoon. And she gives one piece of information that nobody else could give. The stone with the ring inside it is sitting in her freezer right now. Only a witness could know that." },
    },
    {
      id: "guided-entry-page-1",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "The town history entry, page one. Read along!",
      image: IMG("page-s1"),
      narration: { audio: A("guided-entry-page-1"), script: "Now the second writer, who was not there. Years afterward, somebody wrote an entry about the same storm for the history book of the town. Here is the entry, page one. Read along with me, and notice who this writer talks about." },
      interaction: { type: "read-along", text: "The Dunmore Hailstorm was a sudden summer storm that struck the town of Dunmore on a hot Saturday afternoon in June. All morning the temperature had climbed, and warm, damp air had been rising quickly from the fields around the town. Scientists who studied the storm afterward explained that a powerful updraft, which is a column of fast rising air, had carried raindrops high into freezing air again and again, adding a new layer of ice each time, until the stones grew too heavy to stay up.", audio: A("guided-entry-page-1-sentence") },
    },
    {
      id: "guided-entry-page-2",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "The entry, page two. Read along, and watch what it measures.",
      image: IMG("page-s2"),
      narration: { audio: A("guided-entry-page-2"), script: "Here is page two of the entry. Read along with me, and notice how many things this writer measures and counts." },
      interaction: { type: "read-along", text: "The hail fell for about six minutes along a path four miles long, and the largest stones, which were the size of walnuts, landed near the town pool and the high school. More than a hundred windows were broken across the town, and the roofs of several barns were dented. Nobody was seriously hurt, although a number of people were treated for bruises, and the pool stayed closed for the rest of the weekend while workers cleared the deck.", audio: A("guided-entry-page-2-sentence") },
    },
    {
      id: "model-overview-signals",
      purpose: "model",
      gate: "none",
      prompt: "Secondhand: the writer was told about it.",
      fx: {"text":"**Secondhand** means the writer was told about it","effect":"pop-words"},
      narration: { audio: A("model-overview-signals"), script: "The entry is a secondhand account. Secondhand means the writer was not there and learned about the event later, from records and from other people. Its signals are the opposite of the diary's signals. Instead of I and we, it says the town, and it says the scientists who studied it afterward. Instead of one girl's afternoon, its focus is the whole event. That means the cause and the size of it, and what happened to the town afterward. And it gives information the girl at the pool could never have known. It tells how the updraft built the stones one layer at a time, which is something nobody could see from under a snack bar roof. The two accounts do not disagree. Both of them say the stones were the size of walnuts. They simply stand in different places. One stands under the tin roof with a stinging hand. The other stands back and looks at the whole town." },
    },
    {
      id: "guided-choose-account-a",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which kind of writing is this?",
      narration: { audio: A("guided-choose-account-a"), script: "Now you name the account. Here is a short piece of writing about a different event, and four labels are on your screen. Two of the labels are traps, because a piece of writing can be a story or an opinion, and this one is neither. It reports something that really happened. Listen for the signals, then tap the label that fits. Here is the piece. I was standing at the back of the gym when the ceiling tile fell, and the sound it made was like a heavy book slammed shut, and every one of us jumped." },
      interaction: { type: "choose", options: [{ id: "a-firsthand-account", label: "a firsthand account" }, { id: "a-secondhand-account", label: "a secondhand account" }, { id: "a-story", label: "a story" }, { id: "an-opinion", label: "an opinion" }], correctId: "a-firsthand-account", coachWrong: "It really happened, and nobody is judging anything, so it is an account. Listen for who is telling it. Does the writer stand inside the event, or look at it from outside?" },
    },
    {
      id: "guided-choose-account-b",
      purpose: "guided",
      gate: "interaction",
      prompt: "Same four labels. Which kind of writing is this?",
      narration: { audio: A("guided-choose-account-b"), script: "Here is a second piece about another event, with the same four labels. Listen for the signals, then tap the label that fits. Here is the piece. The old wooden bandstand in the park was taken down after its floor had rotted through, and the town built the new one out of brick the following summer." },
      interaction: { type: "choose", options: [{ id: "a-secondhand-account", label: "a secondhand account" }, { id: "a-firsthand-account", label: "a firsthand account" }, { id: "a-story", label: "a story" }, { id: "an-opinion", label: "an opinion" }], correctId: "a-secondhand-account", coachWrong: "It really happened, and nobody is judging anything, so it is an account. Listen for who is telling it. Does the writer say what one person felt, or what the whole town did over time?" },
    },
    {
      id: "guided-choose-witness-only",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which detail could only the witness know?",
      narration: { audio: A("guided-choose-witness-only"), script: "Here is the hailstorm again. Some information lives in only one of the two accounts. Four details are on your screen, and every one of them is true. One of them is something that only the girl with the diary could know, because she was standing there when it happened. Tap the detail only a witness could give." },
      interaction: { type: "choose", options: [{ id: "a-stone-stung-her-hand", label: "a stone stung her hand" }, { id: "the-stones-were-walnut-sized", label: "the stones were walnut sized" }, { id: "it-lasted-about-six-minutes", label: "it lasted about six minutes" }, { id: "barn-roofs-were-dented", label: "barn roofs were dented" }], correctId: "a-stone-stung-her-hand", coachWrong: "That detail is true, but somebody who was told about the storm afterward could give it too. Find the detail that needed a body standing under that roof." },
    },
    {
      id: "guided-choose-researcher-only",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which fact could only the researcher give?",
      narration: { audio: A("guided-choose-researcher-only"), script: "Now the other direction. Four details again, and all of them are true. One of them is information that only the writer of the entry could give, because getting it took counting and asking around the whole town after the storm had passed. Tap the fact only the researcher could give." },
      interaction: { type: "choose", options: [{ id: "a-hundred-windows-broke", label: "a hundred windows broke" }, { id: "the-sky-turned-green", label: "the sky turned green" }, { id: "the-deck-was-steaming", label: "the deck was steaming" }, { id: "the-stones-were-walnut-sized", label: "the stones were walnut sized" }], correctId: "a-hundred-windows-broke", coachWrong: "A girl standing at the pool could see that with her own eyes. Find the fact that nobody could see from one spot, the one that took gathering up afterward." },
    },
    {
      id: "guided-sequence-the-move",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Put the three steps of the move in order.",
      narration: { audio: A("guided-sequence-the-move"), script: "Here is the move in three steps, and the tiles are out of order. The first step is to name which account you are holding, firsthand or secondhand, from its signals. The second step is to say what that account focuses on. The last step is to find the piece of information that only this account gives. Drag the three steps into that order." },
      interaction: { type: "sequence", items: [{ id: "name-which-account-it-is", label: "name which account it is" }, { id: "say-what-it-focuses-on", label: "say what it focuses on" }, { id: "find-what-only-it-tells", label: "find what only it tells" }], order: ["name-which-account-it-is", "say-what-it-focuses-on", "find-what-only-it-tells"], coachWrong: "Signals come first, because you cannot say what an account focuses on until you know which kind it is. The unique information is the last thing you hunt for." },
    },
    {
      id: "apply-sort-signals",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Sort it: Firsthand Signals, or Secondhand Signals?",
      narration: { audio: A("apply-sort-signals"), script: "Six phrases from the two accounts are on your screen. Some of them carry the signals of a witness. Those are the words I and we. Those are the senses and the feelings. Some of them carry the signals of an overview. Those are the town and the scientists. Those are the numbers. Drag each phrase to its bucket, Firsthand Signals or Secondhand Signals." },
      interaction: { type: "sort", buckets: ["Firsthand Signals","Secondhand Signals"], items: [{ label: "we ran for the roof", bucket: "Firsthand Signals" }, { label: "the storm struck the town", bucket: "Secondhand Signals" }, { label: "none of us understood yet", bucket: "Firsthand Signals" }, { label: "scientists later explained", bucket: "Secondhand Signals" }, { label: "I wrapped it in a towel", bucket: "Firsthand Signals" }, { label: "more than a hundred windows", bucket: "Secondhand Signals" }], coachWrong: "Ask who is speaking in that phrase. A person inside the event says I, we, and us. A writer outside the event names the town, the scientists, and the numbers." },
    },
    {
      id: "apply-page-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read the last page of the entry: The storm caused more damage than any other hailstorm in the history of the town. Within a week, the town council voted to build a new roof over the pool deck. Every June since then, the pool has held a race in memory of the storm, and the winner takes home a glass hailstone.",
      narration: { audio: A("apply-page-read"), script: "The last page of the history entry is yours. Read all three sentences out loud, and hold on to what the town did after the storm." },
      interaction: { type: "speak", text: "The storm caused more damage than any other hailstorm in the history of the town Within a week the town council voted to build a new roof over the pool deck Every June since then the pool has held a race in memory of the storm and the winner takes home a glass hailstone" },
    },
    {
      id: "apply-choose-agreement",
      purpose: "apply",
      gate: "interaction",
      prompt: "What do both accounts agree on?",
      narration: { audio: A("apply-choose-agreement"), script: "Two accounts of one event do not have to disagree, and careful readers notice where they match. Four statements are on your screen. Three of them come from only one of the two accounts. One of them is something both writers say. Tap the one that both accounts agree on." },
      interaction: { type: "choose", options: [{ id: "it-came-on-a-hot-afternoon", label: "it came on a hot afternoon" }, { id: "the-deck-was-steaming", label: "the deck was steaming" }, { id: "barn-roofs-were-dented", label: "barn roofs were dented" }, { id: "the-lifeguard-whistled", label: "the lifeguard whistled" }], correctId: "it-came-on-a-hot-afternoon", coachWrong: "Only one of the two writers says that. Test each statement against the diary and then against the entry, and keep the one that shows up in both." },
    },
    {
      id: "apply-choose-best-evidence",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words best prove the diary is firsthand?",
      narration: { audio: A("apply-choose-best-evidence"), script: "Here is the best evidence move. Four groups of words from the diary are on your screen, and every one of them is really on the page. If you wanted to prove to someone that the diary is firsthand, one of them proves it better than the others, because it carries the strongest witness signal. Tap the words that prove it best." },
      interaction: { type: "choose", options: [{ id: "i-could-not-hear-cato", label: "I could not hear Cato" }, { id: "the-sky-turned-green", label: "the sky turned green" }, { id: "the-noise-on-the-tin-roof", label: "the noise on the tin roof" }, { id: "a-stone-the-size-of-a-walnut", label: "a stone the size of a walnut" }], correctId: "i-could-not-hear-cato", coachWrong: "Those words are in the diary, but a history entry could have said them too. Find the words that only someone standing there could write." },
    },
    {
      id: "challenge-speak-compare",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Compare the two accounts. Name one focus difference and one information difference.",
      narration: { audio: A("challenge-speak-compare"), script: "Last one, and you make the whole comparison out loud. Tap the mic when you are ready. The first half of your answer is the focus. Say what the diary focuses on, and then what the entry focuses on. The second half is the information. Name one piece of information that only one of the two accounts gives." },
      interaction: { type: "speak", text: "diary entry witness girl pool afternoon saw felt heard feelings feeling stung sting hand freezer stone ring whistle roof popcorn green focus focuses focused whole town storm bigger picture cause causes updraft layers windows hundred minutes miles barns council history nobody hurt walnut walnuts firsthand secondhand there overview scientists research researcher later moment" },
    },
    {
      id: "celebrate-there-or-told",
      purpose: "celebrate",
      gate: "none",
      prompt: "There, or told about it.",
      fx: {"text":"There, or **told about it**","effect":"fireworks"},
      narration: { audio: A("celebrate-there-or-told"), script: "Two writers told one storm. The girl with the diary was there, so her account is firsthand. It focuses on one afternoon at the pool. It gives you the sting on her hand. It gives you the noise on the roof. It gives you the stone in the freezer. The writer of the entry was told about it, so that account is secondhand. It focuses on the whole town, and it gives you the cause and the count. Read both, and you get the moment and the whole event. That is what a fourth grade reader does with two accounts." },
    },
  ],
};
