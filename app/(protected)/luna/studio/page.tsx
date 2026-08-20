import Link from "next/link";
import { ArrowLeft, Sparkles, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { hasAnyPaidTier } from "@/lib/plan/teacher-gate";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import StoryStudio from "./_components/StoryStudio";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata = {
  title: "Luna Story Studio - Readee",
  description: "Write your own story with Luna and share it with other kids.",
};

export default async function StoryStudioPage() {
  const profile = await requireProfile();

  const supabase = await createClient();
  const { data: childrenRows } = await supabase
    .from("children")
    .select("id, first_name, grade, reading_level, equipped_items")
    .eq("parent_id", profile.id)
    .order("created_at", { ascending: true });
  const child = (childrenRows ?? [])[0] as
    | { id: string; first_name: string; grade: string | null; equipped_items?: any }
    | undefined;

  if (!child) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/luna"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-violet-700 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Luna
        </Link>
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-12 text-center shadow-sm ring-1 ring-violet-100 dark:from-violet-950/30 dark:via-slate-900 dark:to-indigo-950/30 dark:ring-violet-900/40">
          <Sparkles className="mx-auto h-10 w-10 text-violet-500" />
          <h1 className="mt-4 text-xl font-extrabold text-zinc-900 dark:text-white">
            Add a child first
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
            Story Studio writes at your child&apos;s reading level. Add a child on
            the dashboard to get started.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPremium = hasAnyPaidTier((profile.plan ?? "free") as string);

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/luna"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-violet-700 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Luna
        </Link>
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-12 text-center shadow-sm ring-1 ring-violet-100 dark:from-violet-950/30 dark:via-slate-900 dark:to-indigo-950/30 dark:ring-violet-900/40">
          <Lock className="mx-auto h-10 w-10 text-violet-500" />
          <h1 className="mt-4 text-xl font-extrabold text-zinc-900 dark:text-white">
            Story Studio is a Readee+ feature
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
            Unlock unlimited stories with Luna, and let {child.first_name} share
            their creations with other kids.
          </p>
          <Link
            href="/upgrade?reason=luna"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            See Readee+
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StoryStudio
      childId={child.id}
      childName={child.first_name}
      avatarSrc={getChildAvatarImage(child as any, 0)}
    />
  );
}
