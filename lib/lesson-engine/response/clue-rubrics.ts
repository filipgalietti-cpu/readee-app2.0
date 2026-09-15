// Source-bound L.1.4a adaptations; educator/child calibration pending.
export const CLUE_RUBRICS = {
  "clue-drowsy-v1": {
    "stem": "What does drowsy mean?",
    "source": "Ben was drowsy, so he went to bed.",
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing, not keyword presence or a required memorized sentence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an incomplete but intelligible answer can need help. This is supported language practice, not independent decoding evidence. Accept sleepy, tired, ready to sleep, or equivalent. Sleepy alone is sufficient. Hungry, cold or excited as the meaning is contrary. Went to bed alone names the clue rather than the feeling and is incomplete.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  },
  "clue-rest-v1": {
    "stem": "What could you do to rest when you feel drowsy?",
    "source": "Ben was drowsy, so he went to bed. Drowsy means sleepy. The child may offer their own reasonable way to rest.",
    "participationOnly": true,
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing, not keyword presence or a required memorized sentence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an incomplete but intelligible answer can need help. This is supported language practice, not independent decoding evidence. This is open participation, not one required action or a claim about the child’s actual behavior. Accept a plausible restful action: sleep, nap, go to bed, lie down, close my eyes, sit quietly, cuddle a pillow, rest on the couch, or a different quiet activity clearly used to rest. Take a nap alone is sufficient. Reading quietly on a couch can count; do not insist on sleeping. Drowsy or sleepy alone does not offer an action and is unclear. Refusal, no answer, energetic running instead of resting, or an unrelated action is unclear rather than a wrong personal choice. Do not give health advice or infer a diagnosis.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  },
  "clue-soaked-v1": {
    "stem": "Which words helped you understand soaked?",
    "source": "Rain poured down on Jen. Her coat was soaked.",
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing, not keyword presence or a required memorized sentence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an incomplete but intelligible answer can need help. This is supported language practice, not independent decoding evidence. Accept rain, poured, rain poured down, it was raining, the pouring rain, or a natural paraphrase identifying the rain/action clue. Rain alone suffices. Very wet alone defines soaked but does not provide the requested sentence clue and is incomplete. Jen/coat/soaked alone is incomplete. Sun or dry weather as the clue contradicts the source.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  },
  "clue-scalding-v1": {
    "stem": "What does scalding mean?",
    "source": "Dad's soup was scalding, so he blew on it before every bite.",
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing, not keyword presence or a required memorized sentence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an incomplete but intelligible answer can need help. This is supported language practice, not independent decoding evidence. Accept very hot, hot, too hot, burning hot, or an equivalent high-temperature meaning. Hot alone suffices for this supported first-grade answer. It was not cold is an acceptable rough paraphrase only if a hot meaning is clear; not cold alone is incomplete because warm could also fit. Blowing on soup alone gives the clue rather than meaning and is incomplete. Cold, sweet, yummy, or sour as meaning is contrary.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  },
  "clue-famished-v1": {
    "stem": "What does famished mean?",
    "source": "The famished puppy gobbled up two whole bowls of food.",
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing, not keyword presence or a required memorized sentence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an incomplete but intelligible answer can need help. This is supported language practice, not independent decoding evidence. Accept hungry, very hungry, starving, wanted food badly, or equivalent. Hungry alone suffices. Not full alone is incomplete without a hunger meaning. Ate two bowls alone gives a clue but not the requested meaning and is incomplete. Full, sleepy, cold or thirsty as the meaning is contrary.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  }
} as const;
