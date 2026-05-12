"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/app/_components/Skeleton";

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

const MAX_BYTES = 8 * 1024 * 1024;

export default function HomeworkScanner() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleUpload(file: File) {
    setErr(null);
    setResult(null);
    // Pre-flight client-side validation so the parent isn't waiting on a
    // round-trip just to learn the file is too big or the wrong type.
    if (file.size > MAX_BYTES) {
      setErr(
        "That photo is bigger than 8 MB. Try a smaller image or zoom in tighter on the worksheet.",
      );
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErr("That doesn't look like an image. JPG, PNG, or HEIC works best.");
      return;
    }
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
        <label className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 sm:p-10 text-center transition hover:border-emerald-500 hover:bg-emerald-50">
          {/* Welcome bunny — sets the tone that this is friendly, not
              clinical. Hidden on the very smallest screens to keep the
              upload affordance the primary focus. */}
          <Image
            src="/images/ui/bunny-search.png"
            alt=""
            width={120}
            height={120}
            className="hidden h-24 w-24 object-contain sm:block"
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm sm:hidden">
            <Camera className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-emerald-900">
              Snap a photo of your kid&apos;s homework
            </div>
            <div className="mt-1 text-xs text-emerald-800">
              Readee reads the worksheet and tells you which reading skill
              it&apos;s practicing — then takes you straight to a practice
              session for that skill.
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">
            <Camera className="h-4 w-4" />
            Take a photo
          </div>
          <div className="text-[11px] text-emerald-700/70">
            JPG / PNG / HEIC · up to 8 MB
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
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-3 py-2">
            <button
              type="button"
              onClick={reset}
              disabled={pending}
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Try a different photo
            </button>
          </div>
        </div>
      )}

      {/* Loading state — show the *shape* of the result that's about to
          appear instead of a bare spinner. Reduces perceived wait + sets
          expectations for the result card layout. */}
      {pending && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reading the worksheet…
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-2/3 rounded-md" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-full mt-3" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-10 w-48 mt-3 rounded-full" />
          </div>
        </div>
      )}

      {err && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <div>{err}</div>
            <button
              type="button"
              onClick={reset}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-800 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {!result.readable ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
              <Image
                src="/images/ui/bunny-thinking.png"
                alt=""
                width={88}
                height={88}
                className="mx-auto h-20 w-20 object-contain"
              />
              <div className="mt-3 font-bold text-amber-900">
                Hmm, I can&apos;t quite make this out.
              </div>
              <div className="mx-auto mt-2 max-w-sm text-sm text-amber-800">
                {result.notes ||
                  "Try a clearer photo — make sure the text is fully in frame, well-lit, and not blurry."}
              </div>
              <ul className="mx-auto mt-3 max-w-xs text-left text-xs text-amber-700 space-y-1">
                <li>• Hold the phone steady right above the worksheet</li>
                <li>• Use good overhead light, avoid shadows</li>
                <li>• Make sure the whole question is in the frame</li>
              </ul>
              <button
                type="button"
                onClick={reset}
                className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-full bg-amber-600 px-5 text-sm font-bold text-white transition hover:bg-amber-700"
              >
                <Camera className="h-4 w-4" />
                Try another photo
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  Skill detected
                </div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">
                  {result.skillKidName || "Reading practice"}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  {result.gradeLevel && (
                    <span className="rounded-full bg-white px-2 py-0.5 font-bold text-emerald-800 border border-emerald-200">
                      Grade {result.gradeLevel}
                    </span>
                  )}
                  {result.standardId && (
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono font-bold text-zinc-700 border border-zinc-200">
                      {result.standardId}
                    </span>
                  )}
                </div>
                {result.skillSummary && (
                  <p className="mt-3 text-sm text-zinc-700 leading-relaxed">
                    {result.skillSummary}
                  </p>
                )}
                {result.standardId && (
                  <Link
                    href={`/practice-hub?standard=${encodeURIComponent(result.standardId)}`}
                    className="mt-5 inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-sm font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
                  >
                    Practice this skill on Readee
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {result.practiceQuestions.length > 0 && (
                <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Try these together
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Quick warm-ups in the same skill — read them out loud
                    with your reader before tapping the practice button above.
                  </p>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-800 marker:font-bold marker:text-emerald-600">
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

              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <RefreshCw className="h-4 w-4" />
                Scan another worksheet
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
