'use client';

import { usePlanningStore } from '@/store/usePlanningStore';
import { motion } from 'framer-motion';

export default function LocationSelector() {
  const {
    currentLocation,
    setLocation,
    transferDrivers,
    locations,
  } = usePlanningStore();

  const otherLocation = currentLocation === 'toronto' ? 'montreal' : 'toronto';

  // Обновляем store напрямую
  const handleTransfer = () => {
    usePlanningStore.setState((state) => {
      const from = state.currentLocation;
      const to = from === 'toronto' ? 'montreal' : 'toronto';

      // Сколько можно перевести
      const transferCount = Math.min(state.transferDrivers, 5);

      // Обновляем количество водителей в обеих локациях
      const updated = {
        ...state.locations,
        [from]: {
          ...state.locations[from],
          drivers_total: Math.max(0, state.locations[from].drivers_total - transferCount),
        },
        [to]: {
          ...state.locations[to],
          drivers_total: state.locations[to].drivers_total + transferCount,
        },
      };

      return {
        locations: updated,
        currentLocation: to,
        transferDrivers: Math.max(0, state.transferDrivers - transferCount),
      };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 shadow-sm rounded-lg"
    >
      {/* Левая часть */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="font-medium text-gray-700">Location:</label>
        <select
          value={currentLocation}
          onChange={(e) => setLocation(e.target.value as 'toronto' | 'montreal')}
          className="border border-gray-300 bg-white rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
        >
          <option value="toronto">Toronto</option>
          <option value="montreal">Montreal</option>
        </select>

        <div className="text-gray-600 text-sm">
          <span className="font-medium text-gray-800">Capacity:</span>{' '}
          {locations[currentLocation]?.capacity ?? '--'} |{' '}
          <span className="font-medium text-gray-800">Drivers:</span>{' '}
          {locations[currentLocation]?.drivers_total ?? '--'}
        </div>
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-3 mt-3 sm:mt-0">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>Driver Transfer:</span>
          <input
            type="number"
            value={transferDrivers}
            readOnly
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-right bg-gray-50 text-gray-700 focus:outline-none"
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={transferDrivers <= 0}
          className={`font-medium text-sm underline underline-offset-4 transition-all ${transferDrivers > 0
              ? 'text-blue-600 hover:text-blue-700'
              : 'text-gray-400 cursor-not-allowed'
            }`}
        >
          {currentLocation === 'toronto'
            ? 'Transfer to Montreal →'
            : '← Transfer to Toronto'}
        </button>
      </div>
    </motion.div>
  );
}
