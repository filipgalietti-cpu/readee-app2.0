import type { QuizDef } from "@/lib/lesson-engine/quiz";

// The Whole Chapter QUIZ (RL.3.10) · FACTORY-AUTHORED from the finished
// lesson (scripts/quiz-author.ts), human-reviewed. ALL-FRESH second chapter:
// "The Green Notebook", chapter two of Winona at the Board (Winona has lost
// every Tuesday chess game to her big brother Conrad; Mr. Dunbar told her in
// chapter one to write every lost game in a green notebook, move by move; she
// reads the losses, sees her queen always came out early, keeps it home, plays
// slow, does not take the bait, Conrad chews his thumbnail and tips his king,
// she calls it a draw because neither can win, and the narrator thinks a draw
// with Conrad is no half win). 16 sentences, spoken page-by-page INSIDE the
// questions so every Q is self-contained; two pages are the child's to read
// (page three's dialogue in e-4, page six in h-3) and page six is never
// narrated (c-5 puts it on screen for a silent read). Bands: easier(G2-bridge
// where / who / what at 3 options with picture support, plus a one-sentence
// read-aloud) / core(one question per RL tool on the new chapter: proving
// line RL.3.1, trait from actions RL.3.3, phrase that means more RL.3.4, the
// chapter as a part that builds RL.3.5, the narrator's view RL.3.6, and the
// message RL.3.2 as a production speak) / harder(G4 transfer, RL.4.10-adjacent:
// holding two pages together for one inference, MODELED in h-1 on pages two
// and three, then applied to pages four and five, applied again to pages one
// and six, a two-sentence read-aloud, and a closing production speak).
// BLOCKED SLOT: e-4 ships WITHOUT a narration clip (three Autonoe takes on
// three different scripts all came back as whole hallucinated story sentences,
// 8 s for 43 words); the printed prompt carries the instruction, the hint and
// explain clips are whisper-verbatim. Nothing from the lesson chapter
// (Clementine, Slate, the loft) is reused.
// Names + setting grep-swept vs lessons-v2 + quizzes-v2: Winona, Conrad,
// Dunbar, chess, checkmate, green notebook all 0 hits. Quiz support images
// live in the lesson's image dir (quiz- keys).

const Q = "/audio/quizzes-v2/the-whole-chapter-quiz";
const IMG = (w: string) => `/images/lessons-v2/the-whole-chapter/${w.toLowerCase()}.png`;

