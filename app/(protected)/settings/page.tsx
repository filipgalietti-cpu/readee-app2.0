"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { READING_LEVELS, GRADES } from "@/app/_components/LevelProgressBar";
import { useTheme } from "@/app/_components/ThemeContext";
import { safeValidate } from "@/lib/validate";
import CelebrationOverlay from "@/app/_components/CelebrationOverlay";
import { ChildCreateSchema, ChildUpdateSchema } from "@/lib/schemas";

function displayGrade(grade: string): string {
  if (grade.toLowerCase() === "pre-k") return "Foundational";
  return grade;
}

export default function Settings() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new_: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Add child
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", grade: "Kindergarten" });
  const [addingChild, setAddingChild] = useState(false);

  // Editing child
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ first_name: "", grade: "" });

  // Modals
  const [resetChildId, setResetChildId] = useState<string | null>(null);
  const [removeChildId, setRemoveChildId] = useState<string | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [levelChangeChild, setLevelChangeChild] = useState<{ id: string; name: string; newLevel: string } | null>(null);

  // Plan
  const [userPlan, setUserPlan] = useState<string>("free");

  // Promo code
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{ success: boolean; message: string } | null>(null);

  // Preferences
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();

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

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setEmail(user.email || "");
      setUserId(user.id);

      // Fetch plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      setUserPlan((profile as { plan?: string } | null)?.plan || "free");

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
    if (data) setChildren(data as Child[]);
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
  }

  // === Edit Child ===
  function startEditing(child: Child) {
    setEditingChildId(child.id);
    setEditValues({ first_name: child.first_name, grade: child.grade || "Kindergarten" });
  }

  async function saveEdit(childId: string) {
    const updateData = safeValidate(ChildUpdateSchema, {
      first_name: editValues.first_name.trim(),
      grade: editValues.grade,
    });
    await supabase.from("children").update(updateData).eq("id", childId);
    setEditingChildId(null);
    await loadChildren(userId);
  }

  // === Change Reading Level ===
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
  }

  // === Reset Progress ===
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
  }

  // === Remove Child ===
  async function handleRemoveChild(childId: string) {
    await supabase.from("children").delete().eq("id", childId);
    setRemoveChildId(null);
    await loadChildren(userId);
  }

  // === Logout ===
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
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
        setUserPlan("premium");
      }
    } catch {
      setPromoResult({ success: false, message: "Something went wrong. Please try again." });
    }
    setPromoLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const childForReset = children.find((c) => c.id === resetChildId);
  const childForRemove = children.find((c) => c.id === removeChildId);

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-slate-100 tracking-tight">Settings</h1>
        <p className="text-zinc-500 dark:text-slate-400 mt-1">Manage your account, readers, and preferences.</p>
      </div>

      {/* ====== ACCOUNT ====== */}
      <Section title="Account">
        <div>
          <Label>Email</Label>
          <p className="text-sm text-zinc-900 dark:text-slate-200">{email}</p>
        </div>

        <div className="pt-2">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-slate-600 bg-zinc-50/50 dark:bg-slate-700/30 p-4">
              <InputField
                label="Current Password"
                type="password"
                value={passwords.current}
                onChange={(v) => setPasswords((p) => ({ ...p, current: v }))}
                placeholder="••••••••"
              />
              <InputField
                label="New Password"
                type="password"
                value={passwords.new_}
                onChange={(v) => setPasswords((p) => ({ ...p, new_: v }))}
                placeholder="••••••••"
              />
              <InputField
                label="Confirm New Password"
                type="password"
                value={passwords.confirm}
                onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))}
                placeholder="••••••••"
              />
              {passwordMsg && (
                <p className={`text-sm ${passwordMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>
                  {passwordMsg.text}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordChange}
                  disabled={savingPassword}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {savingPassword ? "Saving..." : "Save Password"}
                </button>
                <button
                  onClick={() => { setShowPasswordForm(false); setPasswordMsg(null); }}
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ====== MY CHILDREN ====== */}
      <Section title="My Children" badge={`${children.length}/${userPlan === "premium" ? 5 : 1} profiles`}>
        {children.length === 0 ? (
          <p className="text-sm text-zinc-500">No readers added yet.</p>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="rounded-xl border border-zinc-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 p-5 space-y-3"
              >
                {editingChildId === child.id ? (
                  /* Editing mode */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Name"
                        value={editValues.first_name}
                        onChange={(v) => setEditValues((p) => ({ ...p, first_name: v }))}
                      />
                      <div>
                        <Label>Grade</Label>
                        <select
                          value={editValues.grade}
                          onChange={(e) => setEditValues((p) => ({ ...p, grade: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-slate-600 text-sm text-zinc-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(child.id)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors">Save</button>
                      <button onClick={() => setEditingChildId(null)} className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-slate-600 text-xs font-medium text-zinc-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-slate-100">{child.first_name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {child.grade && (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {displayGrade(child.grade)}
                            </span>
                          )}
                          {child.reading_level === "Independent Reader" && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Advanced
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                          {child.carrots} 🥕
                        </span>
                        <button
                          onClick={() => startEditing(child)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Reading Level */}
                    <div className="space-y-1.5">
                      <Label>Reading Level</Label>
                      <select
                        value={child.reading_level || ""}
                        onChange={(e) => requestLevelChange(child.id, child.first_name, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-slate-600 text-sm text-zinc-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="" disabled>Not assessed yet</option>
                        {READING_LEVELS.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-zinc-400">
                        Set by assessment. Override manually if needed.
                      </p>
                    </div>

                    {/* Danger actions */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => setResetChildId(child.id)}
                        className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        Reset Progress
                      </button>
                      <button
                        onClick={() => setRemoveChildId(child.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove Child
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Child */}
        {(() => {
          const maxChildren = userPlan === "premium" ? 5 : 1;
          const canAdd = children.length < maxChildren;
          const atMaxPremium = userPlan === "premium" && children.length >= 5;

          if (atMaxPremium) {
            return (
              <div className="pt-2">
                <p className="text-xs text-zinc-400">You&apos;ve reached the maximum of 5 child profiles.</p>
              </div>
            );
          }

          if (!canAdd && userPlan !== "premium") {
            // Free user upgrade prompt
            return (
              <div className="pt-2">
                <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                      👨‍👩‍👧‍👦
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Add more readers with Readee+</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Track up to 5 children with detailed progress reports for each.</p>
                    </div>
                  </div>
                  <Link
                    href="/upgrade"
                    className="block w-full text-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm"
                  >
                    Upgrade to Readee+
                  </Link>
                </div>
              </div>
            );
          }

          // Can add — show form
          return (
            <div className="pt-2">
              {!showAddChild ? (
                <button
                  onClick={() => setShowAddChild(true)}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Child
                </button>
              ) : (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Name"
                      value={newChild.name}
                      onChange={(v) => setNewChild((p) => ({ ...p, name: v }))}
                      placeholder="Child's first name"
                    />
                    <div>
                      <Label>Grade</Label>
                      <select
                        value={newChild.grade}
                        onChange={(e) => setNewChild((p) => ({ ...p, grade: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-slate-600 text-sm text-zinc-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddChild}
                      disabled={addingChild || !newChild.name.trim()}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {addingChild ? "Adding..." : "Add Child"}
                    </button>
                    <button
                      onClick={() => setShowAddChild(false)}
                      className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Section>

      {/* ====== PREFERENCES ====== */}
      <Section title="Preferences">
        <Toggle label="Dark Mode" description="Switch to a darker color scheme for the app" value={darkMode} onChange={toggleDarkMode} />
        <Toggle label="Sound Effects" description="Play sounds during lessons and assessments" value={soundEffects} onChange={setSoundEffects} />
        <Toggle label="Auto-Advance" description="Automatically move to the next question after answering" value={autoAdvance} onChange={setAutoAdvance} />
      </Section>

      {/* ====== SUBSCRIPTION ====== */}
      <Section title="Subscription">
        {userPlan === "premium" ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-slate-100">Readee+ Premium</p>
              <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">All lessons, unlimited assessments, up to 5 readers, parent reports</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700">Active</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-slate-100">Free Plan</p>
                <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">Diagnostic assessment, 2 lessons per level, 1 reader profile</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600">Current</span>
            </div>
            <Link
              href="/upgrade"
              className="block rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Readee+ — $9.99/mo</p>
                  <p className="text-xs text-indigo-600 mt-0.5">25+ lessons, unlimited assessments, up to 5 readers, parent reports</p>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-bold whitespace-nowrap">
                  Upgrade
                </span>
              </div>
            </Link>
            {/* Promo code */}
            <div className="pt-1">
              {!showPromo ? (
                <button
                  onClick={() => setShowPromo(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  Have a promo code?
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); }}
                      placeholder="Enter promo code"
                      disabled={promoResult?.success}
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-zinc-400 dark:placeholder:text-slate-500 disabled:opacity-50"
                      onKeyDown={(e) => { if (e.key === "Enter") handleRedeemPromo(); }}
                    />
                    <button
                      onClick={handleRedeemPromo}
                      disabled={promoLoading || !promoCode.trim() || promoResult?.success}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {promoLoading ? "..." : "Redeem"}
                    </button>
                  </div>
                  {promoResult && (
                    <div className={`flex items-center gap-2 text-sm font-medium ${promoResult.success ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                      {promoResult.success && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {promoResult.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </Section>

      {/* ====== SUPPORT ====== */}
      <Section title="Support">
        <div className="space-y-2">
          <SupportLink href="mailto:hello@readee.app" label="Contact Us" desc="Questions, feedback, or need help" />
          <SupportLink href="mailto:hello@readee.app?subject=Bug%20Report" label="Report a Bug" desc="Found something broken? Let us know" />
          <SupportLink href="https://readee.app#faq" label="FAQ" desc="Frequently asked questions" external />
        </div>
      </Section>

      {/* ====== ACCOUNT ACTIONS ====== */}
      <section className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-white dark:bg-slate-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-slate-100">Account Actions</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-slate-600 text-sm font-medium text-zinc-700 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors"
          >
            Log Out
          </button>
          <button
            onClick={() => setShowDeleteAccount(true)}
            className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* ====== MODALS ====== */}

      {/* Reset Progress Modal */}
      {resetChildId && childForReset && (
        <Modal
          title={`Reset ${childForReset.first_name}'s Progress?`}
          description={`This will reset ${childForReset.first_name}'s assessment, lessons, and carrots back to zero. They'll take the reading quiz again.`}
          confirmLabel="Reset Progress"
          confirmColor="amber"
          onConfirm={() => handleResetProgress(resetChildId)}
          onCancel={() => setResetChildId(null)}
        />
      )}

      {/* Remove Child Modal */}
      {removeChildId && childForRemove && (
        <Modal
          title={`Remove ${childForRemove.first_name}?`}
          description={`This will permanently delete ${childForRemove.first_name}'s profile, assessment results, and all lesson progress. This cannot be undone.`}
          confirmLabel="Remove Child"
          confirmColor="red"
          onConfirm={() => handleRemoveChild(removeChildId)}
          onCancel={() => setRemoveChildId(null)}
        />
      )}

      {/* Level Change Confirmation Modal */}
      {levelChangeChild && (
        <Modal
          title={`Change ${levelChangeChild.name}'s Reading Level?`}
          description={`Changing ${levelChangeChild.name}'s reading level will reset their active progress. Completed lessons and carrots for the current level will be saved in their history, but they'll start fresh at the new level. Are you sure?`}
          confirmLabel="Yes, Change Level"
          confirmColor="amber"
          onConfirm={confirmLevelChange}
          onCancel={() => setLevelChangeChild(null)}
        />
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <Modal
          title="Delete Your Account?"
          description="Are you sure? This will delete your account and all children's data permanently."
          confirmLabel="Delete Account"
          confirmColor="red"
          onConfirm={() => setShowDeleteAccount(false)}
          onCancel={() => setShowDeleteAccount(false)}
        />
      )}

      {/* Celebration Overlay (promo success) */}
      <CelebrationOverlay show={!!promoResult?.success} />
    </div>
  );
}

/* ====== REUSABLE COMPONENTS ====== */

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900 dark:text-slate-100">{title}</h2>
        {badge && <span className="text-xs text-zinc-400 dark:text-slate-500">{badge}</span>}
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-zinc-500 dark:text-slate-400 mb-1">{children}</label>;
}

function InputField({
  label, type = "text", value, onChange, placeholder,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-slate-600 text-sm text-zinc-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-zinc-400 dark:placeholder:text-slate-500"
      />
    </div>
  );
}

function Toggle({
  label, description, value, onChange,
}: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-slate-100">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-indigo-600" : "bg-zinc-200 dark:bg-slate-600"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function SupportLink({ href, label, desc, external }: { href: string; label: string; desc: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between rounded-xl border border-zinc-100 dark:border-slate-600 bg-zinc-50/50 dark:bg-slate-700/30 p-4 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-slate-100">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-slate-400">{desc}</p>
      </div>
      <svg className="w-4 h-4 text-zinc-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

function Modal({
  title, description, confirmLabel, confirmColor, onConfirm, onCancel,
}: {
  title: string; description: string; confirmLabel: string; confirmColor: "red" | "amber";
  onConfirm: () => void; onCancel: () => void;
}) {
  const btnClass = confirmColor === "red"
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-amber-500 hover:bg-amber-600 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-zinc-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-slate-400 leading-relaxed">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-slate-600 text-sm font-medium text-zinc-600 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
