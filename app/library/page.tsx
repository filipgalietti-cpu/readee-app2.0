"use client";

import Link from "next/link";
import { useProfile } from "@/app/_components";
import { Card, Badge, SectionHeader } from "@/app/_components";

// Mock story data
const stories = [
  {
    id: "1",
    title: "The Brave Little Fox",
    gradeLevel: "K-2",
    difficulty: "Easy",
    estimatedTime: "10 min",
    category: "Adventure",
    emoji: "🦊",
    description: "A young fox learns about courage while exploring the forest for the first time.",
  },
  {
    id: "2",
    title: "Adventures in Space",
    gradeLevel: "3-5",
    difficulty: "Medium",
    estimatedTime: "15 min",
    category: "Science",
    emoji: "🚀",
    description: "Join astronaut Maya as she discovers a mysterious planet with friendly aliens.",
  },
  {
    id: "3",
    title: "The Magic Library",
    gradeLevel: "3-5",
    difficulty: "Medium",
    estimatedTime: "12 min",
    category: "Fantasy",
    emoji: "✨",
    description: "Emma finds a secret library where books come to life and take her on amazing journeys.",
  },
  {
    id: "4",
    title: "Robot Friends",
    gradeLevel: "K-2",
    difficulty: "Easy",
    estimatedTime: "8 min",
    category: "Science",
    emoji: "🤖",
    description: "A story about a robot who learns what it means to be a good friend.",
  },
  {
    id: "5",
    title: "Mystery at the Museum",
    gradeLevel: "6-8",
    difficulty: "Hard",
    estimatedTime: "20 min",
    category: "Mystery",
    emoji: "🔍",
    description: "Detective twins solve the case of the missing ancient artifact before the grand opening.",
  },
  {
    id: "6",
    title: "Jungle Explorer",
    gradeLevel: "K-2",
    difficulty: "Easy",
    estimatedTime: "10 min",
    category: "Adventure",
    emoji: "🌴",
    description: "Follow Leo as he discovers amazing animals in the rainforest.",
  },
];

export default function Library() {
  const { profile } = useProfile();
  const accentColor = profile?.favoriteColorHex || '#10b981';

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center py-8">
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2">
          Story Library
        </h1>
        <p className="text-lg text-zinc-600">
          Choose a story to start your reading adventure
        </p>
      </div>
      
      <SectionHeader 
        title="All Stories" 
        subtitle={`${stories.length} stories available`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
<Link key={story.id} href={`/reader/${story.id}`}>
  <Card className="p-6 h-full hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
    <div className="flex flex-col h-full">
      {/* Emoji Icon */}
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
        {story.emoji}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge accentColor={accentColor}>
          {story.gradeLevel}
        </Badge>

        <Badge
          variant={
            story.difficulty === "Easy"
              ? "success"
              : story.difficulty === "Medium"
              ? "info"
              : "warning"
          }
        >
          {story.difficulty}
        </Badge>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-opacity-80 transition-colors">
        {story.title}
      </h2>

      {/* Description */}
      <p className="text-sm text-zinc-600 mb-4 flex-1">
        {story.description}
      </p>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <span>⏱️</span>
          <span>{story.estimatedTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <span>📂</span>
          <span>{story.category}</span>
        </div>
              </div>
            </div>
          </Card>
        </Link>
        ))}
      </div>
    </div>
  );
}
