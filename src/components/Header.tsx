'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function Header({ week }: { week: number }) {
  const router = useRouter();
  const path = usePathname();

  const isPlanning = path.includes('planning');
  const isActuals = path.includes('actuals');

  return (
    <header className="flex justify-between items-center bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 sticky top-0 z-10 shadow-sm transition-all">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          WEEK {week} —{' '}
          <span className="text-blue-600">
            {isPlanning ? 'CAPACITY PLANNING' : 'ACTUALS TRACKING'}
          </span>
        </h1>
        <p className="text-sm text-gray-500">
          {isPlanning
            ? 'Plan weekly capacities and allocate across customers'
            : 'Track performance and analyze plan vs actual variances'}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.push('/planning')}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border
            ${isPlanning
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
        >
          Planning
        </button>

        <button
          onClick={() => router.push('/actuals')}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border
            ${isActuals
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
        >
          Actuals
        </button>

        <button
          onClick={() => alert('Saved!')}
          className="px-4 py-2 rounded-md text-sm cursor-pointer font-medium bg-green-600 text-white hover:bg-green-700 shadow-sm active:scale-[0.98] transition-all"
        >
          Save
        </button>
      </div>
    </header>
  );
}
