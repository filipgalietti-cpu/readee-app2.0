import type { LessonDef } from "@/lib/lesson-engine/types";
import timings from "./the-right-tool-timings.json";

// The Right Tool (L.4.4) · FACTORY-AUTHORED (scripts/lesson-author.ts), human-reviewed.
// PURE DATA. Assets: lesson-tts / lesson-timings.py / lesson-images --lesson=the-right-tool
// G4-U1 VOCABULARY CAPSTONE of the L.4.4 umbrella (precedent: three-word-tools
// L.3.4, the blackout: rummaged / unhurried / tripped / delighted / guitarist /
// restored / dwindled and its quiz's mar / vis / super, all burned and unused;
// word-solvers L.2.4 bank / light / train, double-duty-words K bat / duck /
// wave / rock, word-toolbox L.1.4 bark / bat / ring, all burned). Sibling
// split honored: context-at-a-distance L.4.4a (the comet night) owns the clue
// KINDS and where they live, so tool one here is only USED, never re-taught;
// greek-and-latin-roots L.4.4b (opening night) owns phon / graph / spect /
// dict / micro / mega / multi / inter, so tool two here uses three DIFFERENT
// parts, chron (time), ject (throw) and mal (bad), plus pro (forward);
// check-the-dictionary L.3.4d (the clay studio) owns finding an entry fast
// and its four parts, so the glossary here is read, tested and confirmed,
// never hunted; same-root-new-branch L.3.4c owns the carpet false friend,
// greek-and-latin-roots owns sprinter, so the false friend here is dismal
// (the letters of mal, and the sum not bad fails the test). THIS lesson owns
// the G4 step-up: CHOOSING FLEXIBLY and CLARIFYING. Four tools named plainly
// (read around and read FURTHER; take it apart; the sentence picks the meaning
// of a word you know; check the glossary and choose the sense that fits, kept to ONE
// child beat because L.4.4c has its own U2 row that owns respellings,
// guide words and reference types), the move
// look / choose / get a meaning / test / switch, two tools on one word that
// AGREE (chronicle, chronometer), the false friend, a two-sense glossary entry
// read and confirmed by the words on the page, and saying WHICH tool and WHY.
// ONE story, "The Night the Clock Stopped": Britta, ten, apprentice to Mr.
// Kowalski, who has wound the town clock every Monday for thirty years, on the
// night the great clock stops; every fact true (a tower clock is driven by a
// heavy weight on a cable that winds around a barrel and is raised with a
// crank, the pendulum and the wheels make the tick, hammers lifted by the
// clock strike the bells, a bigger bell has a lower pitch, a chronometer is a
// clock exact enough that sailors once navigated by one, the movement is the
// name for the whole machine). Two dense read-alongs of six sentences (pages
// one and three, ref-chained images) + two accept-mode child-read pages of
// three sentences (pages two and four, 51 and 53 tokens, no " my ", the
// clockmaker unnamed on speak pages), complex sentences with relative
// pronouns (who had wound it, in which every keeper had written, where the
// wind pulled), past perfect, one action-beat dialogue line, no digits, no
// contractions in child-read text. Targets by tool: page one defunct (read
// further) / chronicle (chron) / movement (sentence picks) / gallery
// (glossary); page two projected (pro + ject) / faltered (read around); page
// three malfunction (mal) / pitch (sentence picks) / dismal (false friend) /
// barrel (glossary, confirmed by the cable that hung from it); page four
// chronometer (two tools agree, production). ANCHOR FRESHNESS grep-swept vs
// every lessons-v2 + quizzes-v2 file BEFORE writing: clock tower / tower
// clock / bell tower / clockmaker / apprentice / pendulum / crank / defunct /
// chronicle / chronometer / malfunction / projected / faltered / dismal /
// gallery / barrel / chronic / ejected / maltreated / clambered / gaunt /
// jostled / Britta / Kowalski all 0 hits (dormant, mallet, marmalade,
// rickety, brittle, dawdled, hoisted, lurched found burned and avoided;
// movement = one accept token in pictures-that-teach-quiz; pitch = pitcher,
// pitch in and pitch black only). Keys prefixed quiz- are picture supports
// for the quiz's all-fresh bakery text (Tova, Aunt Gerda, the recipe book).
// Tiles lowercase, audio-free, kebab ids, 28-char cap.

