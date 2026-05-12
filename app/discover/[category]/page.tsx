import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getCategory, listCategories } from "@/lib/discover/categories";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

type ListItem = {
  slug: string;
  title: string;
  image_url: string | null;
  body: string;
  created_at: string;
};

export async function generateStaticParams() {
  // Statically render the 7 category index pages — small, stable set.
  return listCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Readee Discover" };
  return {
    title: `${cat.label} — Readee Discover`,
    description: cat.blurb,
  };
}

export default async function DiscoverCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  const supabase = await createClient();
  const { data } = await supabase
    .from("discovery_articles")
    .select("slug, title, image_url, body, created_at")
    .eq("category", category)
    .neq("qc_overall", "fail")
    .order("created_at", { ascending: false })
    .limit(60);
  const items = (data ?? []) as ListItem[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All categories
        </Link>

        <div className="mt-4 flex items-center gap-5">
          <img
            src={cat.tileImageUrl}
            alt={cat.label}
            className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
              <Sparkles className="h-3 w-3" />
              {cat.label}
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              {cat.label}
            </h1>
            <p className="mt-1 text-zinc-600">{cat.blurb}</p>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm italic text-zinc-500">
              The first {cat.label.toLowerCase()} articles drop in this
              category soon. Come back tomorrow.
            </div>
          ) : (
            items.map((a) => (
              <Link
                key={a.slug}
                href={`/discover/${category}/${a.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md"
              >
                {a.image_url && (
                  <img
                    src={a.image_url}
                    alt=""
                    className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-zinc-900">{a.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {a.body.slice(0, 140)}…
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
