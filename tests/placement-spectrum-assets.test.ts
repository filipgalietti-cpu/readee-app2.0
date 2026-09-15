import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { spectrumAudioScripts } from "@/app/data/placement-spectrum/audio";
import audioCheck from "@/app/data/placement-spectrum/pcm-review-manifest.json";
import { ASSESSMENT_PCM } from "@/lib/audio/assessment-pcm-quality";
import { pcmReleaseProblems } from "@/lib/audio/assessment-pcm-release";
import { LANGUAGE_ITEMS, ORAL_BLENDS } from "@/lib/placement/spectrum";

it("ships every fixed narration and option clip with a matching transcript audit", () => {
  const scripts = spectrumAudioScripts();
  const sourceHashes: Record<string, string> = {}, audioHashes: Record<string, string> = {};
  const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
  expect(Object.keys(scripts)).toHaveLength(440);
  for (const [id, script] of Object.entries(scripts)) {
    sourceHashes[id] = hash(JSON.stringify(ASSESSMENT_PCM) + script);
    audioHashes[id] = hash(readFileSync(`public/audio/assessment-voice/${ASSESSMENT_PCM.version}/${id}.wav`));
  }
  expect(pcmReleaseProblems({ scripts, entries: audioCheck, sourceHashes, audioHashes })).toEqual([]);
});
it("keeps every listening question separate from its answer narration", () => {
  expect(LANGUAGE_ITEMS.every((q) => typeof q.audioIncludesOptions === "boolean")).toBe(true);
  const repaired = LANGUAGE_ITEMS.find((q) => q.id === "sp-RI.3.9-H2")!;
  expect(repaired.audio).toBe("/audio/placement-spectrum/q-sp-RI.3.9-H2.mp3");
  expect(LANGUAGE_ITEMS.every(q => !q.audioIncludesOptions && !q.text.startsWith("Read the text."))).toBe(true);
  expect(ORAL_BLENDS.flatMap((b) => b.sounds)).toContain("short_a");
  expect(ORAL_BLENDS.flatMap((b) => b.sounds)).not.toContain("a");
});
