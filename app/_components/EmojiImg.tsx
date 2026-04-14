"use client";

import manifest from "@/public/emojis/manifest.json";

interface EmojiImgProps {
  emoji: string;
  size?: number;
  className?: string;
  alt?: string;
}

const emojiMap = manifest as Record<string, { name: string; path: string }>;

export function EmojiImg({ emoji, size = 32, className = "", alt }: EmojiImgProps) {
  const entry = emojiMap[emoji];

  if (!entry) {
    return (
      <span aria-hidden="true" style={{ fontSize: size * 0.85, lineHeight: 1 }}>
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={entry.path}
      alt={alt ?? entry.name}
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}
