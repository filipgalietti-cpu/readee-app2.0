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
      <body className="antialiased">
<ClientProviders>
        {/* Navbar */}
        <nav className="border-b-2 border-purple-300 bg-gradient-to-r from-yellow-100 to-pink-100">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold text-purple-700">
              Readee 📚
            </Link>

<<div className="flex items-center gap-6">
  <Link
    href="/path"
    className="text-sm text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
  >
    Learning Path
  </Link>

  <Link
    href="/library"
    className="text-sm text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
  >
    Library
  </Link>

  <Link
    href="/about"
    className="text-sm text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
  >
    About
  </Link>
</div>
              <NavAuth />
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
</ClientProviders>
      </body>
    </html>
  );
}
