import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, BookOpenText, ArrowRight, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StoryGenerator from "./_components/StoryGenerator";

export const dynamic = "force-dynamic";

export default async function StoriesForMePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pull the parent's children + their existing personalized stories.
  const { data: kids } = await supabase
    .from("children")
    .select("id, first_name, grade, reading_level, interests")
    .eq("parent_id", user.id);
  const children = (kids ?? []) as any[];

  if (children.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-xl font-bold">Add a kid first</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Stories for me are personalized to a specific kid — name + interests.
        </p>
        <Link
          href="/settings"
          className="mt-4 inline-flex rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white"
        >
          Go to settings
        </Link>
      </div>
    );
  }

  const childIds = children.map((c) => c.id);
  const { data: stories } = await supabase
    .from("personalized_stories")
    .select(
      "id, child_id, title, cover_image_url, pages, updated_at, qc_overall",
    )
    .in("child_id", childIds)
    .order("updated_at", { ascending: false });
  const list = (stories ?? []) as any[];
  const childById = new Map(children.map((c) => [c.id, c]));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
        <Sparkles className="h-4 w-4" />
        Stories for me
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        AI stories starring{" "}
        {children.length === 1
          ? children[0].first_name
          : "your kids"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
        Pick a kid, pick how many pages, and Readee.ai writes a story where{" "}
        {children.length === 1
          ? `${children[0].first_name} is`
          : "they are"}{" "}
        the main character — illustrated, at their reading level.
      </p>

      <div className="mt-6">
        <StoryGenerator children={children} />
      </div>

      {list.length > 0 && (
        <>
          <h2 className="mt-12 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Your library
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {list.map((s) => {
              const child = childById.get(s.child_id);
              const pageCount = Array.isArray(s.pages) ? s.pages.length : 0;
              return (
                <li key={s.id}>
                  <Link
                    href={`/stories-for-me/${s.id}`}
                    className="block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
                  >
                    {s.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.cover_image_url}
                        alt=""
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100 text-violet-400">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                        For {child?.first_name ?? "kid"} ·{" "}
                        {pageCount} pages
                      </div>
                      <div className="mt-1.5 truncate text-sm font-bold text-zinc-900">
                        {s.title}
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700">
                        Read
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
