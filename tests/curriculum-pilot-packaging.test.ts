import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import snapshot from "@/docs/curriculum-pilot/g1-u1/package.json";
import { CurriculumReleaseSchema, validateCurriculumRelease } from "@/lib/curriculum/release";

function withSource(run: (root: string, output: string) => void) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "readee-pilot-test-"));
  const write = (file: string, value: string) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), value);
  };
  try {
    const rows = snapshot.artifacts;
    write(
      "docs/UNIT_ROADMAP.md",
      `### G1·U1\n${rows.map((r) => `| x | ${r.standard} | title |`).join("\n")}\n### G1·U2`,
    );
    write(
      "app/data/sample-lessons.json",
      JSON.stringify(rows.map((r) => ({ standardId: r.standard, grade: "1st Grade" }))),
    );
    write(
      "app/data/lessons-v2/index.ts",
      rows.map((r, i) => `"${r.slug}": { lesson: l${i},`).join("\n"),
    );
    write(
      "app/data/quizzes-v2/index.ts",
      rows.map((_, i) => `q${i},`).join("\n") + '\n"g1-unit-1-exam": exam,',
    );
    rows.forEach((r, i) => {
      write(
        `app/data/lessons-v2/${r.slug}.ts`,
        `import timings from "./${r.slug}-timings.json";
export const l${i}: LessonDef = { id: "${r.id}", title: "Synthetic fixture", standard: "${r.standard}", grade: "1st Grade", objective: "Fixture objective", concepts: ["fixture"], scenes: [{ audio: "/audio/lessons-v2/${r.slug}/test.mp3" }] };`,
      );
      write(`app/data/lessons-v2/${r.slug}-timings.json`, "{}");
      write(`public/audio/lessons-v2/${r.slug}/test.mp3`, "synthetic audio bytes");
      write(
        `app/data/quizzes-v2/${r.slug}-quiz.ts`,
        `export const q${i}: QuizDef = { id: "${r.quizId}", lessonId: "${r.id}", standard: "${r.standard}", questions: [{ id: "q${i}", prompt: "Fixture prompt" }] };`,
      );
    });
    write(
      "app/data/quizzes-v2/g1-unit-1-exam.ts",
      `export const exam: QuizDef = { id: "g1-unit-1-exam", askCount: 10, adaptive: false, questions: [${rows.map((_, i) => `pick(q${i}, "q${i}")`).join(",")}] };`,
    );
    run(root, path.join(root, "output"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function execute(root: string, output: string, verify = false) {
  return execFileSync(
    process.execPath,
    [
      "scripts/package-curriculum-pilot.mjs",
      "--root",
      root,
      "--out",
      output,
      ...(verify ? ["--verify"] : []),
    ],
    { encoding: "utf8", stdio: "pipe" },
  );
}

describe("offline pilot packager on synthetic source files", () => {
  it("packages reproducibly without executing authored code or granting approval", () =>
    withSource((root, output) => {
      execute(root, output);
      const first = fs.readFileSync(path.join(output, "package.json"), "utf8");
      execute(root, output);
      expect(fs.readFileSync(path.join(output, "package.json"), "utf8")).toBe(first);
      const result = JSON.parse(first) as typeof snapshot;
      const release = CurriculumReleaseSchema.parse(result.release);
      expect(validateCurriculumRelease(release, result.inventory)).toEqual([]);
      expect(
        release.lessons.every(
          (l) => l.technicalQa.status === "unknown" && l.curriculumReview.status === "pending",
        ),
      ).toBe(true);
      expect(JSON.parse(execute(root, output, true))).toEqual({ changed: [] });
    }));

  it.each(["audio", "timings", "new-asset"])(
    "detects %s changes beyond source-file hashes",
    (kind) =>
      withSource((root, output) => {
        execute(root, output);
        const file =
          kind === "audio"
            ? "public/audio/lessons-v2/sentence-shapes/test.mp3"
            : kind === "timings"
              ? "app/data/lessons-v2/sentence-shapes-timings.json"
              : "public/audio/lessons-v2/sentence-shapes/new.mp3";
        fs.writeFileSync(path.join(root, file), kind === "timings" ? '{"new":1}' : "changed bytes");
        expect(() => execute(root, output, true)).toThrow();
      }),
  );

  it("records missing resources as failed technical QA without fabricating files", () =>
    withSource((root, output) => {
      fs.unlinkSync(path.join(root, "public/audio/lessons-v2/sentence-shapes/test.mp3"));
      execute(root, output);
      const result = JSON.parse(
        fs.readFileSync(path.join(output, "package.json"), "utf8"),
      ) as typeof snapshot;
      expect(result.release.lessons[0].technicalQa.status).toBe("failed");
      expect(result.technicalReview.missingFiles).toEqual([
        "public/audio/lessons-v2/sentence-shapes/test.mp3",
      ]);
    }));

  it.each(["duplicate-lesson", "unknown-standard", "unknown-question", "unregistered-exam"])(
    "fails closed on %s",
    (fault) =>
      withSource((root, output) => {
        const lesson = path.join(root, "app/data/lessons-v2/sentence-shapes.ts");
        if (fault === "duplicate-lesson")
          fs.copyFileSync(lesson, path.join(root, "app/data/lessons-v2/duplicate.ts"));
        if (fault === "unknown-standard")
          fs.writeFileSync(
            lesson,
            fs.readFileSync(lesson, "utf8").replace("RF.1.1a", "RF.1.UNKNOWN"),
          );
        if (fault === "unknown-question") {
          const exam = path.join(root, "app/data/quizzes-v2/g1-unit-1-exam.ts");
          fs.writeFileSync(
            exam,
            fs.readFileSync(exam, "utf8").replace('pick(q0, "q0")', 'pick(q0, "missing")'),
          );
        }
        if (fault === "unregistered-exam") {
          const registry = path.join(root, "app/data/quizzes-v2/index.ts");
          fs.writeFileSync(
            registry,
            fs.readFileSync(registry, "utf8").replace('"g1-unit-1-exam": exam,', ""),
          );
        }
        expect(() => execute(root, output)).toThrow();
      }),
  );
});
