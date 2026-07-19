"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { savedOk } from "@/lib/db/checked-write";
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
import { Carrot, Sparkles } from "lucide-react";
import { getShopIcon } from "@/lib/data/shop-icons";
import { AVATAR_IMAGES } from "@/lib/utils/get-child-avatar";
import { SkeletonPage } from "@/app/_components/Skeleton";
import { Bunny, BunnyReaction } from "@/app/_components/Bunny/Bunny";
import { getOutfit, type Outfit } from "@/app/_components/Bunny/outfits";
import { UnlockToast } from "@/app/_components/UnlockToast";
import { checkSeasonalGrants, isSeasonalActive, monthName } from "@/lib/unlock";

export default function ShopPage() {
  return (
    <Suspense fallback={<SkeletonPage cards={4} />}>
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
    return <SkeletonPage cards={4} />;
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
  // Default to Outfits so the grid below the bunny showcase is the
  // outfit picker (tap to preview, then equip in the hero). Avatars,
  // backgrounds, etc. are one tab away.
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("outfits");
  const [buying, setBuying] = useState<string | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);
  const [mysteryReward, setMysteryReward] = useState<MysteryReward | null>(null);
  const [buyingMystery, setBuyingMystery] = useState(false);
  const [showGetMore, setShowGetMore] = useState<ShopItem | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [unlocks, setUnlocks] = useState<Outfit[]>([]);
  const [previewOutfitId, setPreviewOutfitId] = useState<string>(
    child.equipped_items?.outfit ?? "bunny_classic",
  );
  const setMysteryBoxMultiplier = usePracticeStore((s) => s.setMysteryBoxMultiplier);

  const ownedIds = new Set(purchases.map((p) => p.item_id));
  const items = getItemsByCategory(activeCategory);

  // Run seasonal grants on every shop load — if it's October and the
  // kid doesn't yet own Vampire, they get it now with a celebration.
  // Idempotent + cheap, safe to call on every mount.
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const supabase = supabaseBrowser();
      const ids = new Set(purchases.map((p) => p.item_id));
      const { newlyGranted } = await checkSeasonalGrants(supabase, child.id, ids);
      if (cancelled || newlyGranted.length === 0) return;
      setPurchases([
        ...purchases,
        ...newlyGranted.map((o) => ({
          id: crypto.randomUUID(),
          child_id: child.id,
          item_id: o.id,
          purchased_at: new Date().toISOString(),
        })),
      ]);
      setUnlocks(newlyGranted);
    }
    run();
    return () => {
      cancelled = true;
    };
    // intentionally only on mount per child
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  const handleBuy = useCallback(
    async (item: ShopItem) => {
      if (child.carrots < item.price || ownedIds.has(item.id)) return;
      setBuying(item.id);
      setBuyError(null);

      const supabase = supabaseBrowser();
      const newCarrots = child.carrots - item.price;

      // Sequence the writes instead of running them in parallel. Old
      // order ran update + insert via Promise.all; if the insert
      // failed after the update succeeded the kid lost their hard-
      // earned carrots without getting the item. We now insert the
      // purchase row first, then deduct carrots, so the failure modes
      // are:
      //   - insert fails -> nothing changed, retry safe
      //   - insert succeeds, update fails -> item owned, kid keeps
      //     carrots. Worst case we hand out a free item; never the
      //     "paid but got nothing" outcome.
      const { error: insertError } = await supabase
        .from("shop_purchases")
        .insert({ child_id: child.id, item_id: item.id });

      if (insertError) {
        console.error("[shop] failed to record purchase:", insertError);
        setBuyError("Couldn't complete that purchase — try again in a moment.");
        setBuying(null);
        return;
      }

      const { error: updateError } = await supabase
        .from("children")
        .update({ carrots: newCarrots })
        .eq("id", child.id);

      if (updateError) {
        // Item is theirs, we just couldn't deduct carrots. Don't fail
        // the UX — log so we can see how often this happens and let
        // the kid enjoy the win.
        console.error("[shop] purchase recorded but carrot deduction failed:", updateError);
      } else {
        setChild({ ...child, carrots: newCarrots });
      }

      setPurchases([
        ...purchases,
        {
          id: crypto.randomUUID(),
          child_id: child.id,
          item_id: item.id,
          purchased_at: new Date().toISOString(),
        },
      ]);
      setJustBought(item.id);
      setTimeout(() => setJustBought(null), 1500);
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
    await savedOk("shop:mystery-spend", supabase.from("children").update({ carrots: newCarrots }).eq("id", child.id));
    setChild({ ...child, carrots: newCarrots });

    const reward = rollMysteryBox(ownedIds);

    // Apply reward
    if (reward.type === "carrots" || reward.type === "jackpot") {
      const bonus = reward.amount;
      await savedOk("shop:mystery-bonus", supabase.from("children").update({ carrots: newCarrots + bonus }).eq("id", child.id));
      setChild({ ...child, carrots: newCarrots + bonus });
    } else if (reward.type === "item") {
      await savedOk("shop:mystery-item", supabase.from("shop_purchases").insert({ child_id: child.id, item_id: reward.item.id }));
      setPurchases([...purchases, { id: crypto.randomUUID(), child_id: child.id, item_id: reward.item.id, purchased_at: new Date().toISOString() }]);
    } else if (reward.type === "multiplier") {
      setMysteryBoxMultiplier(reward.multiplier);
    }

    setMysteryReward(reward);
    setBuyingMystery(false);
  }, [child, buyingMystery, ownedIds, purchases, setChild, setPurchases, setMysteryBoxMultiplier]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 pb-16">
      <UnlockToast unlocked={unlocks} onDone={() => setUnlocks([])} />

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
        className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-center text-white shadow-lg mb-6"
      >
        <div className="flex justify-center mb-2"><Carrot className="w-10 h-10 text-white" strokeWidth={1.5} /></div>
        <div className="text-3xl font-extrabold">{child.carrots}</div>
        <div className="text-sm font-medium text-white/80 mt-1">
          {child.first_name}&apos;s Carrots
        </div>
      </motion.div>

      {/* Bunny showcase — hero preview of the kid's currently-selected
          bunny doing the lesson-complete dance. Tapping any outfit card
          below sets the preview without committing; the action buttons
          (Equip / Buy / Locked badge) live in this block. */}
      <BunnyShowcase
        child={child}
        previewOutfitId={previewOutfitId}
        ownedIds={ownedIds}
        onBuy={(item) => handleBuy(item)}
        onEquip={(item) => handleEquip(item)}
        onCantAfford={(item) => setShowGetMore(item)}
        buying={buying}
      />


      {buyError && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
        >
          {buyError}
        </div>
      )}

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
          className="w-36 h-36 -my-6 relative cursor-pointer"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src="/images/shop/mystery-box-closed.png" alt="Mystery Box" className="w-full h-full object-contain" />
          {/* Shine sweep */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute -inset-full animate-[shine_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
          </div>
          {/* Golden sparkles */}
          {[
            { top: "2%", left: "5%", delay: 0, sizeClass: "w-4 h-4" },
            { top: "8%", right: "0%", delay: 0.6, sizeClass: "w-3.5 h-3.5" },
            { bottom: "25%", left: "0%", delay: 1.2, sizeClass: "w-3.5 h-3.5" },
            { top: "-5%", right: "15%", delay: 0.3, sizeClass: "w-5 h-5" },
            { bottom: "15%", right: "2%", delay: 0.9, sizeClass: "w-3 h-3" },
            { top: "20%", left: "-5%", delay: 1.5, sizeClass: "w-3 h-3" },
            { bottom: "5%", left: "20%", delay: 1.8, sizeClass: "w-4 h-4" },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none text-amber-400"
              style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom }}
              animate={{ opacity: [0, 1, 0], scale: [0.3, 1.3, 0.3] }}
              transition={{ duration: 1.8, delay: s.delay, repeat: Infinity, repeatDelay: 0.8 }}
            >
              <Sparkles className={s.sizeClass} fill="currentColor" strokeWidth={0} />
            </motion.div>
          ))}
        </motion.div>

            <div>
              <div className="font-bold text-zinc-900 dark:text-white">Mystery Box</div>
              <div className="text-xs text-zinc-500 dark:text-slate-400">
                Win carrots, items, or multipliers!
              </div>
            </div>
          </div>
          <button
            onClick={child.carrots >= MYSTERY_BOX_PRICE ? handleBuyMysteryBox : () => setShowGetMore({ id: "mystery_box", name: "Mystery Box", icon: "gift", category: "avatars", price: MYSTERY_BOX_PRICE, description: "Mystery Box" })}
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
              <span className="inline-flex items-center gap-1">{MYSTERY_BOX_PRICE} <Carrot className="w-4 h-4" strokeWidth={1.5} /></span>
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
            {(() => { const CI = getShopIcon(cat.icon); return <CI className="w-4 h-4 inline-block" strokeWidth={1.5} />; })()} {cat.label}
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
              previewing={item.id === previewOutfitId}
              onBuy={() => handleBuy(item)}
              onEquip={() => handleEquip(item)}
              onCantAfford={() => setShowGetMore(item)}
              onPreview={
                item.id.startsWith("bunny_") ? () => setPreviewOutfitId(item.id) : undefined
              }
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

