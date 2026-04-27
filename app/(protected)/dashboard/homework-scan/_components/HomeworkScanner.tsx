"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Upload,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

type Result = {
  readable: boolean;
  extractedText: string;
  gradeLevel: string;
  standardId: string;
  skillKidName: string;
  skillSummary: string;
  practiceQuestions: string[];
  notes: string;
};

export default function HomeworkScanner() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleUpload(file: File) {
    setErr(null);
    setResult(null);
    setPreviewUrl(URL.createObjectURL(file));
    setPending(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/homework-scan", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) {
        setErr(json.error ?? "Scan failed.");
      } else {
        setResult(json.result as Result);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Scan failed.");
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setPreviewUrl(null);
    setResult(null);
    setErr(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {!previewUrl && (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-12 text-center transition hover:border-emerald-500 hover:bg-emerald-100">
          <Camera className="h-12 w-12 text-emerald-600" />
          <div>
            <div className="text-base font-bold text-emerald-900">
              Snap a photo or pick from library
            </div>
            <div className="mt-0.5 text-xs text-emerald-700">
              JPG / PNG / HEIC up to 8 MB. Make sure the text is readable.
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
        </label>
      )}

      {previewUrl && (
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Homework preview"
            className="max-h-80 w-full bg-zinc-50 object-contain"
          />
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-4 py-2">
            <button
              type="button"
              onClick={reset}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
            >
              <RefreshCw className="h-3 w-3" />
              Try a different photo
            </button>
          </div>
        </div>
      )}

      {pending && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Reading the worksheet…
        </div>
      )}

      {err && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {!result.readable ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <div className="font-bold">Hmm, I can&apos;t make this out.</div>
              <div className="mt-1 text-xs">
                {result.notes ||
                  "Try a clearer photo with the text fully in frame and good lighting."}
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  Skill detected
                </div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">
                  {result.skillKidName || "Reading practice"}
                </div>
                <div className="mt-1 text-xs text-zinc-600">
                  {[
                    result.gradeLevel ? `Grade ${result.gradeLevel}` : null,
                    result.standardId || null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                {result.skillSummary && (
                  <p className="mt-3 text-sm text-zinc-700">
                    {result.skillSummary}
                  </p>
                )}
                {result.standardId && (
                  <Link
                    href={`/practice-hub?standard=${encodeURIComponent(result.standardId)}`}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    Practice this skill on Readee
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {result.practiceQuestions.length > 0 && (
                <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Try these together
                  </div>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-800">
                    {result.practiceQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                </div>
              )}

              {result.extractedText && (
                <details className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
                  <summary className="cursor-pointer font-semibold text-zinc-600">
                    Show the text Readee read
                  </summary>
                  <p className="mt-2 whitespace-pre-line">{result.extractedText}</p>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
