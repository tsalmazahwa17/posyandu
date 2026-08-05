export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-5">
          <div className="relative w-14 h-14">
            <div className="w-14 h-14 rounded-full border-4 border-blue-100 absolute"></div>
            <div className="w-14 h-14 rounded-full border-4 border-transparent border-t-blue-600 animate-spin absolute"></div>
          </div>
        </div>

        {/* Pulse skeleton bar */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="h-3 w-36 bg-blue-100 rounded-full animate-pulse"></div>
          <div className="h-3 w-24 bg-blue-50 rounded-full animate-pulse"></div>
        </div>

        <p className="mt-5 text-sm font-medium text-gray-400 animate-pulse">
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}
