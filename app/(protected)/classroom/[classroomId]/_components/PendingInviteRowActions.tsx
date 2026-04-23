"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, X, Loader2, Copy, Check } from "lucide-react";
import { resendInvite, revokeInvite } from "../../invite-actions";

export default function PendingInviteRowActions({
  inviteId,
  hasEmail,
  inviteUrl,
}: {
  inviteId: string;
  hasEmail: boolean;
  inviteUrl: string;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  function copy() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function resend() {
    setErr(null);
    start(async () => {
      const res = await resendInvite({ inviteId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  function revoke() {
    if (!confirm("Revoke this invite? The parent link will stop working.")) return;
    setErr(null);
    start(async () => {
      const res = await revokeInvite({ inviteId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-7 items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 text-[11px] font-semibold text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        title="Copy invite link"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      {hasEmail && (
        <button
          type="button"
          onClick={resend}
          disabled={pending}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 text-[11px] font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300"
          title="Resend invite email"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
          Resend
        </button>
      )}
      <button
        type="button"
        onClick={revoke}
        disabled={pending}
        className="inline-flex h-7 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 text-[11px] font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        title="Revoke invite"
      >
        <X className="h-3 w-3" />
        Revoke
      </button>
      {err && <span className="ml-2 text-[11px] text-red-600">{err}</span>}
    </div>
  );
}
