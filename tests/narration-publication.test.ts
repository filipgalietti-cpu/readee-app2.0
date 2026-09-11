import { beforeEach, expect, it, vi } from "vitest";
const s = vi.hoisted(() => ({
  row: {
    child_id: "reader",
    narration: [{ id: "number", text: "The report is ready.", audioPath: "legacy.mp3" }] as Array<{
      id: string;
      text: string;
      audioPath: string;
      audioVerified?: string;
    }>,
  },
  files: new Map<string, Buffer>(),
  verify: vi.fn(),
  generate: vi.fn(),
}));
vi.mock("@/lib/audio/verified-speech", () => ({
  verifySpeech: s.verify,
  generateVerifiedSpeech: s.generate,
}));
vi.mock("@/lib/observability/critical", () => ({ reportFailure: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: () => ({
    from: () => {
      let update: { narration: typeof s.row.narration } | undefined;
      const q = {
        eq: () => q,
        single: async () => ({ data: structuredClone(s.row) }),
        update: (value: typeof update) => {
          update = value;
          return q;
        },
        select: () => {
          if (update) {
            s.row.narration = update.narration;
            return Promise.resolve({ data: [{ id: "placement" }] });
          }
          return q;
        },
      };
      return q;
    },
    storage: {
      from: () => ({
        download: async (path: string) => ({
          data: s.files.has(path) ? new Blob([new Uint8Array(s.files.get(path)!)]) : null,
        }),
        upload: async (path: string, audio: Buffer) => {
          s.files.set(path, audio);
          return {};
        },
      }),
    },
  }),
}));
import { generatePlacementNarration } from "@/lib/placement/generate-narration";
beforeEach(() => {
  s.row.narration = [{ id: "number", text: "The report is ready.", audioPath: "legacy.mp3" }];
  s.files.clear();
  s.files.set("legacy.mp3", Buffer.from("verified audio"));
  s.verify.mockReset().mockResolvedValue(true);
  s.generate.mockReset();
});
it("copies verified legacy audio to a path an old generation job cannot overwrite", async () => {
  await generatePlacementNarration("first-placement", "Reader");
  const line = s.row.narration[0];
  expect(line.audioVerified).toBe("script-v1");
  expect(line.audioPath).not.toBe("legacy.mp3");
  s.files.set("legacy.mp3", Buffer.from("late hallucinated audio"));
  expect(s.files.get(line.audioPath)?.toString()).toBe("verified audio");
  expect(s.generate).not.toHaveBeenCalled();
});
it("leaves rejected legacy audio unverified when replacement generation fails", async () => {
  s.verify.mockResolvedValue(false);
  s.generate.mockRejectedValue(new Error("No verified replacement"));
  await generatePlacementNarration("second-placement", "Reader");
  expect(s.row.narration[0].audioVerified).toBeUndefined();
  expect(s.files.size).toBe(1);
});
