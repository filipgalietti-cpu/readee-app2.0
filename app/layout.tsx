import ClientProviders from "./_components/ClientProviders";
import PageTransition from "./_components/PageTransition";
import JsonLd from "./_components/JsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import NavAuth from "./_components/NavAuth";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://learn.readee.app"),
  title: { default: "Readee", template: "%s | Readee" },
  description:
    "Fun, science-backed reading for K–4th grade.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Readee",
    title: "Readee — Unlock Reading",
    description:
      "Fun, science-backed reading for K–4th grade.",
    url: "https://learn.readee.app",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Readee" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Readee — Unlock Reading",
    description:
      "Fun, science-backed reading for K–4th grade.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
<ClientProviders>
        <NavAuth />

        {/* Page content */}
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-8">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Footer */}
        <footer className="bg-[#1e1b4b] mt-auto">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 pt-14 pb-8">
            {/* ── Top: columns ── */}
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-6">
              {/* Brand column */}
              <div className="col-span-2 sm:col-span-4 lg:col-span-2 mb-4 lg:mb-0">
                <span className="text-2xl font-extrabold tracking-tight text-white">read<span className="text-indigo-300">ee</span></span>
                <p className="mt-2 text-lg font-bold text-white">Unlock Reading</p>
                <p className="mt-1 text-sm text-white leading-relaxed max-w-[220px]">
                  Helping every child become a confident reader.
                </p>
                {/* Socials */}
                <div className="flex items-center gap-3 mt-5">
                  <a href="https://instagram.com/readeeapp" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-white hover:bg-white/[0.12] hover:text-indigo-300 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a href="https://facebook.com/readeeapp" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-white hover:bg-white/[0.12] hover:text-indigo-300 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://twitter.com/readeeapp" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-white hover:bg-white/[0.12] hover:text-indigo-300 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://tiktok.com/@readeeapp" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-white hover:bg-white/[0.12] hover:text-indigo-300 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  </a>
                </div>
              </div>

              {/* Product */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Product</h4>
                <ul className="space-y-2.5">
                  <li><Link href="/dashboard" className="text-sm text-white hover:text-indigo-300 transition-colors">Dashboard</Link></li>
                  <li><Link href="/practice" className="text-sm text-white hover:text-indigo-300 transition-colors">Practice</Link></li>
                  <li><Link href="/stories" className="text-sm text-white hover:text-indigo-300 transition-colors">Stories</Link></li>
                  <li><Link href="/leaderboard" className="text-sm text-white hover:text-indigo-300 transition-colors">Leaderboard</Link></li>
                  <li><Link href="/upgrade" className="text-sm text-white hover:text-indigo-300 transition-colors">Pricing</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Company</h4>
                <ul className="space-y-2.5">
                  <li><Link href="/about" className="text-sm text-white hover:text-indigo-300 transition-colors">About</Link></li>
                  <li><Link href="/contact-us" className="text-sm text-white hover:text-indigo-300 transition-colors">Contact</Link></li>
                  <li><Link href="/blog" className="text-sm text-white hover:text-indigo-300 transition-colors">Blog</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Support</h4>
                <ul className="space-y-2.5">
                  <li><Link href="/contact-us" className="text-sm text-white hover:text-indigo-300 transition-colors">Help Center</Link></li>
                  <li><Link href="/privacy-policy" className="text-sm text-white hover:text-indigo-300 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="text-sm text-white hover:text-indigo-300 transition-colors">Terms of Service</Link></li>
                  <li><Link href="/feedback" className="text-sm text-white hover:text-indigo-300 transition-colors">Feedback</Link></li>
                </ul>
              </div>

              {/* Mobile */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Mobile</h4>
                <div className="space-y-2">
                  <div className="h-9 px-3 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center gap-2 text-white text-xs font-medium w-fit">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    App Store
                  </div>
                  <div className="h-9 px-3 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center gap-2 text-white text-xs font-medium w-fit">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.04l2.651 1.535c.9.521.9 1.075 0 1.596l-2.651 1.535-2.535-2.535 2.535-2.131zM5.864 3.469L16.8 9.802l-2.302 2.302-8.634-8.635z"/></svg>
                    Google Play
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="mt-10 pt-6 border-t border-white/[0.08]">
              <span className="text-xs text-white">&copy; {new Date().getFullYear()} Readee. All rights reserved.</span>
            </div>
          </div>
        </footer>
</ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
