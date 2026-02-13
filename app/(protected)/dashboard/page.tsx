export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Dashboard 🎉</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-300">
        <p className="text-purple-700 text-lg">
          Welcome to your dashboard! This is a protected route.
        </p>
      </div>
    </div>
  );
}
