import Link from "next/link";
import { BarChart3, Sparkles, Mic, BookText, ClipboardCheck, Users } from "lucide-react";

export const metadata = { title: "More · Readee" };

type Tile = {
  href: string;
  icon: typeof BarChart3;
  label: string;
  desc: string;
  tint: string; // icon chip color
  ai?: boolean;
};

const TILES: Tile[] = [
  { href: "/dashboard/ask-readee", icon: Sparkles, label: "Ask Readee", desc: "Ask the AI reading helper anything.", tint: "from-violet-500 to-pink-500", ai: true },
  { href: "/stories-for-me", icon: Sparkles, label: "Personalized Stories", desc: "Stories made just for your child.", tint: "from-fuchsia-500 to-violet-500", ai: true },
  { href: "/fluency", icon: Mic, label: "Fluency Check", desc: "Practice reading out loud.", tint: "from-sky-500 to-indigo-500" },
  { href: "/word-bank", icon: BookText, label: "Word Bank", desc: "Words your child has learned.", tint: "from-amber-500 to-orange-500" },
  { href: "/assessment-results", icon: ClipboardCheck, label: "Placement Test", desc: "Find the just-right reading level.", tint: "from-emerald-500 to-teal-500" },
  { href: "/analytics", icon: BarChart3, label: "Analytics", desc: "See progress, streaks, and stats.", tint: "from-indigo-500 to-blue-500" },
  { href: "/practice-hub/community", icon: Users, label: "Community Library", desc: "Stories shared by other families.", tint: "from-rose-500 to-pink-500" },
];

export default async function MorePage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const { child } = await searchParams;
  const q = child ? `?child=${encodeURIComponent(child)}` : "";

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          More to explore
        </h1>
        <p className="mt-2 text-base text-zinc-500 dark:text-slate-400">
          Extra tools and surprises for your reader.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map(({ href, icon: Icon, label, desc, tint, ai }) => (
          <Link
            key={href}
            href={`${href}${q}`}
            className="group relative flex flex-col rounded-3xl border-2 border-zinc-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/40"
          >
            {ai && (
              <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                AI
              </span>
            )}
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tint} shadow-sm`}>
              <Icon className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{label}</h2>
            <p className="mt-1 text-sm leading-snug text-zinc-500 dark:text-slate-400">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
