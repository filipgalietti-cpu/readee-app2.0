"use client";

import StudentCustomQuizRunner from "@/app/(student)/student/quiz/_components/StudentCustomQuizRunner";

type Question = {
  id: string;
  kind: "multiple_choice" | "true_false" | "fill_in_blank";
  prompt: string;
  choices: string[] | null;
  correct: any;
  hint: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
};

/**
 * Wraps the same StudentCustomQuizRunner students see, but with
 * previewMode on so the score-save POST doesn't fire and the post-quiz
 * CTA bounces back to the editor instead of /student.
 */
export default function PreviewRunner({
  quizId,
  questions,
}: {
  quizId: string;
  questions: Question[];
}) {
  return (
    <StudentCustomQuizRunner
      quizId={quizId}
      questions={questions}
      previewMode
    />
  );
}
