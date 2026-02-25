/** Shared multiplier logic for carrot rewards */

export function getDailyMultiplier(streakDays: number): { multiplier: number; label: string } {
  if (streakDays >= 7) return { multiplier: 2, label: "2x Daily Streak Bonus!" };
  if (streakDays >= 3) return { multiplier: 1.5, label: "1.5x Daily Streak Bonus!" };
  return { multiplier: 1, label: "" };
}

export function getSessionStreakTier(consecutiveCorrect: number): { multiplier: number; fires: number } {
  if (consecutiveCorrect >= 5) return { multiplier: 3, fires: 3 };
  if (consecutiveCorrect >= 3) return { multiplier: 2, fires: 1 };
  return { multiplier: 1, fires: 0 };
}
