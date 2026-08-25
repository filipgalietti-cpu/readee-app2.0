/** CONTENT-level dupe sweep: labels every passage's actual subject via
 *  Gemini (titles lie — "A Long-Ago Call" vs "A New Way to Talk" were the
 *  same Bell story) and reports subject collisions. Reusable audit. */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" }); loadEnv();
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
(async () => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const { data } = await sb.from("daily_questions").select("date, passage_title, passage_body").order("date", { ascending: false });
  const batch = data!.map((r) => `${r.date} ::: ${r.passage_title} ::: ${(r.passage_body ?? "").slice(0, 250).replace(/\n/g, " ")}`).join("\n");
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `For each line (date ::: title ::: excerpt), output "date -> canonical-subject" where canonical-subject is a lowercase 1-4 word label of the passage's ACTUAL subject (e.g. "alexander graham bell telephone", "fireflies bioluminescence", "eiffel tower thermal expansion"). Same story = same label even if titles differ. One line per input, nothing else.\n\n${batch}`,
  });
  const out = res.text ?? "";
  const bySubject = new Map<string, string[]>();
  for (const line of out.split("\n")) {
    const m = line.match(/(\d{4}-\d{2}-\d{2})\s*->\s*(.+)/);
    if (m) bySubject.set(m[2].trim(), [...(bySubject.get(m[2].trim()) ?? []), m[1]]);
  }
  let dupes = 0;
  for (const [subj, dates] of bySubject) if (dates.length > 1) { dupes++; console.log(`DUP ${dates.length}x "${subj}": ${dates.join(", ")}`); }
  console.log(`\n${data!.length} passages · ${dupes} content-level dupe groups`);
})();
