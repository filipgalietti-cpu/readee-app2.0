/** Offline inventory only. Does not execute lesson modules or promote content.
 * npx tsx scripts/curriculum-reconciliation.ts --root <worktree> --out <directory>
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import ts from "typescript";

type CatalogRow = { standardId: string; grade: string; domain: string; title: string };
type Definition = {
  variable: string;
  id: string;
  title: string;
  grade: string;
  standard: string;
  objective: string;
  lessonId: string;
  file: string;
  sourceVersion: string;
  imports: Record<string, string>;
};
type RoadmapRow = {
  standard: string;
  unit: string;
  position: number;
  line: number;
  authoredLessonLabel: string;
  checked: boolean;
};
export type ReconciliationRow = {
  catalogStandard: string | null;
  canonicalLessonId: string | null;
  slug: string | null;
  grade: string;
  declaredStandards: string[];
  domain: string;
  unit: string | null;
  positionWithinUnit: number | null;
  positionMeaning: "roadmap-standard-row-not-approved-lesson-order";
  objective: string | null;
  exists: boolean;
  registered: boolean;
  technicalQa: "unknown";
  curriculumApproval: "unknown";
  productionRelease: "unknown";
  planningEligible: false;
  roadmapCheckmark: boolean | null;
  checkpoints: string[];
  relationship: "exact-declaration" | "documented-combined-candidate" | "unresolved";
  mismatches: string[];
  combinedStandardCandidates: string[];
  sources: string[];
  sourceVersion: string | null;
};
const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const prop = (o: ts.ObjectLiteralExpression, name: string) =>
  o.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText().replace(/["']/g, "") === name,
  ) as ts.PropertyAssignment | undefined;
const literal = (o: ts.ObjectLiteralExpression, name: string) => {
  const v = prop(o, name)?.initializer;
  return v && (ts.isStringLiteral(v) || ts.isNoSubstitutionTemplateLiteral(v)) ? v.text : "";
};
function source(root: string, file: string) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(path.join(root, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
}
function importsOf(ast: ts.SourceFile) {
  const imports: Record<string, string> = {};
  for (const n of ast.statements)
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      const bindings = n.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings))
        for (const b of bindings.elements) imports[b.name.text] = n.moduleSpecifier.text;
    }
  return imports;
}
function definitions(root: string, dir: string, type: string): Definition[] {
  const out: Definition[] = [];
  for (const file of fs
    .readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith(".ts"))
    .sort()) {
    const relative = `${dir}/${file}`,
      ast = source(root, relative);
    for (const n of ast.statements)
      if (ts.isVariableStatement(n))
        for (const d of n.declarationList.declarations) {
          if (
            d.type?.getText(ast) !== type ||
            !d.initializer ||
            !ts.isObjectLiteralExpression(d.initializer)
          )
            continue;
          const o = d.initializer;
          const id = literal(o, "id"),
            standard = literal(o, "standard");
          if (!id || !standard) throw new Error(`Nonliteral identity: ${relative}`);
          out.push({
            variable: d.name.getText(ast),
            id,
            standard,
            title: literal(o, "title"),
            grade: literal(o, "grade"),
            objective: literal(o, "objective"),
            lessonId: literal(o, "lessonId"),
            file: relative,
            sourceVersion: hash(ast.text),
            imports: importsOf(ast),
          });
        }
  }
  return out;
}
function registry(root: string, file: string, name: string, nested?: string) {
  const ast = source(root, file),
    result = new Map<string, string>();
  for (const n of ast.statements)
    if (ts.isVariableStatement(n))
      for (const d of n.declarationList.declarations) {
        if (
          d.name.getText(ast) !== name ||
          !d.initializer ||
          !ts.isObjectLiteralExpression(d.initializer)
        )
          continue;
        for (const p of d.initializer.properties) {
          if (!ts.isPropertyAssignment(p)) throw new Error(`Unsupported registry entry: ${file}`);
          const value =
            nested && ts.isObjectLiteralExpression(p.initializer)
              ? prop(p.initializer, nested)?.initializer
              : p.initializer;
          if (!value || !ts.isIdentifier(value))
            throw new Error(`Unresolved registry reference: ${file}`);
          const slug = p.name.getText(ast).replace(/["']/g, "");
          if (result.has(slug)) throw new Error(`Duplicate registry slug: ${slug}`);
          result.set(slug, value.text);
        }
      }
  if (!result.size) throw new Error(`Registry ${name} was not found in ${file}`);
  return result;
}
export function parseRoadmap(markdown: string): RoadmapRow[] {
  const rows: RoadmapRow[] = [];
  let unit = "",
    position = 0;
  markdown.split("\n").forEach((line, index) => {
    const heading = line.match(/^### (K|G[1-4])·U(\d+)/);
    if (heading) {
      unit = `${heading[1]}.U${heading[2]}`;
      position = 0;
    }
    if (!unit || !line.startsWith("|")) return;
    const cells = line.split("|").map((c) => c.trim());
    if (!/^(RF|RL|RI|L|K\.L)\./.test(cells[2] ?? "")) return;
    rows.push({
      standard: cells[2],
      unit,
      position: ++position,
      line: index + 1,
      authoredLessonLabel: cells[3],
      checked: cells[1] === "☑",
    });
  });
  return rows;
}

export function reconcileCurriculum(root: string) {
  const catalogFile = "app/data/sample-lessons.json";
  const catalog: CatalogRow[] = JSON.parse(fs.readFileSync(path.join(root, catalogFile), "utf8"));
  const lessons = definitions(root, "app/data/lessons-v2", "LessonDef");
  const quizzes = definitions(root, "app/data/quizzes-v2", "QuizDef");
  const lessonRegistry = registry(root, "app/data/lessons-v2/index.ts", "LESSONS", "lesson");
  const quizRegistry = registry(root, "app/data/quizzes-v2/index.ts", "QUIZZES");
  const roadmapFile = "docs/UNIT_ROADMAP.md";
  const roadmap = parseRoadmap(fs.readFileSync(path.join(root, roadmapFile), "utf8"));
  const lessonSlug = (l: Definition) =>
    [...lessonRegistry].find(([, variable]) => variable === l.variable)?.[0] ??
    path.basename(l.file, ".ts");
  for (const variable of lessonRegistry.values())
    if (lessons.filter((l) => l.variable === variable).length !== 1)
      throw new Error(`Registry lesson unresolved: ${variable}`);
  for (const variable of quizRegistry.values())
    if (quizzes.filter((q) => q.variable === variable).length !== 1)
      throw new Error(`Registry quiz unresolved: ${variable}`);
  const duplicateIds = lessons
    .filter((l, i) => lessons.findIndex((x) => x.id === l.id) !== i)
    .map((l) => l.id);
  const checkpoints = (l: Definition) =>
    quizzes
      .filter((q) => {
        if (![...quizRegistry.values()].includes(q.variable)) return false;
        if (q.lessonId === l.id) return true;
        // An authored exam imports a source quiz for its picks. Record association,
        // not a claim that the exam measures every lesson/standard in a grade.
        if (!/exam|final/.test(q.id)) return false;
        return Object.keys(q.imports).some((v) =>
          quizzes.some((s) => s.variable === v && s.lessonId === l.id),
        );
      })
      .map((q) => q.id)
      .sort();
  const make = (
    c: CatalogRow | null,
    l: Definition | null,
    rr?: RoadmapRow,
    combined = false,
  ): ReconciliationRow => ({
    catalogStandard: c?.standardId ?? null,
    canonicalLessonId: l?.id ?? null,
    slug: l ? lessonSlug(l) : null,
    grade: c?.grade ?? l?.grade ?? "",
    declaredStandards: l ? [l.standard] : [],
    domain: c?.domain ?? "unresolved: no catalog row",
    unit: rr?.unit ?? null,
    positionWithinUnit: rr?.position ?? null,
    positionMeaning: "roadmap-standard-row-not-approved-lesson-order",
    objective: l?.objective || null,
    exists: !!l,
    registered: !!l && [...lessonRegistry.values()].includes(l.variable),
    technicalQa: "unknown",
    curriculumApproval: "unknown",
    productionRelease: "unknown",
    planningEligible: false,
    roadmapCheckmark: rr?.checked ?? null,
    checkpoints: l ? checkpoints(l) : [],
    relationship: combined
      ? "documented-combined-candidate"
      : c && l?.standard === c.standardId
        ? "exact-declaration"
        : "unresolved",
    mismatches: [
      ...(!l ? ["no-exact-v2-lesson"] : []),
      ...(l && l.id !== lessonSlug(l) ? ["id-slug-differ"] : []),
      ...(l && ![...lessonRegistry.values()].includes(l.variable)
        ? ["exists-but-unregistered"]
        : []),
      ...(combined ? ["parent-standard-vs-substandard:review-required"] : []),
      ...(l && !catalog.some((c) => c.standardId === l.standard)
        ? ["declared-standard-outside-routing-catalog"]
        : []),
      ...(l &&
      catalog.filter((c) => c.standardId === l.standard).length &&
      lessons.filter((x) => x.standard === l.standard).length > 1
        ? ["multiple-lessons-declare-standard"]
        : []),
      ...(!rr ? ["no-exact-roadmap-membership"] : []),
    ],
    combinedStandardCandidates: combined ? ["RF.K.1a", "RF.K.1b", "RF.K.1c"] : [],
    sources: [catalogFile, ...(l ? [l.file] : []), ...(rr ? [`${roadmapFile}:${rr.line}`] : [])],
    sourceVersion: l?.sourceVersion ?? null,
  });
  const rows: ReconciliationRow[] = [];
  for (const c of catalog) {
    const rr = roadmap.filter((r) => r.standard === c.standardId);
    const exact = lessons.filter((l) => l.standard === c.standardId);
    // This is an explicit, source-checked discrepancy, NOT prefix inference:
    // the roadmap calls each of these three rows "Book Basics" while that
    // named file declares RF.K.1. Approval remains unknown.
    const combined =
      !exact.length &&
      ["RF.K.1a", "RF.K.1b", "RF.K.1c"].includes(c.standardId) &&
      rr.some((r) => r.authoredLessonLabel === "Book Basics")
        ? lessons.filter((l) => l.id === "book-basics" && l.standard === "RF.K.1")
        : [];
    for (const l of exact.length ? exact : combined.length ? combined : [null])
      for (const r of rr.length ? rr : [undefined]) rows.push(make(c, l, r, combined.length > 0));
  }
  for (const l of lessons)
    if (!catalog.some((c) => c.standardId === l.standard)) rows.push(make(null, l));
  const sources = [
    catalogFile,
    roadmapFile,
    "app/data/lessons-v2/index.ts",
    "app/data/quizzes-v2/index.ts",
    ...lessons.map((l) => l.file),
    ...quizzes.map((q) => q.file),
  ].sort();
  const sourceHashes = sources.map((file) => ({
    file,
    sha256: hash(fs.readFileSync(path.join(root, file), "utf8")),
  }));
  const coverage = new Set(
    rows
      .filter((r) => r.registered && r.relationship === "exact-declaration")
      .map((r) => r.catalogStandard),
  );
  return {
    schemaVersion: 1,
    scope:
      "Offline source reconciliation. Approval/technical QA/live publication not inferred or queried. Source hashes do not include audio/image bytes; they are not release content versions.",
    sourceDigest: hash(JSON.stringify(sourceHashes)),
    sourceHashes,
    summary: {
      catalogStandards: catalog.length,
      registeredLessons: lessonRegistry.size,
      lessonDefinitions: lessons.length,
      exactRegisteredCoverage: coverage.size,
      registeredQuizzes: quizRegistry.size,
      roadmapUnits: new Set(roadmap.map((r) => r.unit)).size,
      duplicateLessonIds: duplicateIds,
      planningEligible: 0,
    },
    rows,
  };
}

export function reconciliationCsv(rows: ReconciliationRow[]) {
  const keys = Object.keys(rows[0] ?? {}) as (keyof ReconciliationRow)[];
  const cell = (v: unknown) =>
    `"${(Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v)).replaceAll('"', '""')}"`;
  return (
    [keys.map(cell).join(","), ...rows.map((r) => keys.map((k) => cell(r[k])).join(","))].join(
      "\n",
    ) + "\n"
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const arg = (key: string) => process.argv[process.argv.indexOf(key) + 1];
  if (!process.argv.includes("--root") || !process.argv.includes("--out"))
    throw new Error("Required: --root <worktree> --out <output-directory>");
  const root = path.resolve(arg("--root")),
    out = path.resolve(arg("--out"));
  const report = reconcileCurriculum(root);
  const revision = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(
    path.join(out, "reconciliation.json"),
    JSON.stringify({ revision, ...report }, null, 2) + "\n",
  );
  fs.writeFileSync(path.join(out, "reconciliation.csv"), reconciliationCsv(report.rows));
  console.log(JSON.stringify(report.summary, null, 2));
}
