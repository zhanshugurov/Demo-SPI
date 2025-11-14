'use client';

import { useEffect } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';

export default function WorkOrdersTable() {
  const {
    currentWeek,
    currentLocation,
    weeks,
    setWorkOrders,
    updateWorkOrder,
  } = usePlanningStore();

  const weekData = weeks[currentWeek];
  const plan = weekData?.locations?.[currentLocation]?.customers ?? [];
  const workOrders = weekData?.workOrders?.[currentLocation] ?? [];

  // Если нет workOrders для этой недели и локации — инициализируем их планом
  useEffect(() => {
    if (plan.length > 0 && (!weekData.workOrders || !weekData.workOrders[currentLocation])) {
      setWorkOrders(plan.map((p) => ({ ...p })));
    }
  }, [currentWeek, currentLocation, plan]);

  const handleChange = (index: number, field: 'mon' | 'wed' | 'fri', value: number) => {
    updateWorkOrder(index, field, value);
  };

  const totals = (workOrders ?? []).reduce(
    (a, c) => ({
      mon: a.mon + (c.mon || 0),
      wed: a.wed + (c.wed || 0),
      fri: a.fri + (c.fri || 0),
    }),
    { mon: 0, wed: 0, fri: 0 }
  );

  const variances = (workOrders ?? []).map((a, i) => {
    const p = plan[i];
    if (!p) return 0;
    const planTotal = (p.mon || 0) + (p.wed || 0) + (p.fri || 0);
    const actTotal = (a.mon || 0) + (a.wed || 0) + (a.fri || 0);
    return actTotal - planTotal;
  });

  const totalVariance = variances.reduce((a, c) => a + c, 0);

  if (!plan.length) {
    return (
      <div className="mt-6 text-gray-500 italic">
        No plan data available for this location/week.
      </div>
    );
  }

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
            {workOrders.map((c, i) => {
              const total = (c.mon || 0) + (c.wed || 0) + (c.fri || 0);
              const variance = variances[i] ?? 0;
              const p = plan[i];

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
                          handleChange(i, field, Number(e.target.value) || 0)
                        }
                        className={`w-20 text-right rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none p-1.5 transition-all duration-200
                          ${p && c[field] !== p[field]
                            ? 'bg-yellow-50 border-yellow-300'
                            : ''
                          }
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

      {/* <div className="p-4 text-sm text-gray-500 italic bg-gray-50 border-t border-gray-100">
        Actual values are stored per week and location — initialized from plan.
      </div> */}
    </div>
  );
}
