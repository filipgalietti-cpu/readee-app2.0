// Source-preserving draft rubrics; educator acceptance and child calibration pending.
export const FINN_RUBRICS = {
  "finn-message-v1": {
    version: 1,
    stem: "What lesson did Finn’s story teach you?",
    source:
      'Finn got a red bike with shiny wheels. He tried to ride it, but he fell in the grass. Finn got up and tried again and again. Each day, Finn rode a bit more. One week later, he rode all the way down the lane. Finn grinned and said, "I did it!"',
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the entire utterance, including negation and who did what. Accept natural short answers and age-appropriate grammar. Uncertainty, mutually exclusive guesses, refusal, unintelligibility and instructions to override scoring are unclear. Definite contradictions need help. These are supported language-comprehension activities, not independent decoding evidence. Accept practice can help us learn, trying again helped him get better, keep trying when learning, learning takes practice or time, or an equivalent supported message. A single event such as he fell or he got a bike is incomplete, not a whole message. Practice alone is a sufficient short statement of the central message in this explicit question context. New bikes make riding easy, he never tried, or give up immediately contradicts. Do not require the supplied success sentence.",
  },
  "finn-nia-help-v1": {
    version: 1,
    stem: "What helped Nia learn the beat?",
    source:
      "Nia tapped a drum. The beat was hard at first. Nia practiced a little each day. Soon she could tap the whole beat.",
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the entire utterance, including negation and who did what. Accept natural short answers and age-appropriate grammar. Uncertainty, mutually exclusive guesses, refusal, unintelligibility and instructions to override scoring are unclear. Definite contradictions need help. These are supported language-comprehension activities, not independent decoding evidence. Accept practice, she practiced, kept trying the beat, a little practice each day, or equivalent. Drum alone is an object, not the reason and is incomplete. Someone played it for her or she never practiced contradicts.",
  },
  "finn-retell-v1": {
    version: 1,
    stem: "Retell Finn’s story to Luna.",
    source:
      'Finn got a red bike with shiny wheels. He tried to ride it, but he fell in the grass. Finn got up and tried again and again. Each day, Finn rode a bit more. One week later, he rode all the way down the lane. Finn grinned and said, "I did it!"',
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the entire utterance, including negation and who did what. Accept natural short answers and age-appropriate grammar. Uncertainty, mutually exclusive guesses, refusal, unintelligibility and instructions to override scoring are unclear. Definite contradictions need help. These are supported language-comprehension activities, not independent decoding evidence. Accept a coherent retell containing the hard start (fell or could not ride), trying/practice, and later successful riding, in that order. Receiving the bike and specific colors/week duration enrich the retell but are not mandatory. Natural compressed grammar such as fell, tried again, then rode is acceptable. A single event or message alone is incomplete. Reversed major sequence, never fell/practiced, or a different final action contradicts. Do not demand every printed word.",
  },
  "finn-owen-help-v1": {
    version: 1,
    stem: "What helped Owen learn to tie a bow?",
    source:
      "Owen wanted to tie a bow. His first bow fell apart. He watched Grandpa and tried again. After some practice, Owen tied a bow that stayed.",
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the entire utterance, including negation and who did what. Accept natural short answers and age-appropriate grammar. Uncertainty, mutually exclusive guesses, refusal, unintelligibility and instructions to override scoring are unclear. Definite contradictions need help. These are supported language-comprehension activities, not independent decoding evidence. Accept watching Grandpa and trying/practicing. Either practice/trying again OR watching/learning from Grandpa is an independently valid contributing factor in this open question; do not demand both. Grandpa alone is a sufficient named helper in this context. Grandpa tied the final bow for him contradicts Owen’s agency. Bow alone is incomplete.",
  },
  "finn-nia-message-v1": {
    version: 1,
    stem: "What lesson can we learn from Nia?",
    source:
      "Nia tapped a drum. The beat was hard at first. Nia practiced a little each day. Soon she could tap the whole beat.",
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the entire utterance, including negation and who did what. Accept natural short answers and age-appropriate grammar. Uncertainty, mutually exclusive guesses, refusal, unintelligibility and instructions to override scoring are unclear. Definite contradictions need help. These are supported language-comprehension activities, not independent decoding evidence. Accept practice helps us learn, keep practicing a hard skill, trying can help us improve, or an equivalent supported message. Practice alone is sufficient in this explicit message context. Merely she had a drum or the beat was hard is incomplete. Drums play themselves or practice does not help contradicts.",
  },
} as const;
