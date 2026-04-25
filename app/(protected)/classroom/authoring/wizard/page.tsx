import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import AssignmentWizard from "../_components/AssignmentWizard";
import Particles from "@/app/_components/Particles";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AssignmentWizardPage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  return (
    <div className="relative min-h-[calc(100vh-72px)] bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/60 dark:from-violet-950/30 dark:via-slate-900 dark:to-indigo-950/30">
      {/* Full-viewport mouse-reactive particles — position:fixed covers
          the whole screen behind everything (z:-10), and stays put while
          the wizard scrolls. */}
      <Particles
        fullScreen
        className="-z-10"
        quantity={150}
        color="#8b5cf6"
        ease={80}
        staticity={50}
      />

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/classroom/authoring"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          All quizzes
        </Link>
        <div className="mt-3">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            <Sparkles className="h-4 w-4" />
            Readee.ai assignment builder
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Build an assignment
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            Tell us what you want your students to work on. Readee.ai will
            write the passage, questions, and read-aloud audio in one pass.
          </p>
        </div>

        <div className="mt-8">
          <AssignmentWizard />
        </div>
      </div>
    </div>
  );
}
