import type { Child } from "@/lib/db/types";
import { getItemById } from "@/lib/data/shop-items";

export const DEFAULT_AVATARS = ["😊", "🦊", "🐱", "🦋", "🐻"];

/**
 * Resolve the emoji avatar for a child.
 * Priority: equipped shop avatar > equipped default > index-based fallback.
 */
export function getChildAvatar(child: Child, index: number): string {
  const equippedId = child.equipped_items?.avatar;
  if (equippedId) {
    // Default avatar stored as "default_0" … "default_4"
    if (equippedId.startsWith("default_")) {
      const i = parseInt(equippedId.split("_")[1], 10);
      return DEFAULT_AVATARS[i] ?? DEFAULT_AVATARS[0];
    }
    // Shop item
    const item = getItemById(equippedId);
    if (item) return item.emoji;
  }
  return DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
}
