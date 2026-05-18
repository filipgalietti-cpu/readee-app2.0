import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import storyBank from "@/scripts/stories-bank.json";
import { InteractiveQuestions } from "./_InteractiveQuestions";

/**
 * Single-story showcase reader — sentence-per-line, big serif text,
 * audio playable, comprehension Qs inline. Designed for Screen
 * Studio capture, so chrome is intentionally minimal and the
 * spacing is generous.
 */
export const dynamic = "force-static";

type Story = {
  id: string;
  grade: string;
  title: string;
  skill: string;
  text: string;
  questions: { prompt: string; choices: string[]; correct: string }[];
};

const SUPABASE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;
const coverUrl = (s: Story) =>
  `${SUPABASE_BASE}/images/stories/${s.grade}/${s.id}.png?v=5`;
const audioUrl = (s: Story) =>
  `${SUPABASE_BASE}/audio/stories/${s.grade}/${s.id}-story.mp3?v=5`;

const GRADE_LABEL: Record<string, string> = {
  kindergarten: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = (storyBank as { stories: Story[] }).stories.find(
    (s) => s.id === id,
  );
  return { title: story ? `${story.title} · Readee` : "Story · Readee" };
}

export default async function ShowcaseStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = (storyBank as { stories: Story[] }).stories.find(
    (s) => s.id === id,
  );
  if (!story) notFound();

  // Sentence-per-line split. Splits on terminal punctuation, keeping
  // the punctuation attached to the sentence.
  const sentences = story.text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Back link */}
        <Link
          href="/showcase/stories"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All stories
        </Link>

        {/* Title + cover */}
        <div className="mt-8">
          <div className="text-xs font-bold uppercase tracking-widest text-violet-600">
            {GRADE_LABEL[story.grade]}
          </div>
          <h1 className="mt-2 font-display text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-6xl">
            {story.title}
          </h1>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-zinc-100 shadow-xl ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl(story)} alt="" className="w-full" />
        </div>

        {/* Listen button */}
        <div className="mt-6 flex items-center justify-center">
          <audio
            controls
            preload="none"
            src={audioUrl(story)}
            className="w-full max-w-md"
          />
        </div>

        {/* Story text — sentence per line, big serif */}
        <div className="mt-12 space-y-5">
          {sentences.map((sentence, i) => (
            <p
              key={i}
              className="text-[22px] leading-relaxed text-zinc-900 sm:text-2xl"
              style={{
                fontFamily:
                  'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
              }}
            >
              {sentence}
            </p>
          ))}
        </div>

        {/* Comprehension Qs */}
        <div className="mt-16 rounded-3xl bg-white p-8 shadow-md ring-1 ring-zinc-100">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
              Comprehension check
            </span>
          </div>
          <InteractiveQuestions questions={story.questions} />
        </div>

      </div>
    </main>
  );
}
