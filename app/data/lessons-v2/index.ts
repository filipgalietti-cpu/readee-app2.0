// Lesson manifest — the single place lessons register. The asset pipelines
// (scripts/lesson-tts.ts, lesson-images.ts) and any lesson list read from here.
// Adding a lesson = add its data file + one entry. No engine changes.

import type { LessonDef } from "@/lib/lesson-engine/types";
import { silentE, silentEImages } from "./silent-e";
import { storyElements, storyElementsImages } from "./story-elements";
import { readingDetective, readingDetectiveImages } from "./reading-detective";

import { rhymeTime, rhymeTimeImages } from "./rhyme-time";

import { keyDetails, keyDetailsImages } from "./key-details";

import { syllableBeats, syllableBeatsImages } from "./syllable-beats";

import { bookMakers, bookMakersImages } from "./book-makers";

import { letterPairs, letterPairsImages } from "./letter-pairs";

import { bookBasics, bookBasicsImages } from "./book-basics";

import { storyKinds, storyKindsImages } from "./story-kinds";

import { bigKidWords, bigKidWordsImages } from "./big-kid-words";

import { soundSliders, soundSlidersImages } from "./sound-sliders";

import { soundDetectives, soundDetectivesImages } from "./sound-detectives";

import { wordMachines, wordMachinesImages } from "./word-machines";

import { letterSounds, letterSoundsImages } from "./letter-sounds";

import { snapWords, snapWordsImages } from "./snap-words";

import { tellItBack, tellItBackImages } from "./tell-it-back";

import { wordWonder, wordWonderImages } from "./word-wonder";

import { namingDoingWords, namingDoingWordsImages } from "./naming-doing-words";

import { lookClose, lookCloseImages } from "./look-close";

import { myFirstRead, myFirstReadImages } from "./my-first-read";

import { pictureClues, pictureCluesImages } from "./picture-clues";

import { sameAndDifferent, sameAndDifferentImages } from "./same-and-different";

import { readingParty, readingPartyImages } from "./reading-party";

import { doubleDutyWords, doubleDutyWordsImages } from "./double-duty-words";

import { wordFamiliesFriends, wordFamiliesFriendsImages } from "./word-families-friends";

import { capitalStart, capitalStartImages } from "./capital-start";

import { factFinderBasics, factFinderBasicsImages } from "./fact-finder-basics";

import { whatsItAbout, whatsItAboutImages } from "./whats-it-about";

import { howTheyConnect, howTheyConnectImages } from "./how-they-connect";

import { scienceWordWonder, scienceWordWonderImages } from "./science-word-wonder";

import { partsOfABook, partsOfABookImages } from "./parts-of-a-book";

import { factBookMakers, factBookMakersImages } from "./fact-book-makers";

import { diagramDetectives, diagramDetectivesImages } from "./diagram-detectives";

import { authorReasons, authorReasonsImages } from "./author-reasons";

import { twoBooksOneTopic, twoBooksOneTopicImages } from "./two-books-one-topic";

import { factReadingParty, factReadingPartyImages } from "./fact-reading-party";

import { sentenceShapes, sentenceShapesImages } from "./sentence-shapes";

import { blendBuilders, blendBuildersImages } from "./blend-builders";

import { soundSpotters, soundSpottersImages } from "./sound-spotters";

import { askItFindIt, askItFindItImages } from "./ask-it-find-it";

import { storyMessage, storyMessageImages } from "./story-message";

import { factQuestions, factQuestionsImages } from "./fact-questions";

import { topicSpotter, topicSpotterImages } from "./topic-spotter";

import { wordToolbox, wordToolboxImages } from "./word-toolbox";

import { sentenceClues, sentenceCluesImages } from "./sentence-clues";

import { prefixPower, prefixPowerImages } from "./prefix-power";

import { soundStretchers, soundStretchersImages } from "./sound-stretchers";

import { smoothReader, smoothReaderImages } from "./smooth-reader";

import { checkAndFix, checkAndFixImages } from "./check-and-fix";

import { storyParts, storyPartsImages } from "./story-parts";

import { wordPictures, wordPicturesImages } from "./word-pictures";

