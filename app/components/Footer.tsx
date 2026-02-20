import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-3 text-sm font-medium text-gray-400">
          <Link href="/dashboard" className="hover:text-gray-200 transition-colors">Dashboard</Link>
          <span className="text-gray-600">|</span>
          <Link href="/analytics" className="hover:text-gray-200 transition-colors">Analytics</Link>
          <span className="text-gray-600">|</span>
          <Link href="/feedback" className="hover:text-gray-200 transition-colors">Feedback</Link>
          <span className="text-gray-600">|</span>
          <Link href="/contact-us" className="hover:text-gray-200 transition-colors">Help & Support</Link>
        </div>
        <p className="text-center text-sm text-gray-400 font-medium">
          © {new Date().getFullYear()} Readee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
