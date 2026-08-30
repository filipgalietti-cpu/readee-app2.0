// Quiz manifest — quizzes register here (mirrors the lesson manifest).
import type { QuizDef } from "@/lib/lesson-engine/quiz";
import { rhymeTimeQuiz } from "./rhyme-time-quiz";

import { keyDetailsQuiz } from "./key-details-quiz";
import { syllableBeatsQuiz } from "./syllable-beats-quiz";
import { bookMakersQuiz } from "./book-makers-quiz";
import { letterPairsQuiz } from "./letter-pairs-quiz";
import { storyKindsQuiz } from "./story-kinds-quiz";
import { bigKidWordsQuiz } from "./big-kid-words-quiz";
import { bookBasicsQuiz } from "./book-basics-quiz";
import { unit1Exam } from "./unit-1-exam";
import { unit2Exam } from "./unit-2-exam";
import { unit3Exam } from "./unit-3-exam";
import { unit4Exam } from "./unit-4-exam";
import { kFinal } from "./k-final";
import { g1Unit1Exam } from "./g1-unit-1-exam";
import { g1Unit2Exam } from "./g1-unit-2-exam";
import { g1Unit3Exam } from "./g1-unit-3-exam";
import { g1Unit4Exam } from "./g1-unit-4-exam";
import { g1Unit5Exam } from "./g1-unit-5-exam";
import { g1Final } from "./g1-final";
import { g2Unit1Exam } from "./g2-unit-1-exam";
import { g2Unit2Exam } from "./g2-unit-2-exam";
import { soundSlidersQuiz } from "./sound-sliders-quiz";
import { soundDetectivesQuiz } from "./sound-detectives-quiz";
import { wordMachinesQuiz } from "./word-machines-quiz";
import { letterSoundsQuiz } from "./letter-sounds-quiz";
import { snapWordsQuiz } from "./snap-words-quiz";
import { tellItBackQuiz } from "./tell-it-back-quiz";
import { wordWonderQuiz } from "./word-wonder-quiz";
import { namingDoingWordsQuiz } from "./naming-doing-words-quiz";
import { lookCloseQuiz } from "./look-close-quiz";
import { myFirstReadQuiz } from "./my-first-read-quiz";
import { pictureCluesQuiz } from "./picture-clues-quiz";
import { sameAndDifferentQuiz } from "./same-and-different-quiz";
import { readingPartyQuiz } from "./reading-party-quiz";
import { doubleDutyWordsQuiz } from "./double-duty-words-quiz";
import { wordFamiliesFriendsQuiz } from "./word-families-friends-quiz";
import { capitalStartQuiz } from "./capital-start-quiz";
import { factFinderBasicsQuiz } from "./fact-finder-basics-quiz";
import { whatsItAboutQuiz } from "./whats-it-about-quiz";
import { howTheyConnectQuiz } from "./how-they-connect-quiz";
import { scienceWordWonderQuiz } from "./science-word-wonder-quiz";
import { partsOfABookQuiz } from "./parts-of-a-book-quiz";
import { factBookMakersQuiz } from "./fact-book-makers-quiz";
import { diagramDetectivesQuiz } from "./diagram-detectives-quiz";
import { authorReasonsQuiz } from "./author-reasons-quiz";
import { twoBooksOneTopicQuiz } from "./two-books-one-topic-quiz";
import { factReadingPartyQuiz } from "./fact-reading-party-quiz";
import { sentenceShapesQuiz } from "./sentence-shapes-quiz";
import { blendBuildersQuiz } from "./blend-builders-quiz";
import { soundSpottersQuiz } from "./sound-spotters-quiz";
import { askItFindItQuiz } from "./ask-it-find-it-quiz";
import { storyMessageQuiz } from "./story-message-quiz";
import { factQuestionsQuiz } from "./fact-questions-quiz";
import { topicSpotterQuiz } from "./topic-spotter-quiz";
import { wordToolboxQuiz } from "./word-toolbox-quiz";
import { sentenceCluesQuiz } from "./sentence-clues-quiz";
import { prefixPowerQuiz } from "./prefix-power-quiz";
import { soundStretchersQuiz } from "./sound-stretchers-quiz";
import { smoothReaderQuiz } from "./smooth-reader-quiz";
import { checkAndFixQuiz } from "./check-and-fix-quiz";
import { storyPartsQuiz } from "./story-parts-quiz";
import { wordPicturesQuiz } from "./word-pictures-quiz";
import { factLinksQuiz } from "./fact-links-quiz";
import { factWordFinderQuiz } from "./fact-word-finder-quiz";
import { wordChangersQuiz } from "./word-changers-quiz";
import { justRightWordsQuiz } from "./just-right-words-quiz";
import { categoryCaptainQuiz } from "./category-captain-quiz";
import { digraphDetectivesQuiz } from "./digraph-detectives-quiz";
import { soundItOutQuiz } from "./sound-it-out-quiz";
import { magicTeamsQuiz } from "./magic-teams-quiz";
import { twoKindsOfBooksQuiz } from "./two-kinds-of-books-quiz";
import { whosTellingItQuiz } from "./whos-telling-it-quiz";
import { textFeatureFindersQuiz } from "./text-feature-finders-quiz";
import { pictureOrWordsQuiz } from "./picture-or-words-quiz";
import { whatIsItQuiz } from "./what-is-it-quiz";
import { wordsInRealLifeQuiz } from "./words-in-real-life-quiz";
import { strongWordsQuiz } from "./strong-words-quiz";
import { syllableSplittersQuiz } from "./syllable-splitters-quiz";
import { wordBreakersQuiz } from "./word-breakers-quiz";
import { endingReadersQuiz } from "./ending-readers-quiz";
import { pictureDetectivesQuiz } from "./picture-detectives-quiz";
import { sameDifferentStoriesQuiz } from "./same-different-stories-quiz";
import { ideaIllustratorsQuiz } from "./idea-illustrators-quiz";
import { proveItQuiz } from "./prove-it-quiz";
import { wordsWeUseQuiz } from "./words-we-use-quiz";
import { grammarBuildersQuiz } from "./grammar-builders-quiz";
import { writeItRightQuiz } from "./write-it-right-quiz";
import { trickyWordsQuiz } from "./tricky-words-quiz";
import { readingWithPurposeQuiz } from "./reading-with-purpose-quiz";
import { storyPoemPartyQuiz } from "./story-poem-party-quiz";
import { twoTextsCompareQuiz } from "./two-texts-compare-quiz";
import { factPartyG1Quiz } from "./fact-party-g1-quiz";
import { fableTellersQuiz } from "./fable-tellers-quiz";
import { decodingChampionsQuiz } from "./decoding-champions-quiz";
import { longOrShortQuiz } from "./long-or-short-quiz";
import { teamPlayersQuiz } from "./team-players-quiz";
import { askAndAnswerG2Quiz } from "./ask-and-answer-g2-quiz";
import { characterChallengesQuiz } from "./character-challenges-quiz";
import { factFindersAskQuiz } from "./fact-finders-ask-quiz";
import { paragraphPowerQuiz } from "./paragraph-power-quiz";
import { chainsAndStepsQuiz } from "./chains-and-steps-quiz";
import { wordSolversQuiz } from "./word-solvers-quiz";
import { clueHuntersQuiz } from "./clue-hunters-quiz";
import { longVowelBuildersQuiz } from "./long-vowel-builders-quiz";
import { prefixSuffixDecodersQuiz } from "./prefix-suffix-decoders-quiz";
import { trickySoundSwitchersQuiz } from "./tricky-sound-switchers-quiz";
import { wordMusicQuiz } from "./word-music-quiz";
import { storyShapeQuiz } from "./story-shape-quiz";
import { twoWaysToSeeQuiz } from "./two-ways-to-see-quiz";
import { scienceWordCluesQuiz } from "./science-word-clues-quiz";
import { findItFastQuiz } from "./find-it-fast-quiz";
import { whyAuthorsWriteQuiz } from "./why-authors-write-quiz";
import { wordMathQuiz } from "./word-math-quiz";
import { wordPlusWordQuiz } from "./word-plus-word-quiz";
import { lookItUpQuiz } from "./look-it-up-quiz";
import { sameAndOppositeQuiz } from "./same-and-opposite-quiz";
import { wordsInYourWorldQuiz } from "./words-in-your-world-quiz";
import { rootCluesQuiz } from "./root-clues-quiz";
import { heartWordsQuiz } from "./heart-words-quiz";
import { readLikeYouTalkQuiz } from "./read-like-you-talk-quiz";
import { readWithYourBrainQuiz } from "./read-with-your-brain-quiz";
import { picturesTellMoreQuiz } from "./pictures-tell-more-quiz";
export const QUIZZES: Record<string, QuizDef> = {
  "rhyme-time-quiz": rhymeTimeQuiz,
  "key-details-quiz": keyDetailsQuiz,
  "syllable-beats-quiz": syllableBeatsQuiz,
  "book-makers-quiz": bookMakersQuiz,
  "letter-pairs-quiz": letterPairsQuiz,
  "story-kinds-quiz": storyKindsQuiz,
  "big-kid-words-quiz": bigKidWordsQuiz,
  "book-basics-quiz": bookBasicsQuiz,
  "unit-1-exam": unit1Exam,
  "unit-2-exam": unit2Exam,
  "unit-3-exam": unit3Exam,
  "unit-4-exam": unit4Exam,
  "k-final": kFinal,
  "g1-unit-1-exam": g1Unit1Exam,
  "g1-unit-2-exam": g1Unit2Exam,
  "g1-unit-3-exam": g1Unit3Exam,
  "g1-unit-4-exam": g1Unit4Exam,
  "g1-unit-5-exam": g1Unit5Exam,
  "g1-final": g1Final,
  "g2-unit-1-exam": g2Unit1Exam,
  "g2-unit-2-exam": g2Unit2Exam,
  "sound-sliders-quiz": soundSlidersQuiz,
  "sound-detectives-quiz": soundDetectivesQuiz,
  "word-machines-quiz": wordMachinesQuiz,
  "letter-sounds-quiz": letterSoundsQuiz,
  "snap-words-quiz": snapWordsQuiz,
  "tell-it-back-quiz": tellItBackQuiz,
  "word-wonder-quiz": wordWonderQuiz,
  "naming-doing-words-quiz": namingDoingWordsQuiz,
  "look-close-quiz": lookCloseQuiz,
  "my-first-read-quiz": myFirstReadQuiz,
  "picture-clues-quiz": pictureCluesQuiz,
  "same-and-different-quiz": sameAndDifferentQuiz,
  "reading-party-quiz": readingPartyQuiz,
  "double-duty-words-quiz": doubleDutyWordsQuiz,
  "word-families-friends-quiz": wordFamiliesFriendsQuiz,
  "capital-start-quiz": capitalStartQuiz,
  "fact-finder-basics-quiz": factFinderBasicsQuiz,
  "whats-it-about-quiz": whatsItAboutQuiz,
  "how-they-connect-quiz": howTheyConnectQuiz,
  "science-word-wonder-quiz": scienceWordWonderQuiz,
  "parts-of-a-book-quiz": partsOfABookQuiz,
  "fact-book-makers-quiz": factBookMakersQuiz,
  "diagram-detectives-quiz": diagramDetectivesQuiz,
  "author-reasons-quiz": authorReasonsQuiz,
  "two-books-one-topic-quiz": twoBooksOneTopicQuiz,
  "fact-reading-party-quiz": factReadingPartyQuiz,
  "sentence-shapes-quiz": sentenceShapesQuiz,
  "blend-builders-quiz": blendBuildersQuiz,
  "sound-spotters-quiz": soundSpottersQuiz,
  "ask-it-find-it-quiz": askItFindItQuiz,
  "story-message-quiz": storyMessageQuiz,
  "fact-questions-quiz": factQuestionsQuiz,
  "topic-spotter-quiz": topicSpotterQuiz,
  "word-toolbox-quiz": wordToolboxQuiz,
  "sentence-clues-quiz": sentenceCluesQuiz,
  "prefix-power-quiz": prefixPowerQuiz,
  "sound-stretchers-quiz": soundStretchersQuiz,
  "smooth-reader-quiz": smoothReaderQuiz,
  "check-and-fix-quiz": checkAndFixQuiz,
  "story-parts-quiz": storyPartsQuiz,
  "word-pictures-quiz": wordPicturesQuiz,
  "fact-links-quiz": factLinksQuiz,
  "fact-word-finder-quiz": factWordFinderQuiz,
  "word-changers-quiz": wordChangersQuiz,
  "just-right-words-quiz": justRightWordsQuiz,
  "category-captain-quiz": categoryCaptainQuiz,
  "digraph-detectives-quiz": digraphDetectivesQuiz,
  "sound-it-out-quiz": soundItOutQuiz,
  "magic-teams-quiz": magicTeamsQuiz,
  "two-kinds-of-books-quiz": twoKindsOfBooksQuiz,
  "whos-telling-it-quiz": whosTellingItQuiz,
  "text-feature-finders-quiz": textFeatureFindersQuiz,
  "picture-or-words-quiz": pictureOrWordsQuiz,
  "what-is-it-quiz": whatIsItQuiz,
  "words-in-real-life-quiz": wordsInRealLifeQuiz,
  "strong-words-quiz": strongWordsQuiz,
  "syllable-splitters-quiz": syllableSplittersQuiz,
  "word-breakers-quiz": wordBreakersQuiz,
  "ending-readers-quiz": endingReadersQuiz,
  "picture-detectives-quiz": pictureDetectivesQuiz,
  "same-different-stories-quiz": sameDifferentStoriesQuiz,
  "idea-illustrators-quiz": ideaIllustratorsQuiz,
  "prove-it-quiz": proveItQuiz,
  "words-we-use-quiz": wordsWeUseQuiz,
  "grammar-builders-quiz": grammarBuildersQuiz,
  "write-it-right-quiz": writeItRightQuiz,
  "tricky-words-quiz": trickyWordsQuiz,
  "reading-with-purpose-quiz": readingWithPurposeQuiz,
  "story-poem-party-quiz": storyPoemPartyQuiz,
  "two-texts-compare-quiz": twoTextsCompareQuiz,
  "fact-party-g1-quiz": factPartyG1Quiz,
  "fable-tellers-quiz": fableTellersQuiz,
  "decoding-champions-quiz": decodingChampionsQuiz,
  "long-or-short-quiz": longOrShortQuiz,
  "team-players-quiz": teamPlayersQuiz,
  "ask-and-answer-g2-quiz": askAndAnswerG2Quiz,
  "character-challenges-quiz": characterChallengesQuiz,
  "fact-finders-ask-quiz": factFindersAskQuiz,
  "paragraph-power-quiz": paragraphPowerQuiz,
  "chains-and-steps-quiz": chainsAndStepsQuiz,
  "word-solvers-quiz": wordSolversQuiz,
  "clue-hunters-quiz": clueHuntersQuiz,
  "long-vowel-builders-quiz": longVowelBuildersQuiz,
  "prefix-suffix-decoders-quiz": prefixSuffixDecodersQuiz,
  "tricky-sound-switchers-quiz": trickySoundSwitchersQuiz,
  "word-music-quiz": wordMusicQuiz,
  "story-shape-quiz": storyShapeQuiz,
  "two-ways-to-see-quiz": twoWaysToSeeQuiz,
  "science-word-clues-quiz": scienceWordCluesQuiz,
  "find-it-fast-quiz": findItFastQuiz,
  "why-authors-write-quiz": whyAuthorsWriteQuiz,
  "word-math-quiz": wordMathQuiz,
  "word-plus-word-quiz": wordPlusWordQuiz,
  "look-it-up-quiz": lookItUpQuiz,
  "same-and-opposite-quiz": sameAndOppositeQuiz,
  "words-in-your-world-quiz": wordsInYourWorldQuiz,
  "root-clues-quiz": rootCluesQuiz,
  "heart-words-quiz": heartWordsQuiz,
  "read-like-you-talk-quiz": readLikeYouTalkQuiz,
  "read-with-your-brain-quiz": readWithYourBrainQuiz,
  "pictures-tell-more-quiz": picturesTellMoreQuiz,
};
