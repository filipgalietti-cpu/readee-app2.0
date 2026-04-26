"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { aiRegenerateQuestion } from "@/app/(protected)/classroom/authoring-actions";

/**
 * Inline "ask Readee.ai for a fresh take on this question" button.
 *
 * Replaces prompt + choices + hint in place. Image / audio context
 * stays attached because we don't touch the junction row. Server
 * action seeds the AI with the question's current prompt + the
 * parent quiz's passage so the new question stays in-theme.
 */
export default function RegenerateQuestionButton({
  quizId,
  questionId,
  kind,
}: {
  quizId: string;
  questionId: string;
  kind: "multiple_choice" | "true_false" | "fill_in_blank" | "matching_pairs";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Only MCQ + T/F have AI generators. Hide the button for the rest
  // rather than show a disabled state — keeps the row tidy.
  if (kind !== "multiple_choice" && kind !== "true_false") return null;

  function regenerate() {
    setErr(null);
    start(async () => {
      const res = await aiRegenerateQuestion({ quizId, questionId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={regenerate}
        disabled={pending}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-violet-500 transition hover:bg-violet-50 hover:text-violet-700 disabled:opacity-60 dark:hover:bg-violet-950/40"
        title="Regenerate with Readee.ai (1 credit)"
        aria-label="Regenerate this question with Readee.ai"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : err ? (
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
      </button>
      {err && (
        <span className="max-w-[160px] truncate text-[10px] font-semibold text-red-600">
          {err}
        </span>
      )}
    </div>
  );
}
