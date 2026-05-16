import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";
import { listCategories } from "@/lib/discover/categories";
import DiscoveryTile from "./_components/DiscoveryTile";

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
  const [{ data }, { data: authData }] = await Promise.all([
    supabase
      .from("discovery_articles")
      .select("category, slug, title, image_url, created_at")
      .eq("published_state", "live")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.auth.getUser(),
  ]);
  const articles = (data ?? []) as Latest[];
  const isSignedIn = !!authData?.user;

  // Bucket by category, keep top 3 per
  const byCategory = new Map<string, Latest[]>();
  for (const a of articles) {
    const list = byCategory.get(a.category) ?? [];
    if (list.length < 3) list.push(a);
    byCategory.set(a.category, list);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700">
          <Sparkles className="h-3 w-3" />
          Discover
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          What sounds <span className="text-violet-600">good</span> today?
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-zinc-600">
          Pick a topic. We'll bring you something fresh to read, every day.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listCategories().map((cat) => {
            const items = byCategory.get(cat.slug) ?? [];
            return (
              <Link
                key={cat.slug}
                href={`/discover/${cat.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
              >
                <div className="aspect-square w-full overflow-hidden bg-zinc-50 transition duration-500 group-hover:scale-105">
                  <DiscoveryTile category={cat.slug} />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-zinc-900">
                    {cat.label}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">{cat.blurb}</p>
                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-zinc-500">
                      {items.length > 0
                        ? `${items.length === 1 ? "1 article" : `${items.length}+ articles`}`
                        : "First articles dropping soon"}
                    </span>
                    <span className="font-bold text-violet-600 transition group-hover:text-violet-800">
                      Browse →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Latest passages strip — pulls newest 6 across all categories so
            visitors get an immediate "fresh content" signal without
            having to drill into a category first. */}
        {articles.length > 0 && (
          <section className="mt-14">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Just published</h2>
              <span className="text-xs font-semibold text-zinc-400">
                Fresh today
              </span>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 6).map((a) => (
                <li key={`${a.category}/${a.slug}`}>
                  <Link
                    href={`/discover/${a.category}/${a.slug}`}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-violet-300 hover:bg-violet-50"
                  >
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt=""
                        className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-100 to-violet-100" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                        {a.category.replace(/_/g, " ")}
                      </div>
                      <div className="truncate text-sm font-semibold text-zinc-900">
                        {a.title}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 rounded-3xl border border-violet-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">
            {isSignedIn
              ? "Pick up where your reader left off."
              : "Daily 5-minute reading practice for kids who love to learn."}
          </h2>
          <Link
            href={isSignedIn ? "/dashboard" : "/signup"}
            className="mt-4 inline-block rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            {isSignedIn ? "Back to dashboard" : "Try Readee free"}
          </Link>
        </div>
      </div>
    </main>
  );
}
