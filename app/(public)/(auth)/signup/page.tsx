"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/app/components/auth/AuthLayout";
import FormField from "@/app/components/auth/FormField";
import GoogleButton from "@/app/components/auth/GoogleButton";
import Divider from "@/app/components/auth/Divider";
import TosCheckbox from "@/app/components/auth/TosCheckbox";
import { CURRENT_TOS_VERSION } from "@/lib/tos";
import { GraduationCap, Heart } from "lucide-react";

const CTA_BTN =
  "w-full bg-indigo-700 text-white py-3.5 rounded-full font-extrabold text-base shadow-[0_8px_20px_-8px_rgba(67,56,202,0.5)] hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
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
  // B2C-only product — the teacher toggle and educator routing are kept as an
  // escape hatch for B2B / school sales links (`/signup?as=teacher`), but the
  // toggle UI is hidden for the default visitor.
  const showRoleToggle = searchParams.get("as") === "teacher";
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  // Keep role state in sync if the user changes the URL ?as= param.
  useEffect(() => {
    const paramRole: "parent" | "educator" =
      searchParams.get("as") === "teacher" ? "educator" : "parent";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(paramRole);
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Use at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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
          // The handle_new_user Postgres trigger reads this `role` hint and
          // stamps the new profiles row accordingly.
          data: { role },
        },
      });

      if (error) {
        setErrors({ general: error.message });
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // identities empty → the email is already registered.
        if (data.user.identities && data.user.identities.length === 0) {
          setErrors({ general: "This email is already registered. Please sign in instead." });
          setIsLoading(false);
        } else {
          // Stash ToS consent for TosGate to pick up after login.
          localStorage.setItem(
            "readee-tos-consent",
            JSON.stringify({
              tos_accepted_at: new Date().toISOString(),
              tos_version: CURRENT_TOS_VERSION,
            }),
          );
          router.push("/login?message=Account created! Check your email to confirm, then sign in.");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrors({ general: msg });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <AuthLayout mode="signup">
      <h1 className="font-[family-name:var(--font-baloo)] font-extrabold text-3xl text-indigo-950 text-center">
        Create your account
      </h1>
      <p className="text-[15px] text-zinc-600 mt-1.5 mb-6 text-center">
        {role === "educator" ? "Teacher signup — free to start." : "Let the learning begin!"}
      </p>

      {/* Parent / Teacher toggle — only when the URL opted into the teacher
          path (?as=teacher), so the default consumer flow is parent-only. */}
      {showRoleToggle && (
        <div className="mb-5 grid grid-cols-2 gap-2">
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
      )}

      <GoogleButton role={role} />
      <Divider />
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
        <FormField
          id="password"
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="8+ characters"
          error={errors.password}
          required
        />
        <TosCheckbox checked={tosAccepted} onChange={setTosAccepted} role={role} />
        <button type="submit" disabled={!tosAccepted || isLoading} className={CTA_BTN}>
          {isLoading ? "Creating account…" : "Start for free"}
        </button>
      </form>
    </AuthLayout>
  );
}