import { factLinks, factLinksImages } from "./fact-links";

import { factWordFinder, factWordFinderImages } from "./fact-word-finder";

import { wordChangers, wordChangersImages } from "./word-changers";

import { justRightWords, justRightWordsImages } from "./just-right-words";

import { categoryCaptain, categoryCaptainImages } from "./category-captain";

import { digraphDetectives, digraphDetectivesImages } from "./digraph-detectives";

import { soundItOut, soundItOutImages } from "./sound-it-out";

import { magicTeams, magicTeamsImages } from "./magic-teams";

import { twoKindsOfBooks, twoKindsOfBooksImages } from "./two-kinds-of-books";

import { whosTellingIt, whosTellingItImages } from "./whos-telling-it";

import { textFeatureFinders, textFeatureFindersImages } from "./text-feature-finders";

import { pictureOrWords, pictureOrWordsImages } from "./picture-or-words";

import { whatIsIt, whatIsItImages } from "./what-is-it";

import { wordsInRealLife, wordsInRealLifeImages } from "./words-in-real-life";

import { strongWords, strongWordsImages } from "./strong-words";

import { syllableSplitters, syllableSplittersImages } from "./syllable-splitters";

import { wordBreakers, wordBreakersImages } from "./word-breakers";

import { endingReaders, endingReadersImages } from "./ending-readers";

import { pictureDetectives, pictureDetectivesImages } from "./picture-detectives";

import { sameDifferentStories, sameDifferentStoriesImages } from "./same-different-stories";

import { ideaIllustrators, ideaIllustratorsImages } from "./idea-illustrators";

import { proveIt, proveItImages } from "./prove-it";

import { wordsWeUse, wordsWeUseImages } from "./words-we-use";

import { grammarBuilders, grammarBuildersImages } from "./grammar-builders";

import { writeItRight, writeItRightImages } from "./write-it-right";

import { trickyWords, trickyWordsImages } from "./tricky-words";

import { readingWithPurpose, readingWithPurposeImages } from "./reading-with-purpose";

import { storyPoemParty, storyPoemPartyImages } from "./story-poem-party";

import { twoTextsCompare, twoTextsCompareImages } from "./two-texts-compare";

import { factPartyG1, factPartyG1Images } from "./fact-party-g1";

import { fableTellers, fableTellersImages } from "./fable-tellers";

import { decodingChampions, decodingChampionsImages } from "./decoding-champions";

import { longOrShort, longOrShortImages } from "./long-or-short";

import { teamPlayers, teamPlayersImages } from "./team-players";

import { askAndAnswerG2, askAndAnswerG2Images } from "./ask-and-answer-g2";

import { characterChallenges, characterChallengesImages } from "./character-challenges";

import { factFindersAsk, factFindersAskImages } from "./fact-finders-ask";

import { paragraphPower, paragraphPowerImages } from "./paragraph-power";

import { chainsAndSteps, chainsAndStepsImages } from "./chains-and-steps";

import { wordSolvers, wordSolversImages } from "./word-solvers";

import { clueHunters, clueHuntersImages } from "./clue-hunters";

import { longVowelBuilders, longVowelBuildersImages } from "./long-vowel-builders";

import { prefixSuffixDecoders, prefixSuffixDecodersImages } from "./prefix-suffix-decoders";

import { trickySoundSwitchers, trickySoundSwitchersImages } from "./tricky-sound-switchers";

import { wordMusic, wordMusicImages } from "./word-music";

import { storyShape, storyShapeImages } from "./story-shape";

import { twoWaysToSee, twoWaysToSeeImages } from "./two-ways-to-see";

import { scienceWordClues, scienceWordCluesImages } from "./science-word-clues";

export interface LessonEntry {
  lesson: LessonDef;
  /** word → image subject (house style applied by pipeline). Object form pins a
   *  recurring character to a reference image: { subject, ref: "<word>" }. */
  images: Record<string, string | { subject: string; ref?: string }>;
}

