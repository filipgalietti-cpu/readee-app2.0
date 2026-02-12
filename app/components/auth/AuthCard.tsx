interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}
