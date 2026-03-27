"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Bell, Mail, Flame, BookOpen, Trophy, Check, Loader2 } from "lucide-react";
import SettingsShell from "@/app/_components/SettingsShell";

interface NotificationPrefs {
  weekly_report: boolean;
  streak_reminders: boolean;
  new_content: boolean;
  achievements: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  weekly_report: true,
  streak_reminders: true,
  new_content: true,
  achievements: true,
};

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-indigo-600" : "bg-zinc-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`} />
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setUserId(user.id);

      const { data: profRows } = await supabase
        .from("profiles")
        .select("notification_prefs")
        .eq("id", user.id)
        .limit(1);

      const prof = profRows?.[0] as any;
      if (prof?.notification_prefs) {
        setPrefs({ ...DEFAULT_PREFS, ...prof.notification_prefs });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const supabase = supabaseBrowser();
    await supabase.from("profiles").update({ notification_prefs: prefs } as any).eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  if (loading) {
    return (
      <SettingsShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      </SettingsShell>
    );
  }

  const NOTIFICATION_OPTIONS: { key: keyof NotificationPrefs; icon: typeof Bell; title: string; description: string }[] = [
    { key: "weekly_report", icon: Mail, title: "Weekly Progress Report", description: "Email summary of your child's reading activity each week" },
    { key: "streak_reminders", icon: Flame, title: "Streak Reminders", description: "Notify when a reading streak is about to break" },
    { key: "new_content", icon: BookOpen, title: "New Content Available", description: "Alert when new lessons or stories are added" },
    { key: "achievements", icon: Trophy, title: "Achievements & Milestones", description: "Celebrate when your child hits reading milestones" },
  ];

  return (
    <SettingsShell>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-zinc-500 mt-1">Choose what updates you receive</p>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
            <h2 className="text-base font-semibold text-zinc-900">Email Notifications</h2>
          </div>

          <div className="divide-y divide-zinc-100">
            {NOTIFICATION_OPTIONS.map(({ key, icon: Icon, title, description }) => (
              <div key={key} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-900">{title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
                </div>
                <Toggle checked={prefs[key]} onChange={(v) => updatePref(key, v)} />
              </div>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              "Save Preferences"
            )}
          </button>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-sm text-emerald-600 font-medium"
            >
              <Check className="w-4 h-4" /> Saved
            </motion.span>
          )}
        </div>
      </div>
    </SettingsShell>
  );
}
