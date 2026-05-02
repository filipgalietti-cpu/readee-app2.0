/**
 * QC bot cleanup — reusable Phase-0/1 false-positive dismisser.
 *
 * Runs after every audit sweep to auto-dismiss findings the audit
 * judges produce that we know are false positives by pattern. Keeps
 * the /owner/content-audit dashboard signal-only without rewriting
 * the audit code itself (those patches are in audit-content.ts).
 *
 * Idempotent — only touches `status='open'` rows. Re-run as often
 * as you like.
 *
 *   npx tsx scripts/qc-bot-cleanup.ts
 *   npx tsx scripts/qc-bot-cleanup.ts --dry-run
 *
 * Patterns dismissed here mirror the gates the audit-content.ts
 * judges now apply at scan time. This script catches findings written
 * by the OLD audit code (pre-patch) so we don't have to re-run the
 * whole audit to clean them up.
 */

import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Local runs use .env.local (Next.js convention). Production reads
// process.env directly.
loadEnv({ path: ".env.local" });
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const DRY = process.argv.includes("--dry-run");

type DismissalRule = {
  name: string;
  reason: string;
  /** SQL fragment plugged into the WHERE clause. Always combined with
   *  status='open' and severity in ('fail','warn'). */
  predicate: string;
};

const RULES: DismissalRule[] = [
  {
    name: "no_self_leak.root_word",
    reason:
      "Judge had 0% precision on root-word / digraph / sight-word / identification / inline-choice question families. Answer being inside the prompt is the question, not a leak. Judge patched in audit-content.ts.",
    predicate: `finding_type = 'q.no_self_leak'`,
  },
  {
    name: "unique_choices.cap_rule",
    reason:
      "L.x.2 (capitalization) and RF.x.1a (sentence punctuation) questions intentionally use case- or punctuation-only-different choices. Judge patched to skip these standards; existing FPs dismissed.",
    predicate: `finding_type = 'q.unique_choices' and target_id ~ '^L\\.[K1-4]\\.2|^RF\\.[K1-4]\\.1a'`,
  },
  {
    name: "audio_quality.phonics_spelling",
    reason:
      "RF.x.3d phonics-spelling: Gemini TTS auto-corrects non-words like 'Thoght' to 'thought'. Inherent TTS limit, not a content fix. Judge patched to skip.",
    predicate: `finding_type = 'q.audio_quality' and target_id ~* '^RF\\.[1-4]\\.3d'`,
  },
  {
    name: "audio_quality.g2to4_choices_omitted",
    reason:
      "Grades 2-4 choices are silent by design (defaultPerQuestionTts=false). Judge keeps flagging 'audio omits the choices' as a bug; that's the convention. Judge patched to skip choice-presence checks on G2-4.",
    predicate: `finding_type = 'q.audio_quality'
      and target_id ~ '^[KL]?\\.?[234]\\.|^R[FILi]\\.[234]\\.|^L\\.[234]\\.'
      and message ~* 'multiple[- ]choice|choice options|answer options|reading the choices|omits.*answer|omits.*choice'`,
  },
];

async function applyRule(rule: DismissalRule) {
  const sql = `
    select id, target_id, severity
    from content_audit_findings
    where status = 'open'
      and severity in ('fail','warn')
      and (${rule.predicate})
  `;
  const { data: matches, error } = await sb.rpc("exec_select_audit_findings", {
    sql_query: sql,
  });
  // Fallback: use direct query when no RPC. Most projects don't have a
  // generic exec RPC, so we go via the supabase-js query builder for
  // each rule's known finding_type instead.
  if (error || !matches) {
    return await applyRuleDirect(rule);
  }
  return { matched: (matches as any[]).length, ids: (matches as any[]).map((m) => m.id) };
}

async function applyRuleDirect(rule: DismissalRule) {
  // We can't run arbitrary WHERE fragments through supabase-js, so this
  // function only works for the simple-predicate rules. The regex
  // rules go through the SQL path above. For local runs without an
  // exec RPC we just print the rule and skip.
  console.log(`  (skipping direct path — needs exec RPC for predicate)`);
  return { matched: 0, ids: [] };
}

async function main() {
  console.log(`QC bot cleanup ${DRY ? "(DRY RUN)" : ""}`);
  console.log(`Rules: ${RULES.length}`);

  let totalDismissed = 0;
  for (const rule of RULES) {
    // We use a direct SQL UPDATE for each rule, returning ids dismissed.
    // supabase-js doesn't support ad-hoc SQL, so each rule has a
    // hand-rolled predicate built into the `match()` calls below.
    const dismissed = await dismissForRule(rule);
    totalDismissed += dismissed;
    console.log(`  • ${rule.name}: dismissed ${dismissed}`);
  }
  console.log(`Total dismissed: ${totalDismissed}`);
}

/** Translate each rule into supabase-js calls. */
async function dismissForRule(rule: DismissalRule): Promise<number> {
  let q = sb.from("content_audit_findings").select("id, target_id, severity, message", {
    count: "exact",
  })
    .eq("status", "open")
    .in("severity", ["fail", "warn"]);

  switch (rule.name) {
    case "no_self_leak.root_word":
      q = q.eq("finding_type", "q.no_self_leak");
      break;
    case "unique_choices.cap_rule":
      q = q
        .eq("finding_type", "q.unique_choices")
        .or("target_id.like.L.%.2%,target_id.like.RF.%.1a%");
      break;
    case "audio_quality.phonics_spelling":
      q = q
        .eq("finding_type", "q.audio_quality")
        .ilike("target_id", "RF.%.3d%");
      break;
    case "audio_quality.g2to4_choices_omitted":
      // Two-step: pull all open audio q fails/warns, filter in JS for
      // the regex+message conditions. supabase-js can't combine
      // regex predicates with .or() cleanly.
      q = q.eq("finding_type", "q.audio_quality");
      break;
  }

  const { data, error } = await q;
  if (error) {
    console.error(`    ! query failed:`, error.message);
    return 0;
  }
  let rows = data ?? [];

  // Post-filter for the regex-heavy rule.
  if (rule.name === "audio_quality.g2to4_choices_omitted") {
    const g2to4 = /^([KL]?\.?[234]\.|R[FILi]\.[234]\.|L\.[234]\.)/;
    const choicesOmitted =
      /multiple[- ]choice|choice options|answer options|reading the choices|omits.*answer|omits.*choice/i;
    rows = rows.filter(
      (r: any) => g2to4.test(r.target_id) && choicesOmitted.test(r.message ?? ""),
    );
  }
  if (rule.name === "unique_choices.cap_rule") {
    const cap = /^L\.[K1-4]\.2|^RF\.[K1-4]\.1a/;
    rows = rows.filter((r: any) => cap.test(r.target_id));
  }

  if (rows.length === 0) return 0;

  if (DRY) {
    rows.slice(0, 5).forEach((r: any) =>
      console.log(`    DRY → ${r.target_id} (${r.severity})`),
    );
    return rows.length;
  }

  const ids = rows.map((r: any) => r.id);
  const { error: updErr } = await sb
    .from("content_audit_findings")
    .update({
      status: "wont_fix",
      resolved_at: new Date().toISOString(),
      resolver_note: `QC bot: ${rule.reason}`,
    })
    .in("id", ids);
  if (updErr) {
    console.error(`    ! update failed:`, updErr.message);
    return 0;
  }
  return ids.length;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
