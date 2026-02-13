"use client";

import Link from "next/link";
import { useProfile } from "./_components";
import { Button, Card, ProgressBar, SectionHeader } from "./_components";

export default function Home() {
  const { profile } = useProfile();
  const accentColor = profile?.favoriteColorHex || '#10b981';

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
  <div className="text-center py-12">
    <div className="inline-block mb-4 text-6xl">📚</div>
    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
      {profile?.name ? `Welcome back, ${profile.name}!` : "Welcome to Readee"}
    </h1>
    <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
      Learn to read with fun stories designed just for you
    </p>
  </div>

  {/* Continue Learning Card */}
  {profile?.onboardingComplete && (
    <Card variant="elevated" className="p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Continue Learning</h2>
          <p className="text-zinc-600 mb-4">Pick up where you left off</p>
          <ProgressBar value={35} showLabel accentColor={accentColor} />
        </div>
        <div className="text-center">
          <div className="text-5xl mb-2">🦊</div>
          <p className="text-sm text-zinc-600">The Brave Little Fox</p>
        </div>
      </div>
    </Card>
  )}

  <div className="grid md:grid-cols-2 gap-6">
    {/* Today's Goal */}
    <Card className="p-6">
      <SectionHeader title="Today's Goal" subtitle="Keep your streak going!" />
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
            ✓
          </div>
          <div>
            <p className="font-semibold text-zinc-900">Read for 10 minutes</p>
            <p className="text-sm text-zinc-600">3 of 10 minutes</p>
          </div>
        </div>
        <ProgressBar value={30} accentColor={accentColor} />
      </div>
    </Card>

    {/* Quick Stats */}
    <Card className="p-6">
      <SectionHeader title="Your Progress" />
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 rounded-2xl bg-zinc-50">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-bold" style={{ color: accentColor }}>5</div>
          <div className="text-xs text-zinc-600">Day Streak</div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-zinc-50">
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-2xl font-bold" style={{ color: accentColor }}>120</div>
          <div className="text-xs text-zinc-600">Total XP</div>
        </div>
      </div>
    </Card>
  </div>
    </div>
  );
}
