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
        <nav className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold">
              Readee
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/about">About</Link>
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
