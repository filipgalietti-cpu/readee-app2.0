import Link from "next/link";
import { Glyph } from "@/app/_components/Glyph";

/**
 * Showcase hub — the "what's inside Readee" landing page for
 * screen-recording tours. Three pillars (Stories, Practice,
 * Lessons), each links to its own deep showcase route.
 *
 * Public, no app chrome, designed to be the FIRST thing a
 * Screen Studio capture lands on so the camera can scroll → click
 * → drill into any pillar without auth or routing detours.
 */
export const dynamic = "force-static";

export const metadata = {
  title: "What's inside Readee",
  robots: { index: false, follow: false },
};

const PILLARS = [
  {
    href: "/showcase/stories",
    label: "Stories",
    icon: "book-open",
    title: "Original decodable tales.",
    body: "25 stories across K-4, hand-illustrated, every line read aloud. Phonics-matched to the grade, so emerging readers can actually decode them.",
    bg: "from-violet-500 to-brand-600",
    accent: "violet",
    stat: "25 stories",
  },
  {
    href: "/showcase/practice",
    label: "Practice",
    icon: "target",
    title: "Standards-aligned questions.",
    body: "911 multiple-choice questions across every K-4 reading skill. Bright illustrations, audio prompts, instant feedback.",
    bg: "from-emerald-500 to-sky-500",
    accent: "emerald",
    stat: "911 questions",
  },
] as const;

export default function ShowcaseHub() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-violet-50/40">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-700 shadow-sm">
            <Glyph name="sparkles" size={12} />
            What's inside Readee
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl">
            Read with <span className="text-violet-600">Readee.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl">
            A reading app for kids 5 to 10. Original stories. Standards-aligned
            practice. Built by a certified reading specialist.
          </p>
        </div>

        {/* Pillars */}
        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.href}
                href={p.href}
                className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-md ring-1 ring-zinc-100 transition duration-500 hover:-translate-y-1 hover:shadow-xl sm:p-10"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${p.bg} text-white shadow-soft`}>
                  <Glyph name={p.icon} size={28} />
                </div>
                <div className={`text-xs font-bold uppercase tracking-widest text-${p.accent}-600`}>
                  {p.label}
                </div>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                  {p.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-zinc-600">
                  {p.body}
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-400">{p.stat}</span>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold text-${p.accent}-600 transition group-hover:text-${p.accent}-800`}>
                    Browse
                    <Glyph name="arrow-right" size={16} className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}
