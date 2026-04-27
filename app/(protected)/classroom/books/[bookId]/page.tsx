import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpenText,
  Sparkles,
  Printer,
  Download,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import BookReader from "./_components/BookReader";

export const dynamic = "force-dynamic";

type Page = {
  position: number;
  text: string;
  image_url: string | null;
};

export default async function BookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ built?: string; warn?: string }>;
}) {
  const { bookId } = await params;
  const { built, warn } = await searchParams;
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();
  const { data: book } = await supabase
    .from("custom_books")
    .select(
      "id, title, phonics_pattern, pattern_label, grade_level, pages, cover_image_url",
    )
    .eq("id", bookId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!book) notFound();
  const b = book as any;
  const pages = (b.pages ?? []) as Page[];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="print:hidden">
        <Link
          href="/classroom/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All books
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
              <BookOpenText className="h-4 w-4" />
              Decodable book
              {b.grade_level && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span>{b.grade_level}</span>
                </>
              )}
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {b.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
              Pattern: <span className="font-semibold">{b.pattern_label}</span> ·{" "}
              {pages.length} page{pages.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/classroom/books/${bookId}/print`}
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / save PDF
            </Link>
          </div>
        </div>

        {built === "1" && warn && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div>
              <div className="font-bold">Book built — with warnings.</div>
              <div className="mt-0.5 text-xs">{warn}</div>
            </div>
          </div>
        )}
        {built === "1" && !warn && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 text-sm text-violet-900">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600" />
            <div>
              <div className="font-bold">Your book is ready.</div>
              <div className="mt-0.5 text-xs">
                Read it on screen below, or hit Print / save PDF to put it in
                kids&apos; take-home folders.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <BookReader pages={pages} title={b.title} />
      </div>
    </div>
  );
}
