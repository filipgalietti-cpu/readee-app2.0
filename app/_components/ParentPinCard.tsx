"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, Trash2, ShieldCheck } from "lucide-react";

/**
 * Compact PIN management card for /account. Shows current state
 * (set / not set) and a 4-digit input + save / clear buttons.
 *
 * Server roundtrip via /api/play/pin handles hashing.
 */
export default function ParentPinCard({ initialHasPin }: { initialHasPin: boolean }) {
  const [hasPin, setHasPin] = useState(initialHasPin);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    if (!/^\d{4}$/.test(pin)) {
      setErr("PIN must be 4 digits.");
      return;
    }
    setErr(null);
    setOk(null);
    start(async () => {
      const res = await fetch("/api/play/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Couldn't save PIN.");
        return;
      }
      setHasPin(true);
      setPin("");
      setOk("PIN saved.");
    });
  }

  function clear() {
    if (!confirm("Remove your PIN? You'll need to use your account password to exit play mode.")) return;
    setErr(null);
    setOk(null);
    start(async () => {
      const res = await fetch("/api/play/pin", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Couldn't clear PIN.");
        return;
      }
      setHasPin(false);
      setOk("PIN removed.");
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
        <h2 className="text-base font-semibold text-zinc-900">Grown-up PIN</h2>
        {hasPin && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <KeyRound className="h-3 w-3" />
            Active
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-500">
        4-digit PIN that exits kid play mode. When set, your kid&apos;s
        device will need the PIN (instead of your full account password)
        to leave play mode and access your dashboard.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="tel"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
          placeholder="••••"
          className="w-24 rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-center text-base font-bold tracking-widest focus:border-indigo-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending || pin.length !== 4}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
          {hasPin ? "Update PIN" : "Set PIN"}
        </button>
        {hasPin && (
          <button
            type="button"
            onClick={clear}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      {ok && <p className="mt-3 text-xs font-semibold text-emerald-600">{ok}</p>}
      {err && <p className="mt-3 text-xs font-semibold text-red-600">{err}</p>}
    </section>
  );
}
