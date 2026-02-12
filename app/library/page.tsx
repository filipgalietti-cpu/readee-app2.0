"use client";

import Link from "next/link";

// Mock story data
const stories = [
  {
    id: "1",
    title: "The Brave Little Fox",
    gradeLevel: "K-2",
    description: "A young fox learns about courage while exploring the forest for the first time.",
  },
  {
    id: "2",
    title: "Adventures in Space",
    gradeLevel: "3-5",
    description: "Join astronaut Maya as she discovers a mysterious planet with friendly aliens.",
  },
  {
    id: "3",
    title: "The Magic Library",
    gradeLevel: "3-5",
    description: "Emma finds a secret library where books come to life and take her on amazing journeys.",
  },
  {
    id: "4",
    title: "Robot Friends",
    gradeLevel: "K-2",
    description: "A story about a robot who learns what it means to be a good friend.",
  },
  {
    id: "5",
    title: "Mystery at the Museum",
    gradeLevel: "6-8",
    description: "Detective twins solve the case of the missing ancient artifact before the grand opening.",
  },
];

export default function Library() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Story Library</h1>
      <p className="text-gray-600 mb-8">Choose a story to start reading</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/reader/${story.id}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-gray-300"
          >
            <div className="mb-2">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full">
                {story.gradeLevel}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h2>
            <p className="text-gray-600">{story.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
