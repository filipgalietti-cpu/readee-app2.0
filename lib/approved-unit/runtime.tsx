"use client";
import { createContext, useContext } from "react";
import type { ActivitySupport, AttemptStore } from "@/lib/lesson-engine/delivery/types";
import type { PracticeAttempt } from "@/lib/lesson-engine/production/practice";
export type UnitRuntime = {
  store: AttemptStore;
  getPracticeResults?: (attemptId: string) => Promise<PracticeAttempt["results"]>;
  readonly isExamRetry?: boolean;
  retryExam?: () => Promise<void>;
  loadPractice: (id: string) => PracticeAttempt | null;
  savePractice: (attempt: PracticeAttempt) => void;
  speechToken: NonNullable<ActivitySupport["speechToken"]>;
  evaluateResponse: NonNullable<ActivitySupport["evaluateResponse"]>;
};
export const UnitRuntimeContext = createContext<UnitRuntime | null>(null);
export const useUnitRuntime = () => useContext(UnitRuntimeContext);
