import ClientProviders from "./_components/ClientProviders";
import PageTransition from "./_components/PageTransition";
import JsonLd from "./_components/JsonLd";
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
    "Readee helps children in K through 4th grade build reading comprehension skills with standards-aligned practice and the Science of Reading.",
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
      "Readee helps children in K through 4th grade build reading comprehension skills with standards-aligned practice and the Science of Reading.",
    url: "https://learn.readee.app",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Readee" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Readee — Unlock Reading",
    description:
      "Readee helps children in K through 4th grade build reading comprehension skills with standards-aligned practice and the Science of Reading.",
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
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <span className="text-xl font-extrabold tracking-tight text-white">read<span className="text-indigo-300">ee</span></span>
                <span className="hidden sm:block w-px h-5 bg-gray-500" />
                <span className="text-sm text-gray-300">
                  Helping every child become a confident reader.
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-5 text-sm">
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/contact-us" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/feedback" className="text-gray-300 hover:text-white transition-colors">
                  Feedback
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-500 text-center">
              <span className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Readee. All rights reserved.</span>
            </div>
          </div>
        </footer>
</ClientProviders>
      </body>
    </html>
  );
}
