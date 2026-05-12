import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenText, Check } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import storiesBank from "@/scripts/stories-bank.json";
import StoryAudioButton from "./_StoryAudioButton";

export const dynamic = "force-dynamic";

/**
 * Teacher-side preview of a Readee decodable story. The kid-facing
 * /stories route requires a child profile; teachers just need to
 * eyeball the passage + comprehension Qs.
 */

type StoryQuestion = {
  prompt: string;
  choices: string[];
  correct: string;
};

type Story = {
  id: string;
  grade: string;
  title: string;
  skill: string;
  text: string;
  image_prompt?: string;
  questions: StoryQuestion[];
};

const STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

const GRADE_LABEL: Record<string, string> = {
  kindergarten: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

export default async function SampleStoryPreviewPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId: raw } = await params;
  const storyId = decodeURIComponent(raw);
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const stories: Story[] = Array.isArray(storiesBank)
    ? (storiesBank as Story[])
    : ((storiesBank as { stories?: Story[] }).stories ?? []);
  const story = stories.find((s) => s.id === storyId);
  if (!story) notFound();

  const imageUrl = `${STORAGE}/images/stories/${story.grade}/${story.id}.png`;
  const audioUrl = `${STORAGE}/audio/stories/${story.grade}/${story.id}-story.mp3`;
  const gradeLabel = GRADE_LABEL[story.grade] ?? story.grade;
  const sentences = story.text.split(/(?<=[.!?])\s+/).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/classroom/library"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to library
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
          <BookOpenText className="h-4 w-4" />
          Decodable story preview
          <span className="text-zinc-300">·</span>
          <span>{gradeLabel}</span>
          <span className="text-zinc-300">·</span>
          <span className="font-mono">{story.skill}</span>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {story.title}
        </h1>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="aspect-[16/9] w-full bg-zinc-50 dark:bg-slate-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-3 p-5">
          <StoryAudioButton url={audioUrl} />
          <div className="space-y-1.5 text-base leading-relaxed text-zinc-900 dark:text-white">
            {sentences.map((s, i) => (
              <p key={i}>{s}</p>
            ))}
          </div>
        </div>
      </div>

      {story.questions.length > 0 && (
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            Comprehension check ({story.questions.length})
          </h2>
          <ol className="mt-3 space-y-3">
            {story.questions.map((q, idx) => (
              <li
                key={idx}
                className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {idx + 1}. {q.prompt}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  {q.choices.map((c) => {
                    const isCorrect = q.correct === c;
                    return (
                      <li
                        key={c}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 ${
                          isCorrect
                            ? "bg-green-100 font-semibold text-green-800 dark:bg-green-950/40 dark:text-green-300"
                            : "bg-zinc-50 text-zinc-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isCorrect && <Check className="h-3 w-3" />}
                        {c}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
