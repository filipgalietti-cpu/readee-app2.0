import Image from "next/image";

/**
 * FluentIcon — Microsoft Fluent Emoji (Flat), self-hosted.
 *
 * Why these and not a native emoji: a native emoji is rendered by the
 * device, so the same character is different artwork on an iPhone, a
 * Chromebook and a Samsung tablet. We control none of it and it matches
 * nothing. These are one fixed artwork everywhere, sized by us.
 *
 * Why these and not Lucide on child surfaces: Lucide is a 2px monochrome
 * stroke set (the shadcn/ui default). It reads as a developer dashboard,
 * and thin strokes lose their silhouette at the size a child actually
 * taps. Filled colour survives the shrink; outlines do not.
 *
 * Scope: content and reward marks on CHILD-facing surfaces. UI chrome —
 * arrows, chevrons, close, spinners, search — stays on Lucide, where a
 * clean line icon is the right register. See CLAUDE.md.
 *
 * Licence: MIT, Copyright (c) Microsoft Corporation. The notice ships in
 * public/icons/fluent/LICENSE, which MIT requires.
 * Source: https://github.com/microsoft/fluentui-emoji
 *
 * `unoptimized` because these are already tiny hand-authored SVGs; running
 * them through the image optimiser costs more than it saves.
 */
export const FLUENT_ICONS = [
  "books",
  "brain",
  "bullseye",
  "carrot",
  "check",
  "crown",
  "fire",
  "first-place",
  "gem",
  "graduation-cap",
  "lightbulb",
  "lock",
  "medal",
  "microphone",
  "newspaper",
  "open-book",
  "party",
  "rocket",
  "speaker",
  "star",
  "trophy",
] as const;

export type FluentIconName = (typeof FLUENT_ICONS)[number];

export function FluentIcon({
  name,
  size = 20,
  className = "",
}: {
  name: FluentIconName;
  /** Rendered square size in px. Readee steps: 14, 16, 20, 24, 32, 48, 88. */
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/icons/fluent/${name}.svg`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      unoptimized
      className={className}
      style={{ width: size, height: size, display: "block" }}
    />
  );
}
