import { describe, it, expect, beforeAll } from "vitest";
import {
  parseReviewCommand,
  humanPart,
  reviewToken,
  reviewTokenValid,
  isReviewAction,
} from "@/lib/daily/review-actions";

beforeAll(() => {
  process.env.DAILY_REVIEW_SECRET = "test-secret-for-review-links";
});

/**
 * Filip asked to reply to the daily email with "fix image" or something like
 * that. The parser's job is to understand a person glancing at a phone, while
 * never redrawing a picture because someone said it was good.
 */
describe("parseReviewCommand", () => {
  it("understands the words Filip actually used", () => {
    expect(parseReviewCommand("fix image")).toBe("image");
    expect(parseReviewCommand("Fix image")).toBe("image");
    expect(parseReviewCommand("fix the image please")).toBe("image");
  });

  it("understands the same ask said differently", () => {
    for (const said of [
      "redo the picture",
      "new illustration",
      "that art is awful",
      "the pic is wrong",
      "regenerate image",
      "redraw it, the image is slop",
    ]) {
      expect(parseReviewCommand(said), said).toBe("image");
    }
  });

  it("tells the passage apart from the picture", () => {
    expect(parseReviewCommand("fix the passage")).toBe("passage");
    expect(parseReviewCommand("rewrite the story")).toBe("passage");
    expect(parseReviewCommand("the text is bad")).toBe("passage");
  });

  it("takes the lot when asked for the lot", () => {
    expect(parseReviewCommand("rebuild")).toBe("rebuild");
    expect(parseReviewCommand("scrap it and start over")).toBe("rebuild");
    expect(parseReviewCommand("new passage and a new image")).toBe("rebuild");
  });

  it("does NOT act on praise, which is the dangerous case", () => {
    // A redraw costs credits and replaces something good. Silence is correct.
    for (const said of [
      "the image is great",
      "love this one",
      "nice picture today",
      "this passage is lovely, thanks",
      "",
      "ok",
    ]) {
      expect(parseReviewCommand(said), said).toBeNull();
    }
  });

  it("ignores the quoted email underneath the reply", () => {
    // Every mail client puts the original below, and the original is full of
    // the words "image" and "passage".
    const reply = [
      "fix image",
      "",
      "On Thu, 18 Sep 2026 at 06:02, Readee <notify@readee.app> wrote:",
      "> Today's Daily Readee is ready.",
      "> The passage is 118 words and the picture is attached.",
      "> Rewrite the passage",
    ].join("\n");
    expect(parseReviewCommand(reply)).toBe("image");
  });

  it("is not fooled by a signature, or by praise above a quoted ask", () => {
    const reply = ["looks great", "Sent from my iPhone", "", "> fix image"].join("\n");
    expect(parseReviewCommand(reply)).toBeNull();
  });

  it("stops at an Outlook original-message block", () => {
    const reply = ["fix the picture", "", "-----Original Message-----", "From: Readee"].join("\n");
    expect(parseReviewCommand(reply)).toBe("image");
  });
});

describe("humanPart", () => {
  it("keeps only what was typed", () => {
    expect(humanPart("fix image\n\nOn Thu wrote:\n> everything else")).toBe("fix image");
  });

  it("survives empty and undefined bodies", () => {
    expect(humanPart("")).toBe("");
    expect(humanPart(undefined as unknown as string)).toBe("");
  });
});

describe("review link tokens", () => {
  it("binds an action to one day", () => {
    const token = reviewToken("2026-09-18", "image");
    expect(reviewTokenValid("2026-09-18", "image", token)).toBe(true);
    // The same token must not redraw a different day...
    expect(reviewTokenValid("2026-09-19", "image", token)).toBe(false);
    // ...nor do a different thing to the same day.
    expect(reviewTokenValid("2026-09-18", "rebuild", token)).toBe(false);
  });

  it("rejects a missing or malformed token without throwing", () => {
    expect(reviewTokenValid("2026-09-18", "image", "")).toBe(false);
    expect(reviewTokenValid("2026-09-18", "image", "nope")).toBe(false);
    expect(reviewTokenValid("2026-09-18", "image", undefined as unknown as string)).toBe(false);
  });

  it("only accepts the three real actions", () => {
    expect(isReviewAction("image")).toBe(true);
    expect(isReviewAction("delete")).toBe(false);
    expect(isReviewAction(null)).toBe(false);
  });
});
