export type ShopCategory = "avatars" | "outfits" | "themes" | "stickers" | "backgrounds";

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  category: ShopCategory;
  price: number;
  description: string;
}

export const SHOP_CATEGORIES: { key: ShopCategory; label: string; emoji: string }[] = [
  { key: "avatars", label: "Avatars", emoji: "🦊" },
  { key: "outfits", label: "Outfits", emoji: "👑" },
  { key: "themes", label: "Themes", emoji: "🎨" },
  { key: "stickers", label: "Stickers", emoji: "⭐" },
  { key: "backgrounds", label: "Backgrounds", emoji: "🌅" },
];

export const SHOP_ITEMS: ShopItem[] = [
  // ── Avatars ──
  { id: "avatar_fox",       name: "Fox",        emoji: "🦊", category: "avatars", price: 25,  description: "A clever little fox" },
  { id: "avatar_owl",       name: "Owl",        emoji: "🦉", category: "avatars", price: 50,  description: "A wise reading owl" },
  { id: "avatar_unicorn",   name: "Unicorn",    emoji: "🦄", category: "avatars", price: 75,  description: "A magical unicorn" },
  { id: "avatar_dragon",    name: "Dragon",     emoji: "🐉", category: "avatars", price: 100, description: "A friendly book dragon" },
  { id: "avatar_astronaut", name: "Astronaut",  emoji: "🧑‍🚀", category: "avatars", price: 125, description: "A space explorer" },
  { id: "avatar_robot",     name: "Robot",       emoji: "🤖", category: "avatars", price: 150, description: "A reading robot" },

  // ── Readee Outfits ──
  { id: "outfit_cape",       name: "Cape",        emoji: "🦸", category: "outfits", price: 30,  description: "A hero's cape for Readee" },
  { id: "outfit_crown",      name: "Crown",       emoji: "👑", category: "outfits", price: 50,  description: "A royal crown" },
  { id: "outfit_wizard_hat", name: "Wizard Hat",  emoji: "🧙", category: "outfits", price: 75,  description: "A magical wizard hat" },
  { id: "outfit_pirate_hat", name: "Pirate Hat",  emoji: "🏴‍☠️", category: "outfits", price: 100, description: "Arr! A pirate hat" },
  { id: "outfit_detective",  name: "Detective",   emoji: "🕵️", category: "outfits", price: 125, description: "A detective outfit" },
  { id: "outfit_space_suit", name: "Space Suit",  emoji: "🚀", category: "outfits", price: 200, description: "A full space suit" },

  // ── Themes ──
  { id: "theme_ocean",      name: "Ocean",       emoji: "🌊", category: "themes", price: 50,  description: "Deep blue ocean theme" },
  { id: "theme_forest",     name: "Forest",      emoji: "🌲", category: "themes", price: 75,  description: "Enchanted forest theme" },
  { id: "theme_space",      name: "Space",       emoji: "🚀", category: "themes", price: 100, description: "Outer space adventure" },
  { id: "theme_candy",      name: "Candy Land",  emoji: "🍭", category: "themes", price: 125, description: "Sweet candy land theme" },
  { id: "theme_dino",       name: "Dino World",  emoji: "🦕", category: "themes", price: 150, description: "Prehistoric dino world" },
  { id: "theme_rainbow",    name: "Rainbow",     emoji: "🌈", category: "themes", price: 200, description: "Colorful rainbow theme" },

  // ── Stickers & Badges ──
  { id: "sticker_bookworm",  name: "Bookworm",   emoji: "🐛", category: "stickers", price: 25,  description: "A proud bookworm badge" },
  { id: "sticker_gold_star", name: "Gold Star",  emoji: "🌟", category: "stickers", price: 50,  description: "A shining gold star" },
  { id: "sticker_trophy",    name: "Trophy",     emoji: "🏆", category: "stickers", price: 75,  description: "A champion trophy" },
  { id: "sticker_rocket",    name: "Rocket",     emoji: "🚀", category: "stickers", price: 100, description: "Blast off to reading!" },
  { id: "sticker_brain",     name: "Big Brain",  emoji: "🧠", category: "stickers", price: 125, description: "Super smart brain badge" },
  { id: "sticker_diamond",   name: "Diamond",    emoji: "💎", category: "stickers", price: 150, description: "A rare diamond badge" },

  // ── Backgrounds ──
  { id: "bg_sunset",      name: "Sunset",      emoji: "🌅", category: "backgrounds", price: 50,  description: "A beautiful sunset" },
  { id: "bg_underwater",   name: "Underwater",  emoji: "🐠", category: "backgrounds", price: 75,  description: "Under the sea" },
  { id: "bg_mountains",    name: "Mountains",   emoji: "🏔️", category: "backgrounds", price: 100, description: "Majestic mountain peaks" },
  { id: "bg_galaxy",       name: "Galaxy",      emoji: "🌌", category: "backgrounds", price: 125, description: "A swirling galaxy" },
  { id: "bg_garden",       name: "Garden",      emoji: "🌸", category: "backgrounds", price: 150, description: "A blooming garden" },
  { id: "bg_aurora",       name: "Aurora",      emoji: "🌌", category: "backgrounds", price: 200, description: "Northern lights aurora" },
];

/** CSS gradients for equipped backgrounds (light + dark variants) */
export const BACKGROUND_STYLES: Record<string, { light: string; dark: string }> = {
  bg_sunset:     { light: "linear-gradient(135deg, #fff7ed 0%, #fde68a 50%, #fecaca 100%)", dark: "linear-gradient(135deg, #1c1917 0%, #451a03 50%, #44403c 100%)" },
  bg_underwater:  { light: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #a5f3fc 100%)", dark: "linear-gradient(135deg, #0c1222 0%, #0c4a6e 50%, #164e63 100%)" },
  bg_mountains:   { light: "linear-gradient(135deg, #f0fdf4 0%, #d1fae5 50%, #e0e7ff 100%)", dark: "linear-gradient(135deg, #0f1a14 0%, #064e3b 50%, #1e1b4b 100%)" },
  bg_galaxy:      { light: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 50%, #fae8ff 100%)", dark: "linear-gradient(135deg, #0f0720 0%, #1e1b4b 50%, #2e1065 100%)" },
  bg_garden:      { light: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f0fdf4 100%)", dark: "linear-gradient(135deg, #1a0a14 0%, #831843 30%, #064e3b 100%)" },
  bg_aurora:      { light: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #ede9fe 70%, #fce7f3 100%)", dark: "linear-gradient(135deg, #022c22 0%, #064e3b 30%, #1e1b4b 70%, #2e1065 100%)" },
};

export function getItemsByCategory(category: ShopCategory): ShopItem[] {
  return SHOP_ITEMS.filter((item) => item.category === category);
}

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}

/** Map category to equipped_items slot name */
export function categoryToSlot(category: ShopCategory): string {
  const map: Record<ShopCategory, string> = {
    avatars: "avatar",
    outfits: "outfit",
    stickers: "badge",
    backgrounds: "background",
    themes: "theme",
  };
  return map[category];
}
