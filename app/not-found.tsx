import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Page not found</h2>
      <p className="text-zinc-600 mb-8 max-w-md">
        We couldn&apos;t find the page you&apos;re looking for. It may have been moved or no longer
        exists.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
