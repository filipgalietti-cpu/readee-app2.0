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
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <div className="mb-3 font-extrabold tracking-tight text-lg">
                  <span className="text-white">READ</span><span className="text-indigo-300">EE</span>
                </div>
                <p className="text-sm text-indigo-200">
                  Helping every child become a confident reader, ages 4–9.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Programs</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/about" className="text-indigo-200 hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/teachers" className="text-indigo-200 hover:text-white transition-colors">
                      For Educators
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/contact-us" className="text-indigo-200 hover:text-white transition-colors">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Get Started</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/signup" className="text-indigo-200 hover:text-white transition-colors">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-indigo-200 hover:text-white transition-colors">
                      Log In
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-indigo-300">
              <p>&copy; {new Date().getFullYear()} Readee. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
</ClientProviders>
      </body>
    </html>
  );
}