export const theWholeChapterQuiz: QuizDef = {
  id: "the-whole-chapter-quiz",
  lessonId: "the-whole-chapter",
  title: "The Whole Chapter Quiz",
  standard: "RL.3.10",
  askCount: 7,
  adaptive: true,
  questions: [
    {
      id: "e-1-where-club-meets",
      band: "easier",
      difficulty: 1,
      prompt: "Where does the chess club meet?",
      image: IMG("quiz-chess-table"),
      narration: { audio: `${Q}/e-1-where-club-meets.mp3`, script: "Here is a new chapter from a book called Winona at the Board. Chapter two is called The Green Notebook. Listen to page one. On the fifth Tuesday of chess club, Winona carried the green notebook into the library, and every page in it was a game she had lost to her big brother Conrad. She had written down each move, the way Mr. Dunbar asked, even the moves she wanted to forget. Every game you lose goes in the notebook, Mr. Dunbar had told her on the first Tuesday, and every move goes with it. Where does the chess club meet? Tap the place." },
      hint: { audio: `${Q}/e-1-where-club-meets-hint.mp3`, script: "The picture shows the place, and the first sentence of page one names it." },
      explain: { audio: `${Q}/e-1-where-club-meets-explain.mp3`, script: "The chess club meets in the library. Page one says that Winona carried the green notebook into the library." },
      interaction: { type: "choose", options: [{ id: "in-a-library", label: "in a library" }, { id: "in-a-gym", label: "in a gym" }, { id: "on-a-bus", label: "on a bus" }], correctId: "in-a-library", coachWrong: "Look at the shelves in the picture, and listen for where Winona carried the notebook." },
    },
    {
      id: "e-2-who-stood-behind",
      band: "easier",
      difficulty: 2,
      prompt: "Who came and stood behind Winona's chair?",
      image: IMG("quiz-mr-dunbar-watching"),
      narration: { audio: `${Q}/e-2-who-stood-behind.mp3`, script: "Here is the first part of page four of The Green Notebook. The game ran past the time club usually ended, and the other tables emptied one by one, until Mr. Dunbar came and stood behind Winona's chair with his arms folded, saying nothing at all, which was how he watched a game he liked. Who came and stood behind Winona's chair? Tap the name." },
      hint: { audio: `${Q}/e-2-who-stood-behind-hint.mp3`, script: "The person is a grown up with his arms folded, and the page says his name right before he stands up." },
      explain: { audio: `${Q}/e-2-who-stood-behind-explain.mp3`, script: "Mr. Dunbar came and stood behind her chair. Page four says he folded his arms and said nothing, because that was how he watched a game he liked." },
      interaction: { type: "choose", options: [{ id: "mr-dunbar", label: "mr. dunbar" }, { id: "conrad", label: "conrad" }, { id: "winona", label: "winona" }], correctId: "mr-dunbar", coachWrong: "Winona is sitting in the chair, and Conrad is across the table. Who is the one standing?" },
    },
    {
      id: "e-3-what-conrad-did",
      band: "easier",
      difficulty: 3,
      prompt: "What did Conrad do to give up?",
      image: IMG("quiz-king-on-its-side"),
      narration: { audio: `${Q}/e-3-what-conrad-did.mp3`, script: "Here is page five of The Green Notebook. At last Conrad tipped his king over on its side, which is how a player gives up, but Winona shook her head. It is a draw, she said, because neither of us can win from here. Conrad stared at the board for a long time, and then he laughed. What did Conrad do to give up? Tap it." },
      hint: { audio: `${Q}/e-3-what-conrad-did-hint.mp3`, script: "The picture shows it, and the page says it is how a player gives up." },
      explain: { audio: `${Q}/e-3-what-conrad-did-explain.mp3`, script: "Conrad tipped his king over on its side. Page five says that is how a player gives up." },
      interaction: { type: "choose", options: [{ id: "tipped-his-king-over", label: "tipped his king over" }, { id: "shook-his-head", label: "shook his head" }, { id: "stared-at-the-board", label: "stared at the board" }], correctId: "tipped-his-king-over", coachWrong: "Those things happen on page five too, but they are not how a player gives up. Look at the chess piece in the picture." },
    },
    {
      id: "e-4-speak-read-slow-is-fine",
      band: "easier",
      difficulty: 4,
      prompt: "Read it: \"Slow is fine,\" said Winona, and she moved a pawn instead.",
      hint: { audio: `${Q}/e-4-speak-read-slow-is-fine-hint.mp3`, script: "The mic sits under the sentence, and the sentence begins with the two words inside the quote marks." },
      explain: { audio: `${Q}/e-4-speak-read-slow-is-fine-explain.mp3`, script: "The sentence tells you that Winona answered that slow was fine, and that she moved a pawn instead of her queen." },
      interaction: { type: "speak", text: "Slow is fine said Winona and she moved a pawn instead" },
    },
    {
      id: "c-1-proof-line-queen",
      band: "core",
      difficulty: 1,
      prompt: "Why did Winona leave her queen where it stood? Tap the line that proves it.",
      narration: { audio: `${Q}/c-1-proof-line-queen.mp3`, script: "Here is page two of The Green Notebook. While Conrad set up the pieces, Winona opened the notebook and read the four games she had lost. In every one of them her queen had come out early, and in every one of them Conrad had trapped it before the tenth move. She closed the notebook, and this time she left her queen where it stood. Why did Winona leave her queen where it stood? Say the answer in your head. Four lines from page two are on your screen, and all four are really there. Tap the line that proves your answer." },
      hint: { audio: `${Q}/c-1-proof-line-queen-hint.mp3`, script: "The answer is a reason, and the reason is what the notebook showed her about her queen in every lost game." },
      explain: { audio: `${Q}/c-1-proof-line-queen-explain.mp3`, script: "The proving line is, her queen had come out early. In every lost game her queen came out early and got trapped, so this time she left it where it stood." },
      interaction: { type: "choose", options: [{ id: "her-queen-had-come-out-early", label: "her queen had come out early" }, { id: "set-up-the-pieces", label: "set up the pieces" }, { id: "read-the-four-games", label: "read the four games" }, { id: "she-closed-the-notebook", label: "she closed the notebook" }], correctId: "her-queen-had-come-out-early", coachWrong: "That line is really on page two, but it answers a different question. Find the line that tells what went wrong in every lost game." },
    },
    {
      id: "c-2-trait-honest",
      band: "core",
      difficulty: 2,
      prompt: "What do Winona's actions show she is like?",
      narration: { audio: `${Q}/c-2-trait-honest.mp3`, script: "On page one of The Green Notebook, Winona wrote down every game she lost, even the moves she wanted to forget. Here is page five. At last Conrad tipped his king over on its side, which is how a player gives up, but Winona shook her head. It is a draw, she said, because neither of us can win from here. Conrad stared at the board for a long time, and then he laughed. The chapter never says what Winona is like, so find it in what she does. She writes down the games she wanted to forget, and when Conrad gives up, she tells him the truth about the board instead of taking the win. Four words are on your screen. Tap the one her actions prove." },
      hint: { audio: `${Q}/c-2-trait-honest-hint.mp3`, script: "Winona could have taken the win when Conrad tipped his king. What she said instead is the clue." },
      explain: { audio: `${Q}/c-2-trait-honest-explain.mp3`, script: "The word is honest. Conrad gave up, and Winona could have taken the win, but she told the truth: the game was a draw, because neither of them could win from there." },
      interaction: { type: "choose", options: [{ id: "honest", label: "honest" }, { id: "greedy", label: "greedy" }, { id: "lazy", label: "lazy" }, { id: "rude", label: "rude" }], correctId: "honest", coachWrong: "Check that word against page five. Did Winona do that kind of thing? Find the word that shaking her head and saying it is a draw proves." },
    },
    {
      id: "c-3-phrase-take-the-bait",
      band: "core",
      difficulty: 3,
      prompt: "What does she did not take the bait mean here?",
      narration: { audio: `${Q}/c-3-phrase-take-the-bait.mp3`, script: "Here is the start of page three of The Green Notebook. Conrad moved fast, the way he always did, and he grinned when she did not take the bait. Then he told her she was playing slow, and Winona told him that slow was fine, and she moved a pawn. Bait is what a fisher puts on a hook, and there is no hook on a chessboard, so the phrase means more than it says. Read around it. Conrad moved fast and grinned, and Winona played slow and moved a pawn instead of her queen. Four plain versions are on your screen. Tap the one the chapter supports." },
      hint: { audio: `${Q}/c-3-phrase-take-the-bait-hint.mp3`, script: "Conrad moved fast because he wanted Winona to do something fast and foolish with her queen. The plain version says whether she did." },
      explain: { audio: `${Q}/c-3-phrase-take-the-bait-explain.mp3`, script: "The plain version is, she did not fall for his trick. Conrad moved fast to tempt her queen out, and she played slow and moved a pawn instead." },
      interaction: { type: "choose", options: [{ id: "did-not-fall-for-his-trick", label: "did not fall for his trick" }, { id: "did-not-eat-his-snack", label: "did not eat his snack" }, { id: "did-not-go-fishing-with-him", label: "did not go fishing with him" }, { id: "did-not-take-his-king", label: "did not take his king" }], correctId: "did-not-fall-for-his-trick", coachWrong: "Read around the phrase again. There is no food, no fishing, and no king taken on page three. What was Conrad hoping she would do?" },
    },
    {
      id: "c-4-chapter-builds",
      band: "core",
      difficulty: 4,
      prompt: "How does this chapter build on chapter one?",
      narration: { audio: `${Q}/c-4-chapter-builds.mp3`, script: "A chapter builds on the chapter before it. In chapter one of Winona at the Board, Winona lost to Conrad every Tuesday, and Mr. Dunbar told her to write every lost game in a green notebook, move by move. Here is page two of chapter two. While Conrad set up the pieces, Winona opened the notebook and read the four games she had lost. In every one of them her queen had come out early, and in every one of them Conrad had trapped it before the tenth move. She closed the notebook, and this time she left her queen where it stood. Four things from page two are on your screen, and all four really happen. Tap the one that uses what chapter one set up." },
      hint: { audio: `${Q}/c-4-chapter-builds-hint.mp3`, script: "Chapter one gave Winona one thing to carry into chapter two. The choice that uses that thing is the answer." },
      explain: { audio: `${Q}/c-4-chapter-builds-explain.mp3`, script: "The answer is, she reads her lost games. Chapter one set up the notebook of lost games, and chapter two builds on it the moment Winona opens the notebook and reads them." },
      interaction: { type: "choose", options: [{ id: "she-reads-her-lost-games", label: "she reads her lost games" }, { id: "conrad-sets-up-the-pieces", label: "conrad sets up the pieces" }, { id: "there-were-four-games", label: "there were four games" }, { id: "the-game-is-about-to-start", label: "the game is about to start" }], correctId: "she-reads-her-lost-games", coachWrong: "That really happens on page two, but it does not use what chapter one set up. Chapter one gave Winona a notebook. What does she do with it?" },
    },
    {
      id: "c-5-narrator-view-draw",
      band: "core",
      difficulty: 5,
      prompt: "Page six: Conrad asked where she had learned to play like that, and Winona only held up the green notebook. Some people would call a draw only half a win, but those people have never sat across a table from Conrad.",
      narration: { audio: `${Q}/c-5-narrator-view-draw.mp3`, script: "The last page of The Green Notebook is on your screen, and it is yours to read to yourself. On page five, the game ended in a draw, with neither player able to win. The voice telling this chapter is not a character in it, but it still has an opinion about that draw, and the opinion sits in the last sentence. Read page six, then look at the four views on your screen. Tap the narrator's view. Your own view can be different." },
      hint: { audio: `${Q}/c-5-narrator-view-draw-hint.mp3`, script: "The narrator says what some people would call a draw, and then says something about those people." },
      explain: { audio: `${Q}/c-5-narrator-view-draw-explain.mp3`, script: "The narrator thinks a draw with Conrad is a win. The last sentence says that the people who call it half a win have never sat across a table from Conrad." },
      interaction: { type: "choose", options: [{ id: "a-draw-with-conrad-is-a-win", label: "a draw with conrad is a win" }, { id: "a-draw-is-only-half-a-win", label: "a draw is only half a win" }, { id: "conrad-should-have-won", label: "conrad should have won" }, { id: "winona-should-have-won", label: "winona should have won" }], correctId: "a-draw-with-conrad-is-a-win", coachWrong: "Read the last sentence again. The narrator names what some people would say, and then disagrees with them. Which view is the narrator's own?" },
    },
    {
      id: "c-6-speak-message",
      band: "core",
      difficulty: 6,
      prompt: "Say the message this chapter shows, then one detail that shows it.",
      narration: { audio: `${Q}/c-6-speak-message.mp3`, script: "Here is the whole chapter in short. Winona had lost every game to Conrad, and she wrote each lost game in a notebook. Before the next game she read them, saw that her queen always came out too early, and kept it home. She played slow, Conrad could not trap her, and the game ended in a draw. The chapter never prints its message, so follow the details to it. Tap the mic. Say the message this chapter shows, in your own words, then say one detail from the chapter that shows it." },
      hint: { audio: `${Q}/c-6-speak-message-hint.mp3`, script: "The message is about what Winona did with her lost games, and what happened in the next game because of it." },
      explain: { audio: `${Q}/c-6-speak-message-explain.mp3`, script: "One way to say it goes like this. A lost game can teach you, if you look at it. Winona read her losses, saw her queen coming out early, kept it home, and Conrad could not trap her." },
      interaction: { type: "speak", text: "lose losing lost losses mistakes mistake learn learned learning teach taught notebook wrote write writing read reading study studied looked look queen early slow patient draw practice game games trapped fix fixed better improve keep trying" },
    },
    {
      id: "h-1-two-pages-conrad-believed",
      band: "harder",
      difficulty: 1,
      prompt: "Hold pages four and five together. What did Conrad believe by the end?",
      narration: { audio: `${Q}/h-1-two-pages-conrad-believed.mp3`, script: "Here is a fourth grade move. Sometimes one page cannot answer a question alone, so a reader holds two pages together. Watch me do it. Page two says that in every lost game her queen came out early and got trapped. Page three says that Winona played slow and moved a pawn instead. Neither page says why she played slow, but together they do: she played slow because the notebook showed her what went wrong. Now you try it. Page four says that somewhere around the twentieth move, Conrad stopped grinning and began to chew his thumbnail. Page five says that at last Conrad tipped his king over on its side, which is how a player gives up. Hold those two pages together. What did Conrad believe by the end of the game? Tap it." },
      hint: { audio: `${Q}/h-1-two-pages-conrad-believed-hint.mp3`, script: "Chewing a thumbnail shows worry, and tipping the king means giving up. Those two clues point the same way." },
      explain: { audio: `${Q}/h-1-two-pages-conrad-believed-explain.mp3`, script: "The answer is, he believed he was losing. Page four shows him worried, and page five shows him giving up, so together they tell you that Conrad thought the game was lost." },
      interaction: { type: "choose", options: [{ id: "he-believed-he-was-losing", label: "he believed he was losing" }, { id: "he-believed-he-had-won", label: "he believed he had won" }, { id: "he-believed-club-was-over", label: "he believed club was over" }, { id: "he-believed-she-cheated", label: "he believed she cheated" }], correctId: "he-believed-he-was-losing", coachWrong: "Put the two pages together. A player who chews his thumbnail and then tips his king over is not feeling like a winner. What does he think is happening?" },
    },
    {
      id: "h-2-two-pages-notebook-means",
      band: "harder",
      difficulty: 2,
      prompt: "Hold pages one and six together. What was Winona telling Conrad?",
      narration: { audio: `${Q}/h-2-two-pages-notebook-means.mp3`, script: "Hold two pages together again. Page one says that Mr. Dunbar told Winona to put every game she lost in the green notebook, move by move. Page six says that when Conrad asked where she had learned to play like that, Winona only held up the green notebook. Neither page says what her answer meant, but together they do. What was Winona telling Conrad when she held up the notebook? Tap it." },
      hint: { audio: `${Q}/h-2-two-pages-notebook-means-hint.mp3`, script: "Page one tells you what is written inside that notebook. That is the whole answer to his question." },
      explain: { audio: `${Q}/h-2-two-pages-notebook-means-explain.mp3`, script: "The answer is, her lost games taught her. The notebook holds every game she lost, so holding it up says that those losses are where she learned to play like that." },
      interaction: { type: "choose", options: [{ id: "her-lost-games-taught-her", label: "her lost games taught her" }, { id: "she-wants-him-to-read-it", label: "she wants him to read it" }, { id: "she-wrote-his-name-in-it", label: "she wrote his name in it" }, { id: "she-never-lost-a-game-before", label: "she never lost a game before" }], correctId: "her-lost-games-taught-her", coachWrong: "Go back to page one. What did Mr. Dunbar tell her to write in that notebook? Then ask what showing it to Conrad would say." },
    },
    {
      id: "h-3-speak-read-page-six",
      band: "harder",
      difficulty: 3,
      prompt: "Read page six: Conrad asked where she had learned to play like that, and Winona only held up the green notebook. Some people would call a draw only half a win, but those people have never sat across a table from Conrad.",
      narration: { audio: `${Q}/h-3-speak-read-page-six.mp3`, script: "The last page of The Green Notebook is on your screen, two sentences long. Tap the mic and read both sentences out loud at a talking pace, with a rest at each period, and let the narrator's opinion in the last sentence come through in your voice." },
      hint: { audio: `${Q}/h-3-speak-read-page-six-hint.mp3`, script: "The mic sits under the page, and the first sentence begins with the name Conrad." },
      explain: { audio: `${Q}/h-3-speak-read-page-six-explain.mp3`, script: "The page tells you that Conrad asked where she learned to play, that Winona held up the notebook, and that the narrator thinks a draw with Conrad is no small thing." },
      interaction: { type: "speak", text: "Conrad asked where she had learned to play like that and Winona only held up the green notebook Some people would call a draw only half a win but those people have never sat across a table from Conrad" },
    },
    {
      id: "h-4-speak-why-a-draw",
      band: "harder",
      difficulty: 4,
      prompt: "Why did Winona call it a draw instead of taking the win? Say why, and what it shows about her.",
      narration: { audio: `${Q}/h-4-speak-why-a-draw.mp3`, script: "Last one, out loud, and it takes two pages. Page five says that Conrad gave up by tipping his king, and that Winona shook her head and said it was a draw, because neither of them could win from there. Page six says that some people would call a draw only half a win. Hold those pages together. Tap the mic. Say why Winona called the game a draw instead of taking the win, then say what that tells you about her." },
      hint: { audio: `${Q}/h-4-speak-why-a-draw-hint.mp3`, script: "Winona looked at the board and said what was true about it. Your answer names that truth, and then names the kind of person who says it." },
      explain: { audio: `${Q}/h-4-speak-why-a-draw-explain.mp3`, script: "One way to say it goes like this. Winona called it a draw because neither player could win from there, and that shows she is honest, since she told the truth instead of taking a win she had not earned." },
      interaction: { type: "speak", text: "draw neither nobody win won honest fair truth true right cheat cheating king tipped gave quit board could cannot stuck tie tied kind proud brave lie lying earned deserve deserved" },
    },
  ],
};
