"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { PRICING } from "@/lib/billing-copy";
import { Glyph } from "./Glyph";
import { trackFunnelClient } from "@/lib/analytics/funnel";
import { reportFailure } from "@/lib/observability/critical";

type Props = {
  childId?: string | null;
  childName?: string | null;
  eligibleForTrial: boolean;
  source: string;
  focus?: string;
  sampleHref?: string | null;
  sampleLabel?: string;
  onSample?: () => void;
};
/** Parent purchase surface. Price selection and the actual card terms precede Stripe. */
export default function TrialOffer({
  childId,
  childName,
  eligibleForTrial,
  source,
  focus,
  sampleHref,
  sampleLabel = "Try the first lesson",
  onSample,
}: Props) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const attempt = useRef<string | null>(null);
  const name = childName || "your reader";
  const amount =
    billing === "monthly"
      ? `$${PRICING.monthly.perMonth.toFixed(2)} a month`
      : `$${PRICING.annual.perYear.toFixed(2)} a year`;
  async function start() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    attempt.current ??= crypto.randomUUID();
    trackFunnelClient("funnel.journey_trial_clicked", {
      source,
      billing,
      trial_eligible: eligibleForTrial,
    });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      const returnPath = childId ? `/journey?child=${encodeURIComponent(childId)}` : "/upgrade";
      const response = await fetch("/api/checkout", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing,
          ...(childId ? { childId } : {}),
          cancelTo: `${returnPath}${childId ? "&" : "?"}checkout=canceled`,
          attemptId: attempt.current,
          source,
        }),
      });
      const body = await response.json();
      if (response.status === 409 && body.alreadySubscribed) {
        window.location.assign(returnPath);
        return;
      }
      if (!response.ok || !body.url) throw new Error("Checkout unavailable");
      trackFunnelClient("funnel.checkout_started", { source, billing });
      window.location.assign(body.url);
    } catch (cause) {
      reportFailure("journey.checkout", cause, { route: "/journey" });
      setError("We couldn’t open checkout. Your reading plan is saved. Please try again.");
      setBusy(false);
      inFlight.current = false;
    } finally {
      window.clearTimeout(timeout);
    }
  }
  return (
    <section
      id="readee-trial"
      aria-label="Readee+ membership"
      className="rounded-2xl border border-violet-200 bg-white p-6 shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)] sm:p-7"
      data-trial-offer
    >
      <h2 className="text-2xl font-bold leading-tight text-zinc-900">
        {eligibleForTrial ? `Start ${name}’s reading plan.` : `Keep ${name} moving forward.`}
      </h2>
      <p className="mt-3 text-base leading-6 text-zinc-600">
        {focus ||
          "A reading plan with a clear next lesson, guided practice and progress you can follow."}
      </p>
      <ul className="my-6 space-y-3 text-sm leading-5 text-zinc-700">
        {[
          "Full access to the lessons in this reading journey",
          "Read-aloud practice and support from Luna",
          "Progress reports to help you see what’s improving",
        ].map((text) => (
          <li key={text} className="flex gap-3">
            <Glyph name="check" size={18} className="mt-0.5 shrink-0 text-violet-600" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <fieldset disabled={busy} className="space-y-2">
        <legend className="mb-2 text-sm font-semibold text-zinc-900">
          Choose your Readee+ plan
        </legend>
        {(["monthly", "annual"] as const).map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${billing === option ? "border-violet-500 bg-violet-50" : "border-zinc-200"}`}
          >
            <input
              type="radio"
              name={`billing-${source}`}
              checked={billing === option}
              onChange={() => {
                setBilling(option);
                attempt.current = null;
              }}
              className="h-4 w-4 accent-violet-600"
              value={option}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-zinc-900">
                {option === "monthly" ? "Monthly" : "Annual"}
              </span>
              <span className="block text-xs text-zinc-600">
                {option === "monthly"
                  ? `$${PRICING.monthly.perMonth.toFixed(2)} billed each month`
                  : `$${PRICING.annual.perYear.toFixed(2)} billed each year`}
              </span>
            </span>
            {option === "annual" && (
              <span className="text-xs font-semibold text-violet-700">
                {PRICING.annual.savingsLabel}
              </span>
            )}
          </label>
        ))}
      </fieldset>
      <p className="mt-5 text-sm leading-6 text-zinc-700" data-trial-terms>
        {eligibleForTrial ? (
          <>
            <strong>$0 today.</strong> {PRICING.trialDays} days of full access, then {amount}. Your
            subscription renews automatically. Cancel in Settings before your trial ends to avoid
            the first charge.
          </>
        ) : (
          <>
            <strong>{amount}, starting today.</strong> Renews automatically until canceled. This
            account has already used its free trial.
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Credit card required. Billing dates and any applicable taxes are shown at checkout.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void start()}
        className="mt-5 min-h-13 w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#6d28d9] hover:from-violet-700 hover:to-violet-600 disabled:opacity-60"
        data-trial-start
      >
        {busy
          ? "Opening secure checkout…"
          : eligibleForTrial
            ? `Start ${PRICING.trialDays}-day free trial`
            : "Continue with Readee+"}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-sm leading-5 text-rose-700">
          {error}
        </p>
      )}
      {sampleHref && (
        <Link
          href={sampleHref}
          onClick={onSample}
          className="mt-5 block py-2 text-center text-sm font-semibold text-violet-700 underline underline-offset-4"
          data-journey-sample
        >
          {sampleLabel}
        </Link>
      )}
      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
        <Glyph name="shield-check" size={15} />
        Secure checkout with Stripe
      </p>
    </section>
  );
}
