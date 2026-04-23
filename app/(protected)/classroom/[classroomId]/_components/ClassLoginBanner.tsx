"use client";

import { useState } from "react";
import { Copy, Check, Monitor } from "lucide-react";

export default function ClassLoginBanner({
  code,
  baseUrl,
}: {
  code: string;
  baseUrl: string;
}) {
  const url = `${baseUrl}/class/${code}`;
  const [copied, setCopied] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-violet-950/30">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
        <Monitor className="h-3.5 w-3.5" />
        Students sign in here
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
            {url}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
            Project this on the board. Students type the 6-letter code, tap
            their name, and they&apos;re in. No email or password needed.
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="rounded-lg bg-white px-3 py-1.5 font-mono text-lg font-extrabold tracking-[0.25em] text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-200">
            {code}
          </div>
          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-indigo-300 bg-white px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-700 dark:bg-slate-900 dark:text-indigo-300"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy URL"}
          </button>
        </div>
      </div>
    </div>
  );
}
