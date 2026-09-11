"use client";
import { useEffect } from "react";
import { reportFailure } from "@/lib/observability/critical";
export default function JourneyError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    reportFailure("journey.load", error, { route: "/journey" });
  }, [error]);
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Your reading journey is saved.</h1>
      <p className="mt-3 text-zinc-600">We couldn’t open it just now. Please try again.</p>
      <button
        className="mt-6 min-h-12 rounded-xl bg-violet-600 px-6 font-semibold text-white"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
