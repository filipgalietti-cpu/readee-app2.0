import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";
import { listCategories } from "@/lib/discover/categories";
import DiscoveryTile from "./_components/DiscoveryTile";

export const dynamic = "force-dynamic";

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
    .eq("published_state", "live")
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
        <Sparkles className="h-3 w-3" />
        Discover
      </div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        What sounds <span className="text-violet-600 dark:text-violet-400">good</span> today?
      </h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-slate-300">
        Pick a topic — we bring your reader something fresh to read, every day.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listCategories().map((cat) => {
          const items = byCategory.get(cat.slug) ?? [];
          return (
            <Link
              key={cat.slug}
              href={`/discover/${cat.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-violet-500/50"
            >
              <div className="aspect-square w-full overflow-hidden bg-zinc-50 transition duration-500 group-hover:scale-105 dark:bg-slate-950/40">
                <DiscoveryTile category={cat.slug} />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {cat.label}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
                  {cat.blurb}
                </p>
                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-zinc-500 dark:text-slate-400">
                    {items.length > 0
                      ? `${items.length === 1 ? "1 article" : `${items.length}+ articles`}`
                      : "First articles dropping soon"}
                  </span>
                  <span className="font-bold text-violet-600 transition group-hover:text-violet-800 dark:text-violet-400 dark:group-hover:text-violet-300">
                    Browse →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Latest passages strip — newest 6 across all categories so kids
          get an immediate "fresh content" signal without drilling into a
          category first. */}
      {articles.length > 0 && (
        <section className="mt-14">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Just published
            </h2>
            <span className="text-xs font-semibold text-zinc-400 dark:text-slate-500">
              Fresh today
            </span>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 6).map((a) => (
              <li key={`${a.category}/${a.slug}`}>
                <Link
                  href={`/discover/${a.category}/${a.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/10"
                >
                  {a.image_url ? (
                    <Image
                      src={a.image_url}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-500/20 dark:to-violet-500/10" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                      {a.category.replace(/_/g, " ")}
                    </div>
                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {a.title}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
