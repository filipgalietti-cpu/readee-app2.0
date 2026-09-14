import { expect, it } from "vitest";
import { timeBudget } from "@/lib/daily/time-budget";

it("is exhausted once only the reserve is left", () => {
  let clock = 1_000;
  const budget = timeBudget(800_000, 180_000, () => clock);
  expect(budget.exhausted()).toBe(false);
  clock += 619_999;
  expect(budget.exhausted()).toBe(false);
  expect(budget.elapsedMs()).toBe(619_999);
  clock += 1;
  expect(budget.exhausted()).toBe(true);
});

it("counts from creation, not from the first check", () => {
  let clock = 5_000;
  const budget = timeBudget(10_000, 2_000, () => clock);
  clock = 13_000;
  expect(budget.exhausted()).toBe(true);
  expect(budget.elapsedMs()).toBe(8_000);
});
