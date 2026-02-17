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
        <footer className="bg-zinc-50 border-t border-zinc-200 mt-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="col-span-2 md:col-span-1">
                <div className="mb-3 font-extrabold tracking-tight">
                  <span className="text-indigo-700">READ</span><span className="text-indigo-400">EE</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Early reading, done right.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Programs</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/about" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/teachers" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      For Educators
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Get Started</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/signup" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Log In
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/privacy-policy" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Contact</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="mailto:hello@readee.app" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      hello@readee.app
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-sm text-zinc-600">
              &copy; {new Date().getFullYear()} Readee. All rights reserved.
            </div>
          </div>
        </footer>
</ClientProviders>
      </body>
    </html>
  );
}
