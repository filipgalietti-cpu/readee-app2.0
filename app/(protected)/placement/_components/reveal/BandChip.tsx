"use client";

/** The reading-band chip: the action gradient on a pill, one of the three places the gradient is allowed. */
export function BandChip({ band, size = "md" }: { band: string; size?: "sm" | "md" }) {
  const sizing = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm @2xl:px-4 @2xl:py-2 @2xl:text-base";
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-violet-500 font-semibold text-white ${sizing}`}>
      {band}
    </span>
  );
}
