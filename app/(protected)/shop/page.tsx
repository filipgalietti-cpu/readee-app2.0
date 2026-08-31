"use client";

import "./_components/ceremony.css";
import { useEffect, useRef, useState, useCallback, useMemo, Suspense, createElement } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase/client";
import { savedOk } from "@/lib/db/checked-write";
import { Child, ShopPurchase, EquippedItems } from "@/lib/db/types";
import {
  SHOP_CATEGORIES,
  ShopCategory,
  ShopItem,
  getItemsByCategory,
  categoryToSlot,
  getCatchphrase,
  BACKGROUND_IMAGES,
  reactionStateFor,
  REACTION_STATE,
  DEFAULT_REACTION,
} from "@/lib/data/shop-items";
import { MYSTERY_BOX_FREE_COOLDOWN_MS, MYSTERY_BOX_PAID_PRICE, rollMysteryBox, MysteryReward } from "@/lib/data/mystery-box";
import { GetMoreCarrotsModal } from "@/app/_components/GetMoreCarrotsModal";
import { useAudioStore } from "@/lib/stores/audio-store";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { grantPowerupFields } from "@/lib/carrots/active-multiplier";
import { Carrot, Lock, RotateCcw, PartyPopper, Zap } from "lucide-react";
import { getShopIcon } from "@/lib/data/shop-icons";
import { AVATAR_IMAGES } from "@/lib/utils/get-child-avatar";
import { SkeletonPage } from "@/app/_components/Skeleton";
import { Bunny, BunnyReaction, reactionHoldMs, type ReactionState } from "@/app/_components/Bunny/Bunny";
import { getOutfit, type Outfit } from "@/app/_components/Bunny/outfits";
import { UnlockToast } from "@/app/_components/UnlockToast";
import { checkSeasonalGrants } from "@/lib/unlock";
import { MysteryBox3D, type MysteryBox3DHandle } from "./_components/MysteryBox3D";
import { shopSfx } from "@/lib/shop/shop-sfx";

const BALOO = "'Baloo 2', cursive";

/* Rarity table + classifier — ported verbatim from the Claude Design
   DCLogic (RARITY / rarityOf). Drives the whole ceremony: charge colour,
   ray colour, card treatment and the tier word. */
type Rarity = { key: string; label: string; hex: string; glow: string; deep: string };
const RARITY: Record<string, Rarity> = {
  common: { key: "common", label: "Common", hex: "#f97316", glow: "#fb923c", deep: "#7c2d12" },
  rare: { key: "rare", label: "Rare", hex: "#38bdf8", glow: "#7dd3fc", deep: "#0c4a6e" },
  epic: { key: "epic", label: "Epic", hex: "#8b5cf6", glow: "#c4b5fd", deep: "#3b0764" },
  legendary: { key: "legendary", label: "Legendary", hex: "#f59e0b", glow: "#fcd34d", deep: "#78350f" },
  special: { key: "special", label: "Special", hex: "#10b981", glow: "#6ee7b7", deep: "#064e3b" },
};
function rarityOf(reward: MysteryReward | null): Rarity {
  if (!reward) return RARITY.common;
  if (reward.type === "jackpot") return RARITY.legendary;
  if (reward.type === "multiplier") return RARITY.special;
  if (reward.type === "item") {
    const p = reward.item.price;
    if (p >= 1200) return RARITY.legendary;
    if (p >= 600) return RARITY.epic;
    if (p >= 200) return RARITY.rare;
    return RARITY.common;
  }
  return reward.amount >= 60 ? RARITY.rare : RARITY.common;
}

function itemImage(id: string): string | null {
  return AVATAR_IMAGES[id] || BACKGROUND_IMAGES[id] || null;
}

/** Renders a lucide icon by its shop-icon name. Uses createElement so the
 *  (stable) icon component isn't treated as one created during render. */
function ShopIcon({ name, size, strokeWidth = 1.5, style }: { name: string; size: number; strokeWidth?: number; style?: React.CSSProperties }) {
  return createElement(getShopIcon(name), { size, strokeWidth, style });
}

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

  return <ShopContent child={child} setChild={setChild} purchases={purchases} setPurchases={setPurchases} />;
}

