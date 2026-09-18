import { describe, it, expect, beforeAll } from "vitest";
import { buildReviewEmail } from "@/lib/daily/review-email";
import { reviewToken } from "@/lib/daily/review-actions";

beforeAll(() => {
  process.env.DAILY_REVIEW_SECRET = "test-secret-for-review-links";
});

/**
 * The email is a proof sheet: the things you can only judge by looking, in an
 * inbox, before a parent sees them. Filip: "Make sure to include the picture,
 * the text (short/long)... To make sure our slop isn't too apparent."
 */

const row = {
  date: "2026-09-18",
  theme: "Things people made - traffic lights",
  subject: "traffic lights",
  medium: "colored-pencil",
  passage_title: "The First Traffic Lights",
  passage_body: "Tariq and Mohammed stood at the corner.\n\nThe light turned green.",
  image_url: "https://example.supabase.co/storage/v1/object/public/images/a/b.png",
  qc_overall: "warn",
  qc_report: {
    checks: [
      { name: "passage.reading_level", severity: "warn", message: "Reads slightly harder than 2nd" },
      { name: "image.judge", severity: "pass", message: "fine" },
    ],
  },
  easy_variant: {
    passage_title: "The First Traffic Lights",
    passage_body: "Tariq saw the light. It turned green.",
    audio_url: null,
    question_prompt: "q",
    choices: ["a"],
    correct: "a",
    hint: null,
    extra_questions: [],
  },
};

describe("buildReviewEmail", () => {
  it("says the day, the title and the verdict in the subject, so the inbox list is triage", () => {
    const { subject } = buildReviewEmail(row as never);
    expect(subject).toContain("The First Traffic Lights");
    expect(subject).toContain("warn");
    expect(subject).toContain("Sep 18");
  });

  it("shows the picture", () => {
    expect(buildReviewEmail(row as never).html).toContain(row.image_url);
  });

  it("carries BOTH renditions with their word counts", () => {
    const { html } = buildReviewEmail(row as never);
    expect(html).toContain("Tariq and Mohammed stood at the corner.");
    expect(html).toContain("Tariq saw the light. It turned green.");
    expect(html).toMatch(/Full read[\s\S]*?11 words/);
    expect(html).toMatch(/Short read[\s\S]*?7 words/);
  });

  it("states the gap between them as a share, which is the defect to eyeball", () => {
    // A short read that is nearly as long as the full one has shipped twice.
    expect(buildReviewEmail(row as never).html).toContain("64% of the full read");
  });

  it("lists what QC flagged, and only what it flagged", () => {
    const { html } = buildReviewEmail(row as never);
    expect(html).toContain("Reads slightly harder than 2nd");
    expect(html).not.toContain("image.judge"); // passed, so not worth a line
  });

  it("offers the three actions as signed links bound to that day", () => {
    const { html } = buildReviewEmail(row as never);
    for (const a of ["image", "passage", "rebuild"] as const) {
      expect(html).toContain(`a=${a}&t=${reviewToken("2026-09-18", a)}`);
      expect(html).toContain("date=2026-09-18");
    }
  });

  it("tells the reader they can simply reply", () => {
    expect(buildReviewEmail(row as never).html).toMatch(/reply to this email/i);
  });

  it("escapes the generated content instead of rendering it", () => {
    // Passage, title and QC messages are all model output. None of it is markup.
    const nasty = {
      ...row,
      passage_title: 'Lights <script>alert("x")</script>',
      passage_body: "A <b>bold</b> claim & more",
    };
    const { html } = buildReviewEmail(nasty as never);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
    expect(html).toContain("&amp; more");
  });

  it("says so plainly when there is no image, rather than showing a broken one", () => {
    const { html } = buildReviewEmail({ ...row, image_url: null } as never);
    expect(html).toContain("No image on this row");
    expect(html).not.toContain("<img src=\"\"");
  });

  it("survives a day with no short read yet", () => {
    const { html } = buildReviewEmail({ ...row, easy_variant: null } as never);
    expect(html).toContain("Not generated.");
    expect(html).toContain("Tariq and Mohammed stood at the corner.");
  });
});
