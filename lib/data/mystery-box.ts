import { ShopItem, availableShopItems } from "./shop-items";

/** Free to open once every 24h (daily engagement loop); after that, extra
 *  opens within the window cost MYSTERY_BOX_PAID_PRICE carrots. */
export const MYSTERY_BOX_FREE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const MYSTERY_BOX_PAID_PRICE = 1000;

/** @deprecated superseded by the free-daily / paid-reopen model. */
export const MYSTERY_BOX_PRICE = 50;

export type MysteryReward =
  | { type: "carrots"; amount: number; label: string }
  | { type: "item"; item: ShopItem; label: string }
  | { type: "multiplier"; multiplier: number; label: string }
  | { type: "jackpot"; amount: number; label: string };

export function rollMysteryBox(ownedItemIds: Set<string>, isPaid = false): MysteryReward {
  const roll = Math.random();

  // A PAID re-open costs MYSTERY_BOX_PAID_PRICE (1,000) carrots, so its payouts
  // are scaled to that tier — a real gamble worth the price, not pocket change.
  // The FREE daily open keeps modest engagement-loop rewards.
  if (isPaid) {
    // 10%: Jackpot 2,500 carrots
    if (roll < 0.1) {
      return { type: "jackpot", amount: 2500, label: "JACKPOT! 2,500 carrots!" };
    }
    // 20%: Temporary 2x multiplier
    if (roll < 0.3) {
      return { type: "multiplier", multiplier: 2, label: "2x carrots on your next lesson!" };
    }
    // 30%: Random unowned shop item (falls back to a big carrot payout)
    if (roll < 0.6) {
      const unowned = availableShopItems().filter((item) => !ownedItemIds.has(item.id));
      if (unowned.length > 0) {
        const item = unowned[Math.floor(Math.random() * unowned.length)];
        return { type: "item", item, label: `${item.name}!` };
      }
      return { type: "carrots", amount: 1000, label: "+1,000 carrots!" };
    }
    // 40%: Random carrots 700-1,500 (avg ~1,100)
    const amount = 700 + Math.floor(Math.random() * 801);
    return { type: "carrots", amount, label: `+${amount.toLocaleString()} carrots!` };
  }

  // 10%: Jackpot 150 carrots
  if (roll < 0.1) {
    return { type: "jackpot", amount: 150, label: "JACKPOT! 150 carrots!" };
  }

  // 20%: Temporary 2x multiplier
  if (roll < 0.3) {
    return { type: "multiplier", multiplier: 2, label: "2x carrots on your next lesson!" };
  }

  // 30%: Random unowned shop item (falls back to carrots)
  if (roll < 0.6) {
    const unowned = availableShopItems().filter((item) => !ownedItemIds.has(item.id));
    if (unowned.length > 0) {
      const item = unowned[Math.floor(Math.random() * unowned.length)];
      return { type: "item", item, label: `${item.name}!` };
    }
    // Fallback: 40 carrots
    return { type: "carrots", amount: 40, label: "+40 carrots!" };
  }

  // 40%: Random carrots 20-80
  const amount = 20 + Math.floor(Math.random() * 61);
  return { type: "carrots", amount, label: `+${amount} carrots!` };
}
