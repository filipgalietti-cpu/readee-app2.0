"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/app/components/auth/AuthCard";
import FormField from "@/app/components/auth/FormField";
import GoogleButton from "@/app/components/auth/GoogleButton";
import Divider from "@/app/components/auth/Divider";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

/* ── Forgot Password View ─────────────────────────── */

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      setSent(true);
    } catch {
      // Always show success to avoid revealing account existence
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset Password">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
              Check your email for a reset link
            </div>
            <p className="text-center text-sm text-indigo-900 mt-4">
              <button
                onClick={onBack}
                className="text-indigo-600 font-medium hover:underline"
              >
                &larr; Back to login
              </button>
            </p>
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
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                id="reset-email"
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="your@email.com"
                error={undefined}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-violet-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-indigo-900">
              <button
                onClick={onBack}
                className="text-indigo-600 font-medium hover:underline"
              >
                &larr; Back to login
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}

/* ── Login Form ────────────────────────────────────── */

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"login" | "forgot">("login");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      setErrors({});

      try {
        const supabase = createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setErrors({ general: error.message });
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          // Success - redirect will be handled by middleware
          router.push("/");
          router.refresh();
        }
      } catch (error) {
        console.error("Login error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
        setErrors({ general: errorMessage });
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (view === "forgot") {
    return <ForgotPasswordView onBack={() => setView("login")} />;
  }

  return (
    <AuthCard title="Welcome Back">
      <GoogleButton />
      <Divider />
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}
      {errorParam && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorParam}
        </div>
      )}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errors.general}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="email"
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          error={errors.email}
          required
        />
        <div>
          <FormField
            id="password"
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
            required
          />
          <div className="mt-1 text-right">
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-violet-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-indigo-900">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-indigo-600 font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <span className="sr-only">Loading login page</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
