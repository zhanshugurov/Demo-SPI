'use client';

import { useState, useEffect } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';

export default function ActualsTable() {
  const { currentLocation, locations } = usePlanningStore();
  const plan = locations[currentLocation]?.customers ?? [];

  const [actuals, setActuals] = useState(() =>
    plan.map((p) => ({ ...p }))
  );

  // Если в плане поменялась локация или данные — обновляем actuals
  useEffect(() => {
    setActuals(plan.map((p) => ({ ...p })));
  }, [plan]);

  const updateValue = (i: number, field: 'mon' | 'wed' | 'fri', value: number) => {
    const updated = [...actuals];
    updated[i][field] = value;
    setActuals(updated);
  };

  const totals = actuals.reduce(
    (a, c) => ({
      mon: a.mon + c.mon,
      wed: a.wed + c.wed,
      fri: a.fri + c.fri,
    }),
    { mon: 0, wed: 0, fri: 0 }
  );

  const variances = actuals.map((a, i) => {
    const p = plan[i];
    if (!p) return 0; // защита от undefined
    const planTotal = p.mon + p.wed + p.fri;
    const actTotal = a.mon + a.wed + a.fri;
    return actTotal - planTotal;
  });

  const totalVariance = variances.reduce((a, c) => a + c, 0);

  // сохраняем данные в localStorage
  useEffect(() => {
    localStorage.setItem(`actuals-${currentLocation}`, JSON.stringify(actuals));
  }, [actuals, currentLocation]);

  useEffect(() => {
    if (plan.length > 0) {
      setActuals(plan.map((p) => ({ ...p })));
    }
  }, [plan]);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white transition-all hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">Customer</th>
              <th className="p-3 text-right font-semibold">Mon/Tue</th>
              <th className="p-3 text-right font-semibold">Wed/Thu</th>
              <th className="p-3 text-right font-semibold">Fri</th>
              <th className="p-3 text-right font-semibold">Total</th>
              <th className="p-3 text-right font-semibold">Variance</th>
            </tr>
          </thead>

          <tbody>
            {actuals.map((c, i) => {
              const total = c.mon + c.wed + c.fri;
              const variance = variances[i];

              const p = plan[i];
              if (!p) return null;

              return (
                <tr
                  key={c.name}
                  className="transition-all hover:bg-gray-50 border-t border-gray-100"
                >
                  <td className="p-3 font-medium text-gray-800">{c.name}</td>

                  {(['mon', 'wed', 'fri'] as const).map((field) => (
                    <td key={field} className="p-3 text-right">
                      <input
                        type="number"
                        value={c[field]}
                        onChange={(e) =>
                          updateValue(i, field, Number(e.target.value) || 0)
                        }
                        className={`w-20 text-right rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none p-1.5 transition-all duration-200
                          ${c[field] !== plan[i][field] ? 'bg-yellow-50 border-yellow-300' : ''}
                        `}
                      />
                    </td>
                  ))}

                  <td className="p-3 text-right text-gray-600 font-medium">
                    {total}
                  </td>
                  <td
                    className={`p-3 text-right font-semibold transition-all duration-300 ${variance > 0
                      ? 'text-green-600'
                      : variance < 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                      }`}
                  >
                    {variance >= 0 ? '+' : ''}
                    {variance}
                  </td>
                </tr>
              );
            })}

            <tr className="bg-gray-50 font-semibold text-gray-800 border-t border-gray-200">
              <td className="p-3">TOTALS</td>
              <td className="p-3 text-right">{totals.mon}</td>
              <td className="p-3 text-right">{totals.wed}</td>
              <td className="p-3 text-right">{totals.fri}</td>
              <td className="p-3 text-right">
                {totals.mon + totals.wed + totals.fri}
              </td>
              <td
                className={`p-3 text-right ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {totalVariance >= 0 ? '+' : ''}
                {totalVariance}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 text-sm text-gray-500 italic bg-gray-50 border-t border-gray-100">
        Actual values are initialized from plan — adjust only if actuals differ.
      </div>
    </div>
  );
}
