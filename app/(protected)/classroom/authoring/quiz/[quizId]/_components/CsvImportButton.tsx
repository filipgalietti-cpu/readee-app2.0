"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  X,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { bulkImportQuestionsFromCsv } from "../../../../authoring-actions";

export default function CsvImportButton({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][] | null>(null);
  const [globalErr, setGlobalErr] = useState<string | null>(null);
  const [result, setResult] = useState<
    | { imported: number; errors: { row: number; message: string }[] }
    | null
  >(null);
  const [pending, start] = useTransition();

  function reset() {
    setCsvText("");
    setFileName(null);
    setPreviewRows(null);
    setGlobalErr(null);
    setResult(null);
  }

  async function handleFile(file: File) {
    setGlobalErr(null);
    setResult(null);
    if (file.size > 500_000) {
      setGlobalErr("File is too large. Max ~500 KB (about 5,000 rows).");
      return;
    }
    const text = await file.text();
    setCsvText(text);
    setFileName(file.name);
    // Quick client-side preview using a tiny parser inline (5 rows).
    setPreviewRows(quickPreview(text));
  }

  function submit() {
    if (!csvText) {
      setGlobalErr("Pick a CSV file first.");
      return;
    }
    setGlobalErr(null);
    start(async () => {
      const res = await bulkImportQuestionsFromCsv({
        quizId,
        csvText,
      });
      if (!res.ok) {
        setGlobalErr(res.error);
        return;
      }
      setResult({ imported: res.imported, errors: res.errors });
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        <Upload className="h-3.5 w-3.5" />
        Import from CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          />
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Import questions from CSV
              </h3>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="text-sm">
                  <div className="font-bold text-zinc-900 dark:text-white">
                    First time? Start with the template.
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                    Download, edit in Excel/Sheets, save as CSV, upload below.
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/api/classroom/csv-template"
                    download
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Template
                  </a>
                  <Link
                    href="/classroom/authoring/csv-help"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    How it works
                  </Link>
                </div>
              </div>

              <label
                htmlFor="csv-input"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-600"
              >
                <Upload className="h-8 w-8 text-zinc-400" />
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {fileName ? fileName : "Drag a CSV here, or click to browse"}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                  Max ~500 KB · UTF-8 · header row required
                </div>
                <input
                  id="csv-input"
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>

              {previewRows && previewRows.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
                    Preview (first 5 rows)
                  </div>
                  <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200 dark:border-slate-700">
                    <table className="min-w-full text-[11px]">
                      <thead className="bg-zinc-50 text-left dark:bg-slate-950">
                        <tr>
                          {previewRows[0].map((h, i) => (
                            <th
                              key={i}
                              className="px-2 py-1.5 font-bold text-zinc-700 dark:text-slate-300"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-900">
                        {previewRows.slice(1, 6).map((r, i) => (
                          <tr key={i} className="border-t border-zinc-100 dark:border-slate-800">
                            {r.map((c, j) => (
                              <td key={j} className="max-w-[200px] truncate px-2 py-1 text-zinc-600 dark:text-slate-400">
                                {c || <span className="text-zinc-300">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {globalErr && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {globalErr}
                </div>
              )}

              {result && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Imported {result.imported} question{result.imported === 1 ? "" : "s"}.
                    </div>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                        {result.errors.length} row{result.errors.length === 1 ? "" : "s"} skipped
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-amber-900 dark:text-amber-200">
                        {result.errors.slice(0, 20).map((e, i) => (
                          <li key={i}>
                            <strong>Row {e.row}:</strong> {e.message}
                          </li>
                        ))}
                        {result.errors.length > 20 && (
                          <li className="text-amber-700 dark:text-amber-400">
                            …and {result.errors.length - 20} more.
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {result ? "Done" : "Cancel"}
              </button>
              {!result && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || !csvText}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Import questions
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Tiny in-component CSV preview (only first 6 lines, comma-only). */
function quickPreview(text: string): string[][] {
  const lines = text.split(/\r?\n/).slice(0, 6);
  return lines.filter(Boolean).map((l) => {
    // naive split — the server uses the real parser. Just for preview.
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (const ch of l) {
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === "," && !inQ) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out;
  });
}