const A = (id: string) => `/audio/lessons-v2/the-right-tool/${id}.mp3`;
const IMG = (w: string) => `/images/lessons-v2/the-right-tool/${w.toLowerCase()}.png`;

export const theRightToolImages: Record<string, string | { subject: string; ref?: string }> = {
  "page-1": "The inside of a tall stone clock tower at night, a huge iron clock movement, a frame of large iron gear wheels taller than a farm wagon, standing silent in the middle of a stone room, a narrow stone staircase coming up through the floor, an elderly man with pale skin, a white mustache, a flat gray cap, and a long brown coat holding up a glowing oil lantern, and a ten year old girl with light brown skin and two dark braids in a green wool coat and a red scarf standing behind him hugging a thick closed leather book, moonlight through a tall arched window, no clock face anywhere in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no clock dials, no numbers, no letters, no words, no signs, no writing anywhere.",
  "page-3": { subject: "The same stone clock room at night, the same elderly man with pale skin, a white mustache, a flat gray cap, and a long brown coat turning a large iron crank handle on the side of the iron clock movement with both hands, a thick cable running up from a wide iron drum to a heavy iron weight, the same ten year old girl with light brown skin, two dark braids, a green wool coat, and a red scarf reaching up to touch a huge bronze bell that hangs in a wooden frame beside a smaller bronze bell, a full moon shining through the tall arched window, dust and a few small moths floating in the lantern light, no clock face anywhere in the picture. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no faces on the moon, no clock dials, no numbers, no letters, no words, no signs, no writing anywhere.", ref: "page-1" },
  "quiz-scorched-loaves": "A wooden bakery counter before dawn, a metal baking tray holding four loaves of bread that are burned black along their bottoms and dark brown on top, one thin wisp of smoke rising from them, a big brick oven glowing orange in the background, flour dusted across the counter, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no labels, no letters, no words, no numbers, no signs, no writing anywhere.",
  "quiz-dough-risen": "A large cream colored ceramic mixing bowl on a wooden bakery counter holding a smooth pale dome of bread dough that has risen high above the rim of the bowl, a folded blue cloth beside it, a small window showing pale early morning light, no people. Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors, no labels, no letters, no words, no numbers, no signs, no writing anywhere."
};

