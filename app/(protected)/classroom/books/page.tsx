import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenText, Sparkles, ArrowRight, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import AssetCardActions from "../_components/AssetCardActions";

export const dynamic = "force-dynamic";

export default async function BooksHomePage() {
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("custom_books")
    .select(
      "id, title, phonics_pattern, pattern_label, grade_level, cover_image_url, pages, updated_at, qc_overall",
    )
    .eq("teacher_id", profile.id)
    .order("updated_at", { ascending: false });

  const list = (rows ?? []) as {
    id: string;
    title: string;
    phonics_pattern: string;
    pattern_label: string;
    grade_level: string | null;
    cover_image_url: string | null;
    pages: any[];
    updated_at: string;
    qc_overall: string;
  }[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            <BookOpenText className="h-4 w-4" />
            Decodable books
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Your decodable books
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            Short multi-page readers targeting one phonics pattern. Kids
            read these aloud — every page practices the pattern.
          </p>
        </div>
        <Link
          href="/classroom/authoring/book-wizard"
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Sparkles className="h-4 w-4" />
          Build a book
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-sm ring-1 ring-indigo-100 p-12 text-center dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <BookOpenText className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            Your first book
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
            Pick a phonics pattern your class is on, and we&apos;ll write a
            short kid-friendly book that practices it on every page —
            illustrations included. Print it for the take-home folder.
          </p>
          <Link
            href="/classroom/authoring/book-wizard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Sparkles className="h-4 w-4" />
            Build with Readee.ai
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {list.map((b) => {
            const pageCount = Array.isArray(b.pages) ? b.pages.length : 0;
            return (
              <li key={b.id} className="relative">
                <AssetCardActions type="book" id={b.id} initialTitle={b.title} />
                <Link
                  href={`/classroom/books/${b.id}`}
                  className="block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-800"
                >
                  {b.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.cover_image_url}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400 dark:from-indigo-950/40 dark:to-violet-950/40">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
                      {b.grade_level ?? "K-2"}
                      <span className="text-zinc-300">·</span>
                      <span>
                        {pageCount} page{pageCount === 1 ? "" : "s"}
                      </span>
                      {b.qc_overall === "warn" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                          Review
                        </span>
                      )}
                      {b.qc_overall === "fail" && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700">
                          Failed QC
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 truncate text-sm font-bold text-zinc-900 dark:text-white">
                      {b.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
                      {b.pattern_label}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                      Open
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
