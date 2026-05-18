export type ShopCategory = "avatars" | "outfits" | "themes" | "stickers" | "backgrounds";

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  category: ShopCategory;
  price: number;
  description: string;
}

export const SHOP_CATEGORIES: { key: ShopCategory; label: string; icon: string }[] = [
  { key: "avatars", label: "Avatars", icon: "smile" },
  { key: "outfits", label: "Outfits", icon: "crown" },
  { key: "themes", label: "Themes", icon: "palette" },
  { key: "stickers", label: "Stickers", icon: "star" },
  { key: "backgrounds", label: "Backgrounds", icon: "image" },
];

export const SHOP_ITEMS: ShopItem[] = [
  // ── Avatars ──
  { id: "avatar_fox",       name: "Rusty",      icon: "cat",      category: "avatars", price: 25,  description: "A cool fox with a scarf" },
  { id: "avatar_rabbit",    name: "Dash",       icon: "rabbit",   category: "avatars", price: 30,  description: "A speedy little rabbit" },
  { id: "avatar_fish",      name: "Bubbles",    icon: "fish",     category: "avatars", price: 40,  description: "A colorful tropical fish" },
  { id: "avatar_owl",       name: "Hoot",       icon: "bird",     category: "avatars", price: 50,  description: "A wise owl with glasses" },
  { id: "avatar_unicorn",   name: "Sparkle",    icon: "sparkles", category: "avatars", price: 75,  description: "A magical rainbow unicorn" },
  { id: "avatar_phoenix",   name: "Ember",      icon: "flame",    category: "avatars", price: 75,  description: "An adorable baby phoenix" },
  { id: "avatar_dragon",    name: "Blaze",      icon: "flame",    category: "avatars", price: 100, description: "A friendly baby dragon" },
  { id: "avatar_pirate",    name: "Captain",    icon: "skull",    category: "avatars", price: 100, description: "A swashbuckling pirate kid" },
  { id: "avatar_astronaut", name: "Nova",       icon: "rocket",   category: "avatars", price: 125, description: "A brave space explorer" },
  { id: "avatar_ninja",     name: "Shadow",     icon: "swords",   category: "avatars", price: 125, description: "A stealthy ninja kid" },
  { id: "avatar_robot",     name: "Bolt",       icon: "bot",      category: "avatars", price: 150, description: "A friendly reading robot" },
  { id: "avatar_leopard",   name: "Frost",      icon: "snowflake", category: "avatars", price: 150, description: "A majestic snow leopard" },
  { id: "avatar_dino",      name: "Rex",        icon: "bone",     category: "avatars", price: 175, description: "A goofy friendly dinosaur" },
  { id: "avatar_pixel",     name: "Pixel",      icon: "gamepad-2", category: "avatars", price: 200, description: "A retro game character" },
  { id: "avatar_lion",      name: "King Leo",   icon: "crown",    category: "avatars", price: 250, description: "A regal lion with a crown" },

  // ── Readee Outfits ──
  // Each bunny outfit re-skins the Readee mascot you see on right/wrong
  // feedback and the lesson-complete screen. Art + animation live in
  // /app/_components/Bunny — keep IDs in sync with OUTFITS there.
  { id: "bunny_classic",   name: "Classic Readee", icon: "rabbit",   category: "outfits", price: 0,   description: "The original Readee bunny" },
  { id: "bunny_bookworm",  name: "Bookworm",       icon: "book-open",category: "outfits", price: 200, description: "Cozy sweater, tiny reading specs" },
  { id: "bunny_astronaut", name: "Astronaut",      icon: "rocket",   category: "outfits", price: 250, description: "Helmet bubble + space suit" },
  { id: "bunny_superhero", name: "Superhero",      icon: "shield",   category: "outfits", price: 250, description: "Caped, with a gold star emblem" },
  { id: "bunny_pirate",    name: "Pirate",         icon: "skull",    category: "outfits", price: 250, description: "Striped shirt + eyepatch + bandana" },
  { id: "bunny_scientist", name: "Scientist",      icon: "brain",    category: "outfits", price: 250, description: "Lab coat with a pocket pencil" },
  { id: "bunny_soccer",    name: "Soccer Star",    icon: "circle-dot", category: "outfits", price: 250, description: "Striped jersey, number 7" },
  { id: "bunny_royal",     name: "Royal",          icon: "crown",    category: "outfits", price: 500, description: "Purple velvet cape + tiny gold crown" },
  { id: "bunny_wizard",    name: "Wizard",         icon: "wand-2",   category: "outfits", price: 500, description: "Starry blue robe + pointed hat" },
  { id: "bunny_birthday",  name: "Birthday",       icon: "sparkles", category: "outfits", price: 750, description: "Party hat + confetti shirt (rare)" },

  // ── Season 2 (May 2026) — detective / ninja / chef / robot / cowboy / knight / popstar / dino / jester / vampire ──
  { id: "bunny_detective", name: "Detective",      icon: "search",   category: "outfits", price: 250, description: "Plaid deerstalker + tan trench coat" },
  { id: "bunny_ninja",     name: "Ninja",          icon: "swords",   category: "outfits", price: 250, description: "Black mask + red headband shuriken" },
  { id: "bunny_chef",      name: "Chef",           icon: "flame",    category: "outfits", price: 250, description: "Double-breasted whites + red kerchief" },
  { id: "bunny_robot",     name: "Robot",          icon: "bot",      category: "outfits", price: 500, description: "Antenna + chrome chest + glowing core (rare)" },
  { id: "bunny_cowboy",    name: "Cowboy",         icon: "star",     category: "outfits", price: 250, description: "Stetson + denim vest + sheriff star" },
  { id: "bunny_knight",    name: "Knight",         icon: "shield",   category: "outfits", price: 500, description: "Silver helmet + chainmail + crusader tabard (rare)" },
  { id: "bunny_popstar",   name: "Pop Star",       icon: "sparkles", category: "outfits", price: 250, description: "Heart sunglasses + sparkly vest + mic" },
  { id: "bunny_dino",      name: "Dino Onesie",    icon: "bone",     category: "outfits", price: 500, description: "Spiked green cap + cream belly + tail (rare)" },
  { id: "bunny_jester",    name: "Jester",         icon: "smile",    category: "outfits", price: 250, description: "Three-bell hat + red/yellow harlequin" },
  { id: "bunny_vampire",   name: "Vampire",        icon: "moon",     category: "outfits", price: 500, description: "High-collar black cape + bow tie + fangs (rare)" },

  // ── Season 3 — fantasy & theatrical ──
  { id: "bunny_magician", name: "Magician", icon: "wand-2", category: "outfits", price: 500, description: "Top hat + cape with wand spark" },
  { id: "bunny_mermaid", name: "Mermaid", icon: "waves", category: "outfits", price: 500, description: "Iridescent scaled tail + seashell top" },
  { id: "bunny_witch", name: "Witch", icon: "moon", category: "outfits", price: 250, description: "Pointy hat + bubbling cauldron" },
  { id: "bunny_viking", name: "Viking", icon: "swords", category: "outfits", price: 500, description: "Horned helmet + fur tunic + braided beard" },
  { id: "bunny_surfer", name: "Surfer", icon: "waves", category: "outfits", price: 250, description: "Hibiscus shirt + bare feet + zinc nose" },
  { id: "bunny_mountaineer", name: "Mountaineer", icon: "mountain", category: "outfits", price: 500, description: "Climbing harness + helmet + ice axe" },
  { id: "bunny_mummy", name: "Mummy", icon: "sparkles", category: "outfits", price: 250, description: "Bandage wrap + dusty cloth" },
  { id: "bunny_disco", name: "Disco Star", icon: "sparkles", category: "outfits", price: 250, description: "Sequins + bell-bottoms + disco ball" },
  { id: "bunny_racer", name: "Race Car Driver", icon: "circle-dot", category: "outfits", price: 250, description: "Race suit + checkered flag + helmet" },
  { id: "bunny_fairy", name: "Fairy", icon: "sparkles", category: "outfits", price: 250, description: "Iridescent wings + flower crown" },

  // ── Season 4 — sports collection ──
  { id: "bunny_tennis", name: "Tennis Pro", icon: "circle-dot", category: "outfits", price: 250, description: "Polo + visor + tennis racquet" },
  { id: "bunny_boxer", name: "Boxer", icon: "shield", category: "outfits", price: 250, description: "Red gloves + satin trunks + champion belt" },
  { id: "bunny_baseball", name: "Baseball Slugger", icon: "circle-dot", category: "outfits", price: 250, description: "Pinstripes + cap + bat" },
  { id: "bunny_hockey", name: "Hockey", icon: "swords", category: "outfits", price: 250, description: "Jersey + helmet + hockey stick" },
  { id: "bunny_football", name: "Football", icon: "circle-dot", category: "outfits", price: 250, description: "Pads + helmet + football" },
  { id: "bunny_karate", name: "Karate", icon: "swords", category: "outfits", price: 250, description: "White gi + black belt" },
  { id: "bunny_cyclist", name: "Cyclist", icon: "star", category: "outfits", price: 250, description: "Lycra kit + aero helmet + goggles" },
  { id: "bunny_swimmer", name: "Swimmer", icon: "waves", category: "outfits", price: 250, description: "Goggles + swim cap + medal" },
  { id: "bunny_gymnast", name: "Gymnast", icon: "star", category: "outfits", price: 250, description: "Leotard + sparkle accents" },
  { id: "bunny_cheer", name: "Cheerleader", icon: "star", category: "outfits", price: 250, description: "V-sweater + skirt + pom poms" },

  // ── Season 5 — World Cup national teams ──
  { id: "bunny_brazil", name: "Brazil", icon: "globe", category: "outfits", price: 250, description: "Yellow + green + soccer ball" },
  { id: "bunny_argentina", name: "Argentina", icon: "globe", category: "outfits", price: 250, description: "Sky blue + white stripes" },
  { id: "bunny_france", name: "France", icon: "globe", category: "outfits", price: 250, description: "Bleu, blanc, rouge" },
  { id: "bunny_germany", name: "Germany", icon: "globe", category: "outfits", price: 250, description: "Black, red, gold trim" },
  { id: "bunny_usa", name: "USA", icon: "star", category: "outfits", price: 250, description: "Stars + stripes + red socks" },
  { id: "bunny_england", name: "England", icon: "shield", category: "outfits", price: 250, description: "Three lions + white kit" },
  { id: "bunny_spain", name: "Spain", icon: "flame", category: "outfits", price: 250, description: "La Roja crest + red top" },
  { id: "bunny_italy", name: "Italy", icon: "globe", category: "outfits", price: 250, description: "Azzurri blue + tricolor" },
  { id: "bunny_netherlands", name: "Netherlands", icon: "globe", category: "outfits", price: 250, description: "Oranje top + lion crest" },
  { id: "bunny_portugal", name: "Portugal", icon: "globe", category: "outfits", price: 250, description: "Maroon + green cross" },

  // ── Season 6 — summer collection ──
  { id: "bunny_flamingo", name: "Flamingo Float", icon: "bird", category: "outfits", price: 250, description: "Pink flamingo pool float" },
  { id: "bunny_scuba", name: "Scuba Diver", icon: "fish", category: "outfits", price: 250, description: "Mask + flippers + air tank" },
  { id: "bunny_lifeguard", name: "Lifeguard", icon: "shield", category: "outfits", price: 250, description: "Red trunks + whistle + zinc nose" },
  { id: "bunny_icecream", name: "Ice Cream", icon: "candy", category: "outfits", price: 250, description: "Cone hat + cherry on top" },
  { id: "bunny_watermelon", name: "Watermelon", icon: "cherry", category: "outfits", price: 250, description: "Watermelon slice cap + green vest" },
  { id: "bunny_sailor", name: "Sailor", icon: "ship", category: "outfits", price: 250, description: "Sailor stripes + nautical hat" },
  { id: "bunny_hula", name: "Hula", icon: "flower", category: "outfits", price: 250, description: "Grass skirt + lei + flower crown" },
  { id: "bunny_fisherman", name: "Fisherman", icon: "fish", category: "outfits", price: 250, description: "Yellow slicker + bucket hat + rod" },
  { id: "bunny_beachtowel", name: "Beach Day", icon: "sun", category: "outfits", price: 250, description: "Beach towel cape + flip flops" },
  { id: "bunny_pineapple", name: "Pineapple", icon: "tree-palm", category: "outfits", price: 250, description: "Pineapple onesie + crown leaves" },

  // ── Themes ──
  { id: "theme_ocean",      name: "Ocean",       icon: "waves",      category: "themes", price: 50,  description: "Deep blue ocean theme" },
  { id: "theme_forest",     name: "Forest",      icon: "tree-pine",  category: "themes", price: 75,  description: "Enchanted forest theme" },
  { id: "theme_space",      name: "Space",       icon: "orbit",      category: "themes", price: 100, description: "Outer space adventure" },
  { id: "theme_candy",      name: "Candy Land",  icon: "candy",      category: "themes", price: 125, description: "Sweet candy land theme" },
  { id: "theme_dino",       name: "Dino World",  icon: "bone",       category: "themes", price: 150, description: "Prehistoric dino world" },
  { id: "theme_rainbow",    name: "Rainbow",     icon: "rainbow",    category: "themes", price: 200, description: "Colorful rainbow theme" },

  // ── Stickers & Badges ──
  { id: "sticker_bookworm",  name: "Bookworm",   icon: "book-open",  category: "stickers", price: 25,  description: "A proud bookworm badge" },
  { id: "sticker_gold_star", name: "Gold Star",  icon: "star",       category: "stickers", price: 50,  description: "A shining gold star" },
  { id: "sticker_trophy",    name: "Trophy",     icon: "trophy",     category: "stickers", price: 75,  description: "A champion trophy" },
  { id: "sticker_rocket",    name: "Rocket",     icon: "rocket",     category: "stickers", price: 100, description: "Blast off to reading!" },
  { id: "sticker_brain",     name: "Big Brain",  icon: "brain",      category: "stickers", price: 125, description: "Super smart brain badge" },
  { id: "sticker_diamond",   name: "Diamond",    icon: "gem",        category: "stickers", price: 150, description: "A rare diamond badge" },

  // ── Backgrounds ──
  { id: "bg_sunset",            name: "Sunset",           icon: "sunset",          category: "backgrounds", price: 50,  description: "A beautiful sunset" },
  { id: "bg_underwater",        name: "Underwater",       icon: "fish",            category: "backgrounds", price: 75,  description: "Under the sea" },
  { id: "bg_mountains",         name: "Mountains",        icon: "mountain",        category: "backgrounds", price: 100, description: "Majestic mountain peaks" },
  { id: "bg_galaxy",            name: "Galaxy",           icon: "orbit",           category: "backgrounds", price: 125, description: "A swirling galaxy" },
  { id: "bg_garden",            name: "Garden",           icon: "flower",          category: "backgrounds", price: 150, description: "A blooming garden" },
  { id: "bg_aurora",            name: "Aurora",           icon: "sparkles",        category: "backgrounds", price: 200, description: "Northern lights aurora" },
  { id: "bg_rainforest",        name: "Rainforest",       icon: "tree-palm",       category: "backgrounds", price: 50,  description: "A lush tropical rainforest" },
  { id: "bg_arctic",            name: "Arctic",           icon: "snowflake",       category: "backgrounds", price: 75,  description: "Peaceful arctic landscape" },
  { id: "bg_volcano",           name: "Volcano",          icon: "flame",           category: "backgrounds", price: 100, description: "A dramatic volcano scene" },
  { id: "bg_desert",            name: "Desert",           icon: "sun",             category: "backgrounds", price: 75,  description: "A colorful desert sunset" },
  { id: "bg_coral_reef",        name: "Coral Reef",       icon: "shell",           category: "backgrounds", price: 100, description: "A vibrant coral reef" },
  { id: "bg_treehouse",         name: "Treehouse",        icon: "tree-deciduous",  category: "backgrounds", price: 125, description: "A magical treehouse" },
  { id: "bg_castle",            name: "Castle",           icon: "castle",          category: "backgrounds", price: 150, description: "A fairytale castle" },
  { id: "bg_space_station",     name: "Space Station",    icon: "satellite",       category: "backgrounds", price: 150, description: "An orbiting space station" },
  { id: "bg_candy_land",        name: "Candy Land",       icon: "candy",           category: "backgrounds", price: 100, description: "A whimsical candy land" },
  { id: "bg_cherry_blossom",    name: "Cherry Blossom",   icon: "cherry",          category: "backgrounds", price: 125, description: "Serene cherry blossoms" },
  { id: "bg_meadow",            name: "Meadow",           icon: "flower-2",        category: "backgrounds", price: 50,  description: "A sunny flower meadow" },
  { id: "bg_pirate_island",     name: "Pirate Island",    icon: "skull",           category: "backgrounds", price: 150, description: "A tropical pirate island" },
  { id: "bg_winter_cabin",      name: "Winter Cabin",     icon: "mountain-snow",   category: "backgrounds", price: 100, description: "A cozy winter cabin" },
  { id: "bg_jungle_river",      name: "Jungle River",     icon: "bird",            category: "backgrounds", price: 100, description: "A jungle river adventure" },
  { id: "bg_moon_base",         name: "Moon Base",        icon: "moon",            category: "backgrounds", price: 175, description: "A moon base with craters" },
  { id: "bg_enchanted_forest",  name: "Enchanted Forest", icon: "trees",           category: "backgrounds", price: 150, description: "A magical enchanted forest" },
  { id: "bg_dinosaur_valley",   name: "Dinosaur Valley",  icon: "bone",            category: "backgrounds", price: 125, description: "A colorful dinosaur valley" },
  { id: "bg_hot_air_balloons",  name: "Hot Air Balloons", icon: "cloud",           category: "backgrounds", price: 75,  description: "Colorful hot air balloons" },
  { id: "bg_lighthouse",        name: "Lighthouse",       icon: "sunrise",         category: "backgrounds", price: 100, description: "A coastal lighthouse" },
  { id: "bg_rainbow_valley",    name: "Rainbow Valley",   icon: "rainbow",         category: "backgrounds", price: 125, description: "A magical rainbow valley" },
  { id: "bg_soccer_field",      name: "Soccer Field",     icon: "circle-dot",      category: "backgrounds", price: 100, description: "A lively soccer field" },
  { id: "bg_basketball_court",  name: "Basketball Court", icon: "circle-dot",      category: "backgrounds", price: 100, description: "An outdoor basketball court" },
  { id: "bg_swimming_pool",     name: "Swimming Pool",    icon: "waves",           category: "backgrounds", price: 75,  description: "A cheerful swimming pool" },
  { id: "bg_shooting_stars",    name: "Shooting Stars",   icon: "sparkles",        category: "backgrounds", price: 150, description: "A magical shooting star sky" },
  { id: "bg_planets",           name: "Planets",          icon: "globe",           category: "backgrounds", price: 175, description: "A colorful solar system" },
  { id: "bg_safari",            name: "Safari",           icon: "binoculars",      category: "backgrounds", price: 125, description: "An African safari adventure" },
  { id: "bg_zoo",               name: "Zoo",              icon: "paw-print",       category: "backgrounds", price: 100, description: "A colorful cartoon zoo" },
  { id: "bg_ocean_animals",     name: "Ocean Animals",    icon: "fish",            category: "backgrounds", price: 100, description: "Playful ocean creatures" },
  { id: "bg_farm_animals",      name: "Farm Animals",     icon: "wheat",           category: "backgrounds", price: 75,  description: "A cheerful cartoon farm" },
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
