"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";

export default function ExitForm({
  hasPin,
  childId,
}: {
  hasPin: boolean;
  childId: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await fetch("/api/play/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          hasPin ? { pin: value } : { password: value },
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "That didn't work — try again.");
        return;
      }
      // Cookie cleared server-side; bounce to dashboard so the parent
      // sees their full UI again.
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          {hasPin ? "Grown-up PIN" : "Account password"}
        </span>
        <input
          type={hasPin ? "tel" : "password"}
          inputMode={hasPin ? "numeric" : "text"}
          maxLength={hasPin ? 4 : 200}
          autoFocus
          autoComplete={hasPin ? "off" : "current-password"}
          pattern={hasPin ? "[0-9]{4}" : undefined}
          value={value}
          onChange={(e) =>
            setValue(hasPin ? e.target.value.replace(/[^0-9]/g, "").slice(0, 4) : e.target.value)
          }
          placeholder={hasPin ? "••••" : "Your password"}
          className="mt-1 w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-widest focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>
      {err && (
        <p className="text-xs font-semibold text-red-600">{err}</p>
      )}
      <button
        type="submit"
        disabled={pending || (hasPin ? value.length !== 4 : value.length === 0)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}
        Unlock
      </button>
    </form>
  );
}
