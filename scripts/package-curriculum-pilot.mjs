/** Offline packaging of the selected G1.U1 pilot. Never executes authored modules. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";
import { pathToFileURL } from "node:url";

const UNIT = "G1.U1";
const EXAM = "g1-unit-1-exam";
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const property = (object, name) =>
  object.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText().replace(/["']/g, "") === name,
  )?.initializer;
const text = (n) =>
  n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : null;
const digest = (root, file) =>
  fs.existsSync(path.join(root, file)) ? hash(fs.readFileSync(path.join(root, file))) : null;
function read(root, file, type) {
  const code = fs.readFileSync(path.join(root, file), "utf8");
  const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
  const declarations = ast.statements
    .filter(ts.isVariableStatement)
    .flatMap((n) => [...n.declarationList.declarations]);
  const found = declarations.find((d) => d.type?.getText(ast) === type);
  if (!found || !ts.isObjectLiteralExpression(found.initializer))
    throw new Error(`Unresolved ${type}: ${file}`);
  return {
    code,
    ast,
    declarations,
    object: found.initializer,
    variable: found.name.getText(ast),
    file,
  };
}
function allFiles(root, directory) {
  if (!fs.existsSync(path.join(root, directory))) return [];
  return fs
    .readdirSync(path.join(root, directory), { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? allFiles(root, `${directory}/${e.name}`) : [`${directory}/${e.name}`],
    );
}
function resourceReferences(source) {
  const constants = new Map(),
    helpers = new Map(),
    references = new Set(),
    unresolved = [];
  for (const d of source.declarations) {
    if (text(d.initializer) !== null) constants.set(d.name.getText(), text(d.initializer));
    if (
      d.initializer &&
      ts.isArrowFunction(d.initializer) &&
      ts.isTemplateExpression(d.initializer.body)
    ) {
      const body = d.initializer.body;
      if (body.templateSpans.length === 1)
        helpers.set(d.name.getText(), {
          prefix: body.head.text,
          suffix: body.templateSpans[0].literal.text,
          lower: body.templateSpans[0].expression.getText().includes("toLowerCase"),
        });
    }
  }
  function scalar(n) {
    if (text(n) !== null) return text(n);
    if (ts.isIdentifier(n)) return constants.get(n.text) ?? null;
    if (ts.isTemplateExpression(n)) {
      let value = n.head.text;
      for (const span of n.templateSpans) {
        const part = scalar(span.expression);
        if (part === null) return null;
        value += part + span.literal.text;
      }
      return value;
    }
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && helpers.has(n.expression.text)) {
      const arg = text(n.arguments[0]),
        h = helpers.get(n.expression.text);
      return arg === null ? null : h.prefix + (h.lower ? arg.toLowerCase() : arg) + h.suffix;
    }
    return null;
  }
  function walk(n) {
    const value = scalar(n);
    if (value && /^\/(audio|images)\//.test(value) && /\.(mp3|wav|png|jpg|webp|svg)$/.test(value))
      references.add(`public${value}`);
    if (
      ts.isPropertyAssignment(n) &&
      ["audio", "image", "successAudio"].includes(n.name.getText().replace(/["']/g, "")) &&
      scalar(n.initializer) === null
    )
      unresolved.push(n.initializer.getText());
    ts.forEachChild(n, walk);
  }
  walk(source.object);
  return { references: [...references].sort(), unresolved };
}
function fingerprint(root, source, slug, quiz = false) {
  const files = new Set([source.file]);
  for (const n of source.ast.statements)
    if (
      ts.isImportDeclaration(n) &&
      !n.importClause?.isTypeOnly &&
      ts.isStringLiteral(n.moduleSpecifier)
    ) {
      const spec = n.moduleSpecifier.text;
      if (spec.startsWith(".") && spec.endsWith(".json"))
        files.add(path.posix.normalize(`${path.posix.dirname(source.file)}/${spec}`));
    }
  // Hash all files in owned asset directories as well as statically resolved references.
  for (const dir of [
    `public/audio/lessons-v2/${slug}`,
    `public/images/lessons-v2/${slug}`,
    ...(quiz
      ? [`public/audio/quizzes-v2/${slug}-quiz`, `public/images/quizzes-v2/${slug}-quiz`]
      : []),
  ])
    for (const file of allFiles(root, dir)) files.add(file);
  const resources = resourceReferences(source);
  for (const file of resources.references) files.add(file);
  const entries = [...files].sort().map((file) => ({ file, sha256: digest(root, file) }));
  return {
    version: `sha256:${hash(JSON.stringify(entries))}`,
    files: entries,
    missing: entries.filter((e) => e.sha256 === null).map((e) => e.file),
    unresolved: resources.unresolved,
  };
}

export function packagePilot(root) {
  const roadmapPath = "docs/UNIT_ROADMAP.md",
    roadmap = fs.readFileSync(path.join(root, roadmapPath), "utf8");
  const section = roadmap.split("### G1·U1")[1]?.split("### G1·U2")[0];
  if (!section) throw new Error("Pilot roadmap unit missing");
  const standards = section
    .split("\n")
    .filter((l) => l.startsWith("|"))
    .map((l) => l.split("|")[2]?.trim())
    .filter((s) => /^(RF|RL|RI|L)\./.test(s));
  if (standards.length !== 10 || new Set(standards).size !== 10)
    throw new Error("Pilot unit membership changed; review selection before repackaging");
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, "app/data/sample-lessons.json"), "utf8"),
  );
  const lessonRegistry = fs.readFileSync(path.join(root, "app/data/lessons-v2/index.ts"), "utf8");
  const quizRegistry = fs.readFileSync(path.join(root, "app/data/quizzes-v2/index.ts"), "utf8");
  const lessons = fs
    .readdirSync(path.join(root, "app/data/lessons-v2"))
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .flatMap((f) => {
      const file = `app/data/lessons-v2/${f}`;
      if (!fs.readFileSync(path.join(root, file), "utf8").includes(": LessonDef")) return [];
      return [read(root, file, "LessonDef")];
    });
  const rows = standards.map((standard, index) => {
    const matches = lessons.filter((l) => text(property(l.object, "standard")) === standard);
    if (matches.length !== 1) throw new Error(`Ambiguous pilot standard: ${standard}`);
    const lesson = matches[0],
      id = text(property(lesson.object, "id")),
      slug = path.basename(lesson.file, ".ts");
    if (id !== slug || !lessonRegistry.includes(`"${slug}": { lesson: ${lesson.variable},`))
      throw new Error(`Unresolved pilot registry identity: ${id}`);
    if (
      !catalog.some(
        (c) => c.standardId === standard && c.grade === text(property(lesson.object, "grade")),
      )
    )
      throw new Error(`Catalog mismatch: ${standard}`);
    const quiz = read(root, `app/data/quizzes-v2/${slug}-quiz.ts`, "QuizDef");
    if (
      text(property(quiz.object, "lessonId")) !== id ||
      text(property(quiz.object, "standard")) !== standard ||
      !quizRegistry.includes(`${quiz.variable},`)
    )
      throw new Error(`Quiz identity mismatch: ${slug}`);
    const conceptsNode = property(lesson.object, "concepts");
    if (
      !conceptsNode ||
      !ts.isArrayLiteralExpression(conceptsNode) ||
      conceptsNode.elements.some((n) => text(n) === null)
    )
      throw new Error(`Nonliteral concepts: ${slug}`);
    const lessonBundle = fingerprint(root, lesson, slug),
      quizBundle = fingerprint(root, quiz, slug, true);
    const version = `sha256:${hash(JSON.stringify([lessonBundle.version, quizBundle.version]))}`;
    return {
      id,
      slug,
      standard,
      grade: 1,
      position: index + 1,
      title: text(property(lesson.object, "title")),
      objective: text(property(lesson.object, "objective")),
      concepts: conceptsNode.elements.map(text),
      lessonBundle,
      quizBundle,
      contentVersion: version,
      quizId: text(property(quiz.object, "id")),
      quizSource: quiz,
      lessonSource: lesson,
    };
  });
  const exam = read(root, `app/data/quizzes-v2/${EXAM}.ts`, "QuizDef"),
    questions = property(exam.object, "questions");
  if (
    text(property(exam.object, "id")) !== EXAM ||
    !quizRegistry.includes(`"${EXAM}": ${exam.variable}`)
  )
    throw new Error("Checkpoint registry identity mismatch");
  if (!questions || !ts.isArrayLiteralExpression(questions))
    throw new Error("Nonliteral exam sequence");
  const items = questions.elements.map((pick, index) => {
    if (!ts.isCallExpression(pick) || pick.expression.getText() !== "pick")
      throw new Error("Unknown checkpoint construction");
    const row = rows.find((r) => r.quizSource.variable === pick.arguments[0].getText());
    const questionId = text(pick.arguments[1]);
    if (!row || !questionId) throw new Error("Unknown checkpoint source quiz");
    const pool = property(row.quizSource.object, "questions");
    const question =
      pool && ts.isArrayLiteralExpression(pool)
        ? pool.elements.find(
            (q) => ts.isObjectLiteralExpression(q) && text(property(q, "id")) === questionId,
          )
        : null;
    if (!question || !ts.isObjectLiteralExpression(question))
      throw new Error(`Unknown checkpoint question: ${questionId}`);
    return {
      position: index + 1,
      questionId,
      sourceQuizId: row.quizId,
      lessonId: row.id,
      standardId: row.standard,
      prompt: text(property(question, "prompt")),
      attribution: "explicit-source-quiz-standard",
      source: row.quizSource.file,
      followUpId: text(property(question, "followUpId")),
    };
  });
  if (new Set(items.map((i) => i.questionId)).size !== items.length)
    throw new Error("Checkpoint question ID collision");
  const checkpointVersion = `sha256:${hash(JSON.stringify({ source: hash(exam.code), items, dependencies: rows.map((r) => r.quizBundle.version) }))}`;
  const unitVersion = `sha256:${hash(section)}`,
    catalogVersion = `sha256:${digest(root, "app/data/sample-lessons.json")}`,
    registryVersion = `sha256:${hash(lessonRegistry + quizRegistry)}`;
  const releaseId = `astra-g1-u1-pilot-v1-${hash(JSON.stringify(rows.map((r) => r.contentVersion)) + checkpointVersion + unitVersion + catalogVersion + registryVersion).slice(0, 12)}`;
  const pending = (version) => ({ status: "pending", version });
  const sourceRef = (source, locator, version) => ({ source, locator, version });
  const release = {
    schemaVersion: 1,
    releaseId,
    catalogVersion,
    registryVersion,
    units: [
      {
        id: UNIT,
        title: "Grade 1 · Unit 1",
        grade: 1,
        domains: ["RF", "RL", "RI", "L"],
        version: unitVersion,
        source: sourceRef(roadmapPath, "G1·U1", unitVersion),
        curriculumReview: pending(unitVersion),
        checkpointIds: [EXAM],
      },
    ],
    lessons: rows.map((r) => ({
      lessonId: r.id,
      slug: r.slug,
      contentVersion: r.contentVersion,
      grade: 1,
      unitId: UNIT,
      position: r.position,
      objective: r.objective,
      coverage: {
        version: r.contentVersion,
        standardIds: [r.standard],
        kind: "single-standard",
        source: sourceRef(r.lessonSource.file, "standard", r.contentVersion),
        curriculumReview: pending(r.contentVersion),
      },
      technicalQa: {
        status:
          r.lessonBundle.missing.length ||
          r.quizBundle.missing.length ||
          r.lessonBundle.unresolved.length ||
          r.quizBundle.unresolved.length
            ? "failed"
            : "unknown",
        contentVersion: r.contentVersion,
        reference: sourceRef(
          "docs/curriculum-pilot/g1-u1/package.json",
          "technicalReview (local snapshot only)",
          r.contentVersion,
        ),
      },
      curriculumReview: pending(r.contentVersion),
      publication: { status: "draft", contentVersion: r.contentVersion },
    })),
    checkpoints: [
      {
        id: EXAM,
        quizId: EXAM,
        contentVersion: checkpointVersion,
        unitIds: [UNIT],
        technicalQa: {
          status: rows.some((r) => r.quizBundle.missing.length || r.quizBundle.unresolved.length)
            ? "failed"
            : "unknown",
          contentVersion: checkpointVersion,
          reference: sourceRef(
            "docs/curriculum-pilot/g1-u1/package.json",
            "technicalReview (local snapshot only)",
            checkpointVersion,
          ),
        },
        curriculumReview: pending(checkpointVersion),
        publication: { status: "draft", contentVersion: checkpointVersion },
      },
    ],
  };
  const inventory = {
    catalogVersion,
    registryVersion,
    standardIds: catalog.map((c) => c.standardId),
    lessons: rows.map((r) => ({
      lessonId: r.id,
      slug: r.slug,
      grade: 1,
      contentVersion: r.contentVersion,
    })),
    quizzes: [
      { id: EXAM, contentVersion: checkpointVersion },
      ...rows.map((r) => ({ id: r.quizId, contentVersion: r.quizBundle.version })),
    ],
  };
  const artifacts = rows.map(({ quizSource, lessonSource, ...r }) => ({
    ...r,
    lessonFile: lessonSource.file,
    quizFile: quizSource.file,
  }));
  const dependencies = [
    ...new Map(
      rows
        .flatMap((r) => [...r.lessonBundle.files, ...r.quizBundle.files])
        .concat([
          { file: exam.file, sha256: hash(exam.code) },
          { file: roadmapPath, sha256: hash(roadmap) },
          {
            file: "app/data/sample-lessons.json",
            sha256: digest(root, "app/data/sample-lessons.json"),
          },
          { file: "app/data/lessons-v2/index.ts", sha256: hash(lessonRegistry) },
          { file: "app/data/quizzes-v2/index.ts", sha256: hash(quizRegistry) },
        ])
        .map((f) => [f.file, f]),
    ).values(),
  ].sort((a, b) => a.file.localeCompare(b.file));
  return {
    release,
    inventory,
    artifacts,
    checkpoint: {
      id: EXAM,
      contentVersion: checkpointVersion,
      askCount: Number(property(exam.object, "askCount").getText()),
      adaptive: property(exam.object, "adaptive").getText() === "true",
      items,
      threshold: null,
      interpretation: "sample-response-evidence-only",
      persistence: "not-connected-to-production",
    },
    dependencies,
    technicalReview: {
      identityAndQuestionReferences: "passed",
      assetBytes: "local-snapshot-only",
      missingFiles: dependencies.filter((d) => d.sha256 === null).map((d) => d.file),
      unresolvedResources: rows.flatMap((r) => [
        ...r.lessonBundle.unresolved,
        ...r.quizBundle.unresolved,
      ]),
      curriculumApproval: "pending",
      productionRelease: "draft",
    },
  };
}

export function verifyPilotSnapshot(root, packaged) {
  const current = packagePilot(root);
  const changed = packaged.dependencies
    .filter((d) => digest(root, d.file) !== d.sha256)
    .map((d) => d.file);
  const known = new Set(packaged.dependencies.map((d) => d.file));
  changed.push(...current.dependencies.filter((d) => !known.has(d.file)).map((d) => d.file));
  if (current.release.releaseId !== packaged.release.releaseId && !changed.length)
    changed.push("release-content-changed");
  return [...new Set(changed)].sort();
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const arg = (name) => process.argv[process.argv.indexOf(name) + 1];
  if (!process.argv.includes("--root") || !process.argv.includes("--out"))
    throw new Error("--root and --out are required");
  const root = path.resolve(arg("--root")),
    out = path.resolve(arg("--out"));
  if (process.argv.includes("--verify")) {
    const changed = verifyPilotSnapshot(
      root,
      JSON.parse(fs.readFileSync(path.join(out, "package.json"), "utf8")),
    );
    console.log(JSON.stringify({ changed }, null, 2));
    if (changed.length) process.exitCode = 1;
  } else {
    const packaged = packagePilot(root);
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, "package.json"), JSON.stringify(packaged, null, 2) + "\n");
    fs.writeFileSync(
      path.join(out, "release.json"),
      JSON.stringify(packaged.release, null, 2) + "\n",
    );
    console.log(
      JSON.stringify(
        {
          release: packaged.release.releaseId,
          lessons: packaged.release.lessons.length,
          checkpointItems: packaged.checkpoint.items.length,
          technicalReview: packaged.technicalReview,
        },
        null,
        2,
      ),
    );
  }
}
