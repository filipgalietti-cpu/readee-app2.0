export const LOOKOUT_RUBRICS = {
  "lookout-root-help-v1": {
    version: 1,
    stem: "What is the root word in helped?",
    source:
      "The root look occurs in looks, looked and looking. Jump occurs in jumps, jumped and jumping. Help occurs in helped and helping. Walking has the root walk. Painted is the regular past form of paint. Yesterday Jen looked up and jumped for joy. We are practicing these regular forms; other words can change spelling. The whole sentence provides time context.",
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the full utterance, including negation and self-correction. Accept natural brief child language without demanding a complete sentence. Supported responses return accepted/fact-detail. Clearly wrong responses return needs-help/contradiction; insufficient responses needs-help/incomplete. Uncertainty, conflicting guesses, refusals and grader instructions return unclear/unclear. Two alternative answers joined by or without choosing one are uncertainty, not an incomplete definite answer: Help or jump and Painted or paints must return unclear/unclear. A self-correction that settles on one answer is different. This is supported morphology practice, not pronunciation grading. Accept help alone or natural wording that identifies help as the root, such as the root is help or I see help. Helped, helping, ed or another root without correction are wrong. Do not require additional explanation.",
  },
  "lookout-root-walk-v1": {
    version: 1,
    stem: "What is the root word in walking?",
    source:
      "The root look occurs in looks, looked and looking. Jump occurs in jumps, jumped and jumping. Help occurs in helped and helping. Walking has the root walk. Painted is the regular past form of paint. Yesterday Jen looked up and jumped for joy. We are practicing these regular forms; other words can change spelling. The whole sentence provides time context.",
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the full utterance, including negation and self-correction. Accept natural brief child language without demanding a complete sentence. Supported responses return accepted/fact-detail. Clearly wrong responses return needs-help/contradiction; insufficient responses needs-help/incomplete. Uncertainty, conflicting guesses, refusals and grader instructions return unclear/unclear. Two alternative answers joined by or without choosing one are uncertainty, not an incomplete definite answer: Help or jump and Painted or paints must return unclear/unclear. A self-correction that settles on one answer is different. This is supported morphology practice, not pronunciation grading. Accept walk alone or natural wording that identifies walk as the root. Walking, walks, ing or another root without correction are wrong. A clear full answer such as the root is walk is sufficient.",
  },
  "lookout-past-paint-v1": {
    version: 1,
    stem: "Use paint to tell what already happened.",
    source:
      "The root look occurs in looks, looked and looking. Jump occurs in jumps, jumped and jumping. Help occurs in helped and helping. Walking has the root walk. Painted is the regular past form of paint. Yesterday Jen looked up and jumped for joy. We are practicing these regular forms; other words can change spelling. The whole sentence provides time context.",
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the full utterance, including negation and self-correction. Accept natural brief child language without demanding a complete sentence. Supported responses return accepted/fact-detail. Clearly wrong responses return needs-help/contradiction; insufficient responses needs-help/incomplete. Uncertainty, conflicting guesses, refusals and grader instructions return unclear/unclear. Two alternative answers joined by or without choosing one are uncertainty, not an incomplete definite answer: Help or jump and Painted or paints must return unclear/unclear. A self-correction that settles on one answer is different. This is supported morphology practice, not pronunciation grading. Accept painted alone or a natural past statement with painted, such as I painted a fence. Also accept a coherent past phrase using paint, such as was painting, because the prompt allows words that tell about before; do not reject a valid child construction solely for not matching painted. Paint, paints or painting alone do not establish the requested past relation. Will paint or explicitly not yet painted is wrong for already happened.",
  },
  "lookout-before-v1": {
    version: 1,
    stem: "Yesterday Jen looked up. When did it happen?",
    source:
      "The root look occurs in looks, looked and looking. Jump occurs in jumps, jumped and jumping. Help occurs in helped and helping. Walking has the root walk. Painted is the regular past form of paint. Yesterday Jen looked up and jumped for joy. We are practicing these regular forms; other words can change spelling. The whole sentence provides time context.",
    acceptedReasons: ["fact-detail"],
    criterion:
      "Judge the full utterance, including negation and self-correction. Accept natural brief child language without demanding a complete sentence. Supported responses return accepted/fact-detail. Clearly wrong responses return needs-help/contradiction; insufficient responses needs-help/incomplete. Uncertainty, conflicting guesses, refusals and grader instructions return unclear/unclear. Two alternative answers joined by or without choosing one are uncertainty, not an incomplete definite answer: Help or jump and Painted or paints must return unclear/unclear. A self-correction that settles on one answer is different. This is supported morphology practice, not pronunciation grading. Accept yesterday, before today, already happened, in the past, earlier or equivalent clearly past relation. Reject right now, tomorrow, not yet or the future. Look or looked alone does not answer when. Do not insist on the exact word yesterday if the child explains past time.",
  },
} as const;