/**
 * BunnyShowcase — hero preview at the top of the shop. Renders the
 * currently-selected bunny doing the lesson-complete dance on loop,
 * plus a contextual action (Equip / Buy / locked badge) for whichever
 * outfit the kid is previewing.
 *
 * `previewOutfitId` drives the bunny + label; defaults to the equipped
 * outfit and updates when the kid taps a card in the grid below.
 */
function BunnyShowcase({
  child,
  previewOutfitId,
  ownedIds,
  onBuy,
  onEquip,
  onCantAfford,
  buying,
}: {
  child: Child;
  previewOutfitId: string;
  ownedIds: Set<string>;
  onBuy: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
  onCantAfford: (item: ShopItem) => void;
  buying: string | null;
}) {
  const outfit = getOutfit(previewOutfitId);
  const item = SHOP_ITEMS.find((i) => i.id === previewOutfitId);
  const owned = ownedIds.has(previewOutfitId);
  const equipped = child.equipped_items?.outfit === previewOutfitId;
  const canAfford = item ? child.carrots >= item.price : false;
  const isBuying = buying === previewOutfitId;

  // The action panel branches by unlock type, mirroring ShopItemCard so
  // the showcase stays in lockstep with the grid.
  const action = (() => {
    if (owned && equipped) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-sm">
          <CheckmarkIcon /> Equipped
        </div>
      );
    }
    if (owned) {
      return (
        <button
          onClick={() => item && onEquip(item)}
          className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.97] hover:bg-orange-600"
        >
          Equip {outfit.name}
        </button>
      );
    }
    if (outfit.unlock.type === "milestone") {
      return (
        <div className="rounded-xl border-2 border-dashed border-violet-400 bg-violet-50 px-5 py-3 text-center text-sm font-bold text-violet-700">
          🎯 {outfit.unlock.label}
        </div>
      );
    }
    if (outfit.unlock.type === "seasonal") {
      const active = (new Date().getMonth() + 1) === outfit.unlock.month;
      return (
        <div
          className={`rounded-xl border-2 border-dashed px-5 py-3 text-center text-sm font-bold ${
            active
              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : "border-zinc-300 bg-zinc-50 text-zinc-500"
          }`}
        >
          {active ? `Free this ${monthName(outfit.unlock.month)}!` : `Back next ${monthName(outfit.unlock.month)}`}
        </div>
      );
    }
    // shop (or "free" which should always be owned, but guard anyway)
    if (!item) return null;
    return (
      <button
        onClick={() => (canAfford ? onBuy(item) : onCantAfford(item))}
        disabled={isBuying}
        className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold shadow-sm transition active:scale-[0.97] ${
          canAfford
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
            : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"
        }`}
      >
        {isBuying ? (
          <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : (
          <>
            Get for {item.price}
            <Carrot className="w-4 h-4" strokeWidth={1.5} />
          </>
        )}
      </button>
    );
  })();

  // Subtitle nudges the kid toward the grid below. Every branch ends in
  // "tap an outfit below" so the interaction model is obvious from the
  // hero alone — you don't have to scroll to discover the grid is live.
  const subtitle = (() => {
    if (equipped) return "Your active look · tap an outfit below to try it on";
    if (owned) return "Tap Equip to wear, or pick another outfit below";
    if (outfit.rarity === "rare") return "Rare collectible · keep tapping outfits below";
    return "Tap an outfit below to preview it here";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-3xl border-2 mb-6 px-5 pb-5 pt-4 shadow-sm"
      style={{ background: outfit.tint, borderColor: outfit.border }}
    >
      <div className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
        Your Bunny
      </div>
      <div className="relative mx-auto mt-1 h-44 w-40 sm:h-52 sm:w-48">
        <BunnyReaction outfitId={previewOutfitId} state="levelup" />
      </div>
      <div className="mt-1 text-center">
        <div className="font-display text-2xl font-extrabold tracking-tight text-zinc-900">
          {outfit.name}
        </div>
        <div className="mt-0.5 text-xs text-zinc-600">{subtitle}</div>
      </div>
      <div className="mt-4 flex justify-center">{action}</div>
    </motion.div>
  );
}

function CheckmarkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ShopItemCard({
  item,
  owned,
  equipped,
  canAfford,
  buying,
  justBought,
  previewing,
  onBuy,
  onEquip,
  onCantAfford,
  onPreview,
}: {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  buying: boolean;
  justBought: boolean;
  previewing?: boolean;
  onBuy: () => void;
  onEquip: () => void;
  onCantAfford: () => void;
  /** Bunny outfits only — tap card to show it in the top showcase. */
  onPreview?: () => void;
}) {
  return (
    <motion.div
      layout
      onClick={onPreview}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`rounded-2xl border-2 p-4 flex flex-col items-center text-center cursor-pointer transition-shadow ${
        previewing
          ? "border-violet-400 bg-violet-50 ring-2 ring-violet-300 dark:bg-violet-950/30 dark:border-violet-600 dark:ring-violet-700"
          : owned
          ? equipped
            ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-700"
            : "border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800"
          : canAfford
          ? "border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg"
          : "border-zinc-100 dark:border-slate-800 bg-zinc-50 dark:bg-slate-900 opacity-70 hover:opacity-100"
      }`}
    >
      {/* Icon / Avatar image */}
      <motion.div
        className="mb-2"
        animate={justBought ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {item.id.startsWith("bunny_") ? (
          <div className="relative w-20 h-20">
            <Bunny outfitId={item.id} showRareSparkle={getOutfit(item.id).rarity === "rare"} />
          </div>
        ) : AVATAR_IMAGES[item.id] ? (
          <div className="w-14 h-14 rounded-xl overflow-hidden">
            <img src={AVATAR_IMAGES[item.id]} alt={item.name} className="w-full h-full object-cover" draggable={false} />
          </div>
        ) : (
          (() => { const ItemIcon = getShopIcon(item.icon); return <ItemIcon className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />; })()
        )}
      </motion.div>

      {/* Name */}
      <div className="font-semibold text-sm text-zinc-900 dark:text-white mb-0.5">
        {item.name}
      </div>

      {/* Description */}
      <div className="text-[11px] text-zinc-400 dark:text-slate-500 mb-3 leading-snug">
        {item.description}
      </div>

      {/* Action — branches by unlock method for bunny items, falls back
          to the legacy buy/equip flow for everything else. */}
      {(() => {
        const bunny = item.id.startsWith("bunny_") ? getOutfit(item.id) : null;
        const unlock = bunny?.unlock;

        if (owned) {
          return (
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
          );
        }

        if (unlock?.type === "milestone") {
          return (
            <div className="w-full rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 px-2 py-2 text-center text-[11px] font-bold leading-tight text-violet-700 dark:border-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
              {unlock.label}
            </div>
          );
        }

        if (unlock?.type === "seasonal") {
          const active = isSeasonalActive(bunny!);
          return (
            <div
              className={`w-full rounded-xl border-2 border-dashed px-2 py-2 text-center text-[11px] font-bold leading-tight ${
                active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-zinc-300 bg-zinc-50 text-zinc-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {active ? `Free this ${monthName(unlock.month)}!` : `Back next ${monthName(unlock.month)}`}
            </div>
          );
        }

        return (
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
              <span className="inline-flex items-center gap-1">{item.price} <Carrot className="w-3.5 h-3.5" strokeWidth={1.5} /></span>
            )}
          </button>
        );
      })()}
    </motion.div>
  );
}
