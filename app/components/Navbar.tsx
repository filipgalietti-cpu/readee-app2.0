import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b-2 border-purple-300 bg-gradient-to-r from-yellow-100 to-pink-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-purple-700">
              Readee 📚
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-purple-700 hover:text-orange-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-purple-700 hover:text-orange-600 transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/login"
              className="text-purple-700 hover:text-orange-600 transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-white font-medium hover:from-orange-600 hover:to-pink-600 transition-all shadow-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
