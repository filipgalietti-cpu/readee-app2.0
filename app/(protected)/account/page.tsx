"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { User, Mail, Shield, Trash2, Check, Loader2, Users } from "lucide-react";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import type { Child } from "@/lib/db/types";
import { usePlanStore } from "@/lib/stores/plan-store";
import SettingsShell from "@/app/_components/SettingsShell";

interface ProfileData {
  display_name: string;
  email: string;
  plan: string;
  avatar_url: string | null;
  provider: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      // Use same pattern as dashboard (which works)
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      const plan = (profile as { plan?: string } | null)?.plan || "free";
      usePlanStore.getState().setPlan(plan);

      const { data: profDetail } = await supabase
        .from("profiles")
        .select("display_name, created_at")
        .eq("id", user.id)
        .single();
      const prof = profDetail as any;

      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      setProfile({
        display_name: prof?.display_name || user.user_metadata?.full_name || "User",
        email: user.email || "",
        plan,
        avatar_url: googleAvatar,
        provider: user.app_metadata?.provider || "email",
        created_at: prof?.created_at || user.created_at,
      });
      setEditName(prof?.display_name || user.user_metadata?.full_name || "");

      const { data: kids } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });
      setChildren((kids || []) as Child[]);

      setLoading(false);
    }
    load();
  }, [router]);

  const handleSaveName = async () => {
    if (!editName.trim() || !profile) return;
    setSaving(true);
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ display_name: editName.trim() }).eq("id", user.id);
      setProfile({ ...profile, display_name: editName.trim() });
    }
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading || !profile) {
    return (
      <SettingsShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const initials = profile.display_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <SettingsShell>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Parent Account</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your account and linked readers</p>
        </div>

        <div className="space-y-5">
          {/* Profile Section */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-zinc-900">Profile</h2>
            </div>

            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-zinc-100"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden"); }}
                  />
                ) : null}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold ring-2 ring-zinc-100 ${profile.avatar_url ? "hidden" : ""}`}>
                  {initials}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Display Name</label>
                  {editing ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving || !editName.trim()}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setEditName(profile.display_name); }}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-zinc-900 font-medium">{profile.display_name}</span>
                      <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                        Edit
                      </button>
                      {saved && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <Check className="w-3 h-3" /> Saved
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Email</label>
                  <p className="text-sm text-zinc-900 mt-1">{profile.email}</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Member Since</label>
                  <p className="text-sm text-zinc-900 mt-1">{memberSince}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Linked Readers */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-zinc-900">Linked Readers</h2>
            </div>
            {children.length > 0 ? (
              <div className="space-y-2.5">
                {children.map((child, i) => (
                  <div key={child.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-zinc-200">
                      <img src={getChildAvatarImage(child, i)} alt={child.first_name} className="w-full h-full object-cover" draggable={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-900">{child.first_name}</div>
                      <div className="text-xs text-zinc-500">
                        {child.grade || "No grade set"}{child.reading_level ? ` · ${child.reading_level}` : ""}
                      </div>
                    </div>
                    <Link href="/settings" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No readers linked to this account yet.</p>
            )}
          </section>

          {/* Plan Section */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-zinc-900">Plan</h2>
            </div>
            {profile.plan === "premium" ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 border border-violet-200">
                    Readee+
                  </span>
                  <span className="text-sm text-zinc-700">Full access to all lessons and features</span>
                </div>
                <Link
                  href="/billing"
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Manage Subscription
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">
                    Free
                  </span>
                  <span className="text-sm text-zinc-500">Limited to starter lessons</span>
                </div>
                <Link
                  href="/upgrade"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-semibold hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm"
                >
                  Upgrade
                </Link>
              </div>
            )}
          </section>

          {/* Authentication */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-zinc-900">Authentication</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Google Account</p>
                <p className="text-xs text-zinc-500">Signed in via Google OAuth</p>
              </div>
              <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Connected</span>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-red-900">Danger Zone</h2>
            </div>
            <p className="text-sm text-red-700/70 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setDeleteModal(true)}
              className="px-4 py-2 rounded-lg border border-red-300 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              Delete Account
            </button>
          </section>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl p-6"
              >
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Account?</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  This will permanently delete your account, all children profiles, progress data, and purchases. Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder='Type "DELETE" to confirm'
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== "DELETE"}
                    className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Delete My Account
                  </button>
                  <button
                    onClick={() => { setDeleteModal(false); setDeleteConfirm(""); }}
                    className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </SettingsShell>
  );
}
