"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/app/components/auth/AuthCard";
import FormField from "@/app/components/auth/FormField";

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // Wait for Supabase to pick up the recovery token from the URL hash
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if session is already established (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="New Password">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
              Password updated!
            </div>
            <p className="text-center text-sm text-indigo-900 mt-4">
              <Link
                href="/login"
                className="text-indigo-600 font-medium hover:underline"
              >
                &larr; Back to login
              </Link>
            </p>
          </motion.div>
        ) : !ready ? (
          <motion.div
            key="loading"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center py-4"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-indigo-900/70">Verifying reset link...</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <p className="text-sm text-indigo-900/70 mb-6 text-center">
              Enter your new password below.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                id="new-password"
                label="New password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                required
              />
              <FormField
                id="confirm-password"
                label="Confirm password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-violet-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-indigo-900">
              <Link
                href="/login"
                className="text-indigo-600 font-medium hover:underline"
              >
                &larr; Back to login
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
