"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Simple "Back" control for standalone pages (policies, etc.). Goes back in
 *  history; falls back to the dashboard if there's nowhere to go. */
export default function BackButton({
  fallback = "/dashboard",
  label = "Back",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
