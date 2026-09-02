"use client";

import { Glyph } from "@/app/_components/Glyph";

export default function PrintButton({
  label = "Print / Save as PDF",
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-indigo-700"
    >
      <Glyph name="printer" size={14} />
      {label}
    </button>
  );
}
