"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PipStudio from "./lessons/PipStudio";
import { UnitRuntimeContext, type UnitRuntime } from "@/lib/approved-unit/runtime";
import type { AttemptSnapshot } from "@/lib/lesson-engine/delivery/types";
import type { PracticeAttempt } from "@/lib/lesson-engine/production/practice";
/** The same approved player with ephemeral sample state; no child identity or persistence. */
export default function Sample() {
  const router = useRouter();
  const [runtime] = useState<UnitRuntime>(() => {
    let lesson: AttemptSnapshot | null = null,
      practice: PracticeAttempt | null = null,
      token: { token: string; region: string; expires: number } | undefined;
    async function service(payload: Record<string, unknown>, signal?: AbortSignal) {
      const r = await fetch("/api/approved-unit/sample", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(14000)])
          : AbortSignal.timeout(14000),
      });
      if (!r.ok) throw Error("Luna unavailable");
      return r.json();
    }
    return {
      store: {
        load: (id) => (lesson?.flowId === id ? lesson : null),
        save: (s) => {
          lesson = s;
        },
      },
      loadPractice: (id) => (practice?.flowId === id ? practice : null),
      savePractice: (a) => {
        practice = a;
      },
      speechToken: async () => {
        if (token && token.expires > Date.now()) return token;
        const t = await service({ kind: "speech" });
        token = { ...t, expires: Date.now() + 8 * 60000 };
        return t;
      },
      evaluateResponse: (rubricId, transcript, confidence, signal) =>
        service({ kind: "response", rubricId, transcript, confidence }, signal),
    };
  });
  return (
    <UnitRuntimeContext.Provider value={runtime}>
      <PipStudio onExit={() => router.push("/explore")} />
    </UnitRuntimeContext.Provider>
  );
}
