"use client";

import { useState } from "react";
import { X, Loader2, Sparkles, Check } from "lucide-react";
import { CREDIT_PACKS, type CreditPackSku } from "@/lib/ai/credit-balance";
import { ShineBorder } from "@/app/components/magicui/shine-border";

/**
 * Reusable button that pops a modal of credit packs and fires one-time
 * Stripe Checkout. Use on teacher + parent budget surfaces.
 *
 * Default styling: light pill with violet text + a soft animated rainbow
 * shine on the border (Magic UI ShineBorder). Matches the AI surface
 * shimmer without going full dark RainbowButton.
 */
export default function TopUpCreditsButton({
  pool,
  label = "Buy more credits",
  variant = "secondary",
}: {
  pool: "teacher" | "parent";
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<CreditPackSku | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function checkout(sku: CreditPackSku) {
    setErr(null);
    setPending(sku);
    try {
      const res = await fetch("/api/checkout/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, pool }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErr(data.error ?? "Couldn't start checkout.");
    } catch {
      setErr("Couldn't reach the checkout service.");
    } finally {
      setPending(null);
    }
  }

  const btnCls =
    variant === "primary"
      ? "relative overflow-hidden inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50 dark:bg-slate-900 dark:text-violet-300"
      : "relative overflow-hidden inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 dark:bg-slate-900 dark:text-violet-300";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnCls}>
        <ShineBorder
          borderWidth={1.5}
          duration={5}
          shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        />
        <Sparkles className="relative z-10 h-3.5 w-3.5" />
        <span className="relative z-10">{label}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Top up Readee.ai credits
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                One-time purchase. Credits never expire and stack on top
                of your monthly allowance.
              </p>
              {CREDIT_PACKS.map((pack) => (
                <button
                  key={pack.sku}
                  type="button"
                  disabled={!!pending}
                  onClick={() => checkout(pack.sku)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
                    pack.best
                      ? "border-violet-300 bg-violet-50 hover:border-violet-400 dark:border-violet-700 dark:bg-violet-950/20 dark:hover:border-violet-500"
                      : "border-zinc-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500"
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {pack.label}
                      </span>
                      {pack.best && (
                        <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          Best value
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-slate-400">
                      {pack.subtitle}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-extrabold text-zinc-900 dark:text-white">
                      ${(pack.usdCents / 100).toFixed(2)}
                    </div>
                    {pending === pack.sku && (
                      <Loader2 className="mx-auto mt-1 h-3 w-3 animate-spin text-violet-500" />
                    )}
                  </div>
                </button>
              ))}

              {err && <p className="text-xs font-semibold text-red-600">{err}</p>}

              <div className="flex items-start gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500 dark:bg-slate-950/60 dark:text-slate-400">
                <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                Credits are applied immediately after payment. One-time
                purchase. No auto-renewal.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
