import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import AskReadeeWizard from "./_components/AskReadeeWizard";
import MyAiLibrary from "./_components/MyAiLibrary";
import AskReadeeFlow from "./_components/AskReadeeFlow";

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

  // Byline consent state. Drives whether the share toggle prompts the
  // one-time "show your name?" dialog on first use.
  const { data: bylineRow } = await supabase
    .from("profiles")
    .select("community_byline_consent, community_display_name")
    .eq("id", profile.id)
    .maybeSingle();
  const bylineConsent =
    (bylineRow as any)?.community_byline_consent ?? null;
  const bylineDisplayName =
    ((bylineRow as any)?.community_display_name as string | null) ?? null;

  // ── Tonight's Read smart picker ─────────────────────────────
  // Derive a personalized topic suggestion + a "why this" reason
  // string. Picks signals in order of preference:
  //   1. Most-frequent meaningful word from past topics (kid history)
  //   2. Last topic + "Continue the {theme}?" prompt
  //   3. Time-of-day fallback (morning vs evening)
  //   4. Generic kid-safe default
  const recentForFirstChild = ((libraryRows ?? []) as any[]).filter(
    (l) => l.child_id === children[0]?.id,
  );
  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "of", "in", "on", "at",
    "to", "for", "with", "about", "is", "are", "was", "were", "be",
    "been", "being", "this", "that", "those", "it", "its", "by",
    "from", "as", "kid", "child", "story", "passage", "short",
    "something", "would", "love", "favorite", "themed",
  ]);
  function topicTokens(topic: string): string[] {
    return (topic ?? "")
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
  }
  const tokenCounts = new Map<string, number>();
  for (const r of recentForFirstChild) {
    for (const t of topicTokens(r.topic ?? "")) {
      tokenCounts.set(t, (tokenCounts.get(t) ?? 0) + 1);
    }
  }
  const recentTopics = Array.from(tokenCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  const hourLocal = new Date().getHours();
  const isEvening = hourLocal >= 18 || hourLocal < 5;

  let suggestedTopic: string;
  let suggestedReason: string;
  if (recentTopics.length >= 2) {
    suggestedTopic = `A new adventure with ${recentTopics[0]} and ${recentTopics[1]}`;
    suggestedReason = `Based on what ${children[0]?.first_name ?? "your kid"} has been into lately.`;
  } else if (recentTopics.length === 1) {
    suggestedTopic = `A fresh ${recentTopics[0]} story they haven't read yet`;
    suggestedReason = `${children[0]?.first_name ?? "Your kid"} keeps coming back to ${recentTopics[0]} — let's give them a new one.`;
  } else if (isEvening) {
    suggestedTopic = "A calm bedtime adventure";
    suggestedReason = "Quick wind-down read for the evening.";
  } else {
    suggestedTopic = "A surprise story they'll love";
    suggestedReason = "First reading? Pick a mode below and Readee builds it.";
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          Readee.ai for families
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Ask Readee
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          A reading made just for your child — in 3 quick taps.
        </p>
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

      {/* Slideshow — the parent-friendly path. 3 taps to a built reading. */}
      <AskReadeeFlow
        children={children}
        recentTopics={recentTopics}
        suggestedTopic={suggestedTopic}
        suggestedReason={suggestedReason}
        isPremium={isPremium}
      />

      {(libraryRows ?? []).length > 0 && (
        <details className="group mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-zinc-700 dark:text-slate-200">
            <span>
              Past creations{" "}
              <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                {(libraryRows ?? []).length}
              </span>
            </span>
            <span className="text-xs text-zinc-400 group-open:hidden">Show</span>
            <span className="hidden text-xs text-zinc-400 group-open:inline">
              Hide
            </span>
          </summary>
          <div className="mt-3">
            <MyAiLibrary
              items={(libraryRows ?? []) as any[]}
              children={children}
              bylineConsent={bylineConsent}
              bylineDisplayName={bylineDisplayName}
            />
          </div>
        </details>
      )}

      <details
        id="customize"
        className="group mt-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40"
        open={!!preSelectedChildId}
      >
        <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-zinc-700 dark:text-slate-200">
          <span>Custom build</span>
          <span className="text-[11px] font-normal text-zinc-400">
            Pick the topic, length, and skill yourself
          </span>
        </summary>
        <div className="mt-3">
          <AskReadeeWizard
            children={children}
            initialChildId={preSelectedChildId ?? null}
            isPremium={isPremium}
          />
        </div>
      </details>
    </div>
  );
}
