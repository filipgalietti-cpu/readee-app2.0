"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Lock, ArrowLeft, Carrot } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useChildStore } from "@/lib/stores/child-store";
import { useLifetimeCarrots } from "@/lib/levels/use-lifetime-carrots";
import { READER_LEVELS, computeLevel } from "@/lib/levels/levels";
import type { Child } from "@/lib/db/types";
import { SkeletonPage } from "@/app/_components/Skeleton";

/**
 * Browse-all-levels page. Kid + parent surface — shows every level on
 * the ladder with the kid's name on the rung they're currently sitting
 * on. Each row spells out the carrot threshold + level name + a teaser
 * of what's next, so the kid has a tangible "how do I get to X" goal.
 *
 * Pattern matches the rest of the parent surfaces: store → DB
 * fallback for the child id, friendly bounce to /dashboard if nothing
 * resolves. Locked levels show the carrot gap; achieved levels show
 * a check.
 */
export default function LevelsPage() {
  return (
    <Suspense fallback={<SkeletonPage cards={4} />}>
      <LevelsContent />
    </Suspense>
  );
}

function LevelsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childIdParam = searchParams.get("child");

  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  // Same defensive resolve pattern as /practice-hub, /analytics, etc.
  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = supabaseBrowser();
      let resolvedId = childIdParam;
      if (!resolvedId) {
        const store = useChildStore.getState();
        const storeChild = store.childData || store.children[0] || null;
        if (storeChild) {
          resolvedId = storeChild.id;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: kids } = await supabase
              .from("children")
              .select("*")
              .eq("parent_id", user.id)
              .order("created_at", { ascending: true })
              .limit(1);
            if (kids && kids.length > 0) resolvedId = kids[0].id;
          }
        }
      }
      if (!resolvedId) {
        if (alive) {
          router.replace("/dashboard");
          setLoading(false);
        }
        return;
      }
      if (!childIdParam && resolvedId && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("child", resolvedId);
        window.history.replaceState(null, "", url.toString());
      }
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("id", resolvedId)
        .single();
      if (!alive) return;
      if (data) setChild(data as Child);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [childIdParam, router]);

  const { lifetimeCarrots, loading: carrotsLoading } = useLifetimeCarrots(
    child?.id ?? null,
  );

  if (loading || !child || carrotsLoading) {
    return <SkeletonPage cards={4} />;
  }

  const info = computeLevel(lifetimeCarrots);
  const childName = child.first_name;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mt-4 text-center">
        <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          {childName}&apos;s ladder
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Reader Levels
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Earn{" "}
          <Carrot className="inline h-3.5 w-3.5 -mt-0.5 text-orange-500" strokeWidth={2.4} />{" "}
          carrots from lessons, practice, and stories to climb the ladder.
        </p>
      </div>

      {/* Current standing — pulled out so the kid sees it first. */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-6 overflow-hidden rounded-3xl bg-gradient-to-br ${info.current.accent.gradFrom} ${info.current.accent.gradTo} p-5 text-white shadow-xl`}
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-inner">
            <info.current.icon className="h-9 w-9" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/80">
              Right now
            </div>
            <h2 className="mt-0.5 text-2xl font-extrabold leading-tight">
              Level {info.current.number} — {info.current.name}
            </h2>
            <p className="mt-1 text-sm text-white/85">
              {info.lifetimeCarrots.toLocaleString()} lifetime carrots
              {info.next
                ? ` · ${info.next.threshold - info.lifetimeCarrots} more to ${info.next.name}`
                : " · top of the ladder!"}
            </p>
          </div>
        </div>
        {info.next && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(info.progress01 * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full bg-white"
            />
          </div>
        )}
      </motion.div>

      {/* The full ladder */}
      <ol className="mt-6 space-y-2">
        {READER_LEVELS.map((lvl, idx) => {
          const achieved = info.current.number >= lvl.number;
          const isCurrent = info.current.number === lvl.number;
          const Icon = lvl.icon;
          return (
            <motion.li
              key={lvl.number}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`flex items-center gap-3 rounded-2xl border bg-white p-3 dark:bg-slate-900 ${
                isCurrent
                  ? "border-indigo-300 ring-2 ring-indigo-200 dark:border-indigo-700 dark:ring-indigo-900/40"
                  : achieved
                    ? "border-zinc-200 dark:border-slate-700"
                    : "border-zinc-100 opacity-70 dark:border-slate-800"
              }`}
            >
              <span
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                  achieved
                    ? `${lvl.accent.bg} ${lvl.accent.fg}`
                    : "bg-zinc-100 text-zinc-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-zinc-400">
                    Lv {lvl.number}
                  </span>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    {lvl.name}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      You are here
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                  {achieved ? (
                    <>Unlocked at {lvl.threshold.toLocaleString()} carrots</>
                  ) : (
                    <>
                      {Math.max(0, lvl.threshold - info.lifetimeCarrots).toLocaleString()}{" "}
                      more carrots to unlock
                    </>
                  )}
                </div>
              </div>
              {achieved ? (
                <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" strokeWidth={2.4} />
              ) : (
                <Lock className="h-4 w-4 flex-shrink-0 text-zinc-300 dark:text-slate-600" strokeWidth={2.2} />
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
