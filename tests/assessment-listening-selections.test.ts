import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { expect, it } from "vitest";
import selections from "@/app/data/placement-spectrum/listening-selections.json";
import { spectrumAudioScripts } from "@/app/data/placement-spectrum/audio";
import { pcmQualityProblems } from "@/lib/audio/assessment-pcm-quality";
import { speechMatchesScript } from "@/lib/audio/speech-script";

it("preserves the actual user-selected C/Max and A/Sam recordings, without resynthesis", () => {
  const expected = [
    ["q-g1-q1", "C", "clear", "57bf4b13bebd4623761f4cba3a8b3d72be1b07fccc295f4458d1b62893e80679"],
    ["q-g1-q2", "A", "repeat", "9ec6c9c46508e9f6ca226abcef5e1864df34545cd0cfc7672e75faee9ad0fb16"],
  ];
  expect(Object.keys(selections.clips).sort()).toEqual(["q-g1-q1", "q-g1-q2"]);
  for (const [id, label, variant, hash] of expected) {
    const chosen = selections.clips[id as keyof typeof selections.clips];
    expect(chosen.selectionLabel).toBe(label);
    expect(chosen.variant).toBe(variant);
    expect(chosen.listeningStatus).toBe("user-selected");
    const audio = readFileSync(join(process.cwd(), "public", chosen.url));
    expect(createHash("sha256").update(audio).digest("hex")).toBe(hash);
    expect(chosen.audioSha256).toBe(hash);
  }
});
it("keeps selected takes aligned with the authored questions and existing technical checks", () => {
  const scripts = spectrumAudioScripts();
  for (const [id, chosen] of Object.entries(selections.clips)) {
    expect(chosen.script).toBe(scripts[id]);
    expect(speechMatchesScript(scripts[id], chosen.transcript)).toBe(true);
    expect(pcmQualityProblems(scripts[id], chosen.measurements)).toEqual([]);
  }
});
