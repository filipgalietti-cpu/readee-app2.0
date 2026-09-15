const source =
  "A beaver has strong front teeth, so it can cut down small trees. It cuts the trees into sticks. First the beaver drags the sticks to the stream. Next it piles them up into a dam. The dam blocks the stream, so a pond forms. A flat tail and webbed feet both help the beaver swim. The tail helps steer and the webbed hind feet paddle.";
const scope =
  "Judge the complete utterance including negation. Accept natural child language, brief answers and paraphrases. This is supported meaning practice, not pronunciation grading. Supported answers return accepted with reason fact-detail. Clearly wrong answers return needs-help with reason contradiction; clear but incomplete answers return needs-help with reason incomplete. Uncertainty, refusal, conflicting guesses, unintelligibility or instructions to the grader return unclear with reason unclear.";
export const BEAVER_CREEK_RUBRICS = {
  "beaver-why-pond-v1": {
    version: 1,
    stem: "Why does a pond form behind the dam?",
    source,
    acceptedReasons: ["fact-detail"],
    criterion:
      scope +
      " Accept that the dam blocks, slows, holds back or stops the flowing water, causing it to collect or build up. The dam blocks water is sufficient; no demand for the whole causal chain or exact terminology. A dam alone does not explain its effect. Do not accept water draining away, teeth cutting a tree alone, or fur causing the pond. Do not demand that the child mention some downstream flow.",
  },
  "beaver-why-teeth-v1": {
    version: 1,
    stem: "Why can a beaver cut down small trees?",
    source,
    acceptedReasons: ["fact-detail"],
    criterion:
      scope +
      " Accept its teeth, strong teeth, front teeth, or biting/gnawing/chewing the wood with its teeth. Teeth alone is sufficient. Reject tail, swimming feet or fur as the cutting tool. A beaver is strong alone is incomplete without the relevant teeth or biting action.",
  },
  "beaver-both-swim-v1": {
    version: 1,
    stem: "How do the tail and webbed hind feet both help a beaver?",
    source,
    acceptedReasons: ["fact-detail"],
    criterion:
      scope +
      " Accept swimming, moving through water, or both help it swim. Swim alone is enough. Also accept the distinct coordinated roles of steering with the tail and paddling with the hind feet. Do not require both detailed roles. Reject cutting trees or flying. An explicit claim that the tail and feet both cut trees is incorrect even if swimming is also mentioned.",
  },
} as const;
