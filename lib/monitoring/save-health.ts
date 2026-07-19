/**
 * Save-health monitor — the safety net for silent save failures.
 *
 * In July a trigger writing an RLS-locked table silently rolled back EVERY
 * practice_results insert for ~7 days, unnoticed. The tell-tale signature:
 * kids were actively answering (practice_answers kept writing) while ZERO
 * completions persisted (practice_results). This checks exactly that signature
 * daily and emails the owner if it recurs — catching an outage in a day
 * instead of a week. Using "active but not saving" (not "zero writes") means
 * no false alarms on quiet pre-launch days.
 */
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FROM = "Readee QC Bot <hello@readee.app>";

export interface SaveHealthResult {
  ok: boolean;
  answers24h: number;
  results24h: number;
  alerted: boolean;
  detail: string;
}

export async function checkSaveHealth(): Promise<SaveHealthResult> {
  const admin = supabaseAdmin();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [answersRes, resultsRes] = await Promise.all([
    admin.from("practice_answers").select("*", { count: "exact", head: true }).gte("created_at", since),
    admin.from("practice_results").select("*", { count: "exact", head: true }).gte("completed_at", since),
  ]);

  const answers24h = answersRes.count ?? 0;
  const results24h = resultsRes.count ?? 0;

  // Healthy unless the outage signature is present: kids answered questions but
  // nothing completed. (No activity at all = quiet day, not an outage.)
  const broken = answers24h > 0 && results24h === 0;
  if (!broken) {
    return { ok: true, answers24h, results24h, alerted: false, detail: "healthy" };
  }

  const detail =
    `Save outage suspected: ${answers24h} practice answers in the last 24h but ` +
    `0 practice_results saved. Practice completions are likely failing silently ` +
    `(RLS denial, a rolled-back trigger, or a constraint). Check the ` +
    `practice_results insert path + child_skill_memory trigger.`;
  console.error("[save-health]", detail);

  let alerted = false;
  const to = process.env.OWNER_DIGEST_TO ?? process.env.OWNER_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  if (to && apiKey) {
    try {
      await new Resend(apiKey).emails.send({
        from: FROM,
        to,
        subject: "🚨 Readee: practice results may not be saving",
        text: detail,
      });
      alerted = true;
    } catch (e) {
      console.error("[save-health] alert email failed:", e);
    }
  }
  return { ok: false, answers24h, results24h, alerted, detail };
}
