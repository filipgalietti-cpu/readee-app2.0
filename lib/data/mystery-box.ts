import { ShopItem, SHOP_ITEMS } from "./shop-items";

export const MYSTERY_BOX_PRICE = 50;

export type MysteryReward =
  | { type: "carrots"; amount: number; label: string }
  | { type: "item"; item: ShopItem; label: string }
  | { type: "multiplier"; multiplier: number; label: string }
  | { type: "jackpot"; amount: number; label: string };

export function rollMysteryBox(ownedItemIds: Set<string>): MysteryReward {
  const roll = Math.random();

  // 10%: Jackpot 150 carrots
  if (roll < 0.1) {
    return { type: "jackpot", amount: 150, label: "JACKPOT! 150 carrots!" };
  }

  // 20%: Temporary 2x multiplier
  if (roll < 0.3) {
    return { type: "multiplier", multiplier: 2, label: "2x Multiplier for next session!" };
  }

  // 30%: Random unowned shop item (falls back to carrots)
  if (roll < 0.6) {
    const unowned = SHOP_ITEMS.filter((item) => !ownedItemIds.has(item.id));
    if (unowned.length > 0) {
      const item = unowned[Math.floor(Math.random() * unowned.length)];
      return { type: "item", item, label: `${item.emoji} ${item.name}!` };
    }
    // Fallback: 40 carrots
    return { type: "carrots", amount: 40, label: "+40 carrots!" };
  }

  // 40%: Random carrots 20-80
  const amount = 20 + Math.floor(Math.random() * 61);
  return { type: "carrots", amount, label: `+${amount} carrots!` };
}
