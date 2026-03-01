"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child, ShopPurchase, EquippedItems } from "@/lib/db/types";
import {
  SHOP_CATEGORIES,
  SHOP_ITEMS,
  ShopCategory,
  ShopItem,
  getItemsByCategory,
  categoryToSlot,
} from "@/lib/data/shop-items";
import { MYSTERY_BOX_PRICE, rollMysteryBox, MysteryReward } from "@/lib/data/mystery-box";
import { MysteryBoxOpener } from "@/app/_components/MysteryBoxOpener";
import { GetMoreCarrotsModal } from "@/app/_components/GetMoreCarrotsModal";
import { usePracticeStore } from "@/lib/stores/practice-store";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
        </div>
      }
    >
      <ShopLoader />
    </Suspense>
  );
}

function ShopLoader() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const [child, setChild] = useState<Child | null>(null);
  const [purchases, setPurchases] = useState<ShopPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();
      const [childRes, purchasesRes] = await Promise.all([
        supabase.from("children").select("*").eq("id", childId).single(),
        supabase.from("shop_purchases").select("*").eq("child_id", childId),
      ]);
      if (childRes.data) setChild(childRes.data as Child);
      if (purchasesRes.data) setPurchases(purchasesRes.data as ShopPurchase[]);
      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading || !child) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <ShopContent
      child={child}
      setChild={setChild}
      purchases={purchases}
      setPurchases={setPurchases}
    />
  );
}

