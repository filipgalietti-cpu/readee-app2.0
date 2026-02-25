import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AnswerRecord {
  questionId: string;
  correct: boolean;
  selected: string;
}

type Phase = "playing" | "feedback" | "complete";

interface LifetimeStats {
  totalQuestions: number;
  totalCorrect: number;
  totalCarrots: number;
  sessionsCompleted: number;
}

interface PracticeState {
  standardId: string | null;
  currentIdx: number;
  answers: AnswerRecord[];
  sessionCarrots: number;
  selected: string | null;
  isCorrect: boolean | null;
  feedbackMsg: string;
  feedbackEmoji: string;
  phase: Phase;
  lifetime: LifetimeStats;
  mysteryBoxMultiplier: number;

  setStandard: (id: string) => void;
  selectAnswer: (choice: string, correct: boolean, questionId: string, carrotsPerCorrect: number, correctMessages: string[], correctEmojis: string[], incorrectMessages: string[]) => void;
  nextQuestion: (totalQ: number) => void;
  reset: () => void;
  recordSessionEnd: () => void;
  setMysteryBoxMultiplier: (mult: number) => void;
  clearMysteryBoxMultiplier: () => void;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const initialSession = {
  standardId: null as string | null,
  currentIdx: 0,
  answers: [] as AnswerRecord[],
  sessionCarrots: 0,
  selected: null as string | null,
  isCorrect: null as boolean | null,
  feedbackMsg: "",
  feedbackEmoji: "",
  phase: "playing" as Phase,
  mysteryBoxMultiplier: 1,
};

const initialLifetime: LifetimeStats = {
  totalQuestions: 0,
  totalCorrect: 0,
  totalCarrots: 0,
  sessionsCompleted: 0,
};

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      ...initialSession,
      lifetime: initialLifetime,

      setStandard: (id) => set({ standardId: id }),

      selectAnswer: (choice, correct, questionId, carrotsPerCorrect, correctMessages, correctEmojis, incorrectMessages) => {
        set((state) => {
          if (state.selected !== null) return state;
          return {
            selected: choice,
            isCorrect: correct,
            phase: "feedback" as Phase,
            feedbackMsg: correct ? pickRandom(correctMessages) : pickRandom(incorrectMessages),
            feedbackEmoji: correct ? pickRandom(correctEmojis) : "",
            sessionCarrots: correct ? state.sessionCarrots + carrotsPerCorrect : state.sessionCarrots,
            answers: [...state.answers, { questionId, correct, selected: choice }],
          };
        });
      },

      nextQuestion: (totalQ) => {
        set((state) => {
          if (state.currentIdx + 1 < totalQ) {
            return {
              currentIdx: state.currentIdx + 1,
              selected: null,
              isCorrect: null,
              feedbackMsg: "",
              feedbackEmoji: "",
              phase: "playing" as Phase,
            };
          }
          return { phase: "complete" as Phase };
        });
      },

      reset: () => set(initialSession),

      recordSessionEnd: () => {
        set((state) => ({
          mysteryBoxMultiplier: 1,
          lifetime: {
            totalQuestions: state.lifetime.totalQuestions + state.answers.length,
            totalCorrect: state.lifetime.totalCorrect + state.answers.filter((a) => a.correct).length,
            totalCarrots: state.lifetime.totalCarrots + state.sessionCarrots,
            sessionsCompleted: state.lifetime.sessionsCompleted + 1,
          },
        }));
      },

      setMysteryBoxMultiplier: (mult) => {
        set({ mysteryBoxMultiplier: mult });
        if (typeof window !== "undefined") {
          localStorage.setItem("readee_mystery_multiplier", String(mult));
        }
      },

      clearMysteryBoxMultiplier: () => {
        set({ mysteryBoxMultiplier: 1 });
        if (typeof window !== "undefined") {
          localStorage.removeItem("readee_mystery_multiplier");
        }
      },
    }),
    {
      name: "readee_practice",
      version: 2,
      partialize: (state) => ({ lifetime: state.lifetime, mysteryBoxMultiplier: state.mysteryBoxMultiplier }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          // Rename totalXP → totalCarrots in persisted lifetime
          const lifetime = state.lifetime as Record<string, number> | undefined;
          if (lifetime && "totalXP" in lifetime) {
            lifetime.totalCarrots = lifetime.totalXP;
            delete lifetime.totalXP;
          }
        }
        return state as unknown as PracticeState;
      },
    }
  )
);
