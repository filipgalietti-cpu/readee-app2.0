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
        {/* Navbar */}
<nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-sm">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <Link
      href="/"
      className="flex items-center gap-2 text-xl font-bold text-zinc-900 hover:opacity-80 transition-opacity"
    >
      <span className="text-2xl">📚</span>
      <span>Readee</span>
    </Link>

    <div className="flex items-center gap-6">
      <Link
        href="/library"
        className="text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
      >
        Library
      </Link>

      <Link
        href="/about"
        className="text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
      >
        About
      </Link>
    </div>
  </div>
</nav>
              <NavAuth />
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-zinc-50 border-t border-zinc-200 mt-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📚</span>
                  <span className="font-bold text-zinc-900">Readee</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Making reading fun for early learners
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/library" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Story Library
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                      About
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-3">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-zinc-600">Help Center</li>
                  <li className="text-zinc-600">Parent Resources</li>
                  <li className="text-zinc-600">Privacy Policy</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-sm text-zinc-600">
              © {new Date().getFullYear()} Readee. All rights reserved.
            </div>
          </div>
        </footer>
</ClientProviders>
      </body>
    </html>
  );
}
