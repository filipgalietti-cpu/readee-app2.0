import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { spectrumAudioScripts } from "@/app/data/placement-spectrum/audio";
import audioCheck from "@/app/data/placement-spectrum/audio-check.json";
import { LANGUAGE_ITEMS, ORAL_BLENDS } from "@/lib/placement/spectrum";

it("ships every fixed narration and option clip with a matching transcript audit", () => {
  const audit = audioCheck as Record<
    string,
    { script: string; audioSha256: string; status: string }
  >;
  for (const [id, script] of Object.entries(spectrumAudioScripts())) {
    const path = `public/audio/placement-spectrum/${id}.mp3`;
    expect(statSync(path).size, id).toBeGreaterThan(500);
    expect(audit[id]?.script, id).toBe(script);
    expect(audit[id]?.status, id).toBe("matched");
    expect(createHash("sha256").update(readFileSync(path)).digest("hex"), id).toBe(
      audit[id].audioSha256,
    );
  }
});
it("declares reused full-choice narration and repairs the missing question explicitly", () => {
  expect(LANGUAGE_ITEMS.every((q) => typeof q.audioIncludesOptions === "boolean")).toBe(true);
  const repaired = LANGUAGE_ITEMS.find((q) => q.id === "sp-RI.3.9-H2")!;
  expect(repaired.promptAudio).toBe("/audio/placement-spectrum/q-sp-RI.3.9-H2.mp3");
  expect(repaired.audioIncludesOptions).toBe(false);
  expect(ORAL_BLENDS.flatMap((b) => b.sounds)).toContain("short_a");
  expect(ORAL_BLENDS.flatMap((b) => b.sounds)).not.toContain("a");
});
