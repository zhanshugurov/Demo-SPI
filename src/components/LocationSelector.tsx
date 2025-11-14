'use client';

import { usePlanningStore } from '@/store/usePlanningStore';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function LocationSelector() {
  const {
    currentWeek,
    currentLocation,
    setLocation,
    weeks,
    updateCapacity,
    updateDrivers,
  } = usePlanningStore();

  const weekData = weeks[currentWeek];
  const locations = weekData?.locations || {};
  const locationData = locations[currentLocation];
  const otherLocation = currentLocation === 'toronto' ? 'montreal' : 'toronto';

  // 🧮 Перемещение водителей
  const handleTransfer = () => {
    usePlanningStore.setState((state) => {
      const week = state.weeks[state.currentWeek];
      if (!week) return state;

      const from = state.currentLocation;
      const to = from === 'toronto' ? 'montreal' : 'toronto';
      const transferCount = Math.min(week.transferDrivers, 5);

      const updatedWeek = {
        ...week,
        transferDrivers: Math.max(0, week.transferDrivers - transferCount),
        locations: {
          ...week.locations,
          [from]: {
            ...week.locations[from],
            drivers_total: Math.max(0, week.locations[from].drivers_total - transferCount),
          },
          [to]: {
            ...week.locations[to],
            drivers_total: week.locations[to].drivers_total + transferCount,
          },
        },
      };

      return {
        ...state,
        currentLocation: to,
        weeks: {
          ...state.weeks,
          [state.currentWeek]: updatedWeek,
        },
      };
    });
  };

  if (!locationData) return null;

  const customers = locationData.customers;
  const actuals = weekData?.actuals?.[currentLocation] ?? [];

  const totals = customers.reduce(
    (a, c) => ({
      vol: a.vol + c.vol,
      init: a.init + c.init,
      mon: a.mon + c.mon,
      wed: a.wed + c.wed,
      fri: a.fri + c.fri,
    }),
    { vol: 0, init: 0, mon: 0, wed: 0, fri: 0 }
  );

  const actualTotals = (actuals ?? []).reduce(
    (a, c) => ({
      mon: a.mon + (c.mon || 0),
      wed: a.wed + (c.wed || 0),
      fri: a.fri + (c.fri || 0),
    }),
    { mon: 0, wed: 0, fri: 0 }
  );

  return (
    <motion.div
      className='flex flex-col gap-0 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm rounded-2xl'
    >
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-3"
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

          {/* Capacity + Drivers */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-800">Capacity:</span>
              <input
                type="number"
                value={locationData.capacity}
                onChange={(e) => updateCapacity(Number(e.target.value))}
                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-right text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-800">Drivers:</span>
              <input
                type="number"
                value={locationData.drivers_total}
                onChange={(e) => updateDrivers(Number(e.target.value))}
                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-right text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Driver Transfer:</span>
            <input
              type="number"
              value={weekData?.transferDrivers ?? 0}
              readOnly
              className="w-20 border border-gray-300 rounded-md px-2 py-1 text-right bg-gray-50 text-gray-700 focus:outline-none"
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={!weekData || weekData.transferDrivers <= 0}
            className={`font-medium text-sm underline underline-offset-4 transition-all ${weekData && weekData.transferDrivers > 0
              ? 'text-blue-600 hover:text-blue-700'
              : 'text-gray-400 cursor-not-allowed'
              }`}
          >
            {currentLocation === 'toronto'
              ? 'Transfer to Montreal →'
              : '← Transfer to Toronto'}
          </button>
        </div>
      </div>
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-3"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-800">Current Initial Capacity:</span>
              <span className='border border-gray-300 rounded-md bg-gray-100 px-2 py-1 text-center text-gray-700'>{totals.init}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-800">Current Planned Capacity:</span>
              <span className='border border-gray-300 rounded-md bg-gray-100 px-2 py-1 text-center text-gray-700'>{totals.mon + totals.wed + totals.fri}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-800">Current Actual Capacity:</span>
              <span className='border border-gray-300 rounded-md bg-gray-100 px-2 py-1 text-center text-gray-700'>{actualTotals.mon + actualTotals.wed + actualTotals.fri}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
