import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import AskReadeeWizard from "./_components/AskReadeeWizard";
import MyAiLibrary from "./_components/MyAiLibrary";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AskReadeePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; built?: string }>;
}) {
  const profile = await requireProfile();
  const { child: preSelectedChildId } = await searchParams;

  const supabase = await createClient();
  const { data: childrenRows } = await supabase
    .from("children")
    .select("id, first_name, reading_level")
    .eq("parent_id", profile.id)
    .order("created_at", { ascending: true });
  const children = (childrenRows ?? []) as {
    id: string;
    first_name: string;
    reading_level: string | null;
  }[];

  if (children.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="mt-8 rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <Sparkles className="mx-auto h-10 w-10 text-violet-500" />
          <h1 className="mt-4 text-xl font-extrabold text-zinc-900 dark:text-white">
            Add a child first
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
            Ask Readee tailors content to your child&apos;s reading level.
            Add a child on the dashboard to get started.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Free plan: bounce to upgrade. We still show the page framing so users
  // know what they're getting, but the wizard itself is gated at submit.
  const isPremium = profile.plan === "premium";

  // Load the library for all children so the parent can see existing
  // content across their kids in one place.
  const childIds = children.map((c) => c.id);
  const { data: libraryRows } = await supabase
    .from("child_ai_content")
    .select(
      "id, child_id, kind, topic, grade_level, title, passage_text, image_url, audio_url, play_count, created_at, shared",
    )
    .in("child_id", childIds)
    .order("created_at", { ascending: false })
    .limit(50);

  // Trusted-parent status — auto-approval on community submissions
  // kicks in after 5 approved shares. Surface it as a badge on this
  // page so the parent sees momentum.
  const { count: approvedShareCount } = await supabase
    .from("community_passages")
    .select("id", { count: "exact", head: true })
    .eq("source_parent_id", profile.id)
    .eq("status", "approved");
  const approvedShares = approvedShareCount ?? 0;
  const TRUSTED_THRESHOLD = 5;
  const isTrustedParent = approvedShares >= TRUSTED_THRESHOLD;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            <Sparkles className="h-4 w-4" />
            Readee.ai for families
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Ask Readee
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            Tell Readee what your child should read about. You&apos;ll get
            a decodable passage, comprehension questions, and
            read-aloud audio in one pass — at their exact grade level.
          </p>
        </div>
      </div>

      {isTrustedParent && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-yellow-950/30 dark:text-amber-100">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-300" />
          <div>
            <div className="font-bold">Trusted contributor 🌟</div>
            <div className="mt-0.5 text-xs text-amber-800 dark:text-amber-200">
              You&apos;ve had {approvedShares} community submissions approved.
              Your future shares now go live immediately — no human review
              wait.
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <AskReadeeWizard
          children={children}
          initialChildId={preSelectedChildId ?? null}
          isPremium={isPremium}
        />
      </div>

      {(libraryRows ?? []).length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            My AI library
          </h2>
          <div className="mt-3">
            <MyAiLibrary
              items={(libraryRows ?? []) as any[]}
              children={children}
            />
          </div>
        </div>
      )}
    </div>
  );
}
