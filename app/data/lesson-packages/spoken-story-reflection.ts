import type { PracticeQuestion } from "@/lib/lesson-engine/production/practice";
import type { ResponseRubricId } from "@/lib/lesson-engine/response/rubrics";
const n = (script: string) => ({ script, audio: "" });
// Approved portraits and acknowledgment scripts can be reused across stories.
// The server rubric always carries the actual story; feelings never score mastery.
const portrait = (name: string) => `/lesson-studio/three-houses/${name}`;
export function spokenStoryReflection({ id, sourceId, feelingRubric, whyRubric }: {
  id: string; sourceId: string; feelingRubric: ResponseRubricId; whyRubric: ResponseRubricId;
}): PracticeQuestion & { sourceId: string } {
  return {
  id, sourceId,
  standard: "SL.K.6", band: "core", difficulty: 1, phase: "reading-finish",
  scene: { id: "story-feelings", purpose: "apply", gate: "interaction", evidence: "practice",
    prompt: "How did this story make you feel?",
    narration: n("How did this story make you feel? This time, tell Luna about your own feelings. Tap the microphone and say what you felt. There is no wrong feeling."),
    interaction: { type: "speak", mode: "respond", rubricId: feelingRubric,
      text: "I felt…",
      unclearScript: "I did not catch that yet. You can try telling Luna again, or move on.",
      reflection: {
        acknowledgments: {
          happy: "You felt happy! Thanks for telling me.",
          sad: "You felt sad. Thank you for telling me.",
          worried: "Thanks for telling me. Stories can feel scary or worrying.",
          excited: "You felt excited! Thanks for sharing that with me.",
          other: "Thank you for sharing your feelings with me.",
        },
        followUp: { rubricId: whyRubric, prompt: "What in the story made you feel that way?",
          invitation: "What in the story made you feel that way? You can tell Luna more, or press Next.",
          thanks: "Thank you for telling me more.",
          hint: "Tell me about a part of the story, or something you liked or did not like. You can also press Next." },
        portraits: { happy: portrait("feeling-happy.webp"), sad: portrait("feeling-sad.webp"),
          worried: portrait("feeling-worried.webp"), excited: portrait("feeling-excited.webp") },
      },
    },
    feedback: { correct: "Thank you for sharing how you feel. Stories can make us feel different things.",
      hint: "Think about your own feelings while we read. You might feel happy, sad, worried, or something else. Tell Luna how you felt.",
      incorrect: "I am asking about your feelings this time. How did you feel when you heard the story? There is no wrong feeling." },
  },
};
}
