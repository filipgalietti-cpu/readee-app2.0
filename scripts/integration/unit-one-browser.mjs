/** Synthetic local parent/child. Runs real Next routes + production SQL in an isolated Postgres engine. */
const { PGlite } = await import(
  process.env.READEE_PGLITE_MODULE ??
    "/private/tmp/k1-db-check/node_modules/@electric-sql/pglite/dist/index.js"
);
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const parent = "11111111-1111-4111-8111-111111111111",
  child = "33333333-3333-4333-8333-333333333333";
const db = new PGlite();
await db.exec(
  `create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select null::uuid$$;create table children(id uuid primary key,parent_id uuid,carrots int default 0,lifetime_carrots int default 0,last_lesson_at timestamptz);create table practice_results(id serial primary key,child_id uuid,standard_id text,questions_attempted int,questions_correct int,carrots_earned int);create function award_carrots(uuid,integer,boolean) returns void language sql as $$update children set carrots=carrots+$2,lifetime_carrots=lifetime_carrots+$2 where id=$1$$;`,
);
await db.exec(readFileSync("supabase/migrations/202609150001_approved_unit_sessions.sql", "utf8"));
await db.query("insert into auth.users values($1)", [parent]);
await db.query("insert into children(id,parent_id) values($1,$2)", [child, parent]);
const user = {
  id: parent,
  aud: "authenticated",
  role: "authenticated",
  email: "local-fixture@example.invalid",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  created_at: new Date().toISOString(),
};
const profile = {
  id: parent,
  email: user.email,
  role: "parent",
  plan: "premium",
  tos_version: "v2.0",
  onboarding_complete: true,
};
let calls = [],
  requests = [];
