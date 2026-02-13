"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProfile } from "@/app/_components";
import { Button, Card, ProgressBar } from "@/app/_components";

// Mock story content
const storyContent = {
  "1": {
    title: "The Brave Little Fox",
    emoji: "🦊",
    pages: [
      "Once upon a time, in a cozy forest, there lived a little fox named Finn.",
      "Finn was small and shy. He had never been far from his den.",
      "One sunny morning, Finn heard a strange sound. It came from deep in the forest.",
      "\"I want to see what it is,\" thought Finn. \"But I'm scared.\"",
      "Finn took a deep breath. He put one paw in front of the other.",
      "As he walked, Finn saw beautiful flowers and tall trees.",
      "The sound got louder. Finn's heart beat fast.",
      "Then Finn saw it: a little bird was stuck in a bush!",
      "\"Don't worry,\" said Finn. \"I'll help you.\" He gently freed the bird.",
      "The bird sang a happy song. Finn felt brave and proud!",
      "From that day on, Finn explored the forest every day.",
      "The End",
    ],
  },
};

export default function Reader() {
  const params = useParams();
  const storyId = params.id as string;
  const { profile } = useProfile();
  const accentColor = profile?.favoriteColorHex || '#10b981';

  const story = storyContent[storyId as keyof typeof storyContent] || {
    title: "Story Not Found",
    emoji: "📖",
    pages: ["This story is not available yet."],
  };

  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = story.pages.length;
  const progress = ((currentPage + 1) / totalPages) * 100;

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/library">
          <Button variant="ghost" className="gap-2">
            <span>←</span>
            <span>Back to Library</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-zinc-600">
          <span className="text-sm font-medium">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar value={progress} accentColor={accentColor} size="lg" />

      {/* Story Card */}
      <Card className="p-12 min-h-[500px] flex flex-col justify-between">
        {/* Story Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{story.emoji}</div>
          <h1 className="text-2xl font-bold text-zinc-900">{story.title}</h1>
        </div>

        {/* Story Content */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-3xl leading-relaxed text-zinc-900 text-center max-w-2xl font-serif">
            {story.pages[currentPage]}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
          <Button
            variant="secondary"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="gap-2"
          >
            <span>←</span>
            <span>Previous</span>
          </Button>

          {currentPage === totalPages - 1 ? (
            <Link href="/library">
              <Button accentColor={accentColor} className="gap-2">
                <span>Finish</span>
                <span>✓</span>
              </Button>
            </Link>
          ) : (
            <Button
              accentColor={accentColor}
              onClick={goToNextPage}
              className="gap-2"
            >
              <span>Next</span>
              <span>→</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Reading Tips */}
      <Card className="p-6 bg-zinc-50">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-semibold text-zinc-900 mb-1">Reading Tip</h3>
            <p className="text-sm text-zinc-600">
              Take your time with each word. It's okay to read slowly and enjoy the story!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
