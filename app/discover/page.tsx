import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";
import { listCategories } from "@/lib/discover/categories";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export const metadata = {
  title: "Discover — Readee",
  description:
    "Browse our growing library of fact-checked, kid-friendly reading passages — Science, History, Nature, and more.",
};

type Latest = {
  category: string;
  slug: string;
  title: string;
  image_url: string | null;
  created_at: string;
};

export default async function DiscoverIndexPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discovery_articles")
    .select("category, slug, title, image_url, created_at")
    .neq("qc_overall", "fail")
    .order("created_at", { ascending: false })
    .limit(50);
  const articles = (data ?? []) as Latest[];

  // Bucket by category, keep top 3 per
  const byCategory = new Map<string, Latest[]>();
  for (const a of articles) {
    const list = byCategory.get(a.category) ?? [];
    if (list.length < 3) list.push(a);
    byCategory.set(a.category, list);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
          <Sparkles className="h-3 w-3" />
          Readee Discover
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          Read something new today.
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Fresh, fact-checked, kid-friendly reading passages — built every day
          for K-4 students. Every piece is grade-level checked, every fact
          grounded against Wikipedia, every question pedagogically reviewed.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {listCategories().map((cat) => {
            const items = byCategory.get(cat.slug) ?? [];
            return (
              <section
                key={cat.slug}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="text-xl font-bold text-zinc-900">
                    {cat.label}
                  </h2>
                  <Link
                    href={`/discover/${cat.slug}`}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800"
                  >
                    Browse all →
                  </Link>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{cat.blurb}</p>
                {items.length === 0 ? (
                  <p className="mt-4 text-xs italic text-zinc-400">
                    First articles dropping soon — check back tomorrow.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {items.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/discover/${a.category}/${a.slug}`}
                          className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 transition hover:border-violet-200 hover:bg-violet-50"
                        >
                          {a.image_url && (
                            <img
                              src={a.image_url}
                              alt=""
                              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                            />
                          )}
                          <span className="text-sm font-semibold text-zinc-900">
                            {a.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-indigo-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">
            Daily 5-minute reading practice for kids who love to learn.
          </h2>
          <Link
            href="/signup"
            className="mt-4 inline-block rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Try Readee free
          </Link>
        </div>
      </div>
    </main>
  );
}
