"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-purple-700">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-orange-600 font-medium hover:underline"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <span className="sr-only">Loading login page</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
