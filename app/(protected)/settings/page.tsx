"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";

export default function Settings() {
  const router = useRouter();
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

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
  };

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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900">Your Readers</h2>
          <span className="text-xs text-zinc-400">
            {children.length}/5 profiles
          </span>
        </div>
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

      {/* Subscription */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900">Free Plan</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Diagnostic assessment, 2 lessons per level, 1 reader profile
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600">
            Current
          </span>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-900">
                Readee+ — $9.99/mo
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                25+ lessons, unlimited assessments, up to 5 readers, parent
                reports
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-bold whitespace-nowrap">
              Coming Soon
            </span>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900">Notifications</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-700">Progress email updates</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Weekly summary of your child&apos;s reading progress
            </p>
          </div>
          <span className="text-xs text-zinc-400">Coming soon</span>
        </div>
      </section>

      {/* Help & Support */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900">Help & Support</h2>
        <div className="space-y-3">
          <Link
            href="/contact-us"
            className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900">Contact Us</p>
              <p className="text-xs text-zinc-500">
                Questions, feedback, or need help
              </p>
            </div>
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          <Link
            href="/about"
            className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900">About Readee</p>
              <p className="text-xs text-zinc-500">
                Our mission and the Science of Reading
              </p>
            </div>
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-red-100 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-zinc-900">Account Actions</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Log Out
          </button>
          <button
            disabled
            className="px-4 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-400 cursor-not-allowed"
            title="Coming soon"
          >
            Delete Account
          </button>
        </div>
        <p className="text-xs text-zinc-400">
          To delete your account and all data, contact{" "}
          <a
            href="mailto:hello@readee.app"
            className="text-indigo-500 hover:underline"
          >
            hello@readee.app
          </a>
        </p>
      </section>
    </div>
  );
}
