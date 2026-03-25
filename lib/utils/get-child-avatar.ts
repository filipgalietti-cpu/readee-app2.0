import type { Child } from "@/lib/db/types";
import { getItemById } from "@/lib/data/shop-items";

export const DEFAULT_AVATARS = ["😊", "🦊", "🐱", "🦋", "🐻"];

/** Maps avatar IDs to image paths in /public/images/avatars/ */
export const AVATAR_IMAGES: Record<string, string> = {
  // Defaults
  default_0: "/images/avatars/default_0.png",
  default_1: "/images/avatars/default_1.png",
  default_2: "/images/avatars/default_2.png",
  default_3: "/images/avatars/default_3.png",
  default_4: "/images/avatars/default_4.png",
  // Shop avatars
  avatar_fox: "/images/avatars/avatar_fox.png",
  avatar_owl: "/images/avatars/avatar_owl.png",
  avatar_unicorn: "/images/avatars/avatar_unicorn.png",
  avatar_dragon: "/images/avatars/avatar_dragon.png",
  avatar_astronaut: "/images/avatars/avatar_astronaut.png",
  avatar_robot: "/images/avatars/avatar_robot.png",
  avatar_rabbit: "/images/avatars/avatar_rabbit.png",
  avatar_fish: "/images/avatars/avatar_fish.png",
  avatar_phoenix: "/images/avatars/avatar_phoenix.png",
  avatar_pirate: "/images/avatars/avatar_pirate.png",
  avatar_ninja: "/images/avatars/avatar_ninja.png",
  avatar_leopard: "/images/avatars/avatar_leopard.png",
  avatar_dino: "/images/avatars/avatar_dino.png",
  avatar_pixel: "/images/avatars/avatar_pixel.png",
  avatar_lion: "/images/avatars/avatar_lion.png",
};

/**
 * Resolve the avatar image path for a child.
 * Priority: equipped shop avatar > equipped default > index-based fallback.
 * Returns an image path string (e.g. "/images/avatars/avatar_fox.png").
 */
export function getChildAvatarImage(child: Child, index: number): string {
  const equippedId = child.equipped_items?.avatar;
  if (equippedId && AVATAR_IMAGES[equippedId]) {
    return AVATAR_IMAGES[equippedId];
  }
  // Fallback: index-based default
  const defaultId = `default_${index % DEFAULT_AVATARS.length}`;
  return AVATAR_IMAGES[defaultId] || AVATAR_IMAGES.default_0;
}

/**
 * Resolve the avatar ID for a child (for comparison/equipping).
 */
export function getChildAvatarId(child: Child, index: number): string {
  const equippedId = child.equipped_items?.avatar;
  if (equippedId && AVATAR_IMAGES[equippedId]) {
    return equippedId;
  }
  return `default_${index % DEFAULT_AVATARS.length}`;
}

/**
 * @deprecated Use getChildAvatarImage instead. Kept for backwards compat.
 */
export function getChildAvatar(child: Child, index: number): string {
  const equippedId = child.equipped_items?.avatar;
  if (equippedId) {
    if (equippedId.startsWith("default_")) {
      const i = parseInt(equippedId.split("_")[1], 10);
      return DEFAULT_AVATARS[i] ?? DEFAULT_AVATARS[0];
    }
    const item = getItemById(equippedId);
    if (item) return item.name;
  }
  return DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
}
