"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import type { ShopPurchase, EquippedItems } from "@/lib/db/types";
import { GRADES } from "@/app/_components/LevelProgressBar";
import { safeValidate } from "@/lib/validate";
import CelebrationOverlay from "@/app/_components/CelebrationOverlay";
import { ChildCreateSchema, ChildUpdateSchema } from "@/lib/schemas";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import {
  Carrot, Check, Download, Pencil, Mail, Flame, ShieldCheck,
  Sparkles, Plus, LogOut,
} from "lucide-react";
import { usePlanStore } from "@/lib/stores/plan-store";
import { useChildStore } from "@/lib/stores/child-store";
import { SkeletonPage } from "@/app/_components/Skeleton";
import {
  exportUserDataAction,
  deleteAccountAction,
} from "@/app/(protected)/account/account-data-actions";

function displayGrade(grade: string): string {
  if (grade.toLowerCase() === "pre-k") return "Kindergarten";
  return grade;
}

// --- Data export as CSV (parent-readable, opens in Excel/Sheets). One
// labeled section per table so it stays a complete "download your data".
function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function tableToCsv(rows: unknown[]): string {
  const objs = rows.filter((r): r is Record<string, unknown> => !!r && typeof r === "object");
  if (!objs.length) return "(no records)\n";
  const cols = Array.from(new Set(objs.flatMap((r) => Object.keys(r))));
  const lines = [cols.map(csvCell).join(",")];
  for (const r of objs) lines.push(cols.map((c) => csvCell(r[c])).join(","));
  return lines.join("\n") + "\n";
}
function payloadToCsv(p: {
  exportedAt: string;
  parent: { email: string | null; tables: Record<string, unknown[]> };
  children: Array<{ id: string; first_name: string | null; tables: Record<string, unknown[]> }>;
}): string {
  const out: string[] = ["Readee data export", `Exported at,${csvCell(p.exportedAt)}`, `Account email,${csvCell(p.parent.email)}`, ""];
  for (const [table, rows] of Object.entries(p.parent.tables)) out.push(`# Account: ${table}`, tableToCsv(rows), "");
  for (const child of p.children) {
    out.push(`# Reader: ${child.first_name ?? child.id}`, "");
    for (const [table, rows] of Object.entries(child.tables)) out.push(`## ${child.first_name ?? "Reader"}: ${table}`, tableToCsv(rows), "");
  }
  return out.join("\n");
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const CARD = "1px solid #e4e4e7";

export default function Settings() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [provider, setProvider] = useState<"google" | "email">("email");

  // "Saved" toast pill
  const [savedMsg, setSavedMsg] = useState("");
  const flashTimer = useRef<number | undefined>(undefined);
  function flash(msg = "Saved") {
    setSavedMsg(msg);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setSavedMsg(""), 2400);
  }

  // Password change (email accounts)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new_: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Add reader
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", grade: "Kindergarten" });
  const [addingChild, setAddingChild] = useState(false);

  // Reader "Manage" expansion + editing
  const [expandedReaderId, setExpandedReaderId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ first_name: "", grade: "" });

  // Modals
  const [resetChildId, setResetChildId] = useState<string | null>(null);
  const [removeChildId, setRemoveChildId] = useState<string | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [levelChangeChild, setLevelChangeChild] = useState<{ id: string; name: string; newLevel: string } | null>(null);
  // After a grade change, recommend (not force) a placement retake.
  const [gradeRec, setGradeRec] = useState<{ id: string; name: string } | null>(null);

  // Plan
  const userPlan = usePlanStore((s) => s.rawPlan) ?? "free";
  // Effective plan (trial -> premium) for the reader-count gate. rawPlan above
  // stays for billing UI (a trial user isn't actually subscribed).
  const planEff = usePlanStore((s) => s.plan) ?? "free";
  const fetchPlan = usePlanStore((s) => s.fetch);
  const setStorePlan = usePlanStore((s) => s.setPlan);
  const [billingBusy, setBillingBusy] = useState(false);

  // Promo code
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{ success: boolean; message: string } | null>(null);

  // Dev reset
  const [resettingPremium, setResettingPremium] = useState(false);

  // Background picker data
  const [purchases, setPurchases] = useState<Record<string, ShopPurchase[]>>({});

  // Preferences (local)
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [activeTab, setActiveTab] = useState("sec-profile");

  // Notifications (real: profiles.email_weekly_digest)
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("readee_prefs");
    if (stored) {
      const prefs = JSON.parse(stored);
      setSoundEffects(prefs.soundEffects ?? true);
      setAutoAdvance(prefs.autoAdvance ?? true);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("readee_prefs");
      const prefs = stored ? JSON.parse(stored) : {};
      prefs.soundEffects = soundEffects;
      prefs.autoAdvance = autoAdvance;
      localStorage.setItem("readee_prefs", JSON.stringify(prefs));
    } catch {}
  }, [soundEffects, autoAdvance]);

  // Scroll-spy: highlight the tab for whichever section is currently in view.
  useEffect(() => {
    const ids = ["sec-profile", "sec-readers", "sec-billing", "sec-notif", "sec-privacy"];
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActiveTab(vis[0].target.id);
      },
      { rootMargin: "-72px 0px -55% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [children]);

  // The skeleton renders first, then swaps to the (taller) real content, which
  // can leave the viewport scrolled down. Snap back to the top once loaded.
  useEffect(() => {
    if (!loading) window.scrollTo({ top: 0 });
  }, [loading]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setEmail(user.email || "");
      setUserId(user.id);
      const prov = (user.app_metadata?.provider ?? user.identities?.[0]?.provider ?? "email") as string;
      setProvider(prov === "google" ? "google" : "email");

      fetchPlan();

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, created_at, email_weekly_digest")
        .eq("id", user.id)
        .maybeSingle();
      const p = profile as { display_name?: string | null; created_at?: string | null; email_weekly_digest?: boolean | null } | null;
      setDisplayName(p?.display_name || (user.email ? user.email.split("@")[0] : "You"));
      setWeeklyDigest(p?.email_weekly_digest ?? true);
      if (p?.created_at) {
        setMemberSince(new Date(p.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }));
      }

      await loadChildren(user.id);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadChildren(parentId: string) {
    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true });
    if (data) {
      const fresh = data as Child[];
      setChildren(fresh);

      // Keep the global child store in sync so sibling surfaces (sidebar,
      // dashboard overlay) reflect add/edit/delete/level-change immediately.
      const store = useChildStore.getState();
      store.setChildren(fresh);
      const selected = store.childData;
      if (selected) {
        const updated = fresh.find((c) => c.id === selected.id);
        if (!updated) {
          store.setChildData(fresh[0] ?? null);
          store.setCurrentChild(fresh[0]?.id ?? null);
        } else if (updated !== selected) {
          store.setChildData(updated);
        }
      } else if (fresh.length === 1) {
        store.setChildData(fresh[0]);
        store.setCurrentChild(fresh[0].id);
      }

      const childIds = fresh.map((c) => c.id);
      if (childIds.length > 0) {
        const { data: allPurchases } = await supabase
          .from("shop_purchases")
          .select("*")
          .in("child_id", childIds);
        if (allPurchases) {
          const grouped: Record<string, ShopPurchase[]> = {};
          for (const p of allPurchases as ShopPurchase[]) {
            (grouped[p.child_id] ??= []).push(p);
          }
          setPurchases(grouped);
        }
      }
    }
  }

  // === Profile name ===
  async function saveName() {
    const v = nameDraft.trim();
    if (!v) return;
    const { error } = await supabase.from("profiles").update({ display_name: v }).eq("id", userId);
    if (error) { flash("Couldn't save name"); return; }
    setDisplayName(v);
    setEditingName(false);
    // Refresh plan store so the sidebar greeting picks up the new name.
    usePlanStore.getState().refresh?.();
    flash("Name updated");
  }

  // === Notifications ===
  async function toggleWeeklyDigest() {
    const next = !weeklyDigest;
    setWeeklyDigest(next);
    const { error } = await supabase.from("profiles").update({ email_weekly_digest: next }).eq("id", userId);
    if (error) { setWeeklyDigest(!next); flash("Couldn't save"); return; }
    flash(next ? "Weekly report on" : "Weekly report off");
  }

  // === Password ===
  async function handlePasswordChange() {
    setPasswordMsg(null);
    if (passwords.new_ !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwords.new_.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new_ });
    setSavingPassword(false);
    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
    } else {
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setPasswords({ current: "", new_: "", confirm: "" });
      setTimeout(() => { setShowPasswordForm(false); setPasswordMsg(null); }, 2000);
    }
  }

  // === Add Child ===
  async function handleAddChild() {
    if (!newChild.name.trim()) return;
    // Readers: 1 free, up to 2 with full access. Free hits the upsell; a
    // full-access parent at the cap gets a plain "max 2" note.
    if (children.length >= maxReaders) {
      if (maxReaders === 1) router.push("/upgrade?reason=multi_reader");
      else flash("You can have up to 2 readers on Readee+.");
      return;
    }
    setAddingChild(true);
    const childData = safeValidate(ChildCreateSchema, {
      parent_id: userId,
      first_name: newChild.name.trim(),
      grade: newChild.grade,
    });
    await supabase.from("children").insert(childData);
    await loadChildren(userId);
    setNewChild({ name: "", grade: "Kindergarten" });
    setShowAddChild(false);
    setAddingChild(false);
    flash("Reader added");
  }

  // === Manage / Edit Child ===
  function toggleManage(child: Child) {
    if (expandedReaderId === child.id) { setExpandedReaderId(null); return; }
    setExpandedReaderId(child.id);
    setEditValues({ first_name: child.first_name, grade: child.grade || "Kindergarten" });
  }

  async function saveEdit(childId: string) {
    const original = children.find((c) => c.id === childId);
    const gradeChanged = !!original && (original.grade || "Kindergarten") !== editValues.grade;
    const updateData = safeValidate(ChildUpdateSchema, {
      first_name: editValues.first_name.trim(),
      grade: editValues.grade,
    });
    await supabase.from("children").update(updateData).eq("id", childId);
    await loadChildren(userId);
    flash("Reader updated");
    // Grade is just what school year they're in; reading level is what they can
    // actually read. Recommend (not force) a placement retake so lessons match.
    if (gradeChanged) setGradeRec({ id: childId, name: editValues.first_name.trim() || original!.first_name });
  }

  function requestLevelChange(childId: string, childName: string, newLevel: string) {
    const child = children.find((c) => c.id === childId);
    if (child?.reading_level === newLevel) return;
    setLevelChangeChild({ id: childId, name: childName, newLevel });
  }

  async function confirmLevelChange() {
    if (!levelChangeChild) return;
    await supabase.from("children").update({ reading_level: levelChangeChild.newLevel }).eq("id", levelChangeChild.id);
    setLevelChangeChild(null);
    await loadChildren(userId);
    flash("Reading level updated");
  }

  async function handleResetProgress(childId: string) {
    await supabase.from("assessments").delete().eq("child_id", childId);
    await supabase.from("lessons_progress").delete().eq("child_id", childId);
    await supabase.from("children").update({
      carrots: 0,
      stories_read: 0,
      streak_days: 0,
      reading_level: null,
    }).eq("id", childId);
    setResetChildId(null);
    await loadChildren(userId);
    flash("Progress reset");
  }

  async function handleRemoveChild(childId: string) {
    await supabase.from("children").delete().eq("id", childId);
    setRemoveChildId(null);
    setExpandedReaderId(null);
    await loadChildren(userId);
    flash("Reader removed");
  }


  // === Auth / devices ===
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleSignOutEverywhere() {
    if (!confirm("Sign out of every device + browser where you're signed in? You'll need to log back in here too.")) return;
    try {
      await fetch("/api/auth/sign-out-everywhere", { method: "POST" });
    } catch { /* best-effort */ }
    await supabase.auth.signOut();
    router.push("/login?message=" + encodeURIComponent("Signed out of all devices."));
  }

  // === Billing ===
  async function openBillingPortal() {
    setBillingBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      flash(data.error === "No billing account found" ? "No billing account yet" : "Couldn't open billing");
    } catch {
      flash("Couldn't open billing");
    }
    setBillingBusy(false);
  }

  async function handleExportData() {
    setExportBusy(true);
    setExportError(null);
    try {
      const res = await exportUserDataAction();
      if (!res.ok) { setExportError(res.error); return; }
      const blob = new Blob([payloadToCsv(res.payload)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `readee-export-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      flash("Export downloaded");
    } catch (e) {
      setExportError((e as Error)?.message ?? "Couldn't build your export.");
    } finally {
      setExportBusy(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deleteConfirmEmail.trim()) { setDeleteError("Type your account email to confirm."); return; }
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      const res = await deleteAccountAction({ confirmEmail: deleteConfirmEmail });
      if (!res.ok) { setDeleteError(res.error); setDeleteBusy(false); return; }
      router.push("/?message=" + encodeURIComponent("Your account and all data have been deleted. We're sorry to see you go."));
    } catch (e) {
      setDeleteError((e as Error)?.message ?? "Couldn't delete your account.");
      setDeleteBusy(false);
    }
  }

  async function handleRedeemPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      setPromoResult({ success: data.success, message: data.message });
      if (data.success) {
        setStorePlan("premium");
        await usePlanStore.getState().refresh();
      }
    } catch {
      setPromoResult({ success: false, message: "Something went wrong. Please try again." });
    }
    setPromoLoading(false);
  }

  async function handleResetPremium() {
    setResettingPremium(true);
    try {
      await fetch("/api/admin/reset-premium", { method: "POST" });
      setStorePlan("free");
      await usePlanStore.getState().refresh();
      setPromoCode("");
      setPromoResult(null);
      setShowPromo(false);
    } catch { /* ignore */ }
    setResettingPremium(false);
  }

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  if (loading) return <SkeletonPage cards={3} />;

  const childForReset = children.find((c) => c.id === resetChildId);
  const childForRemove = children.find((c) => c.id === removeChildId);
  const isPremium = userPlan === "premium";
  // Readers: 1 on free, up to 2 with full access (trial or paid).
  const readerFull = planEff === "premium";
  const maxReaders = readerFull ? 2 : 1;

  const tabs: Array<[string, string]> = [
    ["sec-profile", "Profile"],
    ["sec-readers", "My readers"],
    ["sec-billing", "Plan & billing"],
    ["sec-notif", "Notifications"],
    ["sec-privacy", "Privacy & data"],
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", color: "#3f3f46", fontFamily: "var(--font-body)" }}>
      {/* Header + saved pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <h1 style={{ flex: 1, margin: 0, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", color: "#18181b", lineHeight: 1.2 }}>Settings</h1>
        {savedMsg && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#d1fae5", color: "#059669", fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>
            <Check className="w-[13px] h-[13px]" strokeWidth={3} /> {savedMsg}
          </span>
        )}
      </div>

      {/* Sticky tab nav (scroll-jumps to sections) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 24, position: "sticky", top: 0, background: "#fff", zIndex: 30, borderBottom: "1px solid #e4e4e7" }}>
        {tabs.map(([id, label]) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => scrollToId(id)}
              style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: active ? 700 : 600, color: active ? "#4338ca" : "#71717a", padding: "12px 14px", whiteSpace: "nowrap", borderBottom: active ? "2px solid #4338ca" : "2px solid transparent", marginBottom: -1, transition: "color .15s ease" }}>
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ═══ Profile ═══ */}
        <div id="sec-profile" style={{ scrollMarginTop: 72, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "stretch" }}>
          <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", marginBottom: 16 }}>Profile</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#4338ca,#8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, flexShrink: 0 }}>
                {initialsOf(displayName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus
                      style={{ flex: 1, minWidth: 0, fontFamily: "inherit", fontSize: 15, fontWeight: 600, padding: "8px 12px", border: CARD, borderRadius: 12, outline: "none", color: "#18181b" }} />
                    <button onClick={saveName} style={{ border: "none", background: "#18181b", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 12, cursor: "pointer" }}>Save</button>
                    <button onClick={() => setEditingName(false)} style={{ border: "none", background: "transparent", color: "#71717a", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 10px", borderRadius: 12, cursor: "pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "#18181b", lineHeight: 1.2 }}>{displayName}</div>
                    <button onClick={() => { setNameDraft(displayName); setEditingName(true); }} title="Edit name"
                      style={{ border: "none", background: "transparent", color: "#71717a", cursor: "pointer", padding: 4, borderRadius: 8, display: "flex" }}>
                      <Pencil className="w-[15px] h-[15px]" strokeWidth={2} />
                    </button>
                  </div>
                )}
                <div style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>{email}</div>
              </div>
            </div>
            <Row label="Sound effects" sub="Sounds during lessons and quizzes">
              <Switch on={soundEffects} onClick={() => setSoundEffects((v) => !v)} />
            </Row>
            <Row label="Auto-advance" sub="Move to the next question automatically" last>
              <Switch on={autoAdvance} onClick={() => setAutoAdvance((v) => !v)} />
            </Row>
          </div>

          {/* Sign-in & security */}
          <div style={{ border: CARD, borderRadius: 20, padding: 20, background: "#fff" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b", marginBottom: 14 }}>Sign-in &amp; security</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 13 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", border: CARD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {provider === "google" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                ) : (
                  <Mail className="w-[17px] h-[17px]" style={{ color: "#4338ca" }} strokeWidth={1.5} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#18181b" }}>{provider === "google" ? "Google" : "Email & password"}</div>
                <div style={{ fontSize: 11.5, color: "#6b7280" }}>{provider === "google" ? "Connected" : email}</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
            </div>

            {provider === "email" && (
              <div style={{ padding: "13px 0", borderTop: "1px solid #f4f4f5" }}>
                {!showPasswordForm ? (
                  <button onClick={() => setShowPasswordForm(true)} style={{ border: "none", background: "transparent", color: "#4338ca", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>Change password</button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <PwInput placeholder="New password" value={passwords.new_} onChange={(v) => setPasswords((p) => ({ ...p, new_: v }))} />
                    <PwInput placeholder="Confirm new password" value={passwords.confirm} onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))} />
                    {passwordMsg && <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: passwordMsg.type === "error" ? "#dc2626" : "#059669" }}>{passwordMsg.text}</p>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handlePasswordChange} disabled={savingPassword} style={{ border: "none", background: "#18181b", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 12, cursor: "pointer", opacity: savingPassword ? 0.6 : 1 }}>{savingPassword ? "Saving…" : "Save"}</button>
                      <button onClick={() => { setShowPasswordForm(false); setPasswordMsg(null); }} style={{ border: "none", background: "transparent", color: "#71717a", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 10px", borderRadius: 12, cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 0", borderTop: "1px solid #f4f4f5" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#18181b" }}>Signed-in devices</div>
                <div style={{ fontSize: 11.5, color: "#6b7280" }}>Sign out everywhere you&apos;re logged in</div>
              </div>
              <button onClick={handleSignOutEverywhere} style={{ border: "none", background: "transparent", color: "#4338ca", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "4px 8px", borderRadius: 8, whiteSpace: "nowrap" }}>Sign out all</button>
            </div>
            {memberSince && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 0 0", borderTop: "1px solid #f4f4f5" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#18181b" }}>Member since</div>
                  <div style={{ fontSize: 11.5, color: "#6b7280" }}>Thanks for reading with us</div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#3f3f46" }}>{memberSince}</div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ My readers ═══ */}
        <div id="sec-readers" style={{ scrollMarginTop: 72 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b" }}>My readers</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{isPremium ? "All readers included with Readee+" : `${children.length} reader${children.length === 1 ? "" : "s"}`}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16, alignItems: "stretch" }}>
            {children.map((child, i) => {
              const expanded = expandedReaderId === child.id;
              return (
                <div key={child.id} style={{ border: CARD, borderRadius: 20, padding: 18, background: "#fff", gridColumn: expanded ? "1 / -1" : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getChildAvatarImage(child, i)} alt={child.first_name} width={48} height={48} style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover", flexShrink: 0, background: "#eef2ff" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "#18181b", lineHeight: 1.2 }}>{child.first_name}</div>
                      <div style={{ fontSize: 12, color: "#71717a" }}>
                        {child.grade ? displayGrade(child.grade) : "No grade"}{child.reading_level ? ` · ${child.reading_level}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                    {child.streak_days > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff7ed", color: "#c2410c", fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>
                        <Flame className="w-3 h-3" strokeWidth={2} /> {child.streak_days}-day streak
                      </span>
                    )}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff7ed", color: "#c2410c", fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>
                      <Carrot className="w-3 h-3" strokeWidth={2} /> {child.carrots}
                    </span>
                    {!child.reading_level && (
                      <span style={{ background: "#eef2ff", color: "#4338ca", fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>Needs placement</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", borderTop: "1px solid #f4f4f5", paddingTop: 12 }}>
                    <button onClick={() => toggleManage(child)} style={{ border: "none", background: "transparent", color: "#4338ca", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "6px 8px", borderRadius: 8, cursor: "pointer" }}>
                      {expanded ? "Close" : "Manage →"}
                    </button>
                  </div>

                  {expanded && (
                    <div style={{ borderTop: "1px solid #f4f4f5", marginTop: 8, paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Name">
                          <input value={editValues.first_name} onChange={(e) => setEditValues((p) => ({ ...p, first_name: e.target.value }))}
                            style={inputStyle} />
                        </Field>
                        <Field label="Grade">
                          <select value={editValues.grade} onChange={(e) => setEditValues((p) => ({ ...p, grade: e.target.value }))} style={inputStyle}>
                            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Reading level" hint="Set by the placement quiz, the surest way to match lessons to their level.">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ ...inputStyle, flex: 1, display: "flex", alignItems: "center", color: child.reading_level ? "#18181b" : "#6b7280", background: "#fafafa" }}>
                            {child.reading_level || "Not assessed yet"}
                          </div>
                          <button onClick={() => router.push(`/assessment?child=${child.id}`)}
                            style={{ border: "1px solid #c7d2fe", background: "#eef2ff", color: "#4338ca", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, padding: "9px 14px", borderRadius: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                            {child.reading_level ? "Retake quiz" : "Take quiz"}
                          </button>
                        </div>
                      </Field>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 2 }}>
                        <button onClick={() => saveEdit(child.id)} style={{ border: "none", background: "#18181b", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 12, cursor: "pointer" }}>Save changes</button>
                        <div style={{ flex: 1 }} />
                        <button onClick={() => setResetChildId(child.id)} style={{ border: "none", background: "transparent", color: "#b45309", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Reset progress</button>
                        <button onClick={() => setRemoveChildId(child.id)} style={{ border: "none", background: "transparent", color: "#dc2626", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add a reader */}
            {!showAddChild ? (
              <button onClick={() => { if (children.length >= maxReaders) { if (maxReaders === 1) router.push("/upgrade?reason=multi_reader"); else flash("You can have up to 2 readers on Readee+."); } else { setShowAddChild(true); } }}
                style={{ border: "1.5px dashed #d4d4d8", borderRadius: 20, background: "#fafafa", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", minHeight: 150 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {!readerFull && children.length >= 1 ? <Sparkles className="w-5 h-5" style={{ color: "#4338ca" }} strokeWidth={2} /> : <Plus className="w-5 h-5" style={{ color: "#4338ca" }} strokeWidth={2} />}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#3f3f46" }}>Add a reader</span>
                <span style={{ fontSize: 11.5, color: "#6b7280" }}>{!readerFull && children.length >= 1 ? "Add more readers with Readee+" : "Included with Readee+"}</span>
              </button>
            ) : (
              <div style={{ border: "1px solid #c7d2fe", borderRadius: 20, background: "#eef2ff", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <Field label="Name">
                  <input value={newChild.name} onChange={(e) => setNewChild((p) => ({ ...p, name: e.target.value }))} placeholder="Child's first name" style={inputStyle} autoFocus />
                </Field>
                <Field label="Grade">
                  <select value={newChild.grade} onChange={(e) => setNewChild((p) => ({ ...p, grade: e.target.value }))} style={inputStyle}>
                    {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleAddChild} disabled={addingChild || !newChild.name.trim()} style={{ border: "none", background: "#4338ca", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 999, cursor: "pointer", opacity: addingChild || !newChild.name.trim() ? 0.6 : 1 }}>{addingChild ? "Adding…" : "Add reader"}</button>
                  <button onClick={() => setShowAddChild(false)} style={{ border: "none", background: "transparent", color: "#52525b", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "9px 12px", borderRadius: 999, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Plan & billing ═══ */}
        <div id="sec-billing" style={{ scrollMarginTop: 72 }}>
          {isPremium ? (
            <div style={{ border: "1px solid #c7d2fe", background: "linear-gradient(135deg,#eef2ff,#fff)", borderRadius: 20, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#312e81", lineHeight: 1.2 }}>Readee+</div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#d1fae5", color: "#059669", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
                  <Check className="w-3 h-3" strokeWidth={3} /> Active
                </span>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#71717a" }}>Full access to every lesson, story, unlimited practice, and parent analytics - for all your readers.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button onClick={openBillingPortal} disabled={billingBusy}
                  style={{ border: "none", background: "#4338ca", color: "#fff", fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, padding: "10px 20px", borderRadius: 999, cursor: "pointer", opacity: billingBusy ? 0.6 : 1 }}>
                  {billingBusy ? "Opening…" : "Manage billing"}
                </button>
                <span style={{ fontSize: 12.5, color: "#71717a" }}>Payment method, invoices, and cancellation live in the secure Stripe portal.</span>
              </div>
              {process.env.NODE_ENV === "development" && (
                <button onClick={handleResetPremium} disabled={resettingPremium} style={{ marginTop: 14, border: "none", background: "transparent", color: "#6b7280", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                  {resettingPremium ? "Resetting…" : "Reset to Free (dev)"}
                </button>
              )}
            </div>
          ) : (
            <div style={{ border: CARD, borderRadius: 20, padding: 24, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "#18181b" }}>Free plan</div>
                <span style={{ background: "#f4f4f5", color: "#52525b", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>Current</span>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "#71717a" }}>Diagnostic placement, the first lesson of each grade, and a taste of practice.</p>
              <a href="/upgrade" style={{ display: "block", border: "1px solid #c7d2fe", background: "linear-gradient(135deg,#eef2ff,#fff)", borderRadius: 16, padding: 18, textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "#312e81" }}>
                      <Sparkles className="w-[18px] h-[18px]" style={{ color: "#4338ca" }} strokeWidth={1.5} /> Readee+ - $9.99/mo
                    </div>
                    <div style={{ fontSize: 12.5, color: "#6366f1", marginTop: 2 }}>Every lesson, unlimited practice, all stories, and parent analytics.</div>
                  </div>
                  <span style={{ background: "#4338ca", color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 999, whiteSpace: "nowrap" }}>Upgrade</span>
                </div>
              </a>
              <div style={{ marginTop: 14 }}>
                {!showPromo ? (
                  <button onClick={() => setShowPromo(true)} style={{ border: "none", background: "transparent", color: "#4338ca", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>Have a promo code?</button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); }} placeholder="Enter promo code" disabled={promoResult?.success}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRedeemPromo(); }} style={{ ...inputStyle, flex: 1 }} />
                      <button onClick={handleRedeemPromo} disabled={promoLoading || !promoCode.trim() || promoResult?.success}
                        style={{ border: "none", background: "#4338ca", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "9px 16px", borderRadius: 12, cursor: "pointer", whiteSpace: "nowrap", opacity: promoLoading || !promoCode.trim() ? 0.6 : 1 }}>{promoLoading ? "…" : "Redeem"}</button>
                    </div>
                    {promoResult && <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: promoResult.success ? "#059669" : "#dc2626" }}>{promoResult.message}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══ Notifications ═══ */}
        <div id="sec-notif" style={{ scrollMarginTop: 72, border: CARD, borderRadius: 20, padding: 8, background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "14px 16px 6px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b" }}>Email notifications</div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>We only email when it&apos;s useful</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderTop: "1px solid #f4f4f5" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Mail className="w-[17px] h-[17px]" style={{ color: "#4338ca" }} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#18181b" }}>Weekly progress report</div>
              <div style={{ fontSize: 12, color: "#71717a" }}>A Sunday recap of what {children[0]?.first_name ?? "your reader"} practiced, mastered, and needs reps on.</div>
            </div>
            <Switch on={weeklyDigest} onClick={toggleWeeklyDigest} />
          </div>
        </div>

        {/* ═══ Privacy & data ═══ */}
        <div id="sec-privacy" style={{ scrollMarginTop: 72, border: CARD, borderRadius: 20, padding: 20, background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <ShieldCheck className="w-[18px] h-[18px]" style={{ color: "#10b981" }} strokeWidth={1.5} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "#18181b" }}>Privacy &amp; data</div>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "#52525b", lineHeight: 1.55, maxWidth: 560 }}>
            Readee is built from the ground up to protect kids&apos; data. We never sell it or use it for ads.{" "}
            <a href="/privacy-policy" style={{ color: "#4338ca", fontWeight: 700 }}>Read our privacy promise</a>
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 0", borderTop: "1px solid #f4f4f5" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#18181b" }}>Export learning data</div>
              <div style={{ fontSize: 12, color: "#71717a" }}>A spreadsheet (CSV) of everything we store about you and your readers.</div>
            </div>
            <button onClick={handleExportData} disabled={exportBusy}
              style={{ border: CARD, background: "#fff", color: "#3f3f46", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, opacity: exportBusy ? 0.6 : 1 }}>
              <Download className="w-[13px] h-[13px]" strokeWidth={2.4} /> {exportBusy ? "Preparing…" : "Request export"}
            </button>
          </div>
          {exportError && <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>{exportError}</p>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 0 0", borderTop: "1px solid #f4f4f5" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#dc2626" }}>Delete account</div>
              <div style={{ fontSize: 12, color: "#71717a" }}>Removes your account, every reader profile, and all progress - permanently.</div>
            </div>
            <button onClick={() => setShowDeleteAccount(true)}
              style={{ border: "1px solid #fecaca", background: "#fff", color: "#dc2626", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 12, cursor: "pointer", flexShrink: 0 }}>Delete</button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 4px 0", flexWrap: "wrap", borderTop: "1px solid #f4f4f5" }}>
          <span style={{ fontSize: 12.5, color: "#6b7280" }}>Questions? <a href="mailto:hello@readee.app" style={{ color: "#4338ca", fontWeight: 700 }}>hello@readee.app</a></span>
          <button onClick={handleLogout} style={{ border: "1px solid #e4e4e7", background: "#fff", color: "#3f3f46", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px 18px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <LogOut className="w-[14px] h-[14px]" strokeWidth={2} /> Log out
          </button>
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      {resetChildId && childForReset && (
        <ConfirmModal
          title={`Reset ${childForReset.first_name}'s progress?`}
          description={`This resets ${childForReset.first_name}'s assessment, lessons, and carrots back to zero. They'll take the reading quiz again.`}
          confirmLabel="Reset progress" tone="amber"
          onConfirm={() => handleResetProgress(resetChildId)} onCancel={() => setResetChildId(null)}
        />
      )}
      {removeChildId && childForRemove && (
        <ConfirmModal
          title={`Remove ${childForRemove.first_name}?`}
          description={`This permanently deletes ${childForRemove.first_name}'s profile, assessment results, and all lesson progress. This cannot be undone.`}
          confirmLabel="Remove reader" tone="red"
          onConfirm={() => handleRemoveChild(removeChildId)} onCancel={() => setRemoveChildId(null)}
        />
      )}
      {gradeRec && (
        <div style={modalScrim} onClick={() => setGradeRec(null)}>
          <div style={{ ...modalCard, width: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "#18181b" }}>Take the placement quiz?</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "#52525b", lineHeight: 1.5 }}>
              Grade updated. We recommend {gradeRec.name} takes the quick placement quiz so lessons match their actual reading level. Grade and reading level aren&apos;t always the same, a 2nd grader might read at a 1st-grade level, and the quiz is how Readee finds the just-right difficulty.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setGradeRec(null)} style={{ border: CARD, background: "#fff", color: "#3f3f46", fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "9px 16px", borderRadius: 12, cursor: "pointer" }}>Maybe later</button>
              <button onClick={() => router.push(`/assessment?child=${gradeRec.id}`)} style={{ border: "none", background: "#4338ca", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "9px 16px", borderRadius: 12, cursor: "pointer" }}>Start placement quiz</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccount && (
        <div style={modalScrim} onClick={() => { if (!deleteBusy) { setShowDeleteAccount(false); setDeleteConfirmEmail(""); setDeleteError(null); } }}>
          <div style={{ ...modalCard, width: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "#18181b" }}>Delete your account?</h3>
            <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "#71717a", lineHeight: 1.5 }}>
              This permanently deletes your account, every reader profile, all progress, and cancels any active subscription. It cannot be undone. Type <strong style={{ color: "#18181b" }}>{email}</strong> to confirm.
            </p>
            <input type="email" value={deleteConfirmEmail} onChange={(e) => { setDeleteConfirmEmail(e.target.value); setDeleteError(null); }} disabled={deleteBusy} placeholder="your@email.com" autoComplete="off"
              style={{ ...inputStyle, width: "100%", marginBottom: 14 }} />
            {deleteError && <p style={{ margin: "-8px 0 12px", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>{deleteError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDeleteAccount}
                disabled={deleteBusy || deleteConfirmEmail.trim().toLowerCase() !== (email || "").trim().toLowerCase()}
                style={{ flex: 1, border: "none", background: (deleteBusy || deleteConfirmEmail.trim().toLowerCase() !== (email || "").trim().toLowerCase()) ? "#fca5a5" : "#dc2626", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: 10, borderRadius: 12, cursor: "pointer" }}>
                {deleteBusy ? "Deleting…" : "Delete my account"}
              </button>
              <button onClick={() => { setShowDeleteAccount(false); setDeleteConfirmEmail(""); setDeleteError(null); }} disabled={deleteBusy}
                style={{ flex: 1, border: CARD, background: "#fff", color: "#3f3f46", fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: 10, borderRadius: 12, cursor: "pointer" }}>Keep my account</button>
            </div>
          </div>
        </div>
      )}

      <CelebrationOverlay show={!!promoResult?.success} />
    </div>
  );
}

/* ═══ Reusable bits ═══ */

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box", fontFamily: "inherit", fontSize: 14, fontWeight: 500,
  padding: "9px 12px", border: CARD, borderRadius: 12, outline: "none", color: "#18181b", background: "#fff",
};
const modalScrim: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(24,24,27,.45)", backdropFilter: "blur(3px)", padding: 24,
};
const modalCard: React.CSSProperties = {
  position: "relative", maxWidth: "calc(100vw - 48px)", background: "#fff", borderRadius: 24,
  boxShadow: "0 24px 60px -12px rgba(30,27,75,.35)", padding: "26px 28px", boxSizing: "border-box",
};

function Row({ label, sub, last, children }: { label: string; sub: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: last ? "13px 0 0" : "13px 0", borderTop: "1px solid #f4f4f5" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#18181b" }}>{label}</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on}
      style={{ width: 44, height: 24, borderRadius: 999, background: on ? "#4338ca" : "#e4e4e7", position: "relative", border: "none", cursor: "pointer", transition: "background .2s", flexShrink: 0, padding: 0, display: "block" }}>
      <span style={{ position: "absolute", top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left .2s" }} />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#71717a" }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11, color: "#6b7280" }}>{hint}</span>}
    </div>
  );
}

function PwInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input type="password" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, width: "100%" }} />
  );
}

function ConfirmModal({ title, description, confirmLabel, tone, onConfirm, onCancel }: {
  title: string; description: string; confirmLabel: string; tone: "red" | "amber"; onConfirm: () => void; onCancel: () => void;
}) {
  const bg = tone === "red" ? "#dc2626" : "#d97706";
  return (
    <div style={modalScrim} onClick={onCancel}>
      <div style={{ ...modalCard, width: 400 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "#18181b" }}>{title}</h3>
        <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "#71717a", lineHeight: 1.5 }}>{description}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ border: CARD, background: "#fff", color: "#3f3f46", fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "9px 16px", borderRadius: 12, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ border: "none", background: bg, color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "9px 16px", borderRadius: 12, cursor: "pointer" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
