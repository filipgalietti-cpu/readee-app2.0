"use client";

import { useState } from "react";
import { Copy, Check, Mail, MessageCircle } from "lucide-react";

export default function ReferralShareCard({
  shareUrl,
  code,
}: {
  shareUrl: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; user can select manually */
    }
  }

  const subject = encodeURIComponent("Try Readee — I think you'd love it");
  const body = encodeURIComponent(
    `Hey! I've been using Readee for my classroom and thought you'd love it too. It's a K-4 reading comprehension tool built by a reading specialist, with AI lesson/passage generation.\n\nSign up through this link and we both get 200 Readee.ai credits:\n\n${shareUrl}`,
  );
  const emailHref = `mailto:?subject=${subject}&body=${body}`;
  const smsHref = `sms:?&body=${encodeURIComponent(
    `Try Readee — I think you'd love it. Sign up here and we both get 200 AI credits: ${shareUrl}`,
  )}`;

  return (
    <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 shadow-sm dark:border-violet-900/40 dark:from-violet-950/20 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            Your referral link
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-zinc-900 dark:text-white">
            {shareUrl}
          </div>
          <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-slate-400">
            Code: <span className="font-mono font-bold">{code}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => copy(shareUrl)}
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy link
            </>
          )}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-violet-200 pt-4 dark:border-violet-900/40">
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-slate-400">
          Share via
        </span>
        <a
          href={emailHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-950/30"
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </a>
        <a
          href={smsHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-950/30"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Text
        </a>
      </div>
    </div>
  );
}
