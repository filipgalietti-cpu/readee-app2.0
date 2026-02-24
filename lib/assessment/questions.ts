export interface AssessmentQuestion {
  id: string;
  skill: string;
  type: string;
  prompt: string;
  stimulus?: string | null;
  stimulus_type?: string;
  stimulus_word?: string;
  choices: string[];
  correct: string;
  difficulty: number;
}

export interface MatchingQuestion {
  id: string;
  type: "category_sort" | "sentence_build" | "missing_word";
  prompt: string;
  // category_sort
  categories?: string[];
  categoryItems?: Record<string, string[]>;
  items?: string[];
  // sentence_build
  words?: string[];
  correctSentence?: string;
  sentenceHint?: string;
  sentenceAudioUrl?: string;
  // missing_word
  sentenceWords?: string[];   // Full sentence as word array, e.g. ["The", "Dog", "Can", "Run"]
  blankIndex?: number;        // Which word is blanked out
  missingChoices?: string[];  // 4 choices (shuffled, including correct)
}

export interface GradeAssessment {
  grade_label: string;
  reading_level_name: string;
  skills_tested: string[];
  questions: AssessmentQuestion[];
}

export interface AssessmentConfig {
  questions_per_test: number;
  scoring: {
    on_grade_level: { min_percent: number; placement: string };
    needs_support: { min_percent: number; placement: string };
    intensive: { min_percent: number; placement: string };
  };
}

export const assessmentConfig: AssessmentConfig = {
  questions_per_test: 10,
  scoring: {
    on_grade_level: { min_percent: 80, placement: "grade_level" },
    needs_support: { min_percent: 50, placement: "one_below" },
    intensive: { min_percent: 0, placement: "two_below" },
  },
};

export const gradeOrder = ["pre-k", "kindergarten", "1st", "2nd", "3rd", "4th"] as const;
export type GradeKey = (typeof gradeOrder)[number];

