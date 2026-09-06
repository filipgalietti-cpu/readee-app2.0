import { describe, it, expect } from "vitest";
import { POOL, isInformationalBucket, type Bucket } from "@/lib/daily/catalog";

/**
 * The QC passage judge is told `Genre: informational | narrative` and FAILS a
 * passage that does not match. `runFullQuizQc` never accepted the flag, so
 * every daily was judged as a narrative — which is how the 2026-09-06 comet
 * passage failed with "The passage is an informational text explaining comets,
 * not a narrative as specified in the prompt" and marked the whole day failed
 * (Sentry JAVASCRIPT-NEXTJS-H). That was the first day the rebuilt catalogue
 * drew a bucket, and eight of its nine buckets are factual.
 */
describe("daily genre", () => {
  it("calls every bucket but `stories` informational", () => {
    for (const bucket of Object.keys(POOL) as Bucket[]) {
      expect(isInformationalBucket(bucket)).toBe(bucket !== "stories");
    }
  });

  it("keeps `stories` narrative — it is the only invented bucket", () => {
    expect(isInformationalBucket("stories")).toBe(false);
  });

  it("calls the bucket that actually failed informational", () => {
    // 2026-09-06 drew `space` / "a comet" and was judged against a narrative.
    expect(isInformationalBucket("space")).toBe(true);
    expect(isInformationalBucket("animals")).toBe(true);
    expect(isInformationalBucket("people")).toBe(true);
  });
});
