'use client';

import { usePlanningStore } from '@/store/usePlanningStore';

export default function PlanningTable() {
  const { currentLocation, locations, updateValue } = usePlanningStore();

  const customers = locations[currentLocation]?.customers ?? [];

  const totals = customers.reduce(
    (a, c) => ({
      init: a.init + c.init,
      mon: a.mon + c.mon,
      wed: a.wed + c.wed,
      fri: a.fri + c.fri,
    }),
    { init: 0, mon: 0, wed: 0, fri: 0 }
  );

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white transition-all hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">Customer</th>
              <th className="p-3 text-right font-semibold">Vol%</th>
              <th className="p-3 text-right font-semibold">Initial</th>
              <th className="p-3 text-right font-semibold">Mon/Tue</th>
              <th className="p-3 text-right font-semibold">Wed/Thu</th>
              <th className="p-3 text-right font-semibold">Fri</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c, i) => (
              <tr
                key={c.name}
                className="transition-all hover:bg-gray-50 border-t border-gray-100"
              >
                <td className="p-3 font-medium text-gray-800">{c.name}</td>
                <td className="p-3 text-right text-gray-500 font-medium">
                  {c.vol}%
                </td>

                {(['init', 'mon', 'wed', 'fri'] as const).map((field) => (
                  <td key={field} className="p-3 text-right">
                    <input
                      type="number"
                      value={c[field]}
                      onChange={(e) =>
                        updateValue(i, field, Number(e.target.value) || 0)
                      }
                      className="w-20 text-right rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none p-1.5 transition-all duration-200"
                    />
                  </td>
                ))}
              </tr>
            ))}

            <tr className="bg-gray-50 font-semibold text-gray-800 border-t border-gray-200">
              <td className="p-3">TOTALS</td>
              <td className="p-3 text-right text-gray-600">100%</td>
              <td className="p-3 text-right text-gray-600">{totals.init}</td>
              <td className="p-3 text-right text-gray-600">{totals.mon}</td>
              <td className="p-3 text-right text-gray-600">{totals.wed}</td>
              <td className="p-3 text-right text-gray-600">{totals.fri}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => localStorage.removeItem('planning-data')}
          className="text-gray-600 text-sm font-medium underline underline-offset-4 hover:text-gray-800 transition-colors"
        >
          Reset
        </button>

        <button
          onClick={() => alert('Saved! (persisted automatically)')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-all active:scale-[0.98]"
        >
          Save Planning
        </button>
      </div>
    </div>
  );
}
