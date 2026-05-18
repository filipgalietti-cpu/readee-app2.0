import Link from "next/link";
import storyBank from "@/scripts/stories-bank.json";

/**
 * Screen-recording showcase for the landing page — all 25
 * decodable stories laid out in a grade-grouped grid, no app
 * chrome (no sidebar, no nav, no auth). Clean enough to point a
 * Screen Studio capture at and let it scroll.
 *
 * Public route — not in (protected). Renders identical to a
 * marketing page; never used by the app itself.
 */
export const dynamic = "force-static";

export const metadata = {
  title: "Stories · Readee",
  robots: { index: false, follow: false },
};

type Story = {
  id: string;
  grade: string;
  title: string;
  skill: string;
  text: string;
  questions: { prompt: string; choices: string[]; correct: string }[];
};

const SUPABASE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

function coverUrl(s: Story) {
  return `${SUPABASE_BASE}/images/stories/${s.grade}/${s.id}.png?v=5`;
}

const GRADE_ORDER = ["kindergarten", "1st", "2nd", "3rd", "4th"];
const GRADE_LABEL: Record<string, string> = {
  kindergarten: "Kindergarten",
  "1st": "1st Grade",
  "2nd": "2nd Grade",
  "3rd": "3rd Grade",
  "4th": "4th Grade",
};

export default function StoriesShowcase() {
  const stories = (storyBank as { stories: Story[] }).stories;
  const byGrade = new Map<string, Story[]>();
  for (const s of stories) {
    const arr = byGrade.get(s.grade) ?? [];
    arr.push(s);
    byGrade.set(s.grade, arr);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-700 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
            25 original stories · K — 4th
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            Stories worth <span className="text-violet-600">reading.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Original decodable tales written for early readers — every word
            chosen for the grade's phonics, every picture drawn to match.
          </p>
        </div>

        {/* Grade sections */}
        <div className="mt-20 space-y-24">
          {GRADE_ORDER.map((grade) => {
            const items = byGrade.get(grade) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={grade}>
                <div className="mb-8 flex items-baseline justify-between">
                  <h2 className="font-display text-3xl font-extrabold text-zinc-900">
                    {GRADE_LABEL[grade]}
                  </h2>
                  <span className="text-sm font-semibold text-zinc-400">
                    {items.length} stories
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {items.map((s) => (
                    <Link
                      key={s.id}
                      href={`/showcase/stories/${s.id}`}
                      className="group flex flex-col"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-md ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverUrl(s)}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-4 px-1">
                        <h3 className="font-display text-lg font-extrabold leading-tight text-zinc-900">
                          {s.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                          {s.text.slice(0, 80)}…
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

      </div>
    </main>
  );
}
