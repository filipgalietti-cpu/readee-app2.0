"use client";

import { useState, useEffect } from "react";

interface AuthCardProps {
  title: string;
  banner?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, banner, children }: AuthCardProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setShowBanner(true), 1500);
    return () => clearTimeout(timer);
  }, [banner]);

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div
          className={`mb-4 text-center transition-all duration-500 ease-out ${
            showBanner
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        >
          {banner && (
            <span className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold shadow-md">
              {banner}
            </span>
          )}
        </div>
        <div className="bg-white p-8 rounded-2xl border-2 border-purple-300 shadow-lg">
          <img src="/readee-logo.png" alt="Readee - Learn to Read" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}
