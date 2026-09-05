/**
 * Backfill the V2 journey's tailoring for placements saved before it existed:
 * writes plan.tailoring onto each child's LATEST placement and the placement
 * credit rows in journey_v2_progress (replacing any earlier credits).
 *
 *   npx tsx scripts/journey-credits-backfill.ts --dry     # report only
 *   npx tsx scripts/journey-credits-backfill.ts           # write
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();
import { createClient } from "@supabase/supabase-js";
import { tailor } from "../lib/journey-v2/tailor";
import { creditRows, creditedLessonsFor } from "../lib/journey-v2/credits";
import type { PlacementDecision } from "../lib/placement/decide";

const DRY = process.argv.includes("--dry");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const admin = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data: rows, error } = await admin.from("placements").select("id, child_id, decision, plan, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  const seen = new Set<string>();
  let written = 0;
  for (const r of rows ?? []) {
    const childId = String(r.child_id);
    if (seen.has(childId)) continue; // latest placement per child only
    seen.add(childId);
    const decision = r.decision as PlacementDecision;
    const plan = (r.plan ?? {}) as Record<string, unknown>;
    const { data: child } = await admin.from("children").select("first_name").eq("id", childId).maybeSingle();
    const childName = (String(child?.first_name ?? "").split(" ")[0] || "Your child");
    const credits = creditedLessonsFor(decision.seeds.filter((s) => s.pass).map((s) => s.standard_id));
    const tailoring = tailor(decision, { childName, creditedLessons: credits.length });
    console.log(`${childId} placement ${String(r.id).slice(0, 8)} band ${decision.placedBand} → ${tailoring.difficulty}, priority ${tailoring.priorityDomains.join("/") || "-"}, credits ${credits.length}${plan.tailoring ? " (had tailoring)" : ""}`);
    if (DRY) continue;
    await admin.from("placements").update({ plan: { ...plan, tailoring } }).eq("id", r.id);
    await admin.from("journey_v2_progress").delete().eq("child_id", childId).eq("source", "placement");
    const cr = creditRows(childId, credits);
    if (cr.length) await admin.from("journey_v2_progress").insert(cr);
    written++;
  }
  console.log(`${seen.size} children, ${written} written${DRY ? " (dry run)" : ""}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
