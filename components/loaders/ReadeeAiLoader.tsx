"use client";

import { OrganicLoader } from "./OrganicLoader";
import { OrganicLoaderDefs } from "./OrganicLoaderDefs";

/**
 * The official Readee.ai loading affordance. Variant 13 ("gooey eight"),
 * brand gradient, suitable for any UI moment where Readee.ai is
 * generating content. Mounts the shared SVG defs locally so callers
 * never need to remember.
 *
 * Use `size` to scale: 64-96 for inline, 140-200 for panel/full-page.
 */
export function ReadeeAiLoader({
  size = 140,
  label = "Readee.ai is thinking",
  caption,
  className,
}: {
  size?: number;
  label?: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3${
        className ? " " + className : ""
      }`}
    >
      <OrganicLoaderDefs />
      <OrganicLoader variant={13} size={size} aria-label={label} />
      {caption ? (
        <p className="text-xs font-semibold text-violet-700">{caption}</p>
      ) : null}
    </div>
  );
}
