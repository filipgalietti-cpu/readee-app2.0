"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Icon } from "../components/ui/Icon";

interface Story {
  id: string;
  title: string;
  description: string;
  grade_level: string;
  unlocked: boolean;
}

export default function Library() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories");
      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-12">
        <div className="text-center">
          <Icon name="book" className="mx-auto mb-4 text-blue-500 animate-pulse" size={48} />
          <p className="text-zinc-600">Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 mb-2">Story Library</h1>
        <p className="text-zinc-600">Choose a story to start reading</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div key={story.id}>
            {story.unlocked ? (
              <Link href={`/reader/${story.id}`} className="block">
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {story.grade_level}
                      </span>
                      <Icon name="book" className="text-blue-500" size={20} />
                    </div>
                    <CardTitle>{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-600">{story.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="h-full opacity-60 cursor-not-allowed">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-zinc-500 bg-zinc-100 rounded-full">
                      {story.grade_level}
                    </span>
                    <Icon name="lock" className="text-zinc-400" size={20} />
                  </div>
                  <CardTitle className="text-zinc-500">{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">{story.description}</p>
                  <p className="text-xs text-zinc-500 mt-3">🔒 Complete more lessons to unlock</p>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
