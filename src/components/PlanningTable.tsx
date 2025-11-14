'use client';

import { useState } from 'react';
import { usePlanningStore } from '@/store/usePlanningStore';

export default function PlanningTable() {
  const {
    currentWeek,
    currentLocation,
    weeks,
    addCustomer,
    removeCustomer,
    updateCustomer,
  } = usePlanningStore();

  const week = weeks[currentWeek];
  const location = week.locations[currentLocation];
  const customers = location.customers;

  const totals = customers.reduce(
    (a, c) => ({
      forecast: a.forecast + c.forecast,
      vol: a.vol + c.vol,
      init: a.init + c.init,
      mon: a.mon + c.mon,
      wed: a.wed + c.wed,
      fri: a.fri + c.fri,
    }),
    { forecast: 0, vol: 0, init: 0, mon: 0, wed: 0, fri: 0 }
  );

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    forecast: 0,
    vol: 0,
    init: 0,
    mon: 0,
    wed: 0,
    fri: 0,
  });

  // =====================
  // Валидации
  // =====================
  const overVol = totals.vol > 100;
  const initOverCapacity =
    totals.init > location.capacity;
  const overCapacity =
    totals.mon + totals.wed + totals.fri > location.capacity;

  // =====================
  // Добавление клиента
  // =====================
  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) return alert('Enter customer name');
    if (totals.vol + newCustomer.vol > 100)
      return alert('Vol% total cannot exceed 100');
    addCustomer({ ...newCustomer });
    setNewCustomer({ name: '', forecast: 0, vol: 0, init: 0, mon: 0, wed: 0, fri: 0 });
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white transition-all hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">Customer</th>
              <th className="p-3 text-right font-semibold">Customer Forecast</th>
              <th className="p-3 text-right font-semibold">Vol%</th>
              <th className="p-3 text-right font-semibold">Initial</th>
              <th className="p-3 text-right font-semibold">Mon/Tue</th>
              <th className="p-3 text-right font-semibold">Wed/Thu</th>
              <th className="p-3 text-right font-semibold">Fri</th>
              <th className="p-3 text-center font-semibold w-[100px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c, i) => (
              <tr key={i} className="transition-all hover:bg-gray-50 border-t border-gray-100">
                <td className="p-3 font-medium text-gray-800">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateCustomer(i, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-gray-200 focus:border-blue-400 focus:ring-0 outline-none text-sm"
                  />
                </td>

                {(['forecast', 'vol', 'init', 'mon', 'wed', 'fri'] as const).map((field) => (
                  <td key={field} className="p-3 text-right">
                    <input
                      type="number"
                      value={c[field]}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0;
                        if (field === 'vol' && totals.vol - c.vol + value > 100) {
                          alert('Vol% total cannot exceed 100');
                          return;
                        }
                        updateCustomer(i, field, value);
                      }}
                      className="w-20 text-right rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none p-1.5 transition-all duration-200"
                    />
                  </td>
                ))}

                <td className="p-3 text-center">
                  <button
                    onClick={() => removeCustomer(i)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}

            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="p-3">
                <input
                  placeholder="New customer name"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer((s) => ({ ...s, name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-md p-1 text-sm"
                />
              </td>
              {(['forecast', 'vol', 'init', 'mon', 'wed', 'fri'] as const).map((field) => (
                <td key={field} className="p-3 text-right">
                  <input
                    type="number"
                    value={newCustomer[field]}
                    onChange={(e) =>
                      setNewCustomer((s) => ({
                        ...s,
                        [field]: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-20 text-right border border-gray-200 rounded-md p-1 text-sm"
                  />
                </td>
              ))}
              <td className="p-3 text-center">
                <button
                  onClick={handleAddCustomer}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md"
                >
                  Add
                </button>
              </td>
            </tr>

            <tr
              className={`font-semibold border-t ${overVol || initOverCapacity || overCapacity ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-800'
                }`}
            >
              <td className="p-3">TOTALS</td>
              <td className="p-3 text-right">{totals.forecast}</td>
              <td className="p-3 text-right">{totals.vol}%</td>
              <td className="p-3 text-right">{totals.init}</td>
              <td className="p-3 text-right">{totals.mon}</td>
              <td className="p-3 text-right">{totals.wed}</td>
              <td className="p-3 text-right">{totals.fri}</td>
              <td className="p-3 text-center">—</td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-col p-4 bg-gray-50 border-t border-gray-100">
          {initOverCapacity && (
            <div className="text-sm text-red-600 font-medium">
              Warning: Initial deliveries exceed location capacity!
            </div>
          )}
          {overCapacity && (
            <div className="text-sm text-red-600 font-medium">
              Warning: Total planned deliveries exceed location capacity!
            </div>
          )}
          {overVol && (
            <div className="text-sm text-red-600 font-medium">
              Warning: Total Vol% exceeds 100%!
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          Capacity: {location.capacity} | Drivers: {location.drivers_total}
        </div>

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
