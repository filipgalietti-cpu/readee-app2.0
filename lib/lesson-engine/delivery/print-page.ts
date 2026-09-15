import type { PrintPageDef } from "../types";
export type PrintPosition = {
  id: string;
  label: string;
  kind: "word" | "space";
  line: number;
  index: number;
  wordIndex?: number;
};
/** Authored line breaks and positional IDs survive repeated words and resize. */
export function printPagePositions(page: PrintPageDef): PrintPosition[] {
  const positions: PrintPosition[] = [];
  let wordIndex = 0;
  page.lines.forEach((line, row) =>
    line.forEach((word, column) => {
      positions.push({
        id: `word-${row}-${column}`,
        label: word,
        kind: "word",
        line: row,
        index: column,
        wordIndex: wordIndex++,
      });
      if (page.showSpaces && column < line.length - 1)
        positions.push({
          id: `space-${row}-${column}`,
          label: "Space",
          kind: "space",
          line: row,
          index: column,
        });
    }),
  );
  return positions;
}
export function printPageText(page: PrintPageDef) {
  return page.lines.map((line) => line.join(" ")).join(" ");
}
export function repairedPrintPage(page: PrintPageDef, repair: {positionId: string; replacement: string}): PrintPageDef {
  return {...page, lines: page.lines.map((line, row) => line.map((word, column) =>
    `word-${row}-${column}` === repair.positionId ? repair.replacement : word))};
}
export function printPageErrors(page: PrintPageDef): string[] {
  const errors: string[] = [];
  if (
    !page.lines.length ||
    page.lines.some(
      (line) =>
        !line.length ||
        line.some((word) => !word.trim() || /\s/.test(word) || !/[\p{L}\p{N}]/u.test(word)),
    )
  )
    errors.push("print page needs nonempty authored lines of single words");
  if (
    page.markerId &&
    !printPagePositions(page).some((p) => p.kind === "word" && p.id === page.markerId)
  )
    errors.push("print marker must name a word position on this page");
  return errors;
}
