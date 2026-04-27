"use client";

import { useState, useTransition } from "react";
import {
  ScrollText,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { generateConferenceNotes } from "@/lib/ai/path-actions";

/**
 * Conference-notes generator drawer. Teacher hits the button → AI
 * reads the kid's recent activity and drafts a 2-paragraph
 * parent-conference summary the teacher can edit + copy.
 */
export default function ConferenceNotesButton({
  childId,
  childFirstName,
}: {
  childId: string;
  childFirstName: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [summary, setSummary] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    setErr(null);
    setSummary("");
    setNextSteps("");
    setOpen(true);
    start(async () => {
      const res = await generateConferenceNotes({ childId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSummary(res.notes.summary);
      setNextSteps(res.notes.next_steps);
    });
  }

  function copyAll() {
    const blob = `${childFirstName ?? "Student"} — Conference Notes\n\n${summary}\n\nNext steps:\n${nextSteps}`;
    navigator.clipboard.writeText(blob);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <button
        type="button"
        onClick={generate}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-4 py-1.5 text-xs font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:opacity-60 dark:bg-slate-900 dark:hover:bg-violet-950/30"
      >
        {pending && !open ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ScrollText className="h-3.5 w-3.5" />
        )}
        Conference notes
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={pending ? undefined : () => setOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
                  <Sparkles className="h-3 w-3" />
                  Readee.ai
                </div>
                <h3 className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">
                  Conference notes — {childFirstName ?? "Student"}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                  Editable. Copy and paste into your conference doc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {pending && (
              <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Reading the data and drafting…
              </div>
            )}

            {err && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {err}
              </div>
            )}

            {!pending && !err && summary && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    Summary
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={5}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    Next steps
                  </label>
                  <textarea
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={generate}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
                  >
                    Re-draft
                  </button>
                  <button
                    type="button"
                    onClick={copyAll}
                    className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy all
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
