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
  { id: "bg_sunset",            name: "Sunset",           emoji: "🌅", category: "backgrounds", price: 50,  description: "A beautiful sunset" },
  { id: "bg_underwater",        name: "Underwater",       emoji: "🐠", category: "backgrounds", price: 75,  description: "Under the sea" },
  { id: "bg_mountains",         name: "Mountains",        emoji: "🏔️", category: "backgrounds", price: 100, description: "Majestic mountain peaks" },
  { id: "bg_galaxy",            name: "Galaxy",           emoji: "🌌", category: "backgrounds", price: 125, description: "A swirling galaxy" },
  { id: "bg_garden",            name: "Garden",           emoji: "🌸", category: "backgrounds", price: 150, description: "A blooming garden" },
  { id: "bg_aurora",            name: "Aurora",           emoji: "🌌", category: "backgrounds", price: 200, description: "Northern lights aurora" },
  { id: "bg_rainforest",        name: "Rainforest",       emoji: "🌴", category: "backgrounds", price: 50,  description: "A lush tropical rainforest" },
  { id: "bg_arctic",            name: "Arctic",           emoji: "🧊", category: "backgrounds", price: 75,  description: "Peaceful arctic landscape" },
  { id: "bg_volcano",           name: "Volcano",          emoji: "🌋", category: "backgrounds", price: 100, description: "A dramatic volcano scene" },
  { id: "bg_desert",            name: "Desert",           emoji: "🏜️", category: "backgrounds", price: 75,  description: "A colorful desert sunset" },
  { id: "bg_coral_reef",        name: "Coral Reef",       emoji: "🪸", category: "backgrounds", price: 100, description: "A vibrant coral reef" },
  { id: "bg_treehouse",         name: "Treehouse",        emoji: "🏡", category: "backgrounds", price: 125, description: "A magical treehouse" },
  { id: "bg_castle",            name: "Castle",           emoji: "🏰", category: "backgrounds", price: 150, description: "A fairytale castle" },
  { id: "bg_space_station",     name: "Space Station",    emoji: "🛸", category: "backgrounds", price: 150, description: "An orbiting space station" },
  { id: "bg_candy_land",        name: "Candy Land",       emoji: "🍭", category: "backgrounds", price: 100, description: "A whimsical candy land" },
  { id: "bg_cherry_blossom",    name: "Cherry Blossom",   emoji: "🌸", category: "backgrounds", price: 125, description: "Serene cherry blossoms" },
  { id: "bg_meadow",            name: "Meadow",           emoji: "🌼", category: "backgrounds", price: 50,  description: "A sunny flower meadow" },
  { id: "bg_pirate_island",     name: "Pirate Island",    emoji: "🏴‍☠️", category: "backgrounds", price: 150, description: "A tropical pirate island" },
  { id: "bg_winter_cabin",      name: "Winter Cabin",     emoji: "🏔️", category: "backgrounds", price: 100, description: "A cozy winter cabin" },
  { id: "bg_jungle_river",      name: "Jungle River",     emoji: "🦜", category: "backgrounds", price: 100, description: "A jungle river adventure" },
  { id: "bg_moon_base",         name: "Moon Base",        emoji: "🌙", category: "backgrounds", price: 175, description: "A moon base with craters" },
  { id: "bg_enchanted_forest",  name: "Enchanted Forest", emoji: "🍄", category: "backgrounds", price: 150, description: "A magical enchanted forest" },
  { id: "bg_dinosaur_valley",   name: "Dinosaur Valley",  emoji: "🦕", category: "backgrounds", price: 125, description: "A colorful dinosaur valley" },
  { id: "bg_hot_air_balloons",  name: "Hot Air Balloons", emoji: "🎈", category: "backgrounds", price: 75,  description: "Colorful hot air balloons" },
  { id: "bg_lighthouse",        name: "Lighthouse",       emoji: "🏖️", category: "backgrounds", price: 100, description: "A coastal lighthouse" },
  { id: "bg_rainbow_valley",    name: "Rainbow Valley",   emoji: "🌈", category: "backgrounds", price: 125, description: "A magical rainbow valley" },
  { id: "bg_soccer_field",      name: "Soccer Field",     emoji: "⚽", category: "backgrounds", price: 100, description: "A lively soccer field" },
  { id: "bg_basketball_court",  name: "Basketball Court", emoji: "🏀", category: "backgrounds", price: 100, description: "An outdoor basketball court" },
  { id: "bg_swimming_pool",     name: "Swimming Pool",    emoji: "🏊", category: "backgrounds", price: 75,  description: "A cheerful swimming pool" },
  { id: "bg_shooting_stars",    name: "Shooting Stars",   emoji: "🌠", category: "backgrounds", price: 150, description: "A magical shooting star sky" },
  { id: "bg_planets",           name: "Planets",          emoji: "🪐", category: "backgrounds", price: 175, description: "A colorful solar system" },
  { id: "bg_safari",            name: "Safari",           emoji: "🦁", category: "backgrounds", price: 125, description: "An African safari adventure" },
  { id: "bg_zoo",               name: "Zoo",              emoji: "🐼", category: "backgrounds", price: 100, description: "A colorful cartoon zoo" },
  { id: "bg_ocean_animals",     name: "Ocean Animals",    emoji: "🐬", category: "backgrounds", price: 100, description: "Playful ocean creatures" },
  { id: "bg_farm_animals",      name: "Farm Animals",     emoji: "🐄", category: "backgrounds", price: 75,  description: "A cheerful cartoon farm" },
];

