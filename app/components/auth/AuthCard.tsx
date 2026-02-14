import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AuthCard({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-10">
      {/* Premium background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-24 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 blur-3xl opacity-50" />
        <div className="absolute left-1/2 top-40 h-[260px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-200 via-indigo-200 to-purple-200 blur-3xl opacity-40" />
      </div>

      <div className="w-full max-w-md">
<<<<<<< Updated upstream
        <div className="bg-white p-8 rounded-2xl border-2 border-purple-300 shadow-lg">
          <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">
            {title}
          </h1>
          {children}
=======
        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
          {/* Top accent */}
          <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900" />

          <div className="px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
              ) : null}
            </div>

            <div className="mt-7">{children}</div>
          </div>
>>>>>>> Stashed changes
        </div>

        {/* Small helper text area if you want later */}
        {/* <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </p> */}
      </div>
    </div>
  );
}