"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import KidRunner from "./KidRunner";

type Question = {
  prompt: string;
  choices?: string[];
  correct?: string;
  hint?: string;
  audioUrl?: string | null;
};

type Content = {
  id: string;
  child_id: string;
  title: string | null;
  topic: string;
  passage_text: string | null;
  image_url: string | null;
  audio_url: string | null;
  questions: Question[] | null;
};

export default function LessonRunnerLauncher({
  content,
  childName,
  ctaLabel,
}: {
  content: Content;
  childName: string;
  ctaLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-violet-700 active:scale-[.99]"
      >
        <BookOpen className="h-5 w-5" />
        {ctaLabel}
      </button>

      {open && (
        <KidRunner
          content={content}
          contentId={content.id}
          childId={content.child_id}
          childName={childName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
