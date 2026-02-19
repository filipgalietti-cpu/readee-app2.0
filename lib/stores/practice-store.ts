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
  totalXP: number;
  sessionsCompleted: number;
}

interface PracticeState {
  standardId: string | null;
  currentIdx: number;
  answers: AnswerRecord[];
  sessionXP: number;
  selected: string | null;
  isCorrect: boolean | null;
  feedbackMsg: string;
  feedbackEmoji: string;
  phase: Phase;
  lifetime: LifetimeStats;

  setStandard: (id: string) => void;
  selectAnswer: (choice: string, correct: boolean, questionId: string, xpPerCorrect: number, correctMessages: string[], correctEmojis: string[], incorrectMessages: string[]) => void;
  nextQuestion: (totalQ: number) => void;
  reset: () => void;
  recordSessionEnd: () => void;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const initialSession = {
  standardId: null as string | null,
  currentIdx: 0,
  answers: [] as AnswerRecord[],
  sessionXP: 0,
  selected: null as string | null,
  isCorrect: null as boolean | null,
  feedbackMsg: "",
  feedbackEmoji: "",
  phase: "playing" as Phase,
};

const initialLifetime: LifetimeStats = {
  totalQuestions: 0,
  totalCorrect: 0,
  totalXP: 0,
  sessionsCompleted: 0,
};

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      ...initialSession,
      lifetime: initialLifetime,

      setStandard: (id) => set({ standardId: id }),

      selectAnswer: (choice, correct, questionId, xpPerCorrect, correctMessages, correctEmojis, incorrectMessages) => {
        set((state) => {
          if (state.selected !== null) return state;
          return {
            selected: choice,
            isCorrect: correct,
            phase: "feedback" as Phase,
            feedbackMsg: correct ? pickRandom(correctMessages) : pickRandom(incorrectMessages),
            feedbackEmoji: correct ? pickRandom(correctEmojis) : "",
            sessionXP: correct ? state.sessionXP + xpPerCorrect : state.sessionXP,
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
          lifetime: {
            totalQuestions: state.lifetime.totalQuestions + state.answers.length,
            totalCorrect: state.lifetime.totalCorrect + state.answers.filter((a) => a.correct).length,
            totalXP: state.lifetime.totalXP + state.sessionXP,
            sessionsCompleted: state.lifetime.sessionsCompleted + 1,
          },
        }));
      },
    }),
    {
      name: "readee_practice",
      partialize: (state) => ({ lifetime: state.lifetime }),
    }
  )
);
