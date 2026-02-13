"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/app/components/ui/Button";
import { Icon } from "@/app/components/ui/Icon";
import { Card } from "@/app/components/ui/Card";

interface StoryPage {
  id: string;
  page_number: number;
  content: string;
  image_url: string | null;
  audio_url: string | null;
  word_timings: Array<{ word: string; start: number; end: number }> | null;
}

interface Story {
  id: string;
  title: string;
  description: string;
}

export default function Reader() {
  const params = useParams();
  const storyId = params.id as string;
  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);

  const fetchStory = useCallback(async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      const data = await response.json();

      if (data.story && data.pages) {
        setStory(data.story);
        setPages(data.pages);
      }
    } catch (error) {
      console.error("Failed to fetch story:", error);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  const handlePlayAudio = () => {
    const page = pages[currentPage];
    if (!page?.word_timings) return;

    let wordIndex = 0;

    const highlightWords = () => {
      if (wordIndex < page.word_timings!.length) {
        setHighlightedWordIndex(wordIndex);
        const timing = page.word_timings![wordIndex];
        const duration = Math.max(0, (timing.end - timing.start) * 1000);

        setTimeout(() => {
          wordIndex++;
          highlightWords();
        }, duration);
      } else {
        setHighlightedWordIndex(null);
      }
    };

    highlightWords();
  };

  const renderContent = () => {
    const page = pages[currentPage];
    if (!page) return null;

    if (page.word_timings && page.word_timings.length > 0) {
      return (
        <div className="text-2xl leading-relaxed">
          {page.word_timings.map((timing, idx) => (
            <span
              key={idx}
              className={`inline-block mx-1 transition-colors duration-200 ${
                highlightedWordIndex === idx ? "bg-yellow-200 font-bold" : "hover:bg-zinc-100"
              }`}
            >
              {timing.word}
            </span>
          ))}
        </div>
      );
    }

    return <p className="text-2xl leading-relaxed">{page.content}</p>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="book" className="mx-auto mb-4 text-zinc-500 animate-pulse" size={48} />
          <p className="text-zinc-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story || pages.length === 0) {
    return (
      <div className="container-page py-12">
        <div className="text-center">
          <p className="text-zinc-600 mb-4">Story not found.</p>
          <Link href="/library">
            <Button>Back to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const page = pages[currentPage];

  return (
    <div className="container-page py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/library">
            <Button variant="ghost" className="gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Library
            </Button>
          </Link>

          <div className="text-sm text-zinc-600">
            Page {currentPage + 1} of {pages.length}
          </div>
        </div>

        {/* Story title */}
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">{story.title}</h1>

        {/* Story content card */}
        <Card className="p-8 mb-6">
          {page.image_url && (
            <div className="mb-6 rounded-lg overflow-hidden bg-zinc-100 h-64 flex items-center justify-center">
              <Icon name="book" className="text-zinc-400" size={64} />
            </div>
          )}

          <div className="min-h-[200px] flex items-center justify-center">
            {renderContent()}
          </div>

          {/* Audio button */}
          {page.word_timings && page.word_timings.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button onClick={handlePlayAudio} className="gap-2" disabled={highlightedWordIndex !== null}>
                <Icon name="play" size={20} />
                {highlightedWordIndex !== null ? "Playing..." : "Play Audio"}
              </Button>
            </div>
          )}
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            variant="outline"
          >
            Previous
          </Button>

          {currentPage === pages.length - 1 ? (
            <Link href="/library">
              <Button>Finish Story</Button>
            </Link>
          ) : (
            <Button
              onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
              disabled={currentPage === pages.length - 1}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