/** Image paths for equipped backgrounds */
export const BACKGROUND_IMAGES: Record<string, string> = {
  bg_sunset:           "/images/backgrounds/bg_sunset.png",
  bg_underwater:       "/images/backgrounds/bg_underwater.png",
  bg_mountains:        "/images/backgrounds/bg_mountains.png",
  bg_galaxy:           "/images/backgrounds/bg_galaxy.png",
  bg_garden:           "/images/backgrounds/bg_garden.png",
  bg_aurora:           "/images/backgrounds/bg_aurora.png",
  bg_rainforest:       "/images/backgrounds/bg_rainforest.png",
  bg_arctic:           "/images/backgrounds/bg_arctic.png",
  bg_volcano:          "/images/backgrounds/bg_volcano.png",
  bg_desert:           "/images/backgrounds/bg_desert.png",
  bg_coral_reef:       "/images/backgrounds/bg_coral_reef.png",
  bg_treehouse:        "/images/backgrounds/bg_treehouse.png",
  bg_castle:           "/images/backgrounds/bg_castle.png",
  bg_space_station:    "/images/backgrounds/bg_space_station.png",
  bg_candy_land:       "/images/backgrounds/bg_candy_land.png",
  bg_cherry_blossom:   "/images/backgrounds/bg_cherry_blossom.png",
  bg_meadow:           "/images/backgrounds/bg_meadow.png",
  bg_pirate_island:    "/images/backgrounds/bg_pirate_island.png",
  bg_winter_cabin:     "/images/backgrounds/bg_winter_cabin.png",
  bg_jungle_river:     "/images/backgrounds/bg_jungle_river.png",
  bg_moon_base:        "/images/backgrounds/bg_moon_base.png",
  bg_enchanted_forest: "/images/backgrounds/bg_enchanted_forest.png",
  bg_dinosaur_valley:  "/images/backgrounds/bg_dinosaur_valley.png",
  bg_hot_air_balloons: "/images/backgrounds/bg_hot_air_balloons.png",
  bg_lighthouse:       "/images/backgrounds/bg_lighthouse.png",
  bg_rainbow_valley:   "/images/backgrounds/bg_rainbow_valley.png",
  bg_soccer_field:     "/images/backgrounds/bg_soccer_field.png",
  bg_basketball_court: "/images/backgrounds/bg_basketball_court.png",
  bg_swimming_pool:    "/images/backgrounds/bg_swimming_pool.png",
  bg_shooting_stars:   "/images/backgrounds/bg_shooting_stars.png",
  bg_planets:          "/images/backgrounds/bg_planets.png",
  bg_safari:           "/images/backgrounds/bg_safari.png",
  bg_zoo:              "/images/backgrounds/bg_zoo.png",
  bg_ocean_animals:    "/images/backgrounds/bg_ocean_animals.png",
  bg_farm_animals:     "/images/backgrounds/bg_farm_animals.png",
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
