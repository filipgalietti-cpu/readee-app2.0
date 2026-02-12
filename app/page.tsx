export default function Home() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="max-w-3xl px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Readee
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your personal reading companion. Discover, track, and enjoy your reading journey.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/about"
            className="rounded-lg bg-gray-900 px-6 py-3 text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Learn More
          </a>
          <a
            href="/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
