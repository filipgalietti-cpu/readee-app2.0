interface AuthCardProps {
  title: string;
  banner?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, banner, children }: AuthCardProps) {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {banner && (
          <div className="mb-4 text-center">
            <span className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-bold shadow-md">
              {banner}
            </span>
          </div>
        )}
        <div className="bg-white p-8 rounded-2xl border-2 border-purple-300 shadow-lg">
          <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}
