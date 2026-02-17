"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";

export default function Settings() {
  const [email, setEmail] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });

      if (data) setChildren(data as Child[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-500 mt-1">Manage your account and readers.</p>
      </div>

      {/* Account */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900">Account</h2>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Email
          </label>
          <p className="text-sm text-zinc-900">{email}</p>
        </div>
      </section>

      {/* Children */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900">Your Readers</h2>
        {children.length === 0 ? (
          <p className="text-sm text-zinc-500">No readers added yet.</p>
        ) : (
          <div className="space-y-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-4"
              >
                <div>
                  <div className="font-semibold text-sm text-zinc-900">
                    {child.first_name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {child.grade || "No grade set"}
                    {child.reading_level && ` \u00B7 ${child.reading_level}`}
                  </div>
                </div>
                <div className="text-xs text-zinc-400">{child.xp} XP</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notifications placeholder */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900">Notifications</h2>
        <p className="text-sm text-zinc-500">
          Notification preferences coming soon.
        </p>
      </section>
    </div>
  );
}
