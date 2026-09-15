import type { ActivitySupport } from "@/lib/lesson-engine/delivery/types";

/** Local preview only. Production must supply authenticated, ownership-checked services. */
export const previewSpeechToken: NonNullable<ActivitySupport["speechToken"]> = async () => {
  const r = await fetch("/api/dev/grammar-speech-token", {
    method: "POST", signal: AbortSignal.timeout(12000),
  });
  if (!r.ok) throw Error("Speech unavailable");
  return r.json();
};

export const previewEvaluateResponse: NonNullable<ActivitySupport["evaluateResponse"]> = async (
  rubricId, transcript, confidence, signal, confirmed = false,
) => {
  const r = await fetch("/api/dev/lesson-response", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ rubricId, transcript, confidence, confirmed }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(14000)]),
  });
  if (!r.ok) throw Error("Response unavailable");
  return r.json();
};
