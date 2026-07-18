"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/app/components/auth/AuthLayout";
import FormField from "@/app/components/auth/FormField";
import GoogleButton from "@/app/components/auth/GoogleButton";
import Divider from "@/app/components/auth/Divider";

const CTA_BTN =
  "w-full bg-indigo-700 text-white py-3.5 rounded-full font-extrabold text-base shadow-[0_8px_20px_-8px_rgba(67,56,202,0.5)] hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed";

/* ── Search-param banners (isolated to avoid suspending the whole form) */
function ParamBanners() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");
  return (
    <>
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
    </>
  );
}

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
    <AuthLayout mode="signin" showTabs={false}>
      <h1 className="font-[family-name:var(--font-baloo)] font-extrabold text-3xl text-indigo-950 text-center mb-1">
        Reset your password
      </h1>
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
              If an account exists for that email, a reset link is on its
              way. Check your inbox (and spam folder).
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
              <button type="submit" disabled={loading} className={CTA_BTN}>
                {loading ? "Sending..." : "Send reset link"}
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
    </AuthLayout>
  );
}

/* ── Login Form ────────────────────────────────────── */

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"login" | "forgot">("login");
  const [magicSending, setMagicSending] = useState(false);
  const [magicSent, setMagicSent] = useState<string | null>(null);

  const handleMagicLink = async () => {
    // Reuse the email field. We don't require a password — the whole
    // point of this lane is for users who can't remember theirs.
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: "Enter your email first" });
      return;
    }
    setMagicSending(true);
    setErrors({});
    setMagicSent(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          // Land back on the same login page on click — the proxy will
          // pick up the new session and the post-auth redirect chain
          // takes over from there.
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : undefined,
        },
      });
      if (error) {
        const msg = (error.message ?? "").toLowerCase();
        if (error.status === 429 || msg.includes("rate limit")) {
          setErrors({ general: "Too many magic-link requests. Try again in a minute." });
        } else {
          setErrors({ general: "Couldn't send the link — try again." });
        }
        setMagicSending(false);
        return;
      }
      setMagicSent(formData.email);
    } catch {
      setErrors({ general: "Network error. Try again." });
    } finally {
      setMagicSending(false);
    }
  };

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
          // Translate Supabase's opaque error strings into something a
          // human can act on. We hit /api/auth/login-hint to figure out
          // whether the email is unknown, OAuth-only, or just wrong
          // password — without leaking that distinction to the public
          // anon endpoint.
          let friendly = "Couldn't sign you in. Check your email and password.";
          const msg = (error.message ?? "").toLowerCase();
          if (
            error.status === 429 ||
            msg.includes("rate limit") ||
            msg.includes("too many")
          ) {
            friendly =
              "Too many sign-in attempts. Wait a minute and try again.";
          } else if (msg.includes("invalid login credentials") || msg.includes("invalid email")) {
            try {
              const hintRes = await fetch("/api/auth/login-hint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
              });
              const j = (await hintRes.json().catch(() => ({}))) as { hint?: string };
              if (j.hint === "no_account") {
                friendly =
                  "We couldn't find an account with that email. Want to sign up?";
              } else if (j.hint === "oauth_only") {
                friendly =
                  'This account uses Google. Click "Continue with Google" above.';
              } else if (j.hint === "wrong_password") {
                friendly = "Wrong password. Try again or use Forgot password.";
              }
            } catch {
              // Fall through to the generic message.
            }
          }
          setErrors({ general: friendly });
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          // Resolve the role-appropriate destination INLINE so we never
          // depend on the / server-redirect chain (which is flaky in
          // dev right after a cookie write, and occasionally races in
          // prod). Prefer ?redirect=... when present (set by the proxy
          // when an unauthed user hit a protected route).
          const wanted = searchParams?.get("redirect") ?? null;
          if (wanted && wanted.startsWith("/") && !wanted.startsWith("/login")) {
            router.replace(wanted);
            router.refresh();
            return;
          }

          // Lookup the role + admin scope so we land on the right home.
          const [{ data: profileRow }, { data: ownerRow }] = await Promise.all([
            supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle(),
            supabase.from("platform_admins").select("profile_id").eq("profile_id", data.user.id).maybeSingle(),
          ]);
          const role = (profileRow as { role?: string } | null)?.role ?? null;
          const isOwner = !!ownerRow;

          let destination = "/dashboard";
          if (isOwner) destination = "/owner";
          else if (role === "educator") destination = "/classroom";

          router.replace(destination);
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
    <AuthLayout mode="signin">
      <h1 className="font-[family-name:var(--font-baloo)] font-extrabold text-3xl text-indigo-950 text-center">
        Welcome back!
      </h1>
      <p className="text-[15px] text-zinc-600 mt-1.5 mb-6 text-center">
        Sign in to see your child&apos;s progress.
      </p>
      <GoogleButton />
      <Divider />
      <Suspense fallback={null}>
        <ParamBanners />
      </Suspense>
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {errors.general}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
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
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={magicSending}
              className="text-[13px] font-bold text-indigo-700 hover:underline disabled:opacity-50"
            >
              {magicSending ? "Sending link…" : "Email me a sign-in link"}
            </button>
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="text-[13px] font-bold text-indigo-700 hover:underline"
            >
              Forgot it?
            </button>
          </div>
        </div>
        {magicSent && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Check <span className="font-semibold">{magicSent}</span> for a sign-in link.
          </div>
        )}
        <button type="submit" disabled={isLoading} className={CTA_BTN}>
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function Login() {
  return <LoginForm />;
}
