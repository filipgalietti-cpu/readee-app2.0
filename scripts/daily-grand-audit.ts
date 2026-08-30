/** GRAND AUDIT — verifies what learn.readee.app/daily actually serves:
 *  every day live + image serving + 3 MCQs, no content-level dupes. */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" }); loadEnv();
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
(async () => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await sb.from("daily_questions").select("date, passage_title, passage_body, image_url, published_state, extra_questions").lte("date", today).order("date", { ascending: false });
  let notLive = 0, noImg = 0, dead = 0, shortQ = 0;
  for (const r of data!) {
    if (r.published_state !== "live") { notLive++; console.log("NOT-LIVE:", r.date, r.passage_title); }
    if (!r.image_url) { noImg++; console.log("NO-IMG:", r.date); continue; }
    const resp = await fetch(r.image_url, { method: "HEAD" }).catch(() => null);
    if (!resp || resp.status !== 200) { dead++; console.log("DEAD-IMG:", r.date); }
    if (1 + (Array.isArray(r.extra_questions) ? r.extra_questions.length : 0) < 3) { shortQ++; console.log("MCQ<3:", r.date); }
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const batch = data!.map((r) => `${r.date} ::: ${r.passage_title} ::: ${(r.passage_body ?? "").slice(0, 200).replace(/\n/g, " ")}`).join("\n");
  const res = await ai.models.generateContent({ model: "gemini-2.5-flash",
    contents: `For each line (date ::: title ::: excerpt) output "date -> canonical-subject" (lowercase 1-4 words, same story = same label). Broad themes (a child playing outside) only count as the same subject if the actual premise matches. One line each.\n\n${batch}` });
  const bySubject = new Map<string, string[]>();
  for (const line of (res.text ?? "").split("\n")) {
    const m = line.match(/(\d{4}-\d{2}-\d{2})\s*->\s*(.+)/);
    if (m) bySubject.set(m[2].trim(), [...(bySubject.get(m[2].trim()) ?? []), m[1]]);
  }
  let dupes = 0;
  for (const [t, ds] of bySubject) if (ds.length > 1) { dupes++; console.log(`DUP ${ds.length}x "${t}": ${ds.join(", ")}`); }
  console.log(`\nGRAND AUDIT: ${data!.length} days · not-live ${notLive} · no-img ${noImg} · dead ${dead} · mcq<3 ${shortQ} · dupe-groups ${dupes}`);
})();
