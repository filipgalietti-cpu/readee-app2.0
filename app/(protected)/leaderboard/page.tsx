"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { Crown, Carrot, Flame, ArrowRight } from "lucide-react";
import { SkeletonPage } from "@/app/_components/Skeleton";
import { EmptyState } from "@/app/_components/EmptyState";

interface LeaderEntry {
  id: string;
  name: string;
  carrots: number;
  streak: number;
  isMe: boolean;
  avatar: string;
}

/** Scoped keyframes for the podium celebration (confetti + streak flicker). */
const CELEBRATE_CSS = `
@keyframes lbFall{0%{transform:translateY(-24px) rotate(0);opacity:0}12%{opacity:1}100%{transform:translateY(220px) rotate(420deg);opacity:0}}
@keyframes lbFlicker{0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.16) rotate(3deg)}}
@keyframes lbShine{0%{transform:translateX(-140%)}40%{transform:translateX(260%)}100%{transform:translateX(260%)}}
@media (prefers-reduced-motion:reduce){.lb-anim{animation:none!important}}
`;

const CONFETTI = [
  { left: "22%", color: "#f59e0b", w: 9, h: 9, r: "2px", dur: "3.4s", delay: "0s" },
  { left: "38%", color: "#8b5cf6", w: 7, h: 12, r: "2px", dur: "4.1s", delay: ".6s" },
  { left: "52%", color: "#38bdf8", w: 10, h: 10, r: "50%", dur: "3.8s", delay: "1.2s" },
  { left: "64%", color: "#fb7185", w: 8, h: 8, r: "2px", dur: "4.4s", delay: ".3s" },
  { left: "78%", color: "#34d399", w: 9, h: 13, r: "2px", dur: "3.6s", delay: "1.8s" },
];

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<SkeletonPage cards={4} />}>
      <LeaderboardContent />
    </Suspense>
  );
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myStreak, setMyStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const meRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      if (!childId) return;

      const supabase = supabaseBrowser();
      const { data: childData } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (childData) setChild(childData as Child);

      try {
        const res = await fetch(`/api/leaderboard?child=${childId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.leaders) setLeaders(json.leaders);
        if (json.myRank) setMyRank(json.myRank);
        if (typeof json.myStreak === "number") setMyStreak(json.myStreak);
      } catch (e) {
        console.error("Failed to load leaderboard:", e);
        setLoadError(
          "We couldn't reach the leaderboard. Check your connection and try again.",
        );
      }

      setLoading(false);
    }
    load();
  }, [childId]);

  // If the child sits below the podium, glide their row into view once loaded
  // so they always land on themselves (same feel as the Journey page).
  useEffect(() => {
    if (loading || !myRank || myRank <= 3 || !meRowRef.current) return;
    const t = setTimeout(() => {
      meRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 700);
    return () => clearTimeout(t);
  }, [loading, myRank, leaders.length]);

  if (loading || !child) {
    return <SkeletonPage cards={4} />;
  }

  if (leaders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <EmptyState
          mascot="cheer"
          title="Start earning carrots!"
          description="Finish a lesson to put yourself on the board and start climbing the ranks."
          action={{ href: "/dashboard", label: "Start learning" }}
        />
      </div>
    );
  }

  const ahead = myRank && myRank > 1 ? leaders[myRank - 2] : null;
  const carrotsToAhead = ahead ? Math.max(0, ahead.carrots - child.carrots) : 0;

  // Podium order: 2nd (left) · 1st (center) · 3rd (right).
  const top3 = leaders.slice(0, 3);
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);
  const rest = leaders.slice(3);

  const subhead = !myRank
    ? "Every carrot earned climbs the board."
    : myRank === 1
      ? `You're #1, ${child.first_name}. You're leading the whole board.`
      : ahead
        ? `You're in ${ordinal(myRank)} place, ${child.first_name}. ${carrotsToAhead.toLocaleString()} carrots to pass ${ahead.name}.`
        : `You're in ${ordinal(myRank)} place, ${child.first_name}.`;

  // CTA nudge: only promise "one story" when the gap is genuinely small
  // (~one activity ≈ 25 carrots); otherwise stay motivating but honest.
  const ctaMsg = !ahead
    ? "You're on top. Keep the streak alive!"
    : carrotsToAhead <= 30
      ? `Read one story and pass ${ahead.name}!`
      : carrotsToAhead <= 120
        ? `A few more stories and you'll pass ${ahead.name}!`
        : `Keep reading to climb past ${ahead.name}!`;

  return (
    <div className="min-h-full">
      <style>{CELEBRATE_CSS}</style>
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div>
            <div className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-indigo-600">
              Leaderboard
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-indigo-950 sm:text-4xl">
              Top readers
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-lg text-zinc-600">
              {subhead}
            </p>
          </div>
        </motion.div>

        {loadError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {loadError}
          </div>
        )}

        {/* Podium */}
        {podium.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white px-4 pt-8 shadow-sm sm:px-8"
          >
            {(
              <div className="pointer-events-none absolute inset-0">
                {CONFETTI.map((c, i) => (
                  <span
                    key={i}
                    className="lb-anim absolute top-0"
                    style={{
                      left: c.left,
                      width: c.w,
                      height: c.h,
                      borderRadius: c.r,
                      background: c.color,
                      animation: `lbFall ${c.dur} linear ${c.delay} infinite`,
                    }}
                  />
                ))}
              </div>
            )}
            <div className="relative flex items-end justify-center gap-3 sm:gap-8">
              {podium.map((entry) => {
                const rank = leaders.indexOf(entry) + 1;
                return (
                  <PodiumColumn key={entry.id} entry={entry} rank={rank} />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Standings + side rail */}
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Everyone else */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="flex items-baseline justify-between border-b border-zinc-100 px-5 py-4">
              <h2 className="text-lg font-extrabold tracking-tight text-zinc-900">
                {rest.length > 0 ? "Everyone else" : "The board"}
              </h2>
              <span className="text-[13px] font-semibold text-zinc-400">
                {leaders.length} readers
              </span>
            </div>
            <div className="flex max-h-[calc(100dvh-26rem)] min-h-[16rem] flex-col gap-2 overflow-y-auto p-3">
              {(rest.length > 0 ? rest : leaders).map((entry) => {
                const rank = leaders.indexOf(entry) + 1;
                return (
                  <StandingRow
                    key={entry.id}
                    entry={entry}
                    rank={rank}
                    rowRef={entry.isMe ? meRowRef : undefined}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Side rail */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-4"
          >
            {/* Rank card */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={leaders.find((l) => l.isMe)?.avatar || "/images/avatars/default_0.png"}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-300"
                  />
                  {myRank && (
                    <span className="absolute -bottom-1 -right-1.5 rounded-full border-2 border-white bg-indigo-600 px-2 py-0.5 text-xs font-extrabold text-white">
                      #{myRank}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-extrabold text-zinc-900">
                    {myRank ? `${ordinal(myRank)} of ${leaders.length}` : "On the board"}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                    <Carrot className="h-4 w-4" strokeWidth={2} />
                    {child.carrots.toLocaleString()} carrots
                  </div>
                </div>
              </div>
              {ahead ? (
                <div className="mt-4">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-500"
                      style={{
                        width: `${Math.min(100, ahead.carrots > 0 ? (child.carrots / ahead.carrots) * 100 : 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[13px] font-bold">
                    <span className="text-zinc-500">
                      {child.carrots.toLocaleString()}
                    </span>
                    <span className="text-indigo-600">
                      {ahead.name} · {ahead.carrots.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm font-semibold text-zinc-500">
                  Nobody&rsquo;s ahead of you. Keep the lead!
                </p>
              )}
            </div>

            {/* Streak card */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" fill="currentColor" strokeWidth={0} />
                <h3 className="text-lg font-extrabold tracking-tight text-zinc-900">
                  {myStreak}-day streak
                </h3>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => {
                  const lit = i < Math.min(myStreak, 7);
                  return (
                    <div
                      key={i}
                      className={`flex h-11 items-center justify-center rounded-xl text-xs font-extrabold ${
                        lit
                          ? "bg-amber-100 text-amber-700"
                          : "border-2 border-dashed border-indigo-200 bg-indigo-50/40 text-indigo-400"
                      }`}
                    >
                      {"MTWTFSS"[i]}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-600">
                One lesson today keeps your flame lit.
              </p>
            </div>

            {/* CTA */}
            <div className="flex min-h-[132px] flex-1 items-center gap-4 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-500 p-5 shadow-sm">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/70 bg-white">
                <Image
                  src="/images/ui/bunny-cheer.png"
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="mb-3 text-[17px] font-extrabold leading-snug text-white">
                  {ctaMsg}
                </p>
                <Link
                  href={`/practice?child=${childId}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 transition-transform hover:scale-[1.03]"
                >
                  Practice now
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/** One column of the top-3 podium. Center (rank 1) sits tallest. */
function PodiumColumn({ entry, rank }: { entry: LeaderEntry; rank: number }) {
  const isFirst = rank === 1;
  const pedestal =
    rank === 1
      ? "h-40 from-amber-200 to-amber-400 text-amber-900"
      : rank === 2
        ? "h-28 from-indigo-200 to-indigo-300 text-indigo-800"
        : "h-20 from-orange-100 to-orange-200 text-orange-800";
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 18,
        delay: isFirst ? 0.05 : rank === 2 ? 0.18 : 0.3,
      }}
      className="flex w-[30%] max-w-[220px] flex-col items-center"
    >
      {isFirst && (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-md">
          <Crown className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
          Champion
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.avatar}
        alt={entry.name}
        className={`${isFirst ? "h-24 w-24 border-[5px] border-amber-400" : "h-16 w-16 border-4 border-zinc-200"} rounded-full bg-white object-cover shadow-lg`}
      />
      <div
        className={`mt-2.5 text-center font-extrabold text-indigo-950 ${isFirst ? "text-xl" : "text-base"}`}
      >
        {entry.name}
        {entry.isMe && (
          <span className="ml-1 text-xs font-bold text-indigo-500">(You)</span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-600">
          <Carrot className="h-4 w-4 text-orange-500" strokeWidth={2} />
          {entry.carrots.toLocaleString()}
        </span>
        {entry.streak > 0 && (
          <span className="inline-flex items-center gap-0.5 text-sm font-bold text-amber-600">
            <Flame
              className={`h-4 w-4 ${isFirst ? "lb-anim" : ""}`}
              fill="currentColor"
              strokeWidth={0}
              style={isFirst ? { animation: "lbFlicker 1.8s ease-in-out infinite" } : undefined}
            />
            {entry.streak}
          </span>
        )}
      </div>
      <div
        className={`relative mt-3.5 flex w-full items-center justify-center overflow-hidden rounded-t-3xl bg-gradient-to-b ${pedestal} font-extrabold`}
        style={{ fontSize: isFirst ? 56 : 40 }}
      >
        {rank}
        {isFirst && (
          <span
            className="lb-anim pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/65 to-transparent"
            style={{ animation: "lbShine 4.2s cubic-bezier(0.4,0,0.2,1) infinite" }}
          />
        )}
      </div>
    </motion.div>
  );
}

/** A single row in the "Everyone else" standings list. */
function StandingRow({
  entry,
  rank,
  rowRef,
}: {
  entry: LeaderEntry;
  rank: number;
  rowRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={rowRef}
      className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-colors ${
        entry.isMe
          ? "border-2 border-indigo-500 bg-indigo-50 shadow-[0_6px_0_#c7d2fe]"
          : "border border-zinc-200 hover:bg-zinc-50"
      }`}
    >
      <span
        className={`w-8 text-center text-xl font-extrabold ${
          entry.isMe ? "text-indigo-700" : "text-zinc-400"
        }`}
      >
        {rank}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.avatar}
        alt=""
        className={`h-10 w-10 rounded-full object-cover ${
          entry.isMe ? "ring-2 ring-indigo-400" : "ring-1 ring-zinc-200"
        }`}
      />
      <span
        className={`min-w-0 flex-1 truncate font-bold ${
          entry.isMe
            ? "text-indigo-700"
            : "text-zinc-700"
        }`}
      >
        {entry.isMe ? `You (${entry.name})` : entry.name}
      </span>
      <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-orange-600">
        <Carrot className="h-4 w-4 text-orange-500" strokeWidth={2} />
        {entry.carrots.toLocaleString()}
      </span>
      <span
        className={`inline-flex w-11 items-center justify-end gap-0.5 text-[15px] font-bold ${
          entry.streak > 0 ? "text-amber-600" : "text-zinc-300"
        }`}
      >
        <Flame
          className="h-4 w-4"
          fill="currentColor"
          strokeWidth={0}
        />
        {entry.streak}
      </span>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