export const LESSONS: Record<string, LessonEntry> = {
  "silent-e": { lesson: silentE, images: silentEImages },
  "story-elements": { lesson: storyElements, images: storyElementsImages },
  "reading-detective": { lesson: readingDetective, images: readingDetectiveImages },
  "rhyme-time": { lesson: rhymeTime, images: rhymeTimeImages },
  "key-details": { lesson: keyDetails, images: keyDetailsImages },
  "syllable-beats": { lesson: syllableBeats, images: syllableBeatsImages },
  "book-makers": { lesson: bookMakers, images: bookMakersImages },
  "letter-pairs": { lesson: letterPairs, images: letterPairsImages },
  "book-basics": { lesson: bookBasics, images: bookBasicsImages },
  "story-kinds": { lesson: storyKinds, images: storyKindsImages },
  "big-kid-words": { lesson: bigKidWords, images: bigKidWordsImages },
  "sound-sliders": { lesson: soundSliders, images: soundSlidersImages },
  "sound-detectives": { lesson: soundDetectives, images: soundDetectivesImages },
  "word-machines": { lesson: wordMachines, images: wordMachinesImages },
  "letter-sounds": { lesson: letterSounds, images: letterSoundsImages },
  "snap-words": { lesson: snapWords, images: snapWordsImages },
  "tell-it-back": { lesson: tellItBack, images: tellItBackImages },
  "word-wonder": { lesson: wordWonder, images: wordWonderImages },
  "naming-doing-words": { lesson: namingDoingWords, images: namingDoingWordsImages },
  "look-close": { lesson: lookClose, images: lookCloseImages },
  "my-first-read": { lesson: myFirstRead, images: myFirstReadImages },
  "picture-clues": { lesson: pictureClues, images: pictureCluesImages },
  "same-and-different": { lesson: sameAndDifferent, images: sameAndDifferentImages },
  "reading-party": { lesson: readingParty, images: readingPartyImages },
  "double-duty-words": { lesson: doubleDutyWords, images: doubleDutyWordsImages },
  "word-families-friends": { lesson: wordFamiliesFriends, images: wordFamiliesFriendsImages },
  "capital-start": { lesson: capitalStart, images: capitalStartImages },
  "fact-finder-basics": { lesson: factFinderBasics, images: factFinderBasicsImages },
  "whats-it-about": { lesson: whatsItAbout, images: whatsItAboutImages },
  "how-they-connect": { lesson: howTheyConnect, images: howTheyConnectImages },
  "science-word-wonder": { lesson: scienceWordWonder, images: scienceWordWonderImages },
  "parts-of-a-book": { lesson: partsOfABook, images: partsOfABookImages },
  "fact-book-makers": { lesson: factBookMakers, images: factBookMakersImages },
  "diagram-detectives": { lesson: diagramDetectives, images: diagramDetectivesImages },
  "author-reasons": { lesson: authorReasons, images: authorReasonsImages },
  "two-books-one-topic": { lesson: twoBooksOneTopic, images: twoBooksOneTopicImages },
  "fact-reading-party": { lesson: factReadingParty, images: factReadingPartyImages },
  "sentence-shapes": { lesson: sentenceShapes, images: sentenceShapesImages },
  "blend-builders": { lesson: blendBuilders, images: blendBuildersImages },
  "sound-spotters": { lesson: soundSpotters, images: soundSpottersImages },
  "ask-it-find-it": { lesson: askItFindIt, images: askItFindItImages },
  "story-message": { lesson: storyMessage, images: storyMessageImages },
  "fact-questions": { lesson: factQuestions, images: factQuestionsImages },
  "topic-spotter": { lesson: topicSpotter, images: topicSpotterImages },
  "word-toolbox": { lesson: wordToolbox, images: wordToolboxImages },
  "sentence-clues": { lesson: sentenceClues, images: sentenceCluesImages },
  "prefix-power": { lesson: prefixPower, images: prefixPowerImages },
  "sound-stretchers": { lesson: soundStretchers, images: soundStretchersImages },
  "smooth-reader": { lesson: smoothReader, images: smoothReaderImages },
  "check-and-fix": { lesson: checkAndFix, images: checkAndFixImages },
  "story-parts": { lesson: storyParts, images: storyPartsImages },
  "word-pictures": { lesson: wordPictures, images: wordPicturesImages },
  "fact-links": { lesson: factLinks, images: factLinksImages },
  "fact-word-finder": { lesson: factWordFinder, images: factWordFinderImages },
  "word-changers": { lesson: wordChangers, images: wordChangersImages },
  "just-right-words": { lesson: justRightWords, images: justRightWordsImages },
  "category-captain": { lesson: categoryCaptain, images: categoryCaptainImages },
  "digraph-detectives": { lesson: digraphDetectives, images: digraphDetectivesImages },
  "sound-it-out": { lesson: soundItOut, images: soundItOutImages },
  "magic-teams": { lesson: magicTeams, images: magicTeamsImages },
  "two-kinds-of-books": { lesson: twoKindsOfBooks, images: twoKindsOfBooksImages },
  "whos-telling-it": { lesson: whosTellingIt, images: whosTellingItImages },
  "text-feature-finders": { lesson: textFeatureFinders, images: textFeatureFindersImages },
  "picture-or-words": { lesson: pictureOrWords, images: pictureOrWordsImages },
  "what-is-it": { lesson: whatIsIt, images: whatIsItImages },
  "words-in-real-life": { lesson: wordsInRealLife, images: wordsInRealLifeImages },
  "strong-words": { lesson: strongWords, images: strongWordsImages },
  "syllable-splitters": { lesson: syllableSplitters, images: syllableSplittersImages },
  "word-breakers": { lesson: wordBreakers, images: wordBreakersImages },
  "ending-readers": { lesson: endingReaders, images: endingReadersImages },
  "picture-detectives": { lesson: pictureDetectives, images: pictureDetectivesImages },
  "same-different-stories": { lesson: sameDifferentStories, images: sameDifferentStoriesImages },
  "idea-illustrators": { lesson: ideaIllustrators, images: ideaIllustratorsImages },
  "prove-it": { lesson: proveIt, images: proveItImages },
  "words-we-use": { lesson: wordsWeUse, images: wordsWeUseImages },
  "grammar-builders": { lesson: grammarBuilders, images: grammarBuildersImages },
  "write-it-right": { lesson: writeItRight, images: writeItRightImages },
  "tricky-words": { lesson: trickyWords, images: trickyWordsImages },
  "reading-with-purpose": { lesson: readingWithPurpose, images: readingWithPurposeImages },
  "story-poem-party": { lesson: storyPoemParty, images: storyPoemPartyImages },
  "two-texts-compare": { lesson: twoTextsCompare, images: twoTextsCompareImages },
  "fact-party-g1": { lesson: factPartyG1, images: factPartyG1Images },
  "fable-tellers": { lesson: fableTellers, images: fableTellersImages },
  "decoding-champions": { lesson: decodingChampions, images: decodingChampionsImages },
  "long-or-short": { lesson: longOrShort, images: longOrShortImages },
  "team-players": { lesson: teamPlayers, images: teamPlayersImages },
  "ask-and-answer-g2": { lesson: askAndAnswerG2, images: askAndAnswerG2Images },
  "character-challenges": { lesson: characterChallenges, images: characterChallengesImages },
  "fact-finders-ask": { lesson: factFindersAsk, images: factFindersAskImages },
  "paragraph-power": { lesson: paragraphPower, images: paragraphPowerImages },
  "chains-and-steps": { lesson: chainsAndSteps, images: chainsAndStepsImages },
  "word-solvers": { lesson: wordSolvers, images: wordSolversImages },
  "clue-hunters": { lesson: clueHunters, images: clueHuntersImages },
  "long-vowel-builders": { lesson: longVowelBuilders, images: longVowelBuildersImages },
  "prefix-suffix-decoders": { lesson: prefixSuffixDecoders, images: prefixSuffixDecodersImages },
  "tricky-sound-switchers": { lesson: trickySoundSwitchers, images: trickySoundSwitchersImages },
  "word-music": { lesson: wordMusic, images: wordMusicImages },
  "story-shape": { lesson: storyShape, images: storyShapeImages },
  "two-ways-to-see": { lesson: twoWaysToSee, images: twoWaysToSeeImages },
  "science-word-clues": { lesson: scienceWordClues, images: scienceWordCluesImages },
};