export const theRightTool: LessonDef = {
  id: "the-right-tool",
  title: "The Right Tool",
  grade: "4th Grade",
  standard: "L.4.4",
  archetype: "vocabulary",
  objective: "I can look at a new word, choose the tool that fits it, test the meaning in the sentence, switch when the test fails, and say which tool I used.",
  concepts: [
    "look at the word first, then choose the tool that fits it",
    "read around the word, and when the sentence gives you little, read further",
    "take the word apart into its Greek and Latin parts, then test the sum",
    "when a word you know does not fit, the sentence picks the meaning",
    "when no tool settles it, check the glossary, choose the sense that fits, and confirm it with the words on the page",
    "a failed test means switch tools, and a strong reader can say which tool and why",
  ],
  timings: timings as LessonDef["timings"],
  completion: {
    "script": "Tonight you did not learn a new tool. You chose. At every word that stopped you, you looked at the word first, picked the tool that fit, got a meaning, and tested it in the sentence. When a test failed, you switched. When no tool settled it, you checked the glossary and confirmed the sense with the words on the page. The tools belong to every reader. The choosing is what makes a fourth grade reader, and now the choosing is yours.",
    "title": "The Right Tool, Every Time",
    "body": "You looked at each new word, chose the tool that fit it, tested the meaning, switched when a test failed, and named the tool you used."
  },
  scenes: [
    {
      id: "hook-page-1",
      purpose: "hook",
      layout: "full",
      gate: "interaction",
      prompt: "The Night the Clock Stopped, page one. Read along!",
      image: IMG("page-1"),
      narration: { audio: A("hook-page-1"), script: "Hello, reader. You own four word tools now. You can read around a word, and in fourth grade you read further, a sentence or two away. You can take a word apart into its Greek and Latin parts. When a word you know does not fit, you let the sentence pick the meaning. And when the tools disagree, or none of them fits, you check the glossary. Tonight nobody hands you the tool. You read one story, and at every word that stops you, you look at the word, choose a tool, get a meaning, and test it in the sentence. Here is page one. Read along with me, and notice the four words that slow you down." },
      interaction: { type: "read-along", text: "For the first time in Britta's life, the great clock above the town square had stopped, and Mr. Kowalski, who had wound it every Monday for thirty years, was climbing the tower stairs with his apprentice behind him. He called the clock defunct, and he said it the way a doctor says a hard word. Nothing inside it had turned since the bells struck four that afternoon, and the hands on all four dials pointed at the same wrong minute. Halfway up, he unlocked a cupboard and handed Britta the chronicle, a heavy book in which every keeper had written the date of every winding since the tower was built. At the top, the movement filled the whole room, a frame of iron wheels taller than a wagon, and it stood as silent as a stone. Britta followed him out onto the gallery, where the wind pulled at her coat and the whole dark square lay below them.", audio: A("hook-page-1-sentence") },
    },
    {
      id: "model-read-further",
      purpose: "model",
      gate: "none",
      prompt: "Tool one: read around the word, then read further.",
      fx: {"text":"Read around the word, then read **further**","effect":"underline"},
      narration: { audio: A("model-read-further"), script: "The first stop is defunct. Look at the word before you look anywhere else. Is there a part you know inside it? De, funct. Nothing I can build with, so I read around it. The sentence with defunct in it says only that he said it the way a doctor says a hard word. That tells me the word is serious, and nothing more. So I read further. The next sentence says that nothing inside the clock had turned since four that afternoon, and that the hands pointed at the same wrong minute. There is the clue, one whole sentence away. Defunct means no longer working, finished as a machine. Now I test it. He called the clock no longer working, and he said it the way a doctor says a hard word. It fits. Read around the word, and when the sentence gives you little, read further." },
    },
    {
      id: "model-take-apart",
      purpose: "model",
      gate: "none",
      prompt: "Tool two: take the word apart into its old parts.",
      fx: {"text":"**chron** means time","effect":"pop-words"},
      narration: { audio: A("model-take-apart"), script: "The second stop is chronicle. Look at the word first. The front of it, chron, is a Greek part, and chron means time. So I take the word apart. Chron, time, and icle, an ending that turns a part into a thing. A chronicle should be a thing made of time, a record kept over time. Now I test it in the sentence. A heavy book in which every keeper had written the date of every winding since the tower was built. A record kept over time, year after year. It fits. Notice one more thing. The sentence explained the book as well, so reading around would have worked too. Two tools, one meaning, and they agree. When two tools agree, you can trust the meaning." },
    },
    {
      id: "model-two-more-tools",
      purpose: "model",
      gate: "none",
      prompt: "Tools three and four: the sentence picks, or the glossary settles.",
      fx: {"text":"The **moving** filled the room? Switch.","effect":"cross-out"},
      narration: { audio: A("model-two-more-tools"), script: "Movement is a word you know. Moving, motion. Test it. The moving filled the whole room and stood as silent as a stone? That fails, and a failed test means switch, not skip. When a word you know does not fit, the sentence picks the meaning. A frame of iron wheels taller than a wagon. The movement is the machine inside the clock, all of its wheels together, and that fits. Gallery is harder. Reading around gives me a windy place with a view. No part helps. The meaning I know, a room where paintings hang, fails on a tower at night. When no tool settles it, I check the glossary. Gallery. Sense one, a room where paintings hang. Sense two, a narrow walkway with a rail along a tower or a wall. Test sense two. She followed him out onto the walkway, where the wind pulled at her coat. It fits, and the glossary settled it." },
    },
    {
      id: "page-2-read",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Read page two: The clockmaker set his lamp on the floor, and its light projected the shadow of the pendulum across the wall. He gave the pendulum a push, and it swung twice, faltered, and hung still again. \"Whatever is wrong, it is not the pendulum,\" he said, and he turned to the wheels.",
      narration: { audio: A("page-2-read"), script: "Page two is yours. Read all three sentences out loud, and notice the two words that might slow you down." },
      interaction: { type: "speak", text: "The clockmaker set his lamp on the floor and its light projected the shadow of the pendulum across the wall He gave the pendulum a push and it swung twice faltered and hung still again Whatever is wrong it is not the pendulum he said and he turned to the wheels" },
    },
    {
      id: "guided-choose-tool-projected",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which tool fits projected?",
      narration: { audio: A("guided-choose-tool-projected"), script: "Here is projected. Before you touch the sentence, look at the word. Is there an old part inside it that you have learned? Is there a whole word you already know? Or is there nothing to build with? What you see inside the word tells you which tool to pick up. Tap the tool that fits projected." },
      interaction: { type: "choose", options: [{ id: "take-it-apart", label: "take it apart" }, { id: "read-around-it", label: "read around it" }, { id: "the-sentence-picks-a-meaning", label: "the sentence picks a meaning" }, { id: "check-the-glossary", label: "check the glossary" }], correctId: "take-it-apart", coachWrong: "Look at the back half of projected. An old part you have learned is sitting there. Which tool uses parts?" },
    },
    {
      id: "guided-choose-tool-faltered",
      purpose: "guided",
      gate: "interaction",
      prompt: "Which tool fits faltered?",
      narration: { audio: A("guided-choose-tool-faltered"), script: "Here is faltered. Look inside the word first. Fal, ter, ed. The ending is one you know, but under it there is no old part and no word you know, and that tells you which tool is left. Tap the tool that fits faltered." },
      interaction: { type: "choose", options: [{ id: "read-around-it", label: "read around it" }, { id: "take-it-apart", label: "take it apart" }, { id: "the-sentence-picks-a-meaning", label: "the sentence picks a meaning" }, { id: "check-the-glossary", label: "check the glossary" }], correctId: "read-around-it", coachWrong: "Nothing inside faltered is a part or a word you know, so the word itself gives you nothing, and you did not know faltered before tonight. Which tool works from the words next to an unknown word?" },
    },
    {
      id: "guided-choose-projected-meaning",
      purpose: "guided",
      gate: "interaction",
      prompt: "What does projected mean here?",
      narration: { audio: A("guided-choose-projected-meaning"), script: "You chose the tool, so use it, and then test it. The front part of projected, pro, means forward, and ject means throw. Put the two parts together, and test what you get in the sentence. The clockmaker set his lamp on the floor, and its light projected the shadow of the pendulum across the wall. Tap the meaning that passes the test." },
      interaction: { type: "choose", options: [{ id: "threw-forward-onto-the-wall", label: "threw forward onto the wall" }, { id: "pulled-back-into-the-lamp", label: "pulled back into the lamp" }, { id: "hid-deep-inside-the-wall", label: "hid deep inside the wall" }, { id: "measured-along-the-wall", label: "measured along the wall" }], correctId: "threw-forward-onto-the-wall", coachWrong: "Test that meaning in the sentence. A lamp on the floor, a shadow on the wall. Which meaning is the light doing to the shadow?" },
    },
    {
      id: "guided-sequence-the-move",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Put the four moves in the order you make them.",
      narration: { audio: A("guided-sequence-the-move"), script: "Every word that stops you gets the same four moves in the same order, and faltered can show them. Four tiles are on your screen, one for each move, and they are mixed up. Think about what you do first when a word stops you, what you do last, and what has to happen in between. Drag the four moves into the order you make them." },
      interaction: { type: "sequence", items: [{ id: "look", label: "look inside faltered" }, { id: "choose", label: "choose read around it" }, { id: "get", label: "faltered means lost strength" }, { id: "test", label: "test it in the sentence" }], order: ["look","choose","get","test"], coachWrong: "Ask what each move needs before it can happen. You cannot choose a tool before you have looked, and you cannot test a meaning before you have one." },
    },
    {
      id: "guided-sort-by-tool",
      purpose: "guided",
      layout: "full",
      gate: "interaction",
      prompt: "Sort each word by the tool that fits it.",
      narration: { audio: A("guided-sort-by-tool"), script: "Six new words, and you choose the tool for each one by looking at the word itself. If you can see chron, or ject, or mal inside the word, drag it to Take It Apart. If nothing inside the word is a part or a word you know, drag it to Read Around It." },
      interaction: { type: "sort", buckets: ["Read Around It","Take It Apart"], items: [{ label: "chronic", bucket: "Take It Apart" }, { label: "clambered", bucket: "Read Around It" }, { label: "ejected", bucket: "Take It Apart" }, { label: "gaunt", bucket: "Read Around It" }, { label: "maltreated", bucket: "Take It Apart" }, { label: "jostled", bucket: "Read Around It" }], coachWrong: "Look at that word again, from the front and from the back. Is chron, ject, or mal inside it? If yes, the parts are the tool. If nothing you know is inside, the sentence is the tool." },
    },
    {
      id: "page-3-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Page three. Read along, and look at every word that stops you.",
      image: IMG("page-3"),
      narration: { audio: A("page-3-read"), script: "Page three, and the clock room at the top of the tower. Four words on this page will stop you, and one of them will try to trick your parts tool. Read along with me." },
      interaction: { type: "read-along", text: "The malfunction was small, and it was hiding in the dark. A hammer that struck the biggest bell had slipped off its pin and wedged itself between two wheels, so the whole movement had jammed against it. Britta tapped the smallest bell with her knuckle and then the biggest, and the pitch of the big one was so low that she felt it in her teeth more than she heard it. The dismal little room, cold and full of dust and dead moths, grew brighter as the moon came out from behind a cloud. Mr. Kowalski freed the hammer, oiled the barrel, and began to turn the crank, and the cable that hung from the barrel creaked as the great weight rose. Then he set the pendulum swinging, and the first tick sounded like a door closing far away.", audio: A("page-3-read-sentence") },
    },
    {
      id: "apply-choose-false-friend-dismal",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which tool saves dismal?",
      fx: {"text":"dis and mal, **not bad**? Test it.","effect":"cross-out"},
      narration: { audio: A("apply-choose-false-friend-dismal"), script: "Malfunction came apart cleanly. Mal means bad, and a malfunction is a bad working, a breakdown, and the page proves it. Dismal looks the same. The letters of mal sit right there, so the parts tool jumps into your hand. Dis means not, mal means bad, and the sum is not bad. Now test it. The not bad little room, cold and full of dust and dead moths? That fails. The letters of a part can sit inside a word without adding up, and a failed test is the signal to switch, not to skip. Four tools are on your screen. Tap the tool that saves dismal." },
      interaction: { type: "choose", options: [{ id: "read-around-it", label: "read around it" }, { id: "take-it-apart", label: "take it apart" }, { id: "the-sentence-picks-a-meaning", label: "the sentence picks a meaning" }, { id: "check-the-glossary", label: "check the glossary" }], correctId: "read-around-it", coachWrong: "The parts already failed the test, dismal is not a word you knew before tonight, and a glossary of clock words will not list it. The words next to dismal tell you what the room was like. Which tool works from those?" },
    },
    {
      id: "apply-choose-glossary-barrel",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "barrel. Sense one, a large round container with flat ends. Sense two, the drum inside a clock that the cable winds around. Which sense fits page three?",
      narration: { audio: A("apply-choose-glossary-barrel"), script: "The word pitch was one you knew, and the sentence picked its meaning, how high or low a sound is, because she felt the big bell in her teeth. Barrel is different. You know a barrel, a big round container. Test it. He oiled the big container, and a cable hung from the container? Maybe, and maybe is not good enough. No part helps, and the sentence does not settle it. So you check the glossary, and the entry for barrel is on your screen with two numbered senses. Read both senses, then test each one in the sentence. Mr. Kowalski oiled the barrel, and the cable that hung from the barrel creaked as the great weight rose. Tap the sense that fits." },
      interaction: { type: "choose", options: [{ id: "the-drum-the-cable-winds-on", label: "the drum the cable winds on" }, { id: "a-big-round-container", label: "a big round container" }, { id: "a-heavy-iron-weight", label: "a heavy iron weight" }, { id: "a-long-metal-bar", label: "a long metal bar" }], correctId: "the-drum-the-cable-winds-on", coachWrong: "Test that in the sentence. Would he oil it, and would a cable hang from it while a weight rose? Only one sense can do both." },
    },
    {
      id: "page-4-read",
      purpose: "apply",
      layout: "full",
      gate: "interaction",
      prompt: "Read page four: Before they climbed down, the clockmaker took a chronometer from his pocket and held it beside the dial. A chronometer is a clock so exact that sailors once used one to find their way at sea. He wrote the time in the chronicle, and under it he wrote the name of his apprentice.",
      narration: { audio: A("page-4-read"), script: "Page four is yours. Read all three sentences out loud, and hold on to the word that two tools can open." },
      interaction: { type: "speak", text: "Before they climbed down the clockmaker took a chronometer from his pocket and held it beside the dial A chronometer is a clock so exact that sailors once used one to find their way at sea He wrote the time in the chronicle and under it he wrote the name of his apprentice" },
    },
    {
      id: "apply-choose-confirming-words",
      purpose: "apply",
      gate: "interaction",
      prompt: "Which words on page three confirm sense two of barrel?",
      narration: { audio: A("apply-choose-confirming-words"), script: "Choosing a sense is half the job, and confirming it is the other half. Sense two of barrel is the drum inside a clock that the cable winds around. Four pieces of page three are on your screen, and every one of them is really on the page. Only one of them confirms sense two, because it shows the barrel doing what sense two says. Tap the words that confirm it." },
      interaction: { type: "choose", options: [{ id: "the-cable-that-hung-from-it", label: "the cable that hung from it" }, { id: "freed-the-hammer", label: "freed the hammer" }, { id: "cold-and-full-of-dust", label: "cold and full of dust" }, { id: "the-first-tick-sounded", label: "the first tick sounded" }], correctId: "the-cable-that-hung-from-it", coachWrong: "That piece is true, but it is about a hammer, a room, or a tick, not the barrel. Find the piece that touches the barrel itself." },
    },
    {
      id: "challenge-speak-chronometer",
      purpose: "challenge",
      gate: "interaction",
      prompt: "Say what chronometer means, and name the tool you used.",
      narration: { audio: A("challenge-speak-chronometer"), script: "Last one, and you run the whole move out loud. Chronometer stopped you on page four, and that page gave you two roads to it. Tap the mic, then say what chronometer means in that sentence, and name the tool that got you there. If two tools got you there, say so." },
      interaction: { type: "speak", text: "clock watch timekeeper time keeps tells measures measure exact accurate precise careful sailors sea pocket dial chron meter parts part apart take took read around sentence clue clues context agree both two" },
    },
    {
      id: "celebrate-the-choosing",
      purpose: "celebrate",
      gate: "none",
      prompt: "Look at the word, choose the tool, test the meaning.",
      fx: {"text":"Look, **choose**, get a meaning, **test** it","effect":"fireworks"},
      narration: { audio: A("celebrate-the-choosing"), script: "You did not learn a new tool tonight. You chose, and you tested, and when a test failed, you switched. Defunct sent you reading further. Chronicle came apart into time. Movement and pitch let the sentence pick. Gallery and barrel sent you to the glossary, and the words on the page confirmed the sense. Dismal tried to trick your parts tool, and the test caught it. Every strong reader owns the same four tools. The choosing is what makes a fourth grade reader, and now the choosing is yours." },
    },
  ],
};
