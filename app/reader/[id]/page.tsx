"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function Reader() {
  const params = useParams();
  const storyId = params.id;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/library"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        ← Back to Library
      </Link>
      
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Story Reader</h1>
        <p className="text-gray-700 mb-4">
          This is a placeholder for story ID: <span className="font-semibold">{storyId}</span>
        </p>
        <p className="text-gray-600">
          The actual story reader functionality will be implemented here.
        </p>
      </div>
    </div>
  );
}
