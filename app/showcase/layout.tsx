import "./no-chrome.css";

/**
 * Showcase routes (/showcase/*) are recorded for marketing — Screen
 * Studio captures only the page content. This layout wraps every
 * showcase child in `.showcase-no-chrome`, which the sibling CSS file
 * uses (via `body:has()`) to hide the root layout's nav + footer and
 * neutralize the centered main wrapper's padding/max-width.
 *
 * Effect: showcase pages render full-bleed, no surrounding chrome,
 * without restructuring every other route in the app.
 */
export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="showcase-no-chrome">{children}</div>;
}
