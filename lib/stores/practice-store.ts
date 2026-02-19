import { create } from "zustand";

interface AnswerRecord {
  questionId: string;
  correct: boolean;
  selected: string;
}

type Phase = "playing" | "feedback" | "complete";

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

  setStandard: (id: string) => void;
  selectAnswer: (choice: string, correct: boolean, questionId: string, xpPerCorrect: number, correctMessages: string[], correctEmojis: string[], incorrectMessages: string[]) => void;
  nextQuestion: (totalQ: number) => void;
  reset: () => void;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const initialState = {
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

export const usePracticeStore = create<PracticeState>((set) => ({
  ...initialState,

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

  reset: () => set(initialState),
}));
