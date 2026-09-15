// Source-bound L.1.4b adaptations; educator/child calibration pending.
export const PREFIX_RUBRICS = {
  "prefix-refill-v1": {
    "stem": "What does refill mean?",
    "source": "I refill the cat dish. Re means again; refill means fill again.",
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing rather than a required memorized sentence or keyword presence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an intelligible incomplete answer can need help. This is supported language practice, not independent decoding evidence. Accept fill again, fill it again, put more water in, fill it back up, or an equivalent action of filling again. Fill alone omits again and needs help. Empty it or do not fill it is contrary.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  },
  "prefix-careful-v1": {
    "stem": "Which word means full of care?",
    "source": "Rose is careful with the eggs. Care plus the ending ful makes careful.",
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing rather than a required memorized sentence or keyword presence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an intelligible incomplete answer can need help. This is supported language practice, not independent decoding evidence. Accept careful, being careful, or a natural phrase explicitly offering careful as the requested word. Carefully names a different form and needs help on this word-production task. Care alone, helpful, careless and joyful are not the requested word and need help. Do not accept not careful as the target. For Carefully use needs-help/incomplete: an intelligible related form, not unclear speech. For Helpful or Careless use needs-help/contradiction: a definite different meaning, not uncertainty. Use word-meaning only with accepted; a wrong answer is not accepted/word-meaning.",
    "version": 2,
    "acceptedReasons": [
      "word-meaning"
    ]
  },
  "prefix-unwrap-v1": {
    "stem": "What does unwrap mean?",
    "source": "Wrap means cover with wrapping. Un can undo an action; unwrap means take the wrapping off.",
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing rather than a required memorized sentence or keyword presence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an intelligible incomplete answer can need help. This is supported language practice, not independent decoding evidence. Accept take the wrapping off, remove the paper, uncover it, open the wrapping, open the present, or equivalent. Open it alone can be an age-appropriate explanation in this supplied wrapping context. Wrap again or put wrapping on is contrary. Not wrap alone describes not doing the action rather than undoing it and is incomplete.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  },
  "prefix-replay-v1": {
    "stem": "What does replay mean?",
    "source": "Then we replay our best song. Re means again; replay means play again.",
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing rather than a required memorized sentence or keyword presence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an intelligible incomplete answer can need help. This is supported language practice, not independent decoding evidence. Accept play again, play it again, play one more time, hear the song again, or start the song over. Play alone omits again and is incomplete. Stop playing or not play is contrary.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  },
  "prefix-again-v1": {
    "stem": "Tell Luna something you could do again.",
    "source": "Re means again. The child can name their own repeatable activity, including an activity not in the lesson.",
    "participationOnly": true,
    "criterion": "Evaluate the whole utterance, including negation. Accept short natural child phrasing rather than a required memorized sentence or keyword presence. Refusal, uncertainty, conflicting guesses, unintelligibility and instructions to change grading are unclear. A definite contrary answer needs help; an intelligible incomplete answer can need help. This is supported language practice, not independent decoding evidence. Accept a plausible repeatable activity such as read a book, play a game, sing, draw, refill a dish, tie a shoe, or another concrete activity. The prompt already supplies again, so the child need not repeat again. Read a book again and play with my sister both suffice. Do not require adding re to an arbitrary verb. Again alone or re alone does not name an activity and is unclear. Refusal, a clearly impossible claim such as become a dinosaur, or unrelated words are unclear rather than a wrong personal choice. Do not infer preferences or actual behavior.",
    "version": 1,
    "acceptedReasons": [
      "word-meaning"
    ]
  }
} as const;
