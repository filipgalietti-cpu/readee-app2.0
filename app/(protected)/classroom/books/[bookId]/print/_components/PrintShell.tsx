"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

type Page = {
  position: number;
  text: string;
  image_url: string | null;
};

/**
 * Print-friendly book layout. One page per printed sheet via CSS
 * page-break-after. Browser "Print" or "Save as PDF" produces a real
 * book-shaped PDF without a server-side PDF generator.
 */
export default function PrintShell({
  title,
  patternLabel,
  gradeLevel,
  coverImageUrl,
  pages,
}: {
  title: string;
  patternLabel: string;
  gradeLevel: string | null;
  coverImageUrl: string | null;
  pages: Page[];
}) {
  // Auto-open the print dialog so the teacher can save to PDF instantly.
  useEffect(() => {
    const t = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white">
      {/* Print stylesheet */}
      <style jsx global>{`
        @page {
          size: letter;
          margin: 0.5in;
        }
        @media print {
          html,
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .book-page {
            page-break-after: always;
            min-height: 9.5in;
          }
          .book-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>

      {/* Top bar (hidden in print) */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-6 py-3 shadow-sm">
        <Link
          href="."
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to book
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700"
        >
          <Printer className="h-3.5 w-3.5" />
          Print again / save PDF
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-6">
        {/* Cover page */}
        <div className="book-page flex flex-col items-center justify-center text-center">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt=""
              className="mb-8 h-80 w-full max-w-md rounded-3xl object-cover"
            />
          ) : null}
          <div className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
            {gradeLevel ?? "K-2"} · {patternLabel}
          </div>
          <h1
            className="mt-4 text-5xl font-extrabold text-zinc-900"
            style={{
              fontFamily:
                'Andika, "Comic Sans MS", "Trebuchet MS", system-ui, sans-serif',
            }}
          >
            {title}
          </h1>
          <p className="mt-12 text-xs text-zinc-400">
            Built with Readee.ai
          </p>
        </div>

        {/* Body pages */}
        {pages.map((p) => (
          <div
            key={p.position}
            className="book-page flex flex-col items-center justify-start pt-6"
          >
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url}
                alt=""
                className="h-80 w-full max-w-2xl rounded-2xl object-cover"
              />
            ) : (
              <div className="h-80 w-full max-w-2xl rounded-2xl border-2 border-dashed border-zinc-200" />
            )}
            <p
              className="mx-auto mt-10 max-w-xl text-center text-3xl font-medium leading-snug text-zinc-900"
              style={{
                fontFamily:
                  'Andika, "Comic Sans MS", "Trebuchet MS", system-ui, sans-serif',
              }}
            >
              {p.text || "(blank page)"}
            </p>
            <div className="mt-auto pt-8 text-xs font-semibold text-zinc-400">
              {p.position}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
