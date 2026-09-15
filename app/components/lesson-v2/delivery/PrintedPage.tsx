"use client";
import type { PrintPageDef } from "@/lib/lesson-engine/types";
import { printPagePositions, printPageText } from "@/lib/lesson-engine/delivery/print-page";
import { spokenFragmentIndex } from "@/lib/lesson-engine/delivery/spoken-fragment";
import "./printed-page.css";
/** Layout only. Existing Choose owns attempts, feedback, rewards and two-error progression. */
export default function PrintedPage({
  page,
  onPick,
  picked,
  foundIds = [],
  solved = false,
  neutralSelection = false,
  caption = "",
  activeWord = -1,
  readingLine,
}: {
  page: PrintPageDef;
  onPick?: (id: string) => void;
  picked?: string | null;
  foundIds?: string[];
  solved?: boolean;
  neutralSelection?: boolean;
  caption?: string;
  activeWord?: number;
  readingLine?: number;
}) {
  const positions = printPagePositions(page);
  let spoken = spokenFragmentIndex(printPageText(page), caption, activeWord);
  if (spoken < 0 && readingLine !== undefined && page.lines[readingLine]) {
    const local = spokenFragmentIndex(page.lines[readingLine].join(" "), caption, activeWord);
    if (local >= 0)
      spoken = page.lines.slice(0, readingLine).reduce((sum, line) => sum + line.length, 0) + local;
  }
  return (
    <div
      className={`le-print-page ${page.showSpaces ? "shows-spaces" : ""}`}
      aria-label="Printed page"
      data-print-page
    >
      {page.lines.map((_, row) => (
        <div className="le-print-line" data-print-line={row} key={row}>
          {positions
            .filter((p) => p.line === row)
            .map((p) => {
              const marked = page.markerId === p.id,
                selected = picked === p.id;
              const className = `le-print-position ${p.kind === "space" ? "le-print-space" : "le-print-word"} ${marked ? "is-marker" : ""} ${foundIds.includes(p.id) ? "is-correct" : selected ? (neutralSelection ? "is-selected le-selection-registered" : solved ? "is-correct" : "is-retry") : ""} ${p.kind === "word" && p.wordIndex === spoken ? "le-word-active" : ""}`;
              const label =
                p.kind === "word"
                  ? `${p.label}, line ${row + 1}, word ${p.index + 1}${marked ? ", marked word" : ""}`
                  : `Space after word ${p.index + 1} on line ${row + 1}`;
              return onPick ? (
                <button
                  key={p.id}
                  type="button"
                  className={className}
                  data-print-id={p.id}
                  data-marker={marked || undefined}
                  aria-label={label}
                  disabled={solved || foundIds.includes(p.id)}
                  aria-pressed={neutralSelection ? selected : foundIds.length > 0 ? foundIds.includes(p.id) : undefined}
                  onClick={() => onPick(p.id)}
                >
                  {p.kind === "word" ? (
                    p.label + (!page.showSpaces ? " " : "")
                  ) : (
                    <span aria-hidden="true">&nbsp;</span>
                  )}
                </button>
              ) : (
                <span
                  key={p.id}
                  className={className}
                  data-print-id={p.id}
                  data-marker={marked || undefined}
                >
                  {p.kind === "word" ? (
                    p.label + (!page.showSpaces ? " " : "")
                  ) : (
                    <span aria-hidden="true">&nbsp;</span>
                  )}
                </span>
              );
            })}
        </div>
      ))}
    </div>
  );
}
