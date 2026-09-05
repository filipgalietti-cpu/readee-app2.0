/**
 * What an image generator is allowed to draw.
 *
 * Written after two live dailies showed why the existing guards were not
 * enough. The pipeline had an art-style picker and a quality judge, but
 * nothing that could say "this subject must not be depicted by a model at
 * all" - so it cheerfully produced:
 *
 *   Juneteenth (2026-06-19): a smiling white Union soldier handing a scroll
 *   to barefoot Black people in patched clothes with their hands clasped in
 *   prayer, on a palm-lined tropical beach captioned Galveston, Texas. That
 *   is the white-saviour composition Juneteenth scholarship specifically
 *   objects to, with the geography invented on top.
 *
 *   Independence Day (2026-07-04): the Founding Fathers with several faces
 *   restyled, a modern fifty-star flag in 1776, and garbled letter-shapes on
 *   the Declaration.
 *
 * Neither was caught, because both are *competent* images. The quality judge
 * asks "does this render well and match the scene", and the answer was yes.
 * The question nobody was asking is "should a model be inventing this at all".
 *
 * Three tiers, and the rule for each is about WHO may appear, not about style:
 *
 *   "none"    - real, sensitive human history (slavery, civil rights, war,
 *               genocide, atrocity). No generated image. Ship the passage
 *               without one until a real archival image is sourced. There is
 *               no cartoon of enslaved people that is not a problem.
 *   "symbol"  - a real, identifiable person or a specific real event. Draw
 *               objects, places and symbols only, never the people. The
 *               Ferris wheel, not Mr Ferris. The telephone, not Bell.
 *   "free"    - invented characters, animals, general science. Draw normally.
 *
 * Deliberately keyword-driven rather than a model call. This runs on every
 * daily, a miss is expensive, and a list you can read and extend beats a
 * classifier you have to re-evaluate. It over-triggers on purpose: a history
 * passage that loses its illustration costs far less than another Juneteenth.
 */
export type DepictionMode = "none" | "symbol" | "free";

/**
 * A trailing `*` means "match this stem and anything after it" (so `enslav*`
 * covers enslaved and enslavement); everything else must match as a whole
 * word. That distinction is load-bearing: a plain substring search for "war"
 * matched "warm", which put a fox looking for a cool cave into the same tier
 * as the Civil War.
 */
function matcher(keywords: string[]): RegExp {
  const parts = keywords.map((k) => {
    const stem = k.endsWith("*");
    const body = (stem ? k.slice(0, -1) : k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return stem ? `\\b${body}` : `\\b${body}\\b`;
  });
  return new RegExp(`(${parts.join("|")})`, "i");
}

/**
 * Human history where a generated depiction of people is not acceptable.
 * Tuned for RECALL: a false positive costs one illustration, a false negative
 * costs another Juneteenth.
 */
const NO_DEPICTION = matcher([
  "slave*", "enslav*", "emancipat*", "juneteenth", "abolition*",
  "underground railroad", "plantation*", "segregat*", "jim crow",
  "civil rights", "lynching", "holocaust", "genocide", "internment",
  "apartheid", "trail of tears", "residential school*", "massacre*",
  "atrocit*", "concentration camp*", "9/11", "september 11", "terrorist*",
]);

/**
 * Signals that a passage is about real, identifiable people or events.
 * Tuned for PRECISION, unlike the list above: symbol mode strips people from
 * the frame, which is wrong for a fairy tale about a king. Generic verbs that
 * fiction leans on ("discovered", "invented", "explored") are deliberately
 * absent - the Ferris wheel passage is caught by its theme instead.
 */
const REAL_HISTORY = matcher([
  "on this day", "in history", "historic*", "president*",
  "war", "wars", "civil war", "world war", "battle of", "treaty",
  "constitution", "declaration of independence", "amendment*",
  "founding father*", "independence day", "memorial day", "veterans day",
  "heritage month", "black history", "suffrage", "voting rights",
  "the inventor", "moon landing", "spacewalk", "first flight",
]);

/**
 * Decide what may be drawn for a daily.
 *
 * Checks title, body and theme together: the theme alone is too coarse ("On
 * this day in history" covers both the Ferris wheel and the Voting Rights
 * Act) and the title alone is too thin ("A Day for Freedom" reads as fiction).
 */
export function depictionModeFor(input: {
  title: string;
  body: string;
  theme: string;
}): { mode: DepictionMode; reason: string } {
  const hay = `${input.title}\n${input.theme}\n${input.body}`.toLowerCase();

  const sensitive = hay.match(NO_DEPICTION);
  if (sensitive) {
    return {
      mode: "none",
      reason: `sensitive human history ("${sensitive[0]}") - no generated image; source a real archival one`,
    };
  }

  const historic = hay.match(REAL_HISTORY);
  if (historic) {
    return {
      mode: "symbol",
      reason: `real people or a real event ("${historic[0]}") - objects and places only, no depicted people`,
    };
  }

  return { mode: "free", reason: "invented characters or general science" };
}

/**
 * Rewrite an image brief to obey the mode. Returning null means ship no image.
 *
 * The "symbol" wording is blunt on purpose. Imagen's prior pulls hard toward
 * putting a smiling person in the frame, and the soft phrasings ("focus on
 * the object") lost to it repeatedly in the existing scene prompts.
 */
export function applyDepictionMode(scene: string, mode: DepictionMode): string | null {
  if (mode === "none") return null;
  if (mode === "free") return scene;
  return `${scene}

ABSOLUTE CONSTRAINT - this passage describes real people and real events, so no person may be invented. Draw ONLY the objects, machines, buildings, landscape or symbols involved. NO people, NO faces, NO figures, NO crowds, not even distant or in silhouette. No flags, banners, documents or signage bearing text, dates or letters, because those get the details wrong. If the scene cannot be shown without a person, draw the single most important OBJECT on a plain background instead.`;
}