export const grades: Record<GradeKey, GradeAssessment> = {
  "pre-k": {
    grade_label: "Foundational",
    reading_level_name: "Emerging Reader",
    skills_tested: ["letter_recognition", "phonological_awareness", "print_concepts", "vocabulary"],
    questions: [
      { id: "pk-1", skill: "letter_recognition", type: "image_choice", prompt: "Which letter is this?", stimulus: "A", stimulus_type: "large_letter", choices: ["A", "B", "D", "G"], correct: "A", difficulty: 1 },
      { id: "pk-2", skill: "letter_recognition", type: "image_choice", prompt: "Find the letter M", stimulus: null, choices: ["N", "M", "W", "H"], correct: "M", difficulty: 1 },
      { id: "pk-3", skill: "phonological_awareness", type: "audio_choice", prompt: "Which word starts with the same sound as 'ball'?", stimulus_word: "ball", choices: ["dog", "bat", "cat", "fish"], correct: "bat", difficulty: 2 },
      { id: "pk-4", skill: "phonological_awareness", type: "audio_choice", prompt: "Which word rhymes with 'cat'?", stimulus_word: "cat", choices: ["hat", "dog", "cup", "bed"], correct: "hat", difficulty: 1 },
      { id: "pk-5", skill: "phonological_awareness", type: "audio_choice", prompt: "Which word starts with the same sound as 'sun'?", stimulus_word: "sun", choices: ["moon", "sit", "run", "top"], correct: "sit", difficulty: 2 },
      { id: "pk-6", skill: "letter_recognition", type: "image_choice", prompt: "What letter does the word 'dog' start with?", stimulus: "\u{1F415}", choices: ["B", "P", "D", "G"], correct: "D", difficulty: 2 },
      { id: "pk-7", skill: "print_concepts", type: "single_choice", prompt: "Which way do we read?", choices: ["Right to left", "Left to right", "Bottom to top", "Any direction"], correct: "Left to right", difficulty: 1 },
      { id: "pk-8", skill: "vocabulary", type: "image_choice", prompt: "Which one is a fruit?", choices: ["\u{1F697} Car", "\u{1F34E} Apple", "\u{1F45F} Shoe", "\u{1F4DA} Book"], correct: "\u{1F34E} Apple", difficulty: 1 },
      { id: "pk-9", skill: "phonological_awareness", type: "audio_choice", prompt: "How many syllables (claps) in the word 'banana'?", stimulus_word: "banana", choices: ["1", "2", "3", "4"], correct: "3", difficulty: 3 },
      { id: "pk-10", skill: "letter_recognition", type: "image_choice", prompt: "Which is a lowercase letter?", choices: ["A", "b", "C", "D"], correct: "b", difficulty: 2 },
    ],
  },
  kindergarten: {
    grade_label: "Kindergarten",
    reading_level_name: "Beginning Reader",
    skills_tested: ["letter_sounds", "cvc_words", "sight_words", "phonological_awareness"],
    questions: [
      { id: "k-1", skill: "letter_sounds", type: "audio_choice", prompt: "What sound does the letter 'S' make?", stimulus: "S", stimulus_type: "large_letter", choices: ["/s/ (like snake)", "/m/ (like mom)", "/t/ (like top)", "/b/ (like ball)"], correct: "/s/ (like snake)", difficulty: 1 },
      { id: "k-2", skill: "letter_sounds", type: "audio_choice", prompt: "What sound does the letter 'B' make?", stimulus: "B", stimulus_type: "large_letter", choices: ["/d/ (like dog)", "/p/ (like pig)", "/b/ (like bat)", "/g/ (like go)"], correct: "/b/ (like bat)", difficulty: 1 },
      { id: "k-3", skill: "cvc_words", type: "single_choice", prompt: "Sound it out: C - A - T. What word is this?", stimulus: "C \u00B7 A \u00B7 T", stimulus_type: "segmented_word", choices: ["cut", "cat", "cot", "cap"], correct: "cat", difficulty: 1 },
      { id: "k-4", skill: "cvc_words", type: "single_choice", prompt: "Sound it out: D - O - G. What word is this?", stimulus: "D \u00B7 O \u00B7 G", stimulus_type: "segmented_word", choices: ["dig", "dug", "dog", "dot"], correct: "dog", difficulty: 1 },
      { id: "k-5", skill: "letter_sounds", type: "single_choice", prompt: "Which word starts with the same sound as 'moon'?", stimulus: "🌙 moon", stimulus_type: "word_display", choices: ["Nest", "Map", "Lamp", "Sun"], correct: "Map", difficulty: 1 },
      { id: "k-6", skill: "sight_words", type: "single_choice", prompt: "Finish the sentence: I can ___ a book.", choices: ["run", "see", "big", "up"], correct: "see", difficulty: 2 },
      { id: "k-7", skill: "cvc_words", type: "single_choice", prompt: "Which word has the short 'a' sound like in 'hat'?", choices: ["map", "mop", "mug", "met"], correct: "map", difficulty: 2 },
      { id: "k-8", skill: "phonological_awareness", type: "single_choice", prompt: "What do you get if you change the 'c' in 'cat' to 'b'?", choices: ["bat", "bit", "but", "bet"], correct: "bat", difficulty: 3 },
      { id: "k-9", skill: "letter_sounds", type: "audio_choice", prompt: "Which letter makes the /f/ sound?", choices: ["V", "F", "P", "T"], correct: "F", difficulty: 2 },
      { id: "k-10", skill: "cvc_words", type: "image_choice", prompt: "Which picture matches the word 'pig'?", choices: ["\u{1F437} Pig", "\u{1F436} Dog", "\u{1F431} Cat", "\u{1F438} Frog"], correct: "\u{1F437} Pig", difficulty: 1 },
    ],
  },
  "1st": {
    grade_label: "1st Grade",
    reading_level_name: "Developing Reader",
    skills_tested: ["blends_digraphs", "cvce_words", "fluency", "comprehension"],
    questions: [
      { id: "1-1", skill: "blends_digraphs", type: "single_choice", prompt: "What sound do the letters 'SH' make together?", stimulus: "SH", choices: ["/sh/ (like ship)", "/s/ (like sun)", "/ch/ (like chip)", "/th/ (like the)"], correct: "/sh/ (like ship)", difficulty: 1 },
      { id: "1-2", skill: "blends_digraphs", type: "single_choice", prompt: "Which word starts with a blend (two consonant sounds together)?", choices: ["ship", "stop", "the", "cat"], correct: "stop", difficulty: 2 },
      { id: "1-3", skill: "cvce_words", type: "single_choice", prompt: "What happens to the vowel when there's an 'e' at the end? Read this word: CAKE", stimulus: "CAKE", stimulus_type: "word_display", choices: ["The 'a' says its name (long a)", "The 'a' is short like in 'cat'", "The 'e' is loud", "Nothing changes"], correct: "The 'a' says its name (long a)", difficulty: 2 },
      { id: "1-4", skill: "cvce_words", type: "single_choice", prompt: "Which word has a long 'i' sound?", choices: ["bit", "bike", "big", "bin"], correct: "bike", difficulty: 2 },
      { id: "1-5", skill: "fluency", type: "single_choice", prompt: "Read this sentence: 'The dog ran to the park.' What did the dog do?", stimulus: "The dog ran to the park.", stimulus_type: "sentence", choices: ["Slept at home", "Ran to the park", "Ate some food", "Played with a cat"], correct: "Ran to the park", difficulty: 1 },
      { id: "1-6", skill: "comprehension", type: "single_choice", prompt: "Read: 'Sam has a red ball. He likes to throw it to his friend Max.' Who does Sam throw the ball to?", stimulus: "Sam has a red ball. He likes to throw it to his friend Max.", stimulus_type: "passage", choices: ["His mom", "His dog", "His friend Max", "His sister"], correct: "His friend Max", difficulty: 2 },
      { id: "1-7", skill: "blends_digraphs", type: "single_choice", prompt: "Which word ends with the 'CH' sound?", choices: ["much", "must", "mush", "mud"], correct: "much", difficulty: 2 },
      { id: "1-8", skill: "fluency", type: "single_choice", prompt: "Read this word: PLANT", stimulus: "PLANT", stimulus_type: "word_display", choices: ["plant", "plan", "pant", "plate"], correct: "plant", difficulty: 2 },
      { id: "1-9", skill: "comprehension", type: "single_choice", prompt: "Read: 'It was raining outside. Lily took her umbrella.' Why did Lily take her umbrella?", stimulus: "It was raining outside. Lily took her umbrella.", stimulus_type: "passage", choices: ["It was sunny", "It was raining", "She was cold", "She liked umbrellas"], correct: "It was raining", difficulty: 1 },
      { id: "1-10", skill: "cvce_words", type: "single_choice", prompt: "Which pair shows a short vowel word and its long vowel partner?", choices: ["hop \u2192 hope", "dog \u2192 dig", "cat \u2192 cut", "run \u2192 ran"], correct: "hop \u2192 hope", difficulty: 3 },
    ],
  },
  "2nd": {
    grade_label: "2nd Grade",
    reading_level_name: "Growing Reader",
    skills_tested: ["vowel_teams", "multisyllabic", "comprehension", "vocabulary"],
    questions: [
      { id: "2-1", skill: "vowel_teams", type: "single_choice", prompt: "In the word 'RAIN', what sound do the letters 'AI' make?", stimulus: "RAIN", stimulus_type: "word_display", choices: ["Short a", "Long a", "Short i", "Long i"], correct: "Long a", difficulty: 1 },
      { id: "2-2", skill: "vowel_teams", type: "single_choice", prompt: "Which word has the 'OA' vowel team that says long 'o'?", choices: ["boat", "boot", "book", "born"], correct: "boat", difficulty: 1 },
      { id: "2-3", skill: "multisyllabic", type: "single_choice", prompt: "How many syllables are in the word 'butterfly'?", stimulus: "BUTTERFLY", stimulus_type: "word_display", choices: ["1", "2", "3", "4"], correct: "3", difficulty: 2 },
      { id: "2-4", skill: "multisyllabic", type: "single_choice", prompt: "Read this word: SUNSHINE. What two smaller words make up this word?", stimulus: "SUNSHINE", stimulus_type: "word_display", choices: ["sun + shine", "su + nshine", "suns + hine", "sh + unshine"], correct: "sun + shine", difficulty: 1 },
      { id: "2-5", skill: "vocabulary", type: "single_choice", prompt: "What does 'enormous' mean?", choices: ["Very small", "Very fast", "Very big", "Very quiet"], correct: "Very big", difficulty: 2 },
      { id: "2-6", skill: "comprehension", type: "single_choice", prompt: "Read: 'The fox was hungry. He saw some grapes hanging high on a vine. He jumped and jumped but could not reach them. \"Those grapes are probably sour anyway,\" he said.' Why did the fox say the grapes were sour?", stimulus: "The fox was hungry. He saw some grapes hanging high on a vine. He jumped and jumped but could not reach them. \"Those grapes are probably sour anyway,\" he said.", stimulus_type: "passage", choices: ["He tasted them", "He was pretending he didn't want them", "Someone told him", "They were green"], correct: "He was pretending he didn't want them", difficulty: 3 },
      { id: "2-7", skill: "vocabulary", type: "single_choice", prompt: "Pick the word that means the OPPOSITE of 'happy'.", choices: ["Glad", "Sad", "Mad", "Silly"], correct: "Sad", difficulty: 1 },
      { id: "2-8", skill: "comprehension", type: "single_choice", prompt: "Read: 'Maria woke up early. She put on her jersey, grabbed her cleats, and ran outside. Her teammates were already warming up.' What is Maria about to do?", stimulus: "Maria woke up early. She put on her jersey, grabbed her cleats, and ran outside. Her teammates were already warming up.", stimulus_type: "passage", choices: ["Go to school", "Play a sport", "Go shopping", "Eat breakfast"], correct: "Play a sport", difficulty: 2 },
      { id: "2-9", skill: "vowel_teams", type: "single_choice", prompt: "Which word has the same vowel sound as 'FEET'?", choices: ["met", "meat", "mat", "moot"], correct: "meat", difficulty: 2 },
      { id: "2-10", skill: "multisyllabic", type: "single_choice", prompt: "What is the root word in 'unhappy'?", choices: ["un", "happy", "hap", "unhap"], correct: "happy", difficulty: 2 },
    ],
  },
  "3rd": {
    grade_label: "3rd Grade",
    reading_level_name: "Independent Reader",
    skills_tested: ["advanced_phonics", "fluency", "comprehension", "vocabulary"],
    questions: [
      { id: "3-1", skill: "advanced_phonics", type: "single_choice", prompt: "Which word has a silent letter?", choices: ["know", "stop", "plan", "help"], correct: "know", difficulty: 1 },
      { id: "3-2", skill: "advanced_phonics", type: "single_choice", prompt: "In the word 'PHONE', what sound does 'PH' make?", stimulus: "PHONE", stimulus_type: "word_display", choices: ["/p/", "/f/", "/h/", "/ph/"], correct: "/f/", difficulty: 1 },
      { id: "3-3", skill: "vocabulary", type: "single_choice", prompt: "Read: 'The scientist made a remarkable discovery.' What does 'remarkable' most likely mean?", choices: ["Boring", "Amazing", "Small", "Quick"], correct: "Amazing", difficulty: 2 },
      { id: "3-4", skill: "vocabulary", type: "single_choice", prompt: "What does the prefix 'RE-' mean in the word 'rewrite'?", choices: ["Not", "Again", "Before", "Under"], correct: "Again", difficulty: 2 },
      { id: "3-5", skill: "comprehension", type: "single_choice", prompt: "Read: 'Long ago, people used candles and oil lamps for light. Then Thomas Edison invented the light bulb, which changed everything. Suddenly, homes, streets, and businesses could be lit safely and easily.' What is the MAIN IDEA of this passage?", stimulus: "Long ago, people used candles and oil lamps for light. Then Thomas Edison invented the light bulb, which changed everything. Suddenly, homes, streets, and businesses could be lit safely and easily.", stimulus_type: "passage", choices: ["Candles are dangerous", "Edison changed how we use light", "Oil lamps are old", "Businesses need light"], correct: "Edison changed how we use light", difficulty: 2 },
      { id: "3-6", skill: "comprehension", type: "single_choice", prompt: "Read: 'Jamal studied every night for a week. On the day of the test, he felt confident. When he got his paper back, he had the highest score in the class.' What can you infer about Jamal?", stimulus: "Jamal studied every night for a week. On the day of the test, he felt confident. When he got his paper back, he had the highest score in the class.", stimulus_type: "passage", choices: ["He is lucky", "Hard work pays off", "Tests are easy", "He cheated"], correct: "Hard work pays off", difficulty: 2 },
      { id: "3-7", skill: "fluency", type: "single_choice", prompt: "Read: 'The children were extremely excited about the upcoming field trip to the aquarium.' What does 'extremely' tell us?", stimulus: "The children were extremely excited about the upcoming field trip to the aquarium.", stimulus_type: "sentence", choices: ["They were a little excited", "They were VERY excited", "They were not excited", "They were scared"], correct: "They were VERY excited", difficulty: 1 },
      { id: "3-8", skill: "advanced_phonics", type: "single_choice", prompt: "Which word has the same 'TION' ending sound as 'nation'?", choices: ["station", "button", "mitten", "kitten"], correct: "station", difficulty: 2 },
      { id: "3-9", skill: "comprehension", type: "single_choice", prompt: "Read: 'Penguins are birds, but they cannot fly. Instead, they are excellent swimmers. Their wings act like flippers in the water. They live in cold places and huddle together for warmth.' Which is a FACT from the passage?", stimulus: "Penguins are birds, but they cannot fly. Instead, they are excellent swimmers. Their wings act like flippers in the water. They live in cold places and huddle together for warmth.", stimulus_type: "passage", choices: ["Penguins are the best animals", "Penguins use their wings as flippers", "Penguins like to play", "Penguins are cute"], correct: "Penguins use their wings as flippers", difficulty: 2 },
      { id: "3-10", skill: "vocabulary", type: "single_choice", prompt: "Choose the correct meaning of 'bank' in this sentence: 'We sat on the bank of the river and watched the ducks.'", choices: ["A place for money", "The side of a river", "To count on something", "A type of building"], correct: "The side of a river", difficulty: 3 },
    ],
  },
  "4th": {
    grade_label: "4th Grade",
    reading_level_name: "Advanced Reader",
    skills_tested: ["figurative_language", "text_structure", "comprehension", "vocabulary"],
    questions: [
      { id: "4-1", skill: "figurative_language", type: "single_choice", prompt: "What does the phrase 'break a leg' mean?", choices: ["Actually break your leg", "Good luck", "Run fast", "Be careful"], correct: "Good luck", difficulty: 1 },
      { id: "4-2", skill: "vocabulary", type: "single_choice", prompt: "What does the suffix '-less' mean in the word 'fearless'?", choices: ["Full of", "Without", "More than", "Like"], correct: "Without", difficulty: 1 },
      { id: "4-3", skill: "text_structure", type: "single_choice", prompt: "A passage that explains why something happened and what resulted uses which text structure?", choices: ["Compare and contrast", "Cause and effect", "Chronological order", "Problem and solution"], correct: "Cause and effect", difficulty: 2 },
      { id: "4-4", skill: "comprehension", type: "single_choice", prompt: "Read: 'The ancient Egyptians built the pyramids as tombs for their pharaohs. These massive structures took thousands of workers and many years to complete. The largest, the Great Pyramid of Giza, still stands today.' What is the author's purpose?", stimulus: "The ancient Egyptians built the pyramids as tombs for their pharaohs. These massive structures took thousands of workers and many years to complete. The largest, the Great Pyramid of Giza, still stands today.", stimulus_type: "passage", choices: ["To persuade you to visit Egypt", "To inform you about the pyramids", "To entertain with a story", "To compare buildings"], correct: "To inform you about the pyramids", difficulty: 2 },
      { id: "4-5", skill: "figurative_language", type: "single_choice", prompt: "Read: 'The wind whispered through the trees.' What type of figurative language is this?", choices: ["Simile", "Metaphor", "Personification", "Alliteration"], correct: "Personification", difficulty: 2 },
      { id: "4-6", skill: "vocabulary", type: "single_choice", prompt: "Read: 'The dog was so famished after the long hike that it devoured its entire bowl of food in seconds.' What does 'famished' most likely mean?", choices: ["Tired", "Very hungry", "Excited", "Thirsty"], correct: "Very hungry", difficulty: 2 },
      { id: "4-7", skill: "comprehension", type: "single_choice", prompt: "Read: 'Maya practiced piano every day after school. Some days she wanted to quit, but she kept going. At the spring recital, she played her piece perfectly. The audience gave her a standing ovation.' What is the theme of this passage?", stimulus: "Maya practiced piano every day after school. Some days she wanted to quit, but she kept going. At the spring recital, she played her piece perfectly. The audience gave her a standing ovation.", stimulus_type: "passage", choices: ["Music is fun", "Persistence leads to success", "School is important", "Audiences are kind"], correct: "Persistence leads to success", difficulty: 2 },
      { id: "4-8", skill: "text_structure", type: "single_choice", prompt: "Which signal words tell you a passage is comparing two things?", choices: ["First, then, finally", "Because, so, therefore", "However, on the other hand, similarly", "Once upon a time"], correct: "However, on the other hand, similarly", difficulty: 2 },
      { id: "4-9", skill: "figurative_language", type: "single_choice", prompt: "Read: 'She ran as fast as a cheetah.' This is an example of a:", choices: ["Metaphor", "Simile", "Personification", "Hyperbole"], correct: "Simile", difficulty: 1 },
      { id: "4-10", skill: "comprehension", type: "single_choice", prompt: "Read: 'Coral reefs are sometimes called the rainforests of the sea. They support more species per unit area than any other marine environment. Yet coral reefs around the world are threatened by rising ocean temperatures and pollution.' Based on this passage, the author would most likely agree that:", stimulus: "Coral reefs are sometimes called the rainforests of the sea. They support more species per unit area than any other marine environment. Yet coral reefs around the world are threatened by rising ocean temperatures and pollution.", stimulus_type: "passage", choices: ["Coral reefs are not important", "We should protect coral reefs", "Pollution is not a problem", "The ocean is too cold"], correct: "We should protect coral reefs", difficulty: 3 },
    ],
  },
};

