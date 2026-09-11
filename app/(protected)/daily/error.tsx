"use client";

import DailyView from "./_components/DailyView";

export default function DailyError({ reset }: { reset: () => void }) {
  return <DailyView><div role="alert" className="py-12 text-center">
    <h2 className="text-2xl font-bold text-zinc-900">The daily readings couldn’t load.</h2>
    <p className="mt-3 text-zinc-600">Please try again in a moment.</p>
    <button onClick={reset} className="mt-6 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white">Try again</button>
  </div></DailyView>;
}
