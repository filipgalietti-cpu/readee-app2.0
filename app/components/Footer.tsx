import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t-2 border-purple-300 bg-gradient-to-r from-yellow-100 to-pink-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-3 text-sm font-medium text-purple-700">
          <Link href="/dashboard" className="hover:text-purple-900 transition-colors">Dashboard</Link>
          <span className="text-purple-300">|</span>
          <Link href="/analytics" className="hover:text-purple-900 transition-colors">Analytics</Link>
          <span className="text-purple-300">|</span>
          <Link href="/feedback" className="hover:text-purple-900 transition-colors">Feedback</Link>
          <span className="text-purple-300">|</span>
          <Link href="/contact-us" className="hover:text-purple-900 transition-colors">Help & Support</Link>
        </div>
        <p className="text-center text-sm text-purple-600 font-medium">
          © {new Date().getFullYear()} Readee. All rights reserved. 🎉
        </p>
      </div>
    </footer>
  );
}
