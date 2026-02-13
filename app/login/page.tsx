"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!email || !password) return setMsg("Email and password are required.");

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) setMsg(error.message);
    else window.location.href = "/dashboard";
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm">Email</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white"
          type="submit"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>

        {msg && <p className="text-sm text-gray-700">{msg}</p>}

        <p className="text-sm text-gray-600">
          Need an account?{" "}
          <Link className="underline" href="/signup">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
