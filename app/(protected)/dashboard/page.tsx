"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";

const AVATARS = ["😊", "🦊", "🐱", "🦋", "🐻"];

export default function Dashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChildren() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching children:", error);
        setLoading(false);
        return;
      }

      const kids = (data || []) as Child[];
      setChildren(kids);
      if (kids.length === 1) {
        setSelectedChild(kids[0]);
      }
      setLoading(false);
    }
    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return <EmptyState />;
  }

  if (selectedChild) {
    return (
      <ChildDashboard
        child={selectedChild}
        children={children}
        onBack={() => setSelectedChild(null)}
        onSwitch={setSelectedChild}
      />
    );
  }

  return <ChildSelector children={children} onSelect={setSelectedChild} />;
}

/* ─── Empty State ─────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-4xl mb-6">
        📚
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">
        No children added yet
      </h1>
      <p className="text-zinc-500 max-w-sm mb-8">
        Complete the signup questionnaire to add your children and get started
        with Readee.
      </p>
      <a
        href="https://readee-site.vercel.app"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
      >
        Get Started
      </a>
    </div>
  );
}

/* ─── Child Selector ──────────────────────────────────── */

function ChildSelector({
  children,
  onSelect,
}: {
  children: Child[];
  onSelect: (c: Child) => void;
}) {
  return (
    <div className="py-10 space-y-10 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Who&apos;s reading today?
        </h1>
        <p className="text-zinc-500 mt-2">Select a reader to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {children.map((child, index) => (
          <button
            key={child.id}
            onClick={() => onSelect(child)}
            className="group text-left w-full"
          >
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group-hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {AVATARS[index % AVATARS.length]}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-zinc-900 truncate">
                    {child.first_name}
                  </h2>
                  {child.grade && (
                    <span className="text-xs font-medium text-indigo-600">
                      {child.grade}
                    </span>
                  )}
                </div>
                <div className="text-right text-xs text-zinc-400 space-y-1">
                  <div>{child.xp} XP</div>
                  <div>{child.streak_days}d streak</div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Child Dashboard ─────────────────────────────────── */

function ChildDashboard({
  child,
  children,
  onBack,
  onSwitch,
}: {
  child: Child;
  children: Child[];
  onBack: () => void;
  onSwitch: (c: Child) => void;
}) {
  const childIndex = children.findIndex((c) => c.id === child.id);
  const avatar = AVATARS[childIndex % AVATARS.length];
  const hasMultiple = children.length > 1;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Nav */}
      {hasMultiple && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            &larr; All Readers
          </button>
          <select
            value={child.id}
            onChange={(e) => {
              const next = children.find((c) => c.id === e.target.value);
              if (next) onSwitch(next);
            }}
            className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {children.map((c, i) => (
              <option key={c.id} value={c.id}>
                {AVATARS[i % AVATARS.length]} {c.first_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Greeting */}
      <div className="text-center pt-4">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 mx-auto mb-4 flex items-center justify-center text-4xl">
          {avatar}
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Hey {child.first_name}!
        </h1>
        <p className="text-zinc-500 mt-1">Ready to read today?</p>
        <div className="flex justify-center gap-2 mt-3">
          {child.grade && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              {child.grade}
            </span>
          )}
          {child.reading_level && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
              {child.reading_level}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="⭐" label="Total XP" value={String(child.xp)} />
        <StatCard
          icon="📖"
          label="Stories Read"
          value={String(child.stories_read)}
        />
        <StatCard
          icon="🔥"
          label="Streak"
          value={`${child.streak_days}d`}
        />
      </div>

      {/* Primary CTA: Assessment if not taken, Start Reading if done */}
      {child.reading_level ? (
        <Link href="/reader/1" className="block">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-center text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer">
            <div className="text-3xl mb-2">📖</div>
            <div className="text-lg font-bold">Start Reading</div>
            <div className="text-indigo-200 text-sm mt-1">
              Jump into a story and earn XP
            </div>
          </div>
        </Link>
      ) : (
        <Link href={`/assessment?child=${child.id}`} className="block">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 p-6 text-center text-white hover:from-indigo-700 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-lg font-bold">Take Your Reading Quiz!</div>
            <div className="text-indigo-200 text-sm mt-1">
              A fun 10-question quiz to find {child.first_name}&apos;s reading level
            </div>
          </div>
        </Link>
      )}

      {/* Weekly Progress */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-base font-bold text-zinc-900 mb-4">
          Weekly Progress
        </h3>
        <div className="space-y-3">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-10 text-xs font-medium text-zinc-500">
                {day}
              </span>
              <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "0%" }} />
              </div>
              <span className="w-12 text-right text-xs text-zinc-400">
                —
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-base font-bold text-zinc-900 mb-4">
          Recent Activity
        </h3>
        <p className="text-sm text-zinc-400 text-center py-6">
          No activity yet. Start reading to see your progress here!
        </p>
      </div>
    </div>
  );
}

/* ─── Stat Card ───────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-zinc-900">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}