const mock = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3452");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "authorization,apikey,content-type,x-client-info,x-supabase-api-version",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }
  const url = new URL(req.url, "http://127.0.0.1:3453");
  requests.push(url.pathname);
  let raw = "";
  for await (const c of req) raw += c;
  try {
    let value;
    if (url.pathname === "/auth/v1/user") value = user;
    else if (url.pathname.includes("/rest/v1/rpc/")) {
      const fn = url.pathname.split("/").at(-1),
        args = JSON.parse(raw);
      calls.push(fn);
      if (!["save_approved_unit", "reserve_unit_service"].includes(fn))
        throw Error("Unexpected RPC " + fn);
      const keys = Object.keys(args);
      value = (
        await db.query(
          `select ${fn}(${keys.map((k, n) => `${k}=>$${n + 1}`).join(",")}) as value`,
          keys.map((k) =>
            typeof args[k] === "object" && args[k] !== null ? JSON.stringify(args[k]) : args[k],
          ),
        )
      ).rows[0].value;
    } else if (url.pathname.endsWith("/approved_unit_sessions")) {
      const where = [],
        values = [];
      for (const key of ["child_id", "release_id", "lesson_id", "completed"]) {
        const v = url.searchParams.get(key);
        if (v?.startsWith("eq.")) {
          values.push(key === "completed" ? v.slice(3) === "true" : v.slice(3));
          where.push(`${key}=$${values.length}`);
        }
      }
      value = (
        await db.query(
          `select * from approved_unit_sessions ${where.length ? "where " + where.join(" and ") : ""}`,
          values,
        )
      ).rows;
      if (req.headers.accept?.includes("vnd.pgrst.object")) value = value[0] ?? null;
    } else if (url.pathname.endsWith("/profiles"))
      value = req.headers.accept?.includes("vnd.pgrst.object") ? profile : [profile];
    else if (url.pathname.endsWith("/children")) {
      const id = url.searchParams.get("id");
      const owner = url.searchParams.get("parent_id");
      const row =
        (!id || id === `eq.${child}`) && (!owner || owner === `eq.${parent}`)
          ? {
              id: child,
              parent_id: parent,
              first_name: "Test Reader",
              carrots: 0,
              streak_days: 0,
              equipped_items: {},
            }
          : null;
      value = req.headers.accept?.includes("vnd.pgrst.object") ? row : row ? [row] : [];
    } else value = [];
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(value));
  } catch (e) {
    res.statusCode = 400;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ message: e.message, code: e.code ?? "test" }));
  }
});
await new Promise((r) => mock.listen(3453, "127.0.0.1", r));
const childEnv = {
  ...process.env,
  APPROVED_K_UNIT_ONE_ENABLED: "true",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3453",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-fixture-anon",
  SUPABASE_SERVICE_ROLE_KEY: "local-fixture-service",
  NEXT_PUBLIC_POSTHOG_KEY: "",
  NEXT_PUBLIC_SENTRY_DSN: "",
  SENTRY_DSN: "",
  SENTRY_AUTH_TOKEN: "",
  AZURE_SPEECH_KEY: "",
  GEMINI_API_KEY: "",
  STRIPE_SECRET_KEY: "sk_test_local_fixture_not_a_real_key",
  RESEND_API_KEY: "re_local_fixture_not_a_real_key",
};
if (process.env.READEE_TEST_PRODUCTION === "1") {
  const build = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "build",
      ...(process.env.READEE_BUILD_WEBPACK === "1" ? ["--webpack"] : []),
    ],
    {
      env: childEnv,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  build.stdout.on("data", (x) => (output += x));
  build.stderr.on("data", (x) => (output += x));
  const code = await new Promise((r) => build.on("exit", r));
  writeFileSync("/private/tmp/k1-production-build.log", output);
  if (code !== 0) {
    mock.close();
    await db.close();
    throw Error("Production build failed: see /private/tmp/k1-production-build.log");
  }
}
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    ...(process.env.READEE_TEST_PRODUCTION ? ["start"] : ["dev", "--webpack"]),
    "--port",
    "3452",
  ],
  { env: childEnv, stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
server.stdout.on("data", (x) => (logs += x));
server.stderr.on("data", (x) => (logs += x));
let browser, page;
try {
  for (let n = 0; n < 120; n++) {
    try {
      await fetch("http://localhost:3452/api/approved-unit");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    bypassCSP: true,
    serviceWorkers: "block",
    viewport: { width: 1280, height: 800 },
  });
  await context.route("**/*", async (route) => {
    const u = new URL(route.request().url());
    const headers = { ...route.request().headers() };
    delete headers["if-none-match"];
    delete headers["if-modified-since"];
    if (!["127.0.0.1", "localhost"].includes(u.hostname)) return route.abort();
    if (u.pathname.endsWith("/chunks/webpack.js")) {
      for (let n = 0; n < 5; n++) {
        const r = await route.fetch({ headers });
        const body = await r.body();
        if (body.length) return route.fulfill({ response: r, body });
        console.log("Retry empty development webpack runtime");
        await new Promise((r) => setTimeout(r, 100));
      }
      throw Error("Development runtime stayed empty");
    }
    return route.continue({ headers });
  });
  const failures = [];
  context.on("page", (p) => {
    p.on("response", async (r) => {
      if (r.url().includes("/chunks/webpack.js"))
        console.log("webpack", r.status(), (await r.body()).length);
    });
    p.on("pageerror", (e) => failures.push(e.message));
    p.on("response", (r) => {
      if (new URL(r.url()).pathname.startsWith("/lesson-studio/") && r.status() >= 400)
        failures.push(`Asset ${r.status()}: ${new URL(r.url()).pathname}`);
    });
    p.on("console", (m) => {
      if (m.type() === "error") console.log("any-page:", m.text());
    });
  });
  const base = "http://localhost:3452";
  const jwt =
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url") +
    "." +
    Buffer.from(
      JSON.stringify({
        sub: parent,
        role: "authenticated",
        aud: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url") +
    "." +
    Buffer.alloc(32, 1).toString("base64url");
  const session = {
    access_token: jwt,
    refresh_token: "local-fixture",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: "bearer",
    user,
  };
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value: "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
      url: base,
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);
  page = await context.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") console.log("browser:", m.text());
  });
  page.on("requestfailed", (r) =>
    console.log(
      "failed:",
      new URL(r.url()).origin,
      new URL(r.url()).pathname,
      r.failure()?.errorText,
    ),
  );
  // Discovery uses the same approved player, but never writes the reader's progress.
  await page.goto(`${base}/explore?child=${child}`, {waitUntil:"networkidle",timeout:120000});
  await page.getByRole("heading",{name:"Meet our Kindergarten adventures"}).waitFor();
  assert.equal(await page.locator("#approved-k-heading").locator("..").getByRole("heading",{level:3}).count(),8);
  for(const width of [390,768,1280]){
    await page.setViewportSize({width,height:800});
    await page.locator("#approved-k-heading").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Showcase has no horizontal overflow");
    await page.screenshot({path:`/private/tmp/k1-discovery-${width}.png`,fullPage:true});
  }
  await page.goto(`${base}/placement/ready?child=${child}`,{waitUntil:"networkidle"});
  await page.getByRole("link",{name:"Meet the Kindergarten lessons"}).click();
  await page.waitForURL(`**/explore?child=${child}`);
  await page.goto(`${base}/learn?standard=RL.K.1&preview=1`,{waitUntil:"networkidle"});
  assert.ok(page.url().includes("/learn/unit-one/sample"),"Old sample link reaches approved player");
  await page.getByRole("button",{name:/let.s begin/i}).click();
  await page.getByRole("button",{name:/let.s play/i}).waitFor();
  await page.screenshot({path:"/private/tmp/k1-discovery-sample.png"});
  assert.equal((await db.query("select count(*)::int as n from approved_unit_sessions")).rows[0].n,0,"Sample cannot create child progress");
  assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith("readee:preview:"))),[],"Sample evidence stays in memory");
  const sampleSpeech=await context.request.post(base+"/api/approved-unit/sample",{headers:{origin:base},data:{kind:"speech"}});
  assert.equal(sampleSpeech.status(),503,"Unavailable speech is honest; no dev endpoint fallback");
  const escape=await context.request.post(base+"/api/approved-unit/sample",{headers:{origin:base},data:{kind:"speech",lessonId:"rhyme-time"}});
  assert.equal(escape.status(),400,"Sample cannot escape its lesson scope");
  console.log("PASS approved showcase, three viewports, assessment handoff, sample route and non-persistence");
  await page.goto(`${base}/learn/unit-one?child=${child}`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });

  await page.getByText("Let’s grow, Test Reader!").waitFor({ timeout: 30000 });
  assert.equal(
    await page.getByRole("link").filter({ hasText: "Warm-up, lesson and practice" }).count(),
    8,
  );
  assert.equal(await page.getByRole("link", { name: "Start the unit exam" }).count(), 0);
  mkdirSync("docs/integration/evidence", { recursive: true });
  await page.screenshot({ path: "docs/integration/evidence/unit-one-index.png" });
  const response = await context.request.get(
    `${base}/api/approved-unit/rhyme-time?child=44444444-4444-4444-8444-444444444444`,
  );
  assert.equal(response.status(), 404);
  const exam = await context.request.get(
    `${base}/api/approved-unit/k-unit-1-checkpoint?child=${child}`,
  );
  assert.equal(exam.status(), 409);
  profile.plan = "free";
  const locked = await context.request.get(`${base}/api/approved-unit/rhyme-time?child=${child}`);
  assert.equal(locked.status(), 403);
  const included = await context.request.get(
    `${base}/api/approved-unit/key-details?child=${child}`,
  );
  assert.equal(included.status(), 200);
  profile.plan = "premium";
  await page.getByRole("link").filter({ hasText: "Rory’s Rhyme Workshop" }).click();
  await page.getByRole("button", { name: /let.s begin/i }).click({ timeout: 60000 });
  await page.getByRole("button", { name: /let.s play/i }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "docs/integration/evidence/rory-authenticated-warmup.png" });
  for (let n = 0; n < 50; n++) {
    if ((await db.query("select * from approved_unit_sessions")).rows.length) break;
    await page.waitForTimeout(200);
  }
  const saved = (await db.query("select * from approved_unit_sessions")).rows;
  assert.equal(saved.length, 1);
  assert.equal(saved[0].child_id, child);
  assert.equal(saved[0].state.lesson.flowId, "rhyme-time-v1");
  assert.equal(
    await page.evaluate(() =>
      Object.keys(localStorage).some((k) => k.startsWith("readee:preview:")),
    ),
    false,
  );
  await page.close();
  page = await context.newPage();
  await page.goto(`${base}/learn/unit-one?child=${child}&lesson=rhyme-time`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: /let.s begin/i }).click();
  await page.getByRole("button", { name: /let.s play/i }).waitFor();
  assert.equal(
    (await db.query("select * from approved_unit_sessions")).rows[0].state.lesson.sessionId,
    saved[0].state.lesson.sessionId,
  );
  const fixtures = JSON.parse(readFileSync("docs/integration/evidence/fixtures.json", "utf8"));
  for (const f of fixtures) {
    await db.query(
      `insert into approved_unit_sessions(child_id,release_id,lesson_id,state) values($1,$2,$3,$4) on conflict(child_id,release_id,lesson_id) do update set state=excluded.state,revision=0`,
      [child, "k1-2026-09-14", f.id, JSON.stringify(f.state)],
    );
    await page.goto(`${base}/learn/unit-one?child=${child}&lesson=${f.id}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.getByRole("button", { name: /continue your practice|let.s begin/i }).click();
    await page.getByRole("button", { name: f.choice, exact: true }).waitFor({ timeout: 20000 });
    await page.waitForTimeout(650);
    await page.screenshot({ path: `docs/integration/evidence/${f.id}-question.png` });
    assert.deepEqual(
      await page
        .locator("img")
        .evaluateAll((images) =>
          images
            .filter(
              (i) =>
                i.getBoundingClientRect().width > 0 &&
                i.getBoundingClientRect().height > 0 &&
                (!i.complete || i.naturalWidth === 0),
            )
            .map((i) => i.getAttribute("src")),
        ),
      [],
      `${f.id} visible images loaded`,
    );
    if (f.id === "letter-pairs") {
      for (const viewport of [
        { width: 390, height: 844 },
        { width: 768, height: 1024 },
      ]) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(400);
        const box = await page.getByRole("button", { name: f.choice, exact: true }).boundingBox();
        assert.ok(
          box &&
            box.x >= 0 &&
            box.y >= 0 &&
            box.x + box.width <= viewport.width + 1 &&
            box.y + box.height <= viewport.height + 1,
          "Letter choice fits viewport",
        );
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          "No horizontal overflow",
        );
        await page.screenshot({
          path: `docs/integration/evidence/letter-pairs-${viewport.width}.png`,
        });
      }
      await page.setViewportSize({ width: 1280, height: 800 });
    }
    await page.getByRole("button", { name: f.choice, exact: true }).click();
    let row;
    for (let n = 0; n < 80; n++) {
      row = (
        await db.query(
          "select state from approved_unit_sessions where child_id=$1 and lesson_id=$2",
          [child, f.id],
        )
      ).rows[0];
      if (row?.state.lesson.evidence[f.evidenceKey]?.submissions?.length) break;
      await page.waitForTimeout(150);
    }
    assert.equal(
      row.state.lesson.evidence[f.evidenceKey].submissions.length,
      1,
      `${f.id} answer saved`,
    );
  }
  await db.query("update approved_unit_sessions set completed=true where child_id=$1", [child]);
  await page.goto(`${base}/learn/unit-one?child=${child}`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Start the unit exam" }).waitFor();
  await page.getByRole("link", { name: "Start the unit exam" }).click();
  await page
    .getByRole("button", { name: /let.s begin|start/i })
    .first()
    .waitFor();
  await page.screenshot({ path: "docs/integration/evidence/exam-authenticated-entry.png" });
  const rubric = JSON.parse(readFileSync("docs/integration/evidence/exam-rubric.json", "utf8"));
  const speech = await context.request.post(`${base}/api/approved-unit/k-unit-1-checkpoint`, {
    headers: { origin: base },
    data: { child, kind: "response", rubricId: rubric.id, transcript: "M.", confidence: 0.5 },
  });
  assert.equal(speech.status(), 200);
  const verdict = await speech.json();
  assert.equal(verdict.verdict, "accepted");
  assert.ok(verdict.receipt);
  const badRubric = await context.request.post(`${base}/api/approved-unit/rhyme-time`, {
    headers: { origin: base },
    data: { child, kind: "response", rubricId: rubric.id, transcript: "M.", confidence: 0.5 },
  });
  assert.equal(badRubric.status(), 400);
  const noMic = await context.request.post(`${base}/api/approved-unit/rhyme-time`, {
    headers: { origin: base },
    data: { child, kind: "speech" },
  });
  assert.equal(noMic.status(), 503);
  assert.equal(failures.length, 0, failures.join("\n"));
  writeFileSync(
    "docs/integration/evidence/browser.json",
    JSON.stringify(
      {
        passed: true,
        checks: [
          "authenticated unit index",
          "eight lesson links",
          "exam locked",
          "existing free and paid entitlements enforced",
          "cross-family reader rejected",
          "real player mounted",
          "real save endpoint to SQL",
          "reopening retains session",
          "no preview localStorage",
          "eight real lesson choices persisted",
          "visible question images loaded and no lesson asset HTTP errors",
          "letter choices fit 390px and 768px viewports",
          "exam unlock after eight completions",
          "objective letter server verdict and signed receipt",
          "cross-package rubric rejected",
          "missing Azure configuration stays unavailable",
        ],
        rpcCalls: calls,
      },
      null,
      2,
    ),
  );
  console.log("PASS authenticated unit, player, persistence, reload, isolation, exam lock.");
} catch (e) {
  if (page) {
    console.log(
      "FAILURE DIAGNOSTIC",
      await page.evaluate(async () => ({
        locks: await navigator.locks.query(),
        resources: performance.getEntriesByType("resource").map((r) => ({
          url: r.name.replace(/\?.*/, ""),
          duration: r.duration,
          size: r.transferSize,
        })),
        scripts: [...document.scripts].map((s) => s.src),
        ready: document.readyState,
      })),
    );
    await page.screenshot({ path: "/private/tmp/k1-browser-failure.png" });
    writeFileSync("/private/tmp/k1-browser-failure.txt", await page.locator("body").innerText());
  }
  throw e;
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
  mock.close();
  await db.close();
  writeFileSync("/private/tmp/k1-browser-next.log", logs);
  writeFileSync("/private/tmp/k1-mock-requests.json", JSON.stringify(requests));
}
