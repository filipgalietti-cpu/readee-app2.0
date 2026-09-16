"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ExamRetryButton({
  child,
  attemptId,
}: {
  child: string;
  attemptId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function retry() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/approved-unit/k-unit-1-checkpoint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ child, attemptId, kind: "retry-exam" }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw Error("retry");
      router.push(`/learn/unit-one?child=${encodeURIComponent(child)}&lesson=k-unit-1-checkpoint`);
    } catch {
      setError("The check-in could not restart. Please try again.");
      setBusy(false);
    }
  }
  return (
    <div className="my-4">
      <p className="mb-3 text-sm">
        After some practice, try the check-in again. Earlier results are kept; completion carrots
        are awarded once.
      </p>
      <button
        disabled={busy}
        onClick={() => void retry()}
        className="min-h-12 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
      >
        {busy ? "Opening check-in…" : "Try the unit check-in again"}
      </button>
      {error && (
        <p role="alert" className="mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
