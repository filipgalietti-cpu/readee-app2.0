"use client";

import { motion } from "framer-motion";

/**
 * A teaching DIAGRAM, not a sentence with one animated word.
 *
 * A scene could previously be two things: an animated line of text, or a
 * picture. That is enough for "the **dog** runs" and nothing else. The moment a
 * lesson needs to show a MAPPING - he stands for a boy, she stands for a girl -
 * the only way to express it was to jam it into one line of fx text, which
 * tokenises on whitespace and renders as a run of loose words with no pairing.
 * "he = a boy she = a girl it = one thing" arrives on screen as exactly that
 * soup, to a six-year-old.
 *
 * So: rows. Each row is one idea, one to a line, with the term and what it means
 * held apart visually. Each row arrives when the narration reaches it, using the
 * same Whisper alignment the rest of the engine now uses - so the teacher says
 * "he is for a boy or a man" and that row, and only that row, appears.
 *
 * Kept deliberately plain. A first grader reading a diagram needs the pairing to
 * be obvious, not decorated: a big term, an arrow, the meaning, and enough space
 * that the eye never has to work out what belongs to what.
 */

export type DiagramRow = {
  /** The thing being taught: "he", "-ed", "?" */
  term: string;
  /** What it means or does: "a boy or a man" */
  means: string;
  /** Optional example that shows it working: "Ben hops. He hops." */
  example?: string;
};

export default function Diagram({
  rows,
  rowDelaysMs,
  audioMs,
  accent = "#7c3aed",
}: {
  rows: DiagramRow[];
  /** When each row should appear, ms from mount. Falls back to an even stagger. */
  rowDelaysMs?: number[];
  /** Narration position in ms. Rows follow the voice rather than a mount timer. */
  audioMs?: number;
  accent?: string;
}) {
  if (!rows.length) return null;
  const many = rows.length > 3;

  return (
    <div
      className="flex h-full w-full items-center justify-center px-6"
      role="list"
      aria-label="Diagram"
    >
      <div className="flex w-full max-w-[560px] flex-col" style={{ gap: many ? 14 : 20 }}>
        {rows.map((r, i) => {
          const audioDriven = typeof audioMs === "number";
          const cue = rowDelaysMs && Number.isFinite(rowDelaysMs[i]) ? rowDelaysMs[i] : undefined;
          // With a clock, the row waits for its moment in the voice. Without
          // one, it falls back to an even stagger so the component still works
          // outside a lesson.
          const shown = audioDriven && cue !== undefined ? (audioMs as number) >= cue : true;
          const delay = audioDriven ? 0 : cue !== undefined ? cue / 1000 : 0.3 + i * 0.55;
          return (
            <motion.div
              key={`${r.term}-${i}`}
              role="listitem"
              initial={{ opacity: 0, y: 18 }}
              animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ delay, type: "spring", stiffness: 260, damping: 22 }}
              className="flex items-center gap-4 rounded-2xl bg-white/85 px-5 shadow-[0_6px_20px_-12px_rgba(49,46,129,.45)]"
              style={{ paddingTop: many ? 12 : 16, paddingBottom: many ? 12 : 16 }}
            >
              <span
                className="shrink-0 font-extrabold tracking-tight"
                style={{ color: accent, fontSize: many ? 30 : 38, minWidth: many ? 78 : 96 }}
              >
                {r.term}
              </span>
              <span className="shrink-0 text-2xl" style={{ color: accent, opacity: 0.5 }} aria-hidden="true">
                →
              </span>
              <span className="min-w-0">
                <span
                  className="block font-bold leading-snug text-[#1e1b3a]"
                  style={{ fontSize: many ? 20 : 24 }}
                >
                  {r.means}
                </span>
                {r.example && (
                  <span className="mt-0.5 block text-[15px] leading-snug text-zinc-500">
                    {r.example}
                  </span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
