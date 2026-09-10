"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BunnyReaction } from "@/app/_components/Bunny/Bunny";
import "../../placement/_components/placement.css";
import { Glyph } from "@/app/_components/Glyph";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { reportFailure } from "@/lib/observability/critical";
import {
  ENROLLMENT_GRADES,
  ReaderSetupSchema,
  readerDraftKey,
  type ReaderSetupInput,
} from "@/lib/onboarding/reader-setup";

export default function ParentReaderSetup({
  parentId,
  preview = false,
}: {
  parentId: string;
  preview?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<ReaderSetupInput["grade"] | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<ReaderSetupInput | null>(null);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const key = readerDraftKey(parentId);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw);
        if (typeof draft.name === "string") setName(draft.name.slice(0, 50));
        if (ENROLLMENT_GRADES.some((g) => g.value === draft.grade)) setGrade(draft.grade);
        const parsed = ReaderSetupSchema.safeParse(draft.pending);
        if (parsed.success) {
          setPending(parsed.data);
          setName(parsed.data.first_name);
          setGrade(parsed.data.grade);
        }
      }
    } catch {
      /* Storage is optional; the in-memory attempt still supports retry. */
    }
    setReady(true);
    if (!preview) trackFunnelClient("funnel.reader_setup_viewed");
  }, [key, preview]);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({ name, grade, pending }));
    } catch {
      /* private browsing */
    }
  }, [key, name, grade, pending, ready]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (preview) {
      router.push(
        "/demo/placement-run?grade=" + ENROLLMENT_GRADES.findIndex((g) => g.value === grade),
      );
      return;
    }
    if (!grade || !ready || inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setError("");
    const attempt = pending ?? { requestId: crypto.randomUUID(), first_name: name, grade };
    setPending(attempt);
    // Persist before the request: a refresh after a lost response must reuse the same attempt.
    try {
      sessionStorage.setItem(key, JSON.stringify({ name, grade, pending: attempt }));
    } catch {
      /* in-memory retry remains */
    }
    try {
      const response = await fetch("/api/onboarding/reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt),
      });
      const result = await response.json();
      if (!response.ok || !result.ok || typeof result.childId !== "string") {
        if (response.status === 401)
          setError("Please sign in again. Your details are kept for when you return.");
        else if (response.status === 409)
          setError("Your account already has a reader. Open your dashboard to continue.");
        else throw new Error("reader_setup_failed");
        return;
      }
      // Keep the idempotent attempt until this component unmounts. If navigation
      // is interrupted, clicking again recovers the same saved child.
      router.push(`/placement/ready?child=${encodeURIComponent(result.childId)}`);
    } catch (cause) {
      reportFailure("onboarding.reader_client", cause, { route: "/dashboard" });
      setError("We couldn’t finish saving. Your details are still here. Please try again.");
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="pa-reader-setup" data-reader-setup>
      <Link href="/explore" className="pa-setup-exit">
        Explore first <span aria-hidden="true">↗</span>
      </Link>
      <div className="pa-setup-grid">
        <div className="pa-setup-copy">
          <h1>Set up your reader.</h1>
          <p className="pa-setup-intro">
            Grown-ups, start here. Then Readee and Luna will welcome your child.
          </p>
          <div className="mt-6 hidden space-y-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-6 lg:block">
            <div className="flex gap-3">
              <Glyph name="mic" size={24} className="shrink-0 text-violet-600" />
              <div>
                <p className="font-semibold text-zinc-900">
                  The assessment finds their starting point.
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Luna listens as your child reads and answers a few questions.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Glyph name="book-open" size={24} className="shrink-0 text-violet-600" />
              <div>
                <p className="font-semibold text-zinc-900">Lessons help them build from there.</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Their reading journey begins with a free lesson at the recommended level.
                </p>
              </div>
            </div>
          </div>
        </div>
        <form
          onSubmit={save}
          className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)] sm:p-8"
        >
          <label htmlFor="reader-name" className="block text-xl font-bold text-zinc-800">
            What should we call your child?
          </label>
          <input
            id="reader-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="Reader"
            autoComplete="off"
            disabled={!ready || !!pending}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-xl text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-zinc-50"
          />
          <p className="mt-3 text-base text-zinc-600">
            A first name or nickname is fine. Leave it blank to use “Reader.”
          </p>
          <fieldset className="mt-6" disabled={!ready || !!pending}>
            <legend className="text-xl font-bold text-zinc-800">
              What grade is your child enrolled in?
            </legend>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {ENROLLMENT_GRADES.map((g) => (
                <label key={g.value} className="cursor-pointer text-center">
                  <input
                    type="radio"
                    name="enrollment-grade"
                    value={g.value}
                    checked={grade === g.value}
                    onChange={() => setGrade(g.value)}
                    className="peer sr-only"
                  />
                  <span className="block rounded-xl border border-zinc-300 px-2 py-3 text-base font-semibold text-zinc-700 peer-checked:border-violet-600 peer-checked:bg-violet-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-600">
                    {g.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Their reading level may be different. The assessment helps us choose where to start.
            </p>
          </fieldset>
          {error && (
            <div role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
              {error}
              <Link
                href={error.includes("sign in") ? "/login?redirect=%2Fdashboard" : "/dashboard"}
                className="mt-2 block font-semibold underline"
              >
                {error.includes("sign in") ? "Sign in" : "Return to dashboard"}
              </Link>
            </div>
          )}
          <button
            type="submit"
            disabled={!ready || !grade || saving}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-4 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)] hover:from-violet-700 hover:to-violet-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600 disabled:cursor-default disabled:opacity-50"
          >
            {saving ? "Saving your reader…" : error ? "Try saving again" : "Save and continue"}
            <Glyph name="arrow-right" size={20} />
          </button>
          <p className="mt-3 text-center text-sm text-zinc-500">
            We’ll save their profile and keep their progress here.
          </p>
          <Link
            href="/explore"
            onClick={() => trackFunnelClient("funnel.reader_setup_skipped")}
            className="mt-6 block text-center text-sm font-semibold text-violet-700 underline underline-offset-4"
          >
            Explore first
          </Link>
        </form>
        <div className="pa-setup-bunny" aria-label="Readee waves hello" role="img">
          <BunnyReaction outfitId="bunny_classic" state="wave" bubbleText="Hello!" />
        </div>
      </div>
    </main>
  );
}
