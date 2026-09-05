/**
 * Real photographs for real subjects.
 *
 * `resolveHistoricalImage` already pulls licensed Wikipedia imagery, but it
 * keys on a named PERSON, so everything that is real without being somebody
 * fell through to Imagen: Mars, the Ferris wheel, the first telephone, the
 * Moon landing. Filip's note was blunt and correct - "The Red Planet sloppy,
 * cant get an actual picture of Mars?" A drawn Mars competes with a NASA
 * photograph and loses every time, and for a nonfiction passage the drawing
 * is also quietly making details up.
 *
 * This is the same pipeline pointed at subjects instead of people. It reuses
 * `fetchWikipediaArtifact`, which was already generic (any article title) and
 * already runs `verifyCommonsLicense`, so an unverified image is dropped
 * rather than served from a commercial product.
 *
 * Only worth calling for nonfiction. A real photo of a real fox is worse than
 * an illustration for a story about a fox who learns to share, because the
 * story is not about foxes.
 */
import { GoogleGenAI } from "@google/genai";
import { fetchWikipediaArtifact } from "@/lib/ai/historical-artifacts";

const MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return client;
}

const SUBJECT_SYSTEM = `You read a short children's nonfiction passage and name the one real-world SUBJECT it is about, in the form Wikipedia titles its article.

Rules:
- Return ONLY a JSON object, no commentary, no markdown fences.
- If the passage teaches about a real, documented thing: {"subject": "<canonical Wikipedia article title>", "kind": "<one of: place, body, species, invention, event, structure, phenomenon>"}
- If the passage is a made-up story, or is about a generic activity, a feeling, or an invented character: {"subject": null}
- ‼️ NARRATIVE BEATS SUBJECT. If the passage follows a named character through events, return null EVEN IF real animals, places or objects appear in it. "Max the rabbit found a cool cave" is a story about Max; a photograph of a cave is the wrong picture for it. Ask what the passage is ABOUT, not what it mentions. A name plus a sequence of events means fiction.
- Name the SPECIFIC subject, never a category. "Mars" not "planets". "Ferris wheel" not "rides". "Chameleon" not "reptiles".
- Prefer the subject a photograph would show. A passage about why leaves change colour is about "Autumn leaf color", not "trees".
- Name it with a word the PASSAGE ITSELF uses whenever an article exists under that name. If the passage says "the Moon", return "Moon", not "Apollo 11". A downstream guard rejects any subject the passage never mentions, so the specific-but-unmentioned title loses the photo entirely.
- People are handled elsewhere. If the passage centres on a person, return null.

Examples:
- "Look up at the night sky. Can you find Mars?" -> {"subject": "Mars", "kind": "body"}
- "A man named George Ferris built a giant wheel" -> {"subject": "Ferris Wheel", "kind": "invention"}
- "Cam the chameleon lived in a tall tree" -> {"subject": null}
- "Why do leaves change color in fall?" -> {"subject": "Autumn leaf color", "kind": "phenomenon"}
- "In 1969 people landed on the Moon" -> {"subject": "Moon", "kind": "body"}  (NOT "Apollo 11": the passage never says it)
- "Kit the fox wanted a cool place to rest" -> {"subject": null}
- "Max the rabbit felt hot and found a dark cave to rest in" -> {"subject": null}  (a story, not an article about caves)
- "Leo saw an opossum play dead in the yard" -> {"subject": null}  (Leo's story, not an opossum article)
- "Narwhals have a long tusk that is really a tooth" -> {"subject": "Narwhal", "kind": "species"}`;

export type RealSubject = { subject: string; kind: string };

/** The subject the passage teaches about, or null. Errors fall through as null. */
export async function detectRealSubject(
  passageTitle: string,
  passageBody: string,
): Promise<RealSubject | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const res = await getClient().models.generateContent({
      model: MODEL,
      contents: `Title: ${passageTitle}\n\nPassage:\n${passageBody.slice(0, 1800)}\n\nReturn the JSON object.`,
      config: { systemInstruction: SUBJECT_SYSTEM, temperature: 0.0, responseMimeType: "application/json" },
    });
    const parsed = JSON.parse((res.text ?? "").trim()) as { subject?: string | null; kind?: string };
    if (!parsed?.subject || typeof parsed.subject !== "string") return null;
    return { subject: parsed.subject, kind: parsed.kind ?? "unknown" };
  } catch {
    return null;
  }
}

const STOP_WORDS = new Set(["the", "of", "and", "a", "an", "to", "in", "for", "or", "by", "color", "colour"]);

export type ResolvedSubjectImage =
  | { kind: "photo"; subject: string; imageUrl: string; attribution: string }
  | { kind: "none"; reason: string };

/**
 * Detect the subject, sanity-check it against the passage, and return a
 * licensed photograph if Wikipedia has one.
 *
 * The token check is lifted from resolveHistoricalImage for the same reason it
 * exists there: the detector occasionally returns a real, confident, entirely
 * unrelated subject, and pulling that article's lead image would put a
 * photograph of the wrong thing on the page with all the authority of a
 * photograph. At least one distinctive word has to actually appear.
 */
export async function resolveRealSubjectImage(
  passageTitle: string,
  passageBody: string,
): Promise<ResolvedSubjectImage> {
  const found = await detectRealSubject(passageTitle, passageBody);
  if (!found) return { kind: "none", reason: "no real subject detected" };

  const hay = `${passageTitle}\n${passageBody}`.toLowerCase();
  const tokens = found.subject
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z]/g, ""))
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
  if (tokens.length > 0 && !tokens.some((t) => hay.includes(t))) {
    return { kind: "none", reason: `detected "${found.subject}" but the passage never mentions it` };
  }

  const artifact = await fetchWikipediaArtifact(found.subject);
  if (!artifact?.imageUrl) {
    return { kind: "none", reason: `no licensed image for "${found.subject}"` };
  }
  return {
    kind: "photo",
    subject: artifact.figureName,
    imageUrl: artifact.imageUrl,
    attribution: artifact.attribution ?? "via Wikimedia Commons",
  };
}
