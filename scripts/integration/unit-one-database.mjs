const { PGlite } = await import(
  process.env.READEE_PGLITE_MODULE ??
    "/private/tmp/k1-db-check/node_modules/@electric-sql/pglite/dist/index.js"
);
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table public.children(id uuid primary key,parent_id uuid references auth.users(id),carrots integer default 0,lifetime_carrots integer default 0,last_lesson_at timestamptz);
create table public.practice_results(id serial primary key,child_id uuid references public.children(id) on delete cascade,standard_id text,questions_attempted int,questions_correct int,carrots_earned int);
grant usage on schema public,auth to authenticated,anon,service_role;grant select on public.children to authenticated;
create function public.award_carrots(p_child_id uuid,p_amount integer,p_count boolean) returns void language sql as $$update public.children set carrots=carrots+p_amount,lifetime_carrots=lifetime_carrots+p_amount where id=p_child_id$$;`);
await db.exec(readFileSync("supabase/migrations/202609150001_approved_unit_sessions.sql", "utf8"));
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222",
  child = "33333333-3333-4333-8333-333333333333";
await db.query("insert into auth.users values($1),($2)", [a, b]);
await db.query("insert into children(id,parent_id) values($1,$2)", [child, a]);
async function save(parent, rev, state, done = false) {
  return db.query("select public.save_approved_unit($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [
    parent,
    child,
    "test-release",
    "rhyme-time",
    rev,
    JSON.stringify(state),
    done,
    JSON.stringify({ correct: 2, attempted: 3 }),
    12,
    "RF.K.2a",
  ]);
}
await assert.rejects(() => save(b, 0, {}));
await save(a, 0, { step: 1 });
await save(a, 1, { step: 2 }, true);
await save(a, 1, { step: 2 }, true); // lost response: replay exactly the same request
await assert.rejects(() => save(a, 1, { step: 3 }, true)); // stale second tab
await save(a, 2, { step: 3 }, true); // reopening celebration cannot pay again
assert.equal((await db.query("select carrots from children")).rows[0].carrots, 12);
assert.equal((await db.query("select count(*)::int as n from practice_results")).rows[0].n, 1);
assert.equal(
  (await db.query("select questions_correct from practice_results")).rows[0].questions_correct,
  2,
);
await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${b}',false)`);
assert.equal((await db.query("select * from approved_unit_sessions")).rows.length, 0);
await assert.rejects(() => db.query("update approved_unit_sessions set completed=true"));
await assert.rejects(() => save(a, 3, { step: 4 }, true));
await db.exec(`select set_config('request.jwt.claim.sub','${a}',false)`);
assert.equal((await db.query("select * from approved_unit_sessions")).rows.length, 1);
await db.exec("reset role");
const budget = await Promise.all(
  Array.from({ length: 8 }, () =>
    db.query("select reserve_unit_service($1,$2,$3) as ok", [a, "speech", 3]),
  ),
);
assert.equal(budget.filter((r) => r.rows[0].ok).length, 3);
await db.query("delete from children where id=$1", [child]);
assert.equal((await db.query("select * from approved_unit_sessions")).rows.length, 0);
await db.close();
console.log(
  "PASS: migration, ownership, RLS, write denial, RPC denial, atomic completion, replay, stale writer, real score, service budget, child deletion cascade.",
);
