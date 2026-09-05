import { describe, it, expect } from "vitest";
import { depictionModeFor, applyDepictionMode } from "@/lib/daily/depiction-guard";

/**
 * The two cases that shipped live are the two that matter here, so they are
 * the tests. Both were competently drawn and both passed the image judge.
 */

const juneteenth = {
  title: "Juneteenth: A Day of Freedom",
  theme: "Juneteenth",
  body: "Juneteenth is a special day each year. It is celebrated on June 19th. This holiday remembers when all enslaved people in Texas learned they were free.",
};

const independence = {
  title: "A Day for Freedom",
  theme: "Independence Day",
  body: "The Fourth of July is a special day in the United States. Americans celebrate their country's birthday. Leaders signed the Declaration of Independence.",
};

describe("depictionModeFor", () => {
  it("ships no image for sensitive human history", () => {
    const r = depictionModeFor(juneteenth);
    expect(r.mode).toBe("none");
    expect(applyDepictionMode("a scene", r.mode)).toBeNull();
  });

  it("allows objects but never people for a real event", () => {
    const r = depictionModeFor(independence);
    expect(r.mode).toBe("symbol");
    const scene = applyDepictionMode("Founding Fathers signing a document", r.mode)!;
    expect(scene).toContain("NO people");
    // The fifty-star flag and the garbled Declaration lettering both came from
    // the model rendering text and insignia it could not get right.
    expect(scene.toLowerCase()).toContain("no flags");
  });

  it("leaves invented characters alone", () => {
    const r = depictionModeFor({
      title: "Kit's Cool Cave",
      theme: "Saturday cave adventure",
      body: "Kit the fox kit felt very warm. She wanted a cool spot to rest.",
    });
    expect(r.mode).toBe("free");
    expect(applyDepictionMode("a fox by a cave", r.mode)).toBe("a fox by a cave");
  });

  it("catches sensitive history even when the title sounds like fiction", () => {
    // "A Day for Freedom" reads as a story; only the body gives it away.
    expect(depictionModeFor({
      title: "A Long Walk",
      theme: "Sunday story",
      body: "She had been enslaved on a plantation before the war.",
    }).mode).toBe("none");
  });

  it("treats an inventor passage as a real event, not free fiction", () => {
    // "The Inventor of the Ferris Wheel" - draw the wheel, not Mr Ferris.
    expect(depictionModeFor({
      title: "The Inventor of the Ferris Wheel",
      theme: "On this day in history",
      body: "A man named George Ferris invented a giant wheel for a fair.",
    }).mode).toBe("symbol");
  });

  it("does not gate ordinary science", () => {
    expect(depictionModeFor({
      title: "Why Popsicles Melt",
      theme: "Monday science",
      body: "Heat moves from the warm air into the cold popsicle.",
    }).mode).toBe("free");
  });
});
