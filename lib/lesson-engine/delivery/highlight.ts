import type { HighlightDef } from "../types";
const norm = (word: string) => word.toLowerCase().replace(/[^a-z']/g, "");
/** Positional case repairs never replace a word or infer a curriculum correction. */
export function highlightWords(data: HighlightDef, found: ReadonlySet<number> = new Set()) {
  return data.text
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      found.has(index) ? (data.repairs?.find((r) => r.index === index)?.replacement ?? word) : word,
    );
}
export function highlightTargetIndices(data: HighlightDef) {
  const targets = new Set(data.targets.map(norm));
  return data.text
    .trim()
    .split(/\s+/)
    .flatMap((word, index) => (targets.has(norm(word)) ? [index] : []));
}
export function highlightErrors(data: HighlightDef) {
  const words = data.text.trim().split(/\s+/),
    targets = highlightTargetIndices(data),
    errors: string[] = [];
  if (
    !data.text.trim() ||
    !data.targets.length ||
    new Set(data.targets.map(norm)).size !== data.targets.length ||
    data.targets.some((t) => !words.some((w) => norm(w) === norm(t)))
  )
    errors.push("highlight targets must name distinct existing words");
  if (data.repairs) {
    if (
      data.repairs.length !== targets.length ||
      new Set(data.repairs.map((r) => r.index)).size !== data.repairs.length ||
      data.repairs.some(
        (r) =>
          !targets.includes(r.index) ||
          !words[r.index] ||
          r.replacement === words[r.index] ||
          r.replacement.toLowerCase() !== words[r.index].toLowerCase(),
      )
    )
      errors.push("highlight repairs must change only the case of every target position");
    if (data.result !== highlightWords(data, new Set(targets)).join(" "))
      errors.push("highlight result must exactly preserve the repaired sentence");
  } else if (data.result) errors.push("highlight result requires explicit case repairs");
  if (
    data.success &&
    (!data.success.image ||
      !data.success.alt.trim() ||
      data.success.sentence !== (data.result ?? data.text))
  )
    errors.push(
      "highlight reveal must preserve the complete target sentence and describe its image",
    );
  return errors;
}