/** Map reading level name back to grade key (reverse of grades[key].reading_level_name) */
export function levelNameToGradeKey(levelName: string | null): GradeKey {
  if (!levelName) return "kindergarten";
  for (const key of gradeOrder) {
    if (grades[key].reading_level_name === levelName) return key;
  }
  return "kindergarten";
}

/** Map child's grade from questionnaire to a grade key */
export function gradeToKey(grade: string | null): GradeKey {
  if (!grade) return "kindergarten";
  const g = grade.toLowerCase().trim();
  if (g.includes("pre") || g.includes("pk") || g.includes("foundational")) return "pre-k";
  if (g.includes("kinder") || g === "k") return "kindergarten";
  if (g.startsWith("1") || g.includes("first")) return "1st";
  if (g.startsWith("2") || g.includes("second")) return "2nd";
  if (g.startsWith("3") || g.includes("third")) return "3rd";
  if (g.startsWith("4") || g.includes("fourth")) return "4th";
  // Default for grades 5+ or unknown
  return "4th";
}

/** Determine reading level placement based on score */
export function getPlacement(
  scorePercent: number,
  gradeKey: GradeKey
): { levelName: string; gradeKey: GradeKey } {
  const gradeIdx = gradeOrder.indexOf(gradeKey);

  if (scorePercent >= assessmentConfig.scoring.on_grade_level.min_percent) {
    return { levelName: grades[gradeKey].reading_level_name, gradeKey };
  }
  if (scorePercent >= assessmentConfig.scoring.needs_support.min_percent) {
    const belowIdx = Math.max(0, gradeIdx - 1);
    const belowKey = gradeOrder[belowIdx];
    return { levelName: grades[belowKey].reading_level_name, gradeKey: belowKey };
  }
  const belowIdx = Math.max(0, gradeIdx - 2);
  const belowKey = gradeOrder[belowIdx];
  return { levelName: grades[belowKey].reading_level_name, gradeKey: belowKey };
}

