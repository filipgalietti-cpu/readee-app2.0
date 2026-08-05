/**
 * Build-time generator for Luna's decodable passage LIBRARY.
 *
 * For each phonics pattern in app/data/luna-phonics.json, generate N short
 * decodable passages loaded with that pattern. Output is frozen into
 * app/data/luna-library.json so runtime never generates — it just PICKS
 * (targeted by the reader's weakest pattern). This is the "predetermined
 * content" / duolingo-style model: Gemini authors offline, we serve instantly.
 *
 * Usage:
 *   npx tsx scripts/gen-luna-library.ts --grade=K --perPattern=1     # small proof batch
 *   npx tsx scripts/gen-luna-library.ts --perPattern=4               # full run
 *   npx tsx scripts/gen-luna-library.ts --grade=1st,2nd --perPattern=3
 *
 * Merges into the existing library by id (safe to re-run / extend).
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" }); loadEnv();
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { generatePassage } from "@/lib/ai/readee-ai";

const THEMES = ["animals", "playing outside", "family", "food and snacks", "at school", "a rainy day", "the beach", "space and stars"];
const LIB_PATH = path.join(process.cwd(), "app/data/luna-library.json");
const PHONICS_PATH = path.join(process.cwd(), "app/data/luna-phonics.json");
const SYSTEM_ID = "00000000-0000-0000-0000-000000000000"; // usage-log id only (fire-and-forget)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function arg(name: string, def: string) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : def;
}

type Pattern = { id: string; grade: string; order: number; label: string; ccss: string; focus: string; exampleWords: string[] };
type Entry = { id: string; grade: string; patternId: string; patternLabel: string; ccss: string; theme: string; title: string; text: string; targetWords: string[] };

(async () => {
  const gradesArg = arg("grade", "").trim();
  const grades = gradesArg ? gradesArg.split(",").map((s) => s.trim()) : null;
  const perPattern = parseInt(arg("perPattern", "1"), 10);

  const phonics = JSON.parse(await fs.readFile(PHONICS_PATH, "utf-8")) as { patterns: Pattern[] };
  let patterns = phonics.patterns;
  if (grades) patterns = patterns.filter((p) => grades.includes(p.grade));

  let lib: Entry[] = [];
  try { lib = JSON.parse(await fs.readFile(LIB_PATH, "utf-8")); } catch { lib = []; }
  const byId = new Map(lib.map((e) => [e.id, e]));

  let made = 0, failed = 0;
  for (const p of patterns) {
    for (let n = 1; n <= perPattern; n++) {
      const id = `${p.id}-${n}`;
      if (byId.has(id)) { console.log("skip (exists)", id); continue; }
      const theme = THEMES[(p.order + n) % THEMES.length];
      const res = await generatePassage({
        teacherId: SYSTEM_ID,
        topic: `a short, fun, decodable story about ${theme} that a ${p.grade} reader will enjoy reading out loud`,
        gradeLevel: p.grade,
        phonicsPattern: `${p.focus}. Use MANY words with this pattern so the child gets real practice; keep every other word simple and decodable.`,
        lengthLevel: "short",
        trustedSystem: true,
      });
      if (!res.ok) { console.log("FAIL", id, res.error); failed++; await sleep(4000); continue; }
      const text = res.passage.passage.trim();
      const lower = text.toLowerCase();
      const targetWords = p.exampleWords.filter((w) => lower.includes(w.toLowerCase()));
      const entry: Entry = { id, grade: p.grade, patternId: p.id, patternLabel: p.label, ccss: p.ccss, theme, title: res.passage.title, text, targetWords: targetWords.length ? targetWords : p.exampleWords.slice(0, 4) };
      byId.set(id, entry);
      made++;
      console.log("OK", id, `"${res.passage.title}" — targets: ${entry.targetWords.join(", ")}`);
      await sleep(3500); // gentle on quota
    }
  }

  const out = [...byId.values()].sort((a, b) => a.patternId.localeCompare(b.patternId) || a.id.localeCompare(b.id));
  await fs.writeFile(LIB_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`\ndone — made ${made}, failed ${failed}, library total ${out.length} → app/data/luna-library.json`);
})();
