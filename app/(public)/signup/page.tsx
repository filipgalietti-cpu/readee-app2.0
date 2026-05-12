"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/app/components/auth/AuthCard";
import FormField from "@/app/components/auth/FormField";
import GoogleButton from "@/app/components/auth/GoogleButton";
import Divider from "@/app/components/auth/Divider";
import TosCheckbox from "@/app/components/auth/TosCheckbox";
import { CURRENT_TOS_VERSION } from "@/lib/tos";
import { GraduationCap, Heart, ShieldCheck, BookOpen } from "lucide-react";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function Signup() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole: "parent" | "educator" =
    searchParams.get("as") === "teacher" ? "educator" : "parent";
  const [role, setRole] = useState<"parent" | "educator">(initialRole);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  // Keep role state in sync if user changes the URL ?as= param.
  useEffect(() => {
    const paramRole: "parent" | "educator" =
      searchParams.get("as") === "teacher" ? "educator" : "parent";
    setRole(paramRole);
  }, [searchParams]);

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

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
        
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${
              role === "educator" ? "/classroom" : "/dashboard"
            }`,
            // The handle_new_user Postgres trigger reads this `role`
            // hint and stamps the new profiles row accordingly.
            data: { role },
          },
        });

        if (error) {
          setErrors({ general: error.message });
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          // Check if email confirmation is required
          if (data.user.identities && data.user.identities.length === 0) {
            // Email already registered
            setErrors({ general: "This email is already registered. Please sign in instead." });
            setIsLoading(false);
          } else {
            // Stash ToS consent for TosGate to pick up after login
            localStorage.setItem(
              "readee-tos-consent",
              JSON.stringify({
                tos_accepted_at: new Date().toISOString(),
                tos_version: CURRENT_TOS_VERSION,
              })
            );
            // Success - redirect to login or dashboard
            router.push("/login?message=Account created! Check your email to confirm, then sign in.");
          }
        }
      } catch (error) {
        console.error("Signup error:", error);
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

  return (
    <AuthCard
      title="Create Your Account"
      banner={role === "educator" ? "Teacher signup — free to start" : "It's Free to Get Started!"}
    >
      {/* Parent / Teacher toggle */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("parent")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-sm font-bold transition ${
            role === "parent"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-indigo-300"
          }`}
        >
          <Heart className="h-4 w-4" />
          I&apos;m a parent
        </button>
        <button
          type="button"
          onClick={() => setRole("educator")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-sm font-bold transition ${
            role === "educator"
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-violet-300"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          I&apos;m a teacher
        </button>
      </div>

      {/* Trust strip — short row of why-trust-us signals above the
          signup form. First-time parents need this before they hand
          over their kid's data. */}
      <div className="mb-5 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-start gap-1.5 rounded-lg bg-indigo-50/80 px-2.5 py-2 text-indigo-900">
          <BookOpen className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-500" strokeWidth={2} />
          <span className="leading-tight">
            <span className="font-bold">Built by a reading specialist.</span>{" "}
            Jen — certified, K-3 classroom teacher.
          </span>
        </div>
        <div className="flex items-start gap-1.5 rounded-lg bg-emerald-50/80 px-2.5 py-2 text-emerald-900">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" strokeWidth={2} />
          <span className="leading-tight">
            <span className="font-bold">COPPA + FERPA safe.</span>{" "}
            No third-party ads. Your kid's data stays yours.
          </span>
        </div>
      </div>

      <GoogleButton role={role} />
      <Divider />
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
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.confirmPassword}
          required
        />
        <TosCheckbox
          checked={tosAccepted}
          onChange={setTosAccepted}
          role={role}
        />
        <button
          type="submit"
          disabled={!tosAccepted || isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-violet-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-indigo-900">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-indigo-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
