import type { CSSProperties } from "react";

/**
 * Glyph — Microsoft Fluent System Icons, self-hosted.
 *
 * The monochrome half of one system. Its colourful half is <FluentIcon />
 * (Fluent Emoji). Same vendor, same design language, both MIT. Readee used to
 * mix Fluent Emoji with Lucide, which is two different studios' drawing
 * conventions on one screen, and it read as broken.
 *
 * Rendered with `mask-image` + `background: currentColor`, so the icon takes
 * its colour from CSS like any glyph. That matters: grey means locked,
 * emerald means success, white means it sits on a coloured fill. A colour
 * emoji cannot do that, which is why chrome and state icons live here.
 * Khan Academy's Wonder Blocks renders Phosphor the same way.
 *
 * Licence: MIT, Copyright (c) Microsoft Corporation. Notice in
 * public/icons/ui/LICENSE. Source: github.com/microsoft/fluentui-system-icons
 *
 * Adding one: drop the 24px regular SVG into public/icons/ui/ as
 * kebab-case.svg and add the name below.
 */
export const UI_ICONS = [
  "alert-circle",
  "angry",
  "arrow-left",
  "arrow-right",
  "award",
  "bar-chart3",
  "bell",
  "book",
  "book-open",
  "bot",
  "brain",
  "bug",
  "building",
  "calendar-days",
  "carrot",
  "check",
  "check-circle2",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevrons-up-down",
  "circle",
  "circle-help",
  "clipboard-check",
  "clipboard-pen",
  "clock",
  "coins",
  "compass",
  "credit-card",
  "crown",
  "download",
  "external-link",
  "eye",
  "factory",
  "file-text",
  "flag",
  "flame",
  "frown",
  "gauge",
  "globe",
  "graduation-cap",
  "headphones",
  "heart",
  "help-circle",
  "home",
  "image",
  "key-round",
  "layers",
  "library",
  "life-buoy",
  "lightbulb",
  "list-checks",
  "loader2",
  "lock",
  "log-out",
  "mail",
  "map",
  "megaphone",
  "meh",
  "menu",
  "message-circle",
  "message-square",
  "mic",
  "newspaper",
  "pause",
  "pen-line",
  "pencil",
  "play",
  "plus",
  "printer",
  "puzzle",
  "refresh-cw",
  "rocket",
  "rotate-ccw",
  "rotate-cw",
  "scan",
  "search",
  "send",
  "settings",
  "share",
  "shield",
  "shield-check",
  "shuffle",
  "skip-forward",
  "smile",
  "smile-plus",
  "sparkles",
  "square",
  "star",
  "target",
  "text",
  "thumbs-down",
  "thumbs-up",
  "trash2",
  "trending-up",
  "trophy",
  "user",
  "user-plus",
  "users",
  "volume-x",
  "volume2",
  "wand",
  "waves",
  "x",
  "x-circle",
  "zap",
] as const;

export type GlyphName = (typeof UI_ICONS)[number];

export function Glyph({
  name,
  size = 20,
  className = "",
  style,
}: {
  name: GlyphName;
  /** Rendered square size in px. */
  size?: number;
  /** Colour comes from `text-*`; the mask paints with currentColor. */
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(/icons/ui/${name}.svg)`,
        maskImage: `url(/icons/ui/${name}.svg)`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        ...style,
      }}
    />
  );
}
