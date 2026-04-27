import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Sparkles,
  ClipboardPen,
  BookText,
  BookOpenText,
  Layers,
  ArrowRight,
  Clock,
} from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";

export const dynamic = "force-dynamic";

const TILES = [
  {
    href: "/classroom/authoring/wizard",
    icon: ClipboardPen,
    label: "Build a quiz",
    description: "Passage + multiple choice / true-false / matching pairs. Assign as a custom assignment.",
    timing: "~1 min",
    accent: "from-indigo-500 to-violet-600",
  },
  {
    href: "/classroom/authoring/lesson-wizard",
    icon: BookText,
    label: "Build a lesson",
    description: "Karaoke slideshow with images + read-aloud per slide. Download as .pptx for Google Slides / PowerPoint.",
    timing: "~2 min",
    accent: "from-violet-500 to-fuchsia-600",
  },
  {
    href: "/classroom/authoring/book-wizard",
    icon: BookOpenText,
    label: "Build a decodable book",
    description: "Multi-page reader targeting a specific phonics pattern. Print-ready for the take-home folder.",
    timing: "~2 min",
    accent: "from-fuchsia-500 to-pink-600",
  },
  {
    href: "/classroom/authoring/leveled-wizard",
    icon: Layers,
    label: "Build a leveled passage",
    description: "Same story at three reading levels — easy / on-level / advanced. One assignment for a mixed-ability class.",
    timing: "~1 min",
    accent: "from-pink-500 to-rose-600",
  },
];

export default async function BuildHubPage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700">
          <Sparkles className="h-3 w-3" />
          Readee.ai
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          What do you want to build?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500 dark:text-slate-400">
          Pick what you need. Every tool produces standards-aligned, kid-safe
          content with a quality-control pass — and you own the file.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TILES.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${t.accent} text-white shadow-sm`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <Clock className="h-3 w-3" />
                {t.timing}
              </div>
              <h2 className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-white">
                {t.label}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
                {t.description}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-700">
                Start
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 text-center text-xs text-zinc-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        Every build runs a quality-control pass — passage, questions, image —
        and writes a report Jennifer reviews at <span className="font-semibold">/admin/qc</span>.
      </div>
    </div>
  );
}
