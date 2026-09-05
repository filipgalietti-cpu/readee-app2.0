import Link from "next/link";
import { Glyph, type GlyphName } from "@/app/_components/Glyph";

export const metadata = { title: "More · Readee" };

type Tile = {
  href: string;
  icon: GlyphName;
  label: string;
  desc: string;
  tint: string; // icon chip color
  ai?: boolean;
};

const TILES: Tile[] = [
  { href: "/journey/library", icon: "book", label: "More support", desc: "The full lesson library, for extra practice on any skill.", tint: "from-violet-500 to-purple-500" },
  { href: "/discover", icon: "compass", label: "Discover", desc: "Explore reading passages by topic.", tint: "from-cyan-500 to-blue-500" },
  { href: "/levels", icon: "star", label: "Levels", desc: "See your reading level and how far you've climbed.", tint: "from-yellow-500 to-amber-500" },
  { href: "/luna", icon: "sparkles", label: "Luna", desc: "Read aloud, ask questions, and make stories with your AI buddy.", tint: "from-violet-500 to-indigo-500", ai: true },
  { href: "/word-bank", icon: "book", label: "Word Bank", desc: "Words your child has learned.", tint: "from-amber-500 to-orange-500" },
  { href: "/assessment-results", icon: "clipboard-check", label: "Placement Test", desc: "Find the just-right reading level.", tint: "from-emerald-500 to-teal-500" },
  { href: "/analytics", icon: "bar-chart3", label: "Analytics", desc: "See progress, streaks, and stats.", tint: "from-indigo-500 to-blue-500" },
  { href: "/learning-report", icon: "file-text", label: "Reading Report", desc: "Your child's reading progress at a glance.", tint: "from-sky-500 to-cyan-500" },
  { href: "/stories", icon: "book-open", label: "Read to me", desc: "Decodable stories read aloud, sentence by sentence.", tint: "from-rose-500 to-pink-500" },
  { href: "/help", icon: "life-buoy", label: "Help & Support", desc: "FAQs and a way to reach us.", tint: "from-slate-500 to-zinc-500" },
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
        <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          More to explore
        </h1>
        <p className="mt-2 text-base text-zinc-500">
          Extra tools and surprises for your reader.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map(({ href, icon: Icon, label, desc, tint, ai }) => (
          <Link
            key={href}
            href={`${href}${q}`}
            className="group relative flex flex-col rounded-3xl border-2 border-zinc-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
          >
            {ai && (
              <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                AI
              </span>
            )}
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tint} shadow-sm`}>
              <Glyph name={Icon} size={28} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">{label}</h2>
            <p className="mt-1 text-sm leading-snug text-zinc-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
