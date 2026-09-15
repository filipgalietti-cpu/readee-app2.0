import type { ReferencePageDef } from "../types";
import { spokenSentences } from "./sentences";

export function referenceEntryText(entry: {term: string; detail: string}) {
  return `${entry.term}: ${entry.detail}`;
}

/** The exact reading order used by both the rendered page and its audio inventory. */
export function referencePageSpeech(page?: ReferencePageDef): string[] {
  if (!page) return [];
  return [page.title, ...page.sections.flatMap(section => [
    section.heading,
    ...spokenSentences(section.text ?? ""),
    ...(section.entries ?? []).map(referenceEntryText),
    section.caption,
    ...(section.page === undefined ? [] : [`Page ${section.page}.`]),
  ])].filter((text): text is string => !!text?.trim());
}

export function readReferencePage(page: ReferencePageDef, say: (text: string, after?: () => void) => void) {
  const parts = referencePageSpeech(page);
  const play = (index: number) => {
    if (index < parts.length) say(parts[index], () => play(index + 1));
  };
  play(0);
}

export function referencePageErrors(page: ReferencePageDef): string[] {
  const errors: string[] = [];
  if (!page.sections.length || page.sections.length > 2) errors.push("reference page needs one or two sections");
  for (const section of page.sections) {
    if (!section.heading.trim()) errors.push("reference section needs a heading");
    if (!section.text?.trim() && !section.entries?.length && !section.image) errors.push("reference section has no source content");
    if (section.entries && (section.entries.length > 4 || section.entries.some(entry => !entry.term.trim() || !entry.detail.trim()))) errors.push("reference entries need at most four complete rows");
    if (section.image && (!section.image.src.startsWith("/") || section.image.src.startsWith("//") || !section.image.alt.trim())) errors.push("reference image needs a local asset and meaningful alternative text");
    if (section.page !== undefined && (!Number.isSafeInteger(section.page) || section.page < 1)) errors.push("reference page number must be a positive integer");
  }
  return errors;
}
