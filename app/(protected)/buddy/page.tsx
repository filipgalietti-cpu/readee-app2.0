import { Sparkles } from "lucide-react";
import BuddyShell from "./_components/BuddyShell";

export const dynamic = "force-dynamic";

export default function BuddyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
        <Sparkles className="h-4 w-4" />
        Reading buddy
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Talk to Readee
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Ask what a word means, get help sounding it out, or check your
        understanding. Tap the mic and speak — Readee answers in
        real-time.
      </p>

      <div className="mt-6">
        <BuddyShell />
      </div>
    </div>
  );
}
