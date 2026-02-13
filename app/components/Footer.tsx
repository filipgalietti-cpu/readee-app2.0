export default function Footer() {
  return (
    <footer className="border-t-2 border-purple-300 bg-gradient-to-r from-yellow-100 to-pink-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-purple-600 font-medium">
          © {new Date().getFullYear()} Readee. All rights reserved. 🎉
        </p>
      </div>
    </footer>
  );
}