function ShopContent({
  child,
  setChild,
  purchases,
  setPurchases,
}: {
  child: Child;
  setChild: (c: Child) => void;
  purchases: ShopPurchase[];
  setPurchases: (p: ShopPurchase[]) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("avatars");
  const [buying, setBuying] = useState<string | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);
  const [mysteryReward, setMysteryReward] = useState<MysteryReward | null>(null);
  const [buyingMystery, setBuyingMystery] = useState(false);
  const [showGetMore, setShowGetMore] = useState<ShopItem | null>(null);
  const setMysteryBoxMultiplier = usePracticeStore((s) => s.setMysteryBoxMultiplier);

  const ownedIds = new Set(purchases.map((p) => p.item_id));
  const items = getItemsByCategory(activeCategory);

  const handleBuy = useCallback(
    async (item: ShopItem) => {
      if (child.carrots < item.price || ownedIds.has(item.id)) return;
      setBuying(item.id);

      const supabase = supabaseBrowser();
      const newCarrots = child.carrots - item.price;

      const [updateRes, insertRes] = await Promise.all([
        supabase.from("children").update({ carrots: newCarrots }).eq("id", child.id),
        supabase.from("shop_purchases").insert({ child_id: child.id, item_id: item.id }),
      ]);

      if (!updateRes.error && !insertRes.error) {
        setChild({ ...child, carrots: newCarrots });
        setPurchases([...purchases, { id: crypto.randomUUID(), child_id: child.id, item_id: item.id, purchased_at: new Date().toISOString() }]);
        setJustBought(item.id);
        setTimeout(() => setJustBought(null), 1500);
      }

      setBuying(null);
    },
    [child, ownedIds, purchases, setChild, setPurchases],
  );

  const handleEquip = useCallback(
    async (item: ShopItem) => {
      const slot = categoryToSlot(item.category);
      const equipped = child.equipped_items || {};
      const isEquipped = equipped[slot as keyof EquippedItems] === item.id;

      const newEquipped: EquippedItems = {
        ...equipped,
        [slot]: isEquipped ? null : item.id,
      };

      const supabase = supabaseBrowser();
      const { error } = await supabase
        .from("children")
        .update({ equipped_items: newEquipped })
        .eq("id", child.id);

      if (!error) {
        setChild({ ...child, equipped_items: newEquipped });
      }
    },
    [child, setChild],
  );

  const handleBuyMysteryBox = useCallback(async () => {
    if (child.carrots < MYSTERY_BOX_PRICE || buyingMystery) return;
    setBuyingMystery(true);

    const supabase = supabaseBrowser();
    const newCarrots = child.carrots - MYSTERY_BOX_PRICE;
    await supabase.from("children").update({ carrots: newCarrots }).eq("id", child.id);
    setChild({ ...child, carrots: newCarrots });

    const reward = rollMysteryBox(ownedIds);

    // Apply reward
    if (reward.type === "carrots" || reward.type === "jackpot") {
      const bonus = reward.amount;
      await supabase.from("children").update({ carrots: newCarrots + bonus }).eq("id", child.id);
      setChild({ ...child, carrots: newCarrots + bonus });
    } else if (reward.type === "item") {
      await supabase.from("shop_purchases").insert({ child_id: child.id, item_id: reward.item.id });
      setPurchases([...purchases, { id: crypto.randomUUID(), child_id: child.id, item_id: reward.item.id, purchased_at: new Date().toISOString() }]);
    } else if (reward.type === "multiplier") {
      setMysteryBoxMultiplier(reward.multiplier);
    }

    setMysteryReward(reward);
    setBuyingMystery(false);
  }, [child, buyingMystery, ownedIds, purchases, setChild, setPurchases, setMysteryBoxMultiplier]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 pb-16">
      {/* Back link */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          &larr; Back
        </Link>
      </div>

      {/* Balance header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-center text-white shadow-lg mb-8"
      >
        <div className="text-4xl mb-2">🥕</div>
        <div className="text-3xl font-extrabold">{child.carrots}</div>
        <div className="text-sm font-medium text-white/80 mt-1">
          {child.first_name}&apos;s Carrots
        </div>
      </motion.div>

      {/* Mystery Box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12"
              animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <img src="/images/shop/mystery-box-closed.png" alt="Mystery Box" className="w-full h-full object-contain" />
            </motion.div>
            <div>
              <div className="font-bold text-zinc-900 dark:text-white">Mystery Box</div>
              <div className="text-xs text-zinc-500 dark:text-slate-400">
                Win carrots, items, or multipliers!
              </div>
            </div>
          </div>
          <button
            onClick={child.carrots >= MYSTERY_BOX_PRICE ? handleBuyMysteryBox : () => setShowGetMore({ id: "mystery_box", name: "Mystery Box", emoji: "🎁", category: "avatars", price: MYSTERY_BOX_PRICE, description: "Mystery Box" })}
            disabled={buyingMystery}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${
              child.carrots >= MYSTERY_BOX_PRICE
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50"
            }`}
          >
            {buyingMystery ? (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <span>{MYSTERY_BOX_PRICE} 🥕</span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {SHOP_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat.key
                ? "bg-orange-500 text-white shadow-md"
                : "bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-slate-700"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {items.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              owned={ownedIds.has(item.id)}
              equipped={child.equipped_items?.[categoryToSlot(item.category) as keyof EquippedItems] === item.id}
              canAfford={child.carrots >= item.price}
              buying={buying === item.id}
              justBought={justBought === item.id}
              onBuy={() => handleBuy(item)}
              onEquip={() => handleEquip(item)}
              onCantAfford={() => setShowGetMore(item)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Mystery Box Opener modal */}
      {mysteryReward && (
        <MysteryBoxOpener
          reward={mysteryReward}
          onClose={() => setMysteryReward(null)}
        />
      )}

      {/* Get More Carrots modal */}
      {showGetMore && (
        <GetMoreCarrotsModal
          itemName={showGetMore.name}
          shortfall={showGetMore.price - child.carrots}
          childId={child.id}
          onClose={() => setShowGetMore(null)}
        />
      )}
    </div>
  );
}

function ShopItemCard({
  item,
  owned,
  equipped,
  canAfford,
  buying,
  justBought,
  onBuy,
  onEquip,
  onCantAfford,
}: {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  buying: boolean;
  justBought: boolean;
  onBuy: () => void;
  onEquip: () => void;
  onCantAfford: () => void;
}) {
  return (
    <motion.div
      layout
      className={`rounded-2xl border p-4 flex flex-col items-center text-center transition-all ${
        owned
          ? equipped
            ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-700"
            : "border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800"
          : canAfford
          ? "border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md"
          : "border-zinc-100 dark:border-slate-800 bg-zinc-50 dark:bg-slate-900 opacity-70 hover:opacity-100"
      }`}
    >
      {/* Emoji */}
      <motion.div
        className="text-4xl mb-2"
        animate={justBought ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {item.emoji}
      </motion.div>

      {/* Name */}
      <div className="font-semibold text-sm text-zinc-900 dark:text-white mb-0.5">
        {item.name}
      </div>

      {/* Description */}
      <div className="text-[11px] text-zinc-400 dark:text-slate-500 mb-3 leading-snug">
        {item.description}
      </div>

      {/* Action */}
      {owned ? (
        <button
          onClick={onEquip}
          className={`w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
            equipped
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-zinc-100 dark:bg-slate-700 text-zinc-600 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-slate-600"
          }`}
        >
          {equipped ? "Equipped" : "Equip"}
        </button>
      ) : (
        <button
          onClick={canAfford ? onBuy : onCantAfford}
          disabled={buying}
          className={`w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] ${
            canAfford
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm hover:from-orange-600 hover:to-amber-600"
              : "bg-zinc-200 dark:bg-slate-700 text-zinc-400 dark:text-slate-500 hover:bg-zinc-300 dark:hover:bg-slate-600"
          }`}
        >
          {buying ? (
            <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <span>{item.price} 🥕</span>
          )}
        </button>
      )}
    </motion.div>
  );
}
