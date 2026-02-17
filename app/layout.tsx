import ClientProviders from "./_components/ClientProviders";
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavAuth from "./_components/NavAuth";

export const metadata: Metadata = {
  title: "Readee",
  description: "Early reading, done right",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
<ClientProviders>
        <NavAuth />

        {/* Page content */}
        <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#1e1b4b] mt-auto">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <span className="font-extrabold tracking-tight text-lg">
                  <span className="text-white">READ</span><span className="text-indigo-300">EE</span>
                </span>
                <span className="hidden sm:block w-px h-5 bg-indigo-700" />
                <p className="text-sm text-indigo-300">
                  Helping every child become a confident reader.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-5 text-sm">
                <Link href="/about" className="text-indigo-300 hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/contact-us" className="text-indigo-300 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link href="/privacy-policy" className="text-indigo-300 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms-of-service" className="text-indigo-300 hover:text-white transition-colors">
                  Terms
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-indigo-800 text-center text-sm text-indigo-400">
              <p>&copy; {new Date().getFullYear()} Readee. All rights reserved.</p>
            </div>
          </div>
        </footer>
</ClientProviders>
      </body>
    </html>
  );
}
