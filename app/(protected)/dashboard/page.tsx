"use client";

import Link from "next/link";
import { useProfile } from "@/app/_components";
import { Card, StatChip, ProgressBar, SectionHeader, Button } from "@/app/_components";

export default function Dashboard() {
  const { profile } = useProfile();
  const accentColor = profile?.favoriteColorHex || '#10b981';

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Summary */}
      <div className="text-center py-8">
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          😊
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          {profile?.name || 'Reader'}
        </h1>
        <p className="text-zinc-600">Level 3 Reader</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatChip 
          icon="🔥" 
          label="Day Streak" 
          value="5 days" 
          accentColor={accentColor} 
          className="w-full justify-center md:justify-start"
        />
        <StatChip 
          icon="⭐" 
          label="Total XP" 
          value="120" 
          accentColor={accentColor}
          className="w-full justify-center md:justify-start"
        />
        <StatChip 
          icon="📖" 
          label="Stories Read" 
          value="8" 
          accentColor={accentColor}
          className="w-full justify-center md:justify-start"
        />
      </div>

      {/* Weekly Progress */}
      <Card className="p-6">
        <SectionHeader 
          title="Weekly Progress" 
          subtitle="You're doing great! Keep it up!" 
        />
        <div className="space-y-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const isToday = index === 3; // Thursday
            const completed = index < 4;
            return (
              <div key={day} className="flex items-center gap-4">
                <div className={`w-12 text-sm font-medium ${isToday ? 'text-zinc-900' : 'text-zinc-600'}`}>
                  {day}
                </div>
                <div className="flex-1">
                  <ProgressBar 
                    value={completed ? 100 : (isToday ? 60 : 0)} 
                    accentColor={accentColor}
                    size="md"
                  />
                </div>
                <div className="w-16 text-right text-sm text-zinc-600">
                  {completed ? '15 min' : (isToday ? '9 min' : '—')}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recommended Next Lesson */}
      <Card variant="bordered" accentColor={accentColor} className="p-6">
        <SectionHeader 
          title="Recommended for You" 
          subtitle="Based on your interests" 
        />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-4xl">🦊</div>
            <h3 className="text-xl font-bold text-zinc-900">The Brave Little Fox</h3>
            <p className="text-zinc-600">
              A young fox learns about courage while exploring the forest.
            </p>
            <div className="flex gap-2 flex-wrap">
              {profile?.interests?.slice(0, 2).map((interest) => (
                <span 
                  key={interest} 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  {interest}
                </span>
              ))}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                K-2
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700">
                10 min
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Link href="/reader/1">
              <Button size="lg" accentColor={accentColor}>
                Start Reading
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <SectionHeader title="Recent Activity" />
        <div className="space-y-4">
          {[
            { story: 'Robot Friends', xp: 15, time: '2 hours ago', emoji: '🤖' },
            { story: 'The Magic Library', xp: 20, time: 'Yesterday', emoji: '✨' },
            { story: 'Adventures in Space', xp: 18, time: '2 days ago', emoji: '🚀' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
              <div className="text-3xl">{activity.emoji}</div>
              <div className="flex-1">
                <p className="font-semibold text-zinc-900">{activity.story}</p>
                <p className="text-sm text-zinc-600">{activity.time}</p>
              </div>
              <div className="text-right">
                <span className="font-bold" style={{ color: accentColor }}>+{activity.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
