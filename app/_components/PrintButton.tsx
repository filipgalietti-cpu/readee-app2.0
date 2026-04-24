"use client";

import { Printer } from "lucide-react";

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
      <Printer className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
