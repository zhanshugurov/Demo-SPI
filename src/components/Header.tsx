'use client';

import { useRouter, usePathname } from 'next/navigation';
import { usePlanningStore } from '@/store/usePlanningStore';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const path = usePathname();

  const isPlanning = path.includes('planning');
  const isActuals = path.includes('actuals');

  const { currentWeek, setWeek } = usePlanningStore();

  // переход по неделям
  const handlePrevWeek = () => {
    if (currentWeek > 1) setWeek(currentWeek - 1);
  };

  const handleNextWeek = () => {
    setWeek(currentWeek + 1);
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 sticky top-0 z-10 shadow-sm transition-all gap-3 sm:gap-0">
      {/* Левая часть */}
      <div className='flex items-center gap-4'>
        {/* <Image
          src="/logo.png"
          alt="Logo"
          width={365}
          height={60}
          className="inline-block"
        /> */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800">
              WEEK {currentWeek} —{' '}
              <span className="text-blue-600">
                {isPlanning ? 'CAPACITY PLANNING' : 'ACTUALS TRACKING'}
              </span>
            </h1>

            {/* Навигация по неделям */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevWeek}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                title="Previous week"
              >
                ‹
              </button>

              <input
                type="number"
                value={currentWeek}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-14 text-center border border-gray-300 rounded-md text-sm px-1 py-0.5 text-gray-700 focus:ring-1 focus:ring-blue-200 focus:border-blue-400"
              />

              <button
                onClick={handleNextWeek}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                title="Next week"
              >
                ›
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            {isPlanning
              ? 'Plan weekly capacities and allocate across customers'
              : 'Track performance and analyze plan vs actual variances'}
          </p>
        </div>
      </div>

      {/* Правая часть */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.push('/planning')}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border ${isPlanning
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
        >
          Planning
        </button>

        <button
          onClick={() => router.push('/actuals')}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border ${isActuals
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