type Phase = "idle" | "charging" | "opening" | "reveal";

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
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("outfits");
  const [buying, setBuying] = useState<string | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);
  const [showGetMore, setShowGetMore] = useState<ShopItem | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [unlocks, setUnlocks] = useState<Outfit[]>([]);
  const [previewOutfitId, setPreviewOutfitId] = useState<string>(child.equipped_items?.outfit ?? "bunny_classic");

  // Ceremony state (ported from DCLogic state machine).
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [ceremony, setCeremony] = useState(false);
  const [reward, setReward] = useState<MysteryReward | null>(null);
  const [shake, setShake] = useState(0);
  const [swap, setSwap] = useState<{ from: string; to: string; name: string } | null>(null);


  // Hide the top header while the opening ceremony is on screen so the
  // full-screen reveal isn't clipped by the fixed header band. Reset on
  // ceremony end and on unmount (leaving the shop mid-ceremony).
  const setImmersive = useSidebarStore((s) => s.setImmersive);
  useEffect(() => {
    setImmersive(ceremony);
    return () => setImmersive(false);
  }, [ceremony, setImmersive]);
  const isMuted = useAudioStore((s) => s.isMuted);

  // Refs so the async ceremony + long-lived box callbacks never read stale
  // React state.
  const boxRef = useRef<MysteryBox3DHandle>(null);
  const phaseRef = useRef<Phase>("idle");
  const pendingRef = useRef<MysteryReward | null>(null);
  const afterDeductRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const childRef = useRef(child);
  const purchasesRef = useRef(purchases);
  childRef.current = child;
  purchasesRef.current = purchases;

  const ownedIds = useMemo(() => new Set(purchases.map((p) => p.item_id)), [purchases]);
  const items = getItemsByCategory(activeCategory);
  // Mystery box: free once every 24h (daily engagement loop), then
  // MYSTERY_BOX_PAID_PRICE carrots for extra opens within the window.
  const lastFreeMs = child.last_free_mystery_box_at
    ? new Date(child.last_free_mystery_box_at).getTime()
    : 0;
  const freeReady = Date.now() - lastFreeMs >= MYSTERY_BOX_FREE_COOLDOWN_MS;
  const nextFreeInMs = Math.max(0, lastFreeMs + MYSTERY_BOX_FREE_COOLDOWN_MS - Date.now());
  const PRICE = freeReady ? 0 : MYSTERY_BOX_PAID_PRICE;

  // Re-render every second while the free box is on cooldown so the countdown
  // ticks live and flips to the free open the instant it's ready.
  const [, setNowTick] = useState(0);
  useEffect(() => {
    if (freeReady) return;
    const id = setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [freeReady]);
  const fmtCountdown = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
  };

  useEffect(() => {
    shopSfx.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    document.body.style.overflow = ceremony || swap ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ceremony, swap]);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };
  const after = (ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms) as unknown as number);
  };

  // Run seasonal grants on every shop load (idempotent + cheap).
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const supabase = supabaseBrowser();
      const ids = new Set(purchasesRef.current.map((p) => p.item_id));
      const { newlyGranted } = await checkSeasonalGrants(supabase, child.id, ids);
      if (cancelled || newlyGranted.length === 0) return;
      setPurchases([
        ...purchasesRef.current,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Escape closes a finished reveal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current === "reveal") exitCeremony();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mystery-box ceremony, wired to the REAL economy ────────────────
  // startCeremony deducts the price (savedOk) then charges; commitReward
  // applies whatever rollMysteryBox returned and shows the reveal.

  const applyReward = useCallback(
    async (r: MysteryReward) => {
      const supabase = supabaseBrowser();
      const base = afterDeductRef.current;
      const c = childRef.current;
      if (r.type === "carrots" || r.type === "jackpot") {
        const total = base + r.amount;
        await savedOk("shop:mystery-bonus", supabase.from("children").update({ carrots: total }).eq("id", c.id));
        setChild({ ...childRef.current, carrots: total });
      } else if (r.type === "item") {
        await savedOk("shop:mystery-item", supabase.from("shop_purchases").insert({ child_id: c.id, item_id: r.item.id }));
        setPurchases([
          ...purchasesRef.current,
          { id: crypto.randomUUID(), child_id: c.id, item_id: r.item.id, purchased_at: new Date().toISOString() },
        ]);
      } else if (r.type === "multiplier") {
        // Persist the powerup on the child row so it survives across
        // devices and applies to every carrot surface (practice, stories,
        // lessons), not just this device's practice runner.
        const fields = grantPowerupFields(r.multiplier);
        await savedOk("shop:mystery-mult", supabase.from("children").update(fields).eq("id", c.id));
        setChild({ ...childRef.current, ...fields });
      }
    },
    [setChild, setPurchases],
  );

  const commitReward = useCallback(() => {
    const r = pendingRef.current;
    if (!r || phaseRef.current !== "opening") return;
    pendingRef.current = null;
    applyReward(r);
    setPhase("reveal");
    setReward(r);
    shopSfx.reveal(rarityOf(r).key);
  }, [applyReward]);

  const startCeremony = useCallback(async () => {
    const c = childRef.current;
    if (c.carrots < PRICE) {
      setShake(Date.now());
      return;
    }
    const owned = new Set(purchasesRef.current.map((p) => p.item_id));
    const r = rollMysteryBox(owned, PRICE > 0);
    const rarity = rarityOf(r);
    clearTimers();
    pendingRef.current = r;
    const newCarrots = c.carrots - PRICE;
    afterDeductRef.current = newCarrots;
    setReward(null);
    setCeremony(true);
    setPhase("charging");

    // Deduct the price up front (real economy). If this was the FREE daily
    // open (PRICE 0), stamp the 24h cooldown; a paid re-open leaves the free
    // clock running so tomorrow's box is still free.
    const supabase = supabaseBrowser();
    const openedFreeAt = PRICE === 0 ? new Date().toISOString() : null;
    const patch: { carrots: number; last_free_mystery_box_at?: string } = { carrots: newCarrots };
    if (openedFreeAt) patch.last_free_mystery_box_at = openedFreeAt;
    await savedOk("shop:mystery-spend", supabase.from("children").update(patch).eq("id", c.id));
    setChild({
      ...childRef.current,
      carrots: newCarrots,
      ...(openedFreeAt ? { last_free_mystery_box_at: openedFreeAt } : {}),
    });

    boxRef.current?.charge(rarity.hex);
    shopSfx.charge(1.75);

    // Tension hold → lid goes. The reveal rides the box's pop event; this
    // second timer is the safety net when rAF is throttled.
    after(1750, () => {
      if (phaseRef.current !== "charging") return;
      setPhase("opening");
      boxRef.current?.open();
      after(1400, () => commitReward());
    });
  }, [PRICE, setChild, commitReward]);

  const reopen = useCallback(() => {
    if (childRef.current.carrots < PRICE) {
      exitCeremony();
      return;
    }
    boxRef.current?.close();
    clearTimers();
    setPhase("idle");
    setReward(null);
    after(360, () => startCeremony());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PRICE, startCeremony]);

  const exitCeremony = useCallback(() => {
    shopSfx.stopCharge();
    boxRef.current?.close();
    clearTimers();
    pendingRef.current = null;
    setPhase("idle");
    setCeremony(false);
    setReward(null);
  }, []);

  const handleBoxClick = useCallback(() => {
    const p = phaseRef.current;
    if (p === "charging" || p === "opening") return;
    if (p === "reveal") {
      reopen();
      return;
    }
    if (childRef.current.carrots < PRICE) {
      setShake(Date.now());
      return;
    }
    startCeremony();
  }, [PRICE, reopen, startCeremony]);

  const onBoxPop = useCallback(() => commitReward(), [commitReward]);

  // ── Buy / equip (existing economy, unchanged logic) ────────────────
  const handleBuy = useCallback(
    async (item: ShopItem) => {
      if (childRef.current.carrots < item.price || ownedIds.has(item.id)) return;
      setBuying(item.id);
      setBuyError(null);
      const supabase = supabaseBrowser();
      const c = childRef.current;
      const newCarrots = c.carrots - item.price;

      const { error: insertError } = await supabase.from("shop_purchases").insert({ child_id: c.id, item_id: item.id });
      if (insertError) {
        console.error("[shop] failed to record purchase:", insertError);
        setBuyError("Couldn't complete that purchase - try again in a moment.");
        setBuying(null);
        return;
      }
      const { error: updateError } = await supabase.from("children").update({ carrots: newCarrots }).eq("id", c.id);
      if (updateError) {
        console.error("[shop] purchase recorded but carrot deduction failed:", updateError);
      } else {
        setChild({ ...childRef.current, carrots: newCarrots });
      }
      setPurchases([
        ...purchasesRef.current,
        { id: crypto.randomUUID(), child_id: c.id, item_id: item.id, purchased_at: new Date().toISOString() },
      ]);
      shopSfx.blip();
      setJustBought(item.id);
      setTimeout(() => setJustBought(null), 1500);
      setBuying(null);
    },
    [ownedIds, setChild, setPurchases],
  );

  const handleEquip = useCallback(
    async (item: ShopItem) => {
      const slot = categoryToSlot(item.category);
      const equipped = childRef.current.equipped_items || {};
      const isEquipped = equipped[slot as keyof EquippedItems] === item.id;
      const newEquipped: EquippedItems = { ...equipped, [slot]: isEquipped ? null : item.id };

      // Keep the big preview bunny uniform with what's actually equipped.
      if (item.category === "outfits") setPreviewOutfitId(newEquipped.outfit || "bunny_classic");

      // Equipping a new outfit plays the swap ceremony (old look spins out,
      // new look drops in dancing).
      if (item.category === "outfits" && !isEquipped) {
        shopSfx.swap();
        setSwap({ from: equipped.outfit || "bunny_classic", to: item.id, name: item.name });
      } else {
        shopSfx.blip();
      }

      const supabase = supabaseBrowser();
      const { error } = await supabase.from("children").update({ equipped_items: newEquipped }).eq("id", childRef.current.id);
      if (!error) setChild({ ...childRef.current, equipped_items: newEquipped });
    },
    [setChild],
  );

  // ── Derived reveal values (ported from renderVals) ─────────────────
  const live = rarityOf(reward || pendingRef.current);
  const revealing = ceremony && phase === "reveal";
  const charging = ceremony && phase === "charging";
  const canAfford = child.carrots >= PRICE;

  const primaryLabel =
    phase === "charging"
      ? "Shaking the box…"
      : phase === "opening"
        ? "Opening…"
        : phase === "reveal"
          ? freeReady
            ? "Open free daily box"
            : `Open another · ${PRICE}`
          : freeReady
            ? "Open your free daily box"
            : canAfford
              ? `Open again · ${PRICE} carrots`
              : `Need ${PRICE - child.carrots} more`;
  const primaryEnabled = canAfford && phase !== "opening" && phase !== "charging";
  // Show the live "free box" countdown on the idle button while it's on cooldown.
  const showBoxCountdown =
    !freeReady && phase !== "charging" && phase !== "opening" && phase !== "reveal";
  const boxCountdown = fmtCountdown(nextFreeInMs);

  const rewardNote = !reward
    ? ""
    : reward.type === "multiplier"
      ? "Your next lesson earns twice as many carrots!"
      : reward.type === "item"
        ? reward.item.description
        : reward.type === "jackpot"
          ? "The rarest thing in the whole chest."
          : "Added to your carrots.";
  const revealTitle = !reward ? "" : reward.type === "item" ? reward.item.name : reward.label.replace(/!$/, "");
  // A won wearable can be equipped straight from the reveal (outfits play the
  // swap ceremony via handleEquip). Null for carrots/jackpot/multiplier wins.
  const wonItem = revealing && reward?.type === "item" ? reward.item : null;

  return (
    <div className="fixed inset-x-0 bottom-0 top-[76px] z-10 overflow-y-auto bg-white lg:left-[272px]">
      <UnlockToast unlocked={unlocks} onDone={() => setUnlocks([])} />

      <div className="mx-auto w-full" style={{ maxWidth: 1180, padding: "32px 32px 72px", fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif" }}>
        {/* Title banner + carrot balance */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            padding: "26px 30px",
            marginBottom: 24,
            borderRadius: 28,
            border: "1px solid #fed7aa",
            background: "linear-gradient(110deg,#fff7ed 0%,#ffedd5 46%,#fff 100%)",
            boxShadow: "0 1px 0 #fff inset,0 16px 40px -30px rgba(194,65,12,.6)",
          }}
        >
          <div style={{ position: "absolute", right: -40, top: -70, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,.18),rgba(249,115,22,0) 66%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: BALOO,
                fontSize: 66,
                fontWeight: 800,
                letterSpacing: "-.035em",
                lineHeight: 0.92,
                background: "linear-gradient(178deg,#fb923c 4%,#ea580c 52%,#c2410c 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 3px 0 rgba(154,52,18,.2)) drop-shadow(0 10px 22px rgba(234,88,12,.26))",
              }}
            >
              Carrot Shop
            </h1>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#9a3412" }}>
              Spend the carrots you earned reading. New looks for your bunny.
            </p>
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, padding: "14px 28px 14px 16px", borderRadius: 999, border: "1px solid #fed7aa", background: "#fff", boxShadow: "0 1px 0 #fff inset,0 10px 24px -16px rgba(194,65,12,.55)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 999, background: "linear-gradient(160deg,#fb923c,#ea580c)", boxShadow: "0 4px 10px -4px rgba(234,88,12,.7)" }}>
              <Carrot size={24} strokeWidth={2} style={{ color: "#fff", display: "block" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#c2410c" }}>{child.first_name}&apos;s carrots</div>
              <div style={{ fontFamily: BALOO, fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: "-.01em", color: "#7c2d12" }}>{child.carrots}</div>
            </div>
          </div>
        </div>

        {/* Mystery box + bunny showcase */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
            gap: 0,
            borderRadius: 28,
            overflow: "hidden",
            border: "2px solid #ddd6fe",
            background: "#fff",
            boxShadow: "0 18px 50px -30px rgba(76,29,149,.55)",
            marginBottom: 28,
          }}
        >
          {/* Left — 3D box + CTA */}
          <div style={{ display: "flex", flexDirection: "column", background: "linear-gradient(160deg,#f5f3ff 0%,#eef2ff 55%,#e0e7ff 100%)" }}>
            <div style={{ position: "relative", flex: 1, minHeight: 390 }}>
              {/* The 3D stage. During a pull the wrapper flips to fixed
                  full-screen so the SAME box the kid tapped flies up. */}
              <div
                className={
                  ceremony
                    ? "fixed inset-0 z-[940] lg:left-[272px]"
                    : "absolute inset-0 z-[2]"
                }
              >
                <MysteryBox3D ref={boxRef} onTap={handleBoxClick} onPop={onBoxPop} />
              </div>

              <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 3, opacity: ceremony ? 0 : 1, transition: "opacity .3s ease" }}>
                <div style={{ padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,.86)", backdropFilter: "blur(6px)", fontSize: 12, fontWeight: 800, color: "#4338ca", boxShadow: "0 4px 14px -6px rgba(67,56,202,.6)" }}>
                  {freeReady
                    ? "Tap to open - free daily box!"
                    : `Next free box in ${boxCountdown}`}
                </div>
              </div>
            </div>

            <div style={{ padding: "18px 24px 20px", display: "flex", flexDirection: "column", gap: 12, background: "rgba(255,255,255,.66)", borderTop: "2px solid #e9e5ff" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                <h2 style={{ margin: 0, fontFamily: BALOO, fontSize: 30, fontWeight: 800, letterSpacing: "-.025em", color: "#18181b", lineHeight: 1.1, whiteSpace: "nowrap" }}>Mystery Box</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto", padding: "9px 15px 9px 12px", borderRadius: 999, background: "linear-gradient(135deg,#fb923c,#f59e0b)", boxShadow: "0 8px 20px -10px rgba(249,115,22,1)" }}>
                  <Carrot size={20} strokeWidth={2.2} style={{ color: "#fff", display: "block" }} />
                  <span style={{ fontFamily: BALOO, fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{PRICE}</span>
                </div>
              </div>

              {wonItem && (
                <button
                  onClick={() => {
                    handleEquip(wonItem); // equips + plays the swap ceremony for outfits
                    setCeremony(false);
                    setPhase("idle");
                    setReward(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 9,
                    width: "100%",
                    padding: "16px 20px",
                    borderRadius: 18,
                    border: 0,
                    cursor: "pointer",
                    fontFamily: BALOO,
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: "-.01em",
                    color: "#fff",
                    background: "linear-gradient(135deg,#fb923c,#f97316)",
                    boxShadow: "0 12px 26px -14px rgba(249,115,22,.95)",
                  }}
                >
                  <PartyPopper size={19} strokeWidth={2.2} /> Wear it now
                </button>
              )}

              <button
                onClick={() =>
                  canAfford
                    ? handleBoxClick()
                    : setShowGetMore({ id: "mystery_box", name: "the Mystery Box", icon: "gift", category: "avatars", price: PRICE, description: "Mystery Box" })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  width: "100%",
                  padding: "16px 20px",
                  borderRadius: 18,
                  border: 0,
                  cursor: primaryEnabled || !canAfford ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  fontFamily: BALOO,
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "-.01em",
                  color: primaryEnabled ? "#fff" : "#a1a1aa",
                  background: primaryEnabled ? "linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)" : "#f4f4f5",
                  boxShadow: primaryEnabled ? "0 12px 26px -14px rgba(76,29,149,.95)" : "none",
                  animation: primaryEnabled ? "rdGlowPulse 2.6s ease-in-out infinite" : shake ? "rdShake .5s ease" : "none",
                  transition: "transform .12s ease",
                }}
              >
                {phase === "reveal" ? <RotateCcw size={19} strokeWidth={2.2} /> : canAfford ? <Carrot size={19} strokeWidth={2.2} /> : <Lock size={19} strokeWidth={2.2} />}
                {showBoxCountdown ? (
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15 }}>
                    <span>{primaryLabel}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>Free box in {boxCountdown}</span>
                  </span>
                ) : (
                  primaryLabel
                )}
              </button>
            </div>
          </div>

          {/* Right — "Your bunny" preview */}
          <BunnyPreview previewOutfitId={previewOutfitId} equippedReactionId={child.equipped_items?.reaction ?? null} />
        </section>

        {buyError && (
          <div role="alert" style={{ marginBottom: 20, borderRadius: 16, border: "1px solid #fecdd3", background: "#fff1f2", padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#9f1239" }}>
            {buyError}
          </div>
        )}

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {SHOP_CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 16px",
                  borderRadius: 999,
                  border: 0,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 13.5,
                  fontWeight: 700,
                  background: active ? "#f97316" : "#f4f4f5",
                  color: active ? "#fff" : "#52525b",
                  boxShadow: active ? "0 6px 16px -8px rgba(249,115,22,.9)" : "none",
                }}
              >
                <ShopIcon name={cat.icon} size={16} strokeWidth={2} style={{ display: "block" }} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Item grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(158px,1fr))", gap: 12 }}>
          {items.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              owned={ownedIds.has(item.id) || item.price === 0}
              equipped={
                item.category === "reactions"
                  ? (child.equipped_items?.reaction ?? DEFAULT_REACTION) === item.id
                  : child.equipped_items?.[categoryToSlot(item.category) as keyof EquippedItems] === item.id
              }
              canAfford={child.carrots >= item.price}
              buying={buying === item.id}
              justBought={justBought === item.id}
              previewing={item.id === previewOutfitId}
              onBuy={() => handleBuy(item)}
              onEquip={() => handleEquip(item)}
              onCantAfford={() => setShowGetMore(item)}
              onPreview={
                item.category === "outfits"
                  ? ownedIds.has(item.id)
                    ? () => { if (child.equipped_items?.outfit !== item.id) handleEquip(item); }
                    : () => setPreviewOutfitId(item.id)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* ── Pack-opening ceremony overlays (fixed, viewport-relative) ── */}
      {/* Dark backdrop + rays + flash */}
      <div
        className="fixed inset-0 lg:left-[272px]"
        style={{
          zIndex: 900,
          pointerEvents: ceremony ? "auto" : "none",
          opacity: ceremony ? 1 : 0,
          transition: "opacity .45s ease",
          background: `radial-gradient(circle at 50% 46%, ${live.deep} 0%, #1e1b4b 45%, #09071c 100%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            width: 620,
            height: 620,
            marginLeft: -310,
            marginTop: -310,
            pointerEvents: "none",
            opacity: revealing ? 0.5 : charging ? 0.14 : 0,
            transition: "opacity .8s ease",
            animation: ceremony ? "rdRayspin 26s linear infinite" : "none",
            willChange: "transform",
            background: `repeating-conic-gradient(from 0deg at 50% 50%, ${live.glow}55 0deg 5deg, transparent 5deg 16deg)`,
            maskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
            WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: live.glow, opacity: 0, animation: revealing ? "rdFlash .7s ease-out" : "none" }} />
      </div>

      {/* Ceremony UI: tension label + reveal card + actions */}
      <div
        className="fixed inset-0 lg:left-[272px]"
        style={{
          zIndex: 960,
          display: ceremony ? "flex" : "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 24px 6vh",
          pointerEvents: "none",
          gap: 22,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "7vh",
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: BALOO,
            fontSize: charging ? 17 : 13,
            fontWeight: 800,
            letterSpacing: charging ? ".34em" : ".2em",
            textTransform: "uppercase",
            color: charging ? live.glow : "rgba(255,255,255,.5)",
            animation: charging ? "rdTension 1s ease-in-out infinite" : "none",
            transition: "all .4s ease",
          }}
        >
          {charging ? "Something's coming…" : revealing ? "" : "Opening"}
        </div>

        {revealing && reward && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "26px 34px 30px",
                borderRadius: 28,
                minWidth: 300,
                pointerEvents: "auto",
                background: "linear-gradient(165deg, rgba(255,255,255,.13), rgba(255,255,255,.04))",
                border: `1px solid ${live.glow}66`,
                boxShadow: `0 0 80px -10px ${live.hex}aa, inset 0 1px 0 rgba(255,255,255,.22)`,
                backdropFilter: "blur(14px)",
                animation: "rdCardIn .72s cubic-bezier(.34,1.56,.64,1) both",
              }}
            >
              <div
                style={{
                  padding: "5px 16px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: live.deep,
                  background: `linear-gradient(90deg,${live.glow},${live.hex})`,
                  boxShadow: `0 6px 22px -8px ${live.hex}`,
                }}
              >
                {live.label}
              </div>
              <div style={{ position: "relative", width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center", filter: `drop-shadow(0 12px 26px ${live.hex}88)` }}>
                <RevealArt reward={reward} glow={live.glow} />
              </div>
              <div style={{ fontFamily: BALOO, fontSize: 34, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-.02em", color: "#fff", textAlign: "center", textWrap: "pretty" }}>{revealTitle}</div>
              <div style={{ margin: 0, fontSize: 15, lineHeight: 1.35, fontWeight: 600, color: "rgba(255,255,255,.72)", textAlign: "center", maxWidth: 280, textWrap: "pretty" }}>{rewardNote}</div>
            </div>

            <div style={{ display: "flex", gap: 12, pointerEvents: "auto", animation: "rdRise .5s ease .35s both" }}>
              <button
                onClick={reopen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "15px 26px",
                  borderRadius: 16,
                  border: 0,
                  cursor: child.carrots >= PRICE ? "pointer" : "not-allowed",
                  fontFamily: BALOO,
                  fontSize: 17,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  color: child.carrots >= PRICE ? live.deep : "rgba(255,255,255,.4)",
                  background: child.carrots >= PRICE ? `linear-gradient(135deg,${live.glow},${live.hex})` : "rgba(255,255,255,.08)",
                  boxShadow: child.carrots >= PRICE ? `0 14px 34px -14px ${live.hex}` : "none",
                }}
              >
                <Carrot size={18} strokeWidth={2.2} />
                {freeReady ? "Open free daily box" : child.carrots >= PRICE ? `Open another · ${PRICE}` : "Your free box is back tomorrow!"}
              </button>
              <button
                onClick={exitCeremony}
                style={{ padding: "15px 26px", borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,.24)", background: "rgba(255,255,255,.08)", fontFamily: BALOO, fontSize: 17, fontWeight: 800, color: "#fff" }}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>

      {/* Outfit swap ceremony */}
      {swap && (
        <div
          className="fixed inset-0 lg:left-[272px]"
          style={{
            zIndex: 970,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            background: "radial-gradient(circle at 50% 44%, #4c1d95 0%, #1e1b4b 48%, #09071c 100%)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: ".12em", textTransform: "uppercase", animation: "rdRise .5s ease .3s both" }}>New look</div>
          <div style={{ position: "relative", width: 260, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "3px solid #c4b5fd", pointerEvents: "none", animation: "rdRing .9s ease-out .42s both" }} />
            <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 60%", animation: "rdSwapOut .6s cubic-bezier(.55,0,.65,.2) both" }}>
              <Bunny outfitId={swap.from} />
            </div>
            <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%", animation: "rdSwapIn .85s cubic-bezier(.34,1.56,.64,1) .5s both" }}>
              <BunnyReaction outfitId={swap.to} state="levelup" />
            </div>
          </div>
          <div style={{ fontFamily: BALOO, fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: "-.02em", textAlign: "center", animation: "rdRise .5s ease .95s both" }}>{swap.name}</div>
          <button
            onClick={() => setSwap(null)}
            style={{ padding: "14px 30px", borderRadius: 16, border: 0, cursor: "pointer", fontFamily: BALOO, fontSize: 17, fontWeight: 800, color: "#3b0764", background: "linear-gradient(135deg,#ddd6fe,#a78bfa)", boxShadow: "0 14px 34px -14px #8b5cf6", animation: "rdRise .5s ease 1.05s both" }}
          >
            {getCatchphrase(swap.to)}
          </button>
        </div>
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

/** The reward art inside the reveal card. Bunny outfits dance; avatars +
 *  backgrounds show their real PNG; everything else shows its icon. */
function RevealArt({ reward, glow }: { reward: MysteryReward; glow: string }) {
  if (reward.type === "item") {
    const it = reward.item;
    if (it.id.startsWith("bunny_")) {
      return (
        <div style={{ position: "relative", width: 148, height: 160 }}>
          <BunnyReaction outfitId={it.id} state="levelup" />
        </div>
      );
    }
    const img = itemImage(it.id);
    if (img) {
      return (
        <div style={{ position: "relative", width: 118, height: 118, borderRadius: 24, overflow: "hidden" }}>
          <ShopImage src={img} alt={it.name} sizes="118px" />
        </div>
      );
    }
    return <ShopIcon name={it.icon} size={88} strokeWidth={1.4} style={{ color: glow, display: "block" }} />;
  }
  if (reward.type === "jackpot") return <PartyPopper size={88} strokeWidth={1.4} style={{ color: glow, display: "block" }} />;
  if (reward.type === "multiplier") return <Zap size={88} strokeWidth={1.4} style={{ color: glow, display: "block" }} />;
  return <Carrot size={88} strokeWidth={1.4} style={{ color: glow, display: "block" }} />;
}

/** Right column of the hero: the currently-previewed bunny on a lit stage.
 *  Tapping Readee plays the child's equipped reaction. */
function BunnyPreview({
  previewOutfitId,
  equippedReactionId,
}: {
  previewOutfitId: string;
  equippedReactionId?: string | null;
}) {
  const outfit = getOutfit(previewOutfitId);
  const [rx, setRx] = useState<"" | ReactionState>("");
  const rxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (rxTimer.current) clearTimeout(rxTimer.current);
    },
    [],
  );
  const tapReadee = () => {
    if (rx) return;
    const state = reactionStateFor(equippedReactionId);
    setRx(state);
    if (rxTimer.current) clearTimeout(rxTimer.current);
    // Dismiss at the reaction's rest pose so the swap to idle is seamless.
    rxTimer.current = setTimeout(() => setRx(""), reactionHoldMs(state));
  };
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        padding: "28px 28px 30px",
        background: "radial-gradient(120% 80% at 50% 0%,#fffdf5 0%,#f7f3ff 42%,#ece7fe 100%)",
        borderLeft: "2px solid #ede9fe",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -40, left: "50%", width: 340, height: 420, marginLeft: -170, pointerEvents: "none", background: "conic-gradient(from 170deg at 50% 0%,rgba(255,255,255,0) 0deg,rgba(255,246,214,.9) 8deg,rgba(255,246,214,0) 22deg)", filter: "blur(8px)", animation: "rdSpotSweep 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: -40, left: "50%", width: 340, height: 420, marginLeft: -170, pointerEvents: "none", background: "conic-gradient(from 168deg at 50% 0%,rgba(255,255,255,0) 0deg,rgba(221,214,254,.85) 26deg,rgba(221,214,254,0) 48deg)", filter: "blur(14px)" }} />

      <div style={{ position: "relative", zIndex: 2, fontFamily: BALOO, fontSize: 19, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "#7c3aed" }}>Your bunny</div>

      <div style={{ position: "relative", zIndex: 2, width: 280, height: 290, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ position: "absolute", bottom: 6, left: "50%", width: 210, height: 56, marginLeft: -105, borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%,rgba(124,58,237,.28) 0%,rgba(124,58,237,0) 70%)" }} />
        <div style={{ position: "absolute", bottom: 26, left: "50%", width: 190, height: 22, marginLeft: -95, borderRadius: "50%", background: "linear-gradient(180deg,#c4b5fd,#8b5cf6)" }} />
        <button
          type="button"
          onClick={tapReadee}
          aria-label="Tap Readee"
          style={{ position: "relative", width: 224, height: 244, marginBottom: 14, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
        >
          {rx ? (
            <BunnyReaction outfitId={previewOutfitId} state={rx} />
          ) : (
            <Bunny outfitId={previewOutfitId} showRareSparkle={outfit.rarity === "rare"} />
          )}
        </button>
      </div>
      <div style={{ position: "relative", zIndex: 2, fontFamily: BALOO, fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", color: "#18181b", lineHeight: 1.1, textAlign: "center" }}>{outfit.name}</div>
    </div>
  );
}

/** Image with a pulse skeleton until it loads, then a quick fade-in. Keeps the
 *  avatar/background grid from looking laggy while many PNGs decode at once. */
function ShopImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="animate-pulse" style={{ position: "absolute", inset: 0, background: "#e4e4e7" }} />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        style={{ objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity .2s ease" }}
        draggable={false}
        onLoad={() => setLoaded(true)}
      />
    </>
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
  onPreview?: () => void;
}) {
  const border = equipped ? "#fdba74" : previewing ? "#a78bfa" : owned ? "#bbf7d0" : canAfford ? "#e4e4e7" : "#f4f4f5";
  const bg = equipped ? "#fff7ed" : previewing ? "#f5f3ff" : owned ? "#f0fdf4" : canAfford ? "#fff" : "#fafafa";
  const img = itemImage(item.id);
  const isBunny = item.id.startsWith("bunny_");

  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 10px",
    borderRadius: 12,
    border: 0,
    cursor: "pointer",
    fontFamily: "'Nunito', sans-serif",
    fontSize: 12.5,
    fontWeight: 800,
    color: equipped ? "#fff" : owned ? "#52525b" : canAfford ? "#fff" : "#a1a1aa",
    background: equipped ? "#f97316" : owned ? "#f4f4f5" : canAfford ? "linear-gradient(90deg,#f97316,#f59e0b)" : "#e4e4e7",
  };

  return (
    <div
      onClick={onPreview}
      style={{
        borderRadius: 18,
        border: `2px solid ${border}`,
        background: bg,
        padding: "14px 12px 12px",
        display: "flex",
        flexDirection: "column",
        cursor: onPreview ? "pointer" : "default",
        boxShadow: previewing ? "0 0 0 3px rgba(167,139,250,.35)" : "none",
        opacity: !owned && !canAfford ? 0.72 : 1,
        transition: "all .18s ease",
      }}
    >
      <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, transform: justBought ? "scale(1.12)" : "none", transition: "transform .3s ease" }}>
        {isBunny ? (
          <div style={{ position: "relative", width: 78, height: 84 }}>
            <Bunny outfitId={item.id} showRareSparkle={getOutfit(item.id).rarity === "rare"} />
          </div>
        ) : item.category === "reactions" ? (
          <div style={{ position: "relative", width: 78, height: 84 }}>
            <BunnyReaction outfitId="bunny_classic" state={REACTION_STATE[item.id] ?? "wave"} />
          </div>
        ) : img ? (
          <div style={{ position: "relative", width: 56, height: 56, borderRadius: 12, overflow: "hidden" }}>
            <ShopImage src={img} alt={item.name} sizes="56px" />
          </div>
        ) : (
          <ShopIcon name={item.icon} size={40} strokeWidth={1.5} style={{ color: "#6366f1" }} />
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", textAlign: "center" }}>{item.name}</div>
      <div style={{ fontSize: 11, lineHeight: 1.35, color: "#a1a1aa", textAlign: "center", margin: "2px 0 10px", minHeight: 30 }}>{item.description}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (owned) onEquip();
          else if (canAfford) onBuy();
          else onCantAfford();
        }}
        disabled={buying}
        style={btnStyle}
      >
        {buying ? (
          <span className="animate-spin" style={{ display: "inline-block", height: 14, width: 14, borderRadius: 999, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff" }} />
        ) : owned ? (
          equipped ? "Equipped" : "Equip"
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            {item.price}
            <Carrot size={14} strokeWidth={2} style={{ display: "block" }} />
          </span>
        )}
      </button>
    </div>
  );
}
