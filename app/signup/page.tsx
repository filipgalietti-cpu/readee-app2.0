"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!email || !password) return setMsg("Email and password are required.");
    if (password.length < 8) return setMsg("Password must be at least 8 characters.");
    if (password !== confirm) return setMsg("Passwords do not match.");

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) setMsg(error.message);
    else setMsg("Check your email to confirm your account.");
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-gray-600">Start using Readee.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm">Email</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            className="mt-1 w-full rounded border p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="text-sm">Confirm password</label>
          <input
            className="mt-1 w-full rounded border p-2"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
          type="submit"
        >
          {loading ? "Creating..." : "Sign up"}
        </button>

        {msg ? <p className="text-sm text-gray-700">{msg}</p> : null}

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
