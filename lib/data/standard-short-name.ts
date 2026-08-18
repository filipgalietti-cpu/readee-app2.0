/**
 * Shared standard_id → parent-friendly skill name (and parent tip), built
 * from the standards catalog JSON. Lets server-side surfaces like the
 * weekly digest name a child's strongest/weakest skill in plain words
 * (e.g. "Key details in a text") instead of a CCSS code ("RL.K.1"),
 * matching how /analytics already labels skills.
 */
import kData from "@/app/data/kindergarten-standards-questions.json";
import g1Data from "@/app/data/1st-grade-standards-questions.json";
import g2Data from "@/app/data/2nd-grade-standards-questions.json";
import g3Data from "@/app/data/3rd-grade-standards-questions.json";
import g4Data from "@/app/data/4th-grade-standards-questions.json";

type StdEntry = {
  standard_id?: string;
  standard_description?: string;
  parent_tip?: string;
};

/** Strip CCSS boilerplate prefixes and cap length — same cleaner /analytics uses. */
function shortName(desc: string): string {
  const cleaned = desc
    .replace(/^With prompting and support, /i, "")
    .replace(/^Demonstrate understanding of /i, "")
    .replace(/^Demonstrate command of the conventions of standard English /i, "")
    .replace(/^Demonstrate basic knowledge of /i, "")
    .replace(/^Recognize and name /i, "")
    .replace(/^Know and apply /i, "");
  const capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capped.length > 48 ? capped.slice(0, 45) + "…" : capped;
}

const MAP: Record<string, { name: string; tip: string | null }> = (() => {
  const out: Record<string, { name: string; tip: string | null }> = {};
  for (const d of [kData, g1Data, g2Data, g3Data, g4Data] as { standards?: StdEntry[] }[]) {
    for (const s of d.standards ?? []) {
      if (!s.standard_id) continue;
      out[s.standard_id] = {
        name: s.standard_description ? shortName(s.standard_description) : s.standard_id,
        tip: s.parent_tip ?? null,
      };
    }
  }
  return out;
})();

/** Plain-words name for a standard, or null if unknown. */
export function standardShortName(id: string | null | undefined): string | null {
  if (!id) return null;
  return MAP[id]?.name ?? null;
}

/** The catalog's parent tip for a standard, if any. */
export function standardParentTip(id: string | null | undefined): string | null {
  if (!id) return null;
  return MAP[id]?.tip ?? null;
}
