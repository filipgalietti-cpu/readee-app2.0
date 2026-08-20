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
  // Batch 2
  avatar_panda: "/images/avatars/avatar_panda.png",
  avatar_koala: "/images/avatars/avatar_koala.png",
  avatar_penguin: "/images/avatars/avatar_penguin.png",
  avatar_tiger: "/images/avatars/avatar_tiger.png",
  avatar_elephant: "/images/avatars/avatar_elephant.png",
  avatar_giraffe: "/images/avatars/avatar_giraffe.png",
  avatar_monkey: "/images/avatars/avatar_monkey.png",
  avatar_sloth: "/images/avatars/avatar_sloth.png",
  avatar_hedgehog: "/images/avatars/avatar_hedgehog.png",
  avatar_raccoon: "/images/avatars/avatar_raccoon.png",
  avatar_otter: "/images/avatars/avatar_otter.png",
  avatar_seal: "/images/avatars/avatar_seal.png",
  avatar_dolphin: "/images/avatars/avatar_dolphin.png",
  avatar_turtle: "/images/avatars/avatar_turtle.png",
  avatar_frog: "/images/avatars/avatar_frog.png",
  avatar_chameleon: "/images/avatars/avatar_chameleon.png",
  avatar_parrot: "/images/avatars/avatar_parrot.png",
  avatar_toucan: "/images/avatars/avatar_toucan.png",
  avatar_peacock: "/images/avatars/avatar_peacock.png",
  avatar_duck: "/images/avatars/avatar_duck.png",
  avatar_swan: "/images/avatars/avatar_swan.png",
  avatar_bat: "/images/avatars/avatar_bat.png",
  avatar_squirrel: "/images/avatars/avatar_squirrel.png",
  avatar_hamster: "/images/avatars/avatar_hamster.png",
  avatar_mouse: "/images/avatars/avatar_mouse.png",
  avatar_pony: "/images/avatars/avatar_pony.png",
  avatar_zebra: "/images/avatars/avatar_zebra.png",
  avatar_hippo: "/images/avatars/avatar_hippo.png",
  avatar_rhino: "/images/avatars/avatar_rhino.png",
  avatar_camel: "/images/avatars/avatar_camel.png",
  avatar_llama: "/images/avatars/avatar_llama.png",
  avatar_alpaca: "/images/avatars/avatar_alpaca.png",
  avatar_goat: "/images/avatars/avatar_goat.png",
  avatar_sheep: "/images/avatars/avatar_sheep.png",
  avatar_pig: "/images/avatars/avatar_pig.png",
  avatar_cow: "/images/avatars/avatar_cow.png",
  avatar_bee: "/images/avatars/avatar_bee.png",
  avatar_ladybug: "/images/avatars/avatar_ladybug.png",
  avatar_snail: "/images/avatars/avatar_snail.png",
  avatar_caterpillar: "/images/avatars/avatar_caterpillar.png",
  avatar_dragonfly: "/images/avatars/avatar_dragonfly.png",
  avatar_crab: "/images/avatars/avatar_crab.png",
  avatar_seahorse: "/images/avatars/avatar_seahorse.png",
  avatar_jellyfish: "/images/avatars/avatar_jellyfish.png",
  avatar_starfish: "/images/avatars/avatar_starfish.png",
  avatar_axolotl: "/images/avatars/avatar_axolotl.png",
  avatar_narwhal: "/images/avatars/avatar_narwhal.png",
  avatar_platypus: "/images/avatars/avatar_platypus.png",
  avatar_kangaroo: "/images/avatars/avatar_kangaroo.png",
  avatar_meerkat: "/images/avatars/avatar_meerkat.png",
  avatar_redpanda: "/images/avatars/avatar_redpanda.png",
  avatar_lemur: "/images/avatars/avatar_lemur.png",
  avatar_capybara: "/images/avatars/avatar_capybara.png",
  avatar_arcticfox: "/images/avatars/avatar_arcticfox.png",
  avatar_polarbear: "/images/avatars/avatar_polarbear.png",
  avatar_mermaid: "/images/avatars/avatar_mermaid.png",
  avatar_fairy: "/images/avatars/avatar_fairy.png",
  avatar_gnome: "/images/avatars/avatar_gnome.png",
  avatar_yeti: "/images/avatars/avatar_yeti.png",
  avatar_griffin: "/images/avatars/avatar_griffin.png",
  avatar_pegasus: "/images/avatars/avatar_pegasus.png",
  avatar_genie: "/images/avatars/avatar_genie.png",
  avatar_troll: "/images/avatars/avatar_troll.png",
  avatar_slime: "/images/avatars/avatar_slime.png",
  avatar_cloud: "/images/avatars/avatar_cloud.png",
  avatar_star: "/images/avatars/avatar_star.png",
  avatar_moon: "/images/avatars/avatar_moon.png",
  avatar_sun: "/images/avatars/avatar_sun.png",
  avatar_rainbow: "/images/avatars/avatar_rainbow.png",
  avatar_acorn: "/images/avatars/avatar_acorn.png",
  avatar_mushroom: "/images/avatars/avatar_mushroom.png",
  avatar_cactus: "/images/avatars/avatar_cactus.png",
  avatar_sunflower: "/images/avatars/avatar_sunflower.png",
  avatar_snowman: "/images/avatars/avatar_snowman.png",
  avatar_ghost: "/images/avatars/avatar_ghost.png",
  avatar_robot2: "/images/avatars/avatar_robot2.png",
  avatar_alien: "/images/avatars/avatar_alien.png",
  avatar_ufo: "/images/avatars/avatar_ufo.png",
  avatar_astro_girl: "/images/avatars/avatar_astro_girl.png",
  avatar_rocketship: "/images/avatars/avatar_rocketship.png",
  avatar_satellite: "/images/avatars/avatar_satellite.png",
  avatar_superhero: "/images/avatars/avatar_superhero.png",
  avatar_princess: "/images/avatars/avatar_princess.png",
  avatar_knight: "/images/avatars/avatar_knight.png",
  avatar_chef: "/images/avatars/avatar_chef.png",
  avatar_scientist: "/images/avatars/avatar_scientist.png",
  avatar_artist: "/images/avatars/avatar_artist.png",
  avatar_musician: "/images/avatars/avatar_musician.png",
  avatar_explorer: "/images/avatars/avatar_explorer.png",
  avatar_detective: "/images/avatars/avatar_detective.png",
  avatar_firefighter: "/images/avatars/avatar_firefighter.png",
  avatar_wizardkid: "/images/avatars/avatar_wizardkid.png",
  avatar_vikingkid: "/images/avatars/avatar_vikingkid.png",
  avatar_cowboykid: "/images/avatars/avatar_cowboykid.png",
  avatar_gamerkid: "/images/avatars/avatar_gamerkid.png",
  avatar_ballerina: "/images/avatars/avatar_ballerina.png",
  avatar_skater: "/images/avatars/avatar_skater.png",
  avatar_diver: "/images/avatars/avatar_diver.png",
  avatar_gardener: "/images/avatars/avatar_gardener.png",
  avatar_baker: "/images/avatars/avatar_baker.png",
  avatar_wolf: "/images/avatars/avatar_wolf.png",
  avatar_deer: "/images/avatars/avatar_deer.png",
  avatar_owl2: "/images/avatars/avatar_owl2.png",
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
