"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { Card, StatChip, ProgressBar, SectionHeader, Button } from "@/app/_components";

const AVATARS = ["😊", "🦊", "🐱", "🦋", "🐻"];
const ACCENT = "#4f46e5"; // indigo-600

export default function Dashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChildren() {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // No children state
  if (children.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-6xl">📚</div>
        <h1 className="text-2xl font-bold text-zinc-900">No children added yet</h1>
        <p className="text-zinc-600 max-w-md mx-auto">
          It looks like no children are linked to your account. Complete the signup questionnaire to get started.
        </p>
      </div>
    );
  }

  // Child dashboard view
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

  // Child selector view
  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900">Who&apos;s reading today?</h1>
        <p className="text-zinc-600 mt-2">Select a reader to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {children.map((child, index) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child)}
            className="group text-left"
          >
            <Card className="p-8 hover:shadow-lg hover:border-indigo-300 transition-all duration-200 cursor-pointer group-hover:scale-[1.02]">
              <div className="text-center space-y-3">
                <div
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl"
                  style={{ backgroundColor: "#eef2ff" }}
                >
                  {AVATARS[index % AVATARS.length]}
                </div>
                <h2 className="text-xl font-bold text-zinc-900">{child.first_name}</h2>
                {child.grade && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                    {child.grade}
                  </span>
                )}
                <div className="flex justify-center gap-4 pt-2 text-sm text-zinc-500">
                  <span>⭐ {child.xp} XP</span>
                  <span>🔥 {child.streak_days}d</span>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

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
    <div className="space-y-8 pb-12">
      {/* Header with back/switcher */}
      {hasMultiple && (
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            ← All Readers
          </button>
          <div className="ml-auto">
            <select
              value={child.id}
              onChange={(e) => {
                const next = children.find((c) => c.id === e.target.value);
                if (next) onSwitch(next);
              }}
              className="text-sm border border-zinc-300 rounded-lg px-3 py-1.5 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {children.map((c, i) => (
                <option key={c.id} value={c.id}>
                  {AVATARS[i % AVATARS.length]} {c.first_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Profile greeting */}
      <div className="text-center py-6">
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
          style={{ backgroundColor: "#eef2ff" }}
        >
          {avatar}
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-1">
          Hey {child.first_name}!
        </h1>
        <p className="text-zinc-600">Ready to read today?</p>
        {child.grade && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
            {child.grade}
          </span>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatChip
          icon="⭐"
          label="Total XP"
          value={child.xp}
          accentColor={ACCENT}
          className="w-full justify-center md:justify-start"
        />
        <StatChip
          icon="📖"
          label="Stories Read"
          value={child.stories_read}
          accentColor={ACCENT}
          className="w-full justify-center md:justify-start"
        />
        <StatChip
          icon="🔥"
          label="Day Streak"
          value={`${child.streak_days} days`}
          accentColor={ACCENT}
          className="w-full justify-center md:justify-start"
        />
      </div>

      {/* Start Reading CTA */}
      <Card variant="bordered" accentColor={ACCENT} className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-zinc-900">Start a new reading session</h2>
            <p className="text-zinc-600">
              Jump into a story and earn XP along the way!
            </p>
          </div>
          <Link href="/reader/1">
            <Button size="lg" accentColor={ACCENT}>
              Start Reading
            </Button>
          </Link>
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card className="p-6">
        <SectionHeader
          title="Weekly Progress"
          subtitle="Keep up the great work!"
        />
        <div className="space-y-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (day, index) => {
              const isToday = index === new Date().getDay() - 1;
              const completed = index < (new Date().getDay() - 1);
              return (
                <div key={day} className="flex items-center gap-4">
                  <div
                    className={`w-12 text-sm font-medium ${
                      isToday ? "text-zinc-900" : "text-zinc-600"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="flex-1">
                    <ProgressBar
                      value={completed ? 100 : isToday ? 30 : 0}
                      accentColor={ACCENT}
                      size="md"
                    />
                  </div>
                  <div className="w-16 text-right text-sm text-zinc-600">
                    {completed ? "15 min" : isToday ? "5 min" : "—"}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <SectionHeader title="Recent Activity" />
        <div className="space-y-4">
          {child.stories_read > 0 ? (
            [
              { story: "Robot Friends", xp: 15, time: "2 hours ago", emoji: "🤖" },
              { story: "The Magic Library", xp: 20, time: "Yesterday", emoji: "✨" },
              { story: "Adventures in Space", xp: 18, time: "2 days ago", emoji: "🚀" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors"
              >
                <div className="text-3xl">{activity.emoji}</div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900">{activity.story}</p>
                  <p className="text-sm text-zinc-600">{activity.time}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold" style={{ color: ACCENT }}>
                    +{activity.xp} XP
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-zinc-500 py-4">
              No activity yet. Start reading to see your progress here!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
