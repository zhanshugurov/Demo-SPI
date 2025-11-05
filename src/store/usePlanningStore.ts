'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ======================
// Типы
// ======================

export interface Customer {
  name: string;
  vol: number;
  init: number;
  mon: number;
  wed: number;
  fri: number;
}

export interface LocationData {
  capacity: number;
  drivers_total: number;
  customers: Customer[];
}

interface PlanningState {
  // Общие поля
  week: number;

  // Управление локациями
  currentLocation: 'toronto' | 'montreal';
  setLocation: (loc: 'toronto' | 'montreal') => void;

  // Данные по локациям
  locations: Record<'toronto' | 'montreal', LocationData>;

  // Перемещение водителей между локациями
  transferDrivers: number;

  // Обновление данных клиентов
  setCustomers: (customers: Customer[]) => void;
  updateValue: (index: number, field: keyof Customer, value: number) => void;
}

// ======================
// Исходные данные
// ======================

const initialCustomersToronto: Customer[] = [
  { name: 'MAERSK #1', vol: 29, init: 35, mon: 10, wed: 10, fri: 15 },
  { name: 'CMA #3', vol: 9, init: 11, mon: 4, wed: 4, fri: 3 },
  { name: 'HL #4', vol: 25, init: 30, mon: 10, wed: 10, fri: 10 },
  { name: 'ZIM #2', vol: 5, init: 6, mon: 3, wed: 3, fri: 0 },
  { name: 'MEDLOG #5', vol: 25, init: 30, mon: 10, wed: 10, fri: 10 },
  { name: 'OTHER/SPOT #6', vol: 7, init: 9, mon: 0, wed: 0, fri: 9 },
];

const initialCustomersMontreal: Customer[] = [
  { name: 'MSC #1', vol: 18, init: 22, mon: 6, wed: 6, fri: 10 },
  { name: 'EVERGREEN #2', vol: 7, init: 9, mon: 3, wed: 3, fri: 3 },
  { name: 'COSCO #3', vol: 10, init: 12, mon: 4, wed: 4, fri: 4 },
];

// ======================
// Zustand Store
// ======================

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set, get) => ({
      week: 32,

      currentLocation: 'toronto',
      setLocation: (loc) => set({ currentLocation: loc }),

      transferDrivers: 5,

      locations: {
        toronto: {
          capacity: 121.13,
          drivers_total: 74,
          customers: initialCustomersToronto,
        },
        montreal: {
          capacity: 60.22,
          drivers_total: 20,
          customers: initialCustomersMontreal,
        },
      },

      setCustomers: (customers) => {
        const { currentLocation, locations } = get();
        set({
          locations: {
            ...locations,
            [currentLocation]: { ...locations[currentLocation], customers },
          },
        });
      },

      updateValue: (index, field, value) => {
        const { currentLocation, locations } = get();
        const current = locations[currentLocation];
        const updatedCustomers = [...current.customers];
        updatedCustomers[index] = { ...updatedCustomers[index], [field]: value };

        set({
          locations: {
            ...locations,
            [currentLocation]: { ...current, customers: updatedCustomers },
          },
        });
      },
    }),
    {
      name: 'planning-data',
    }
  )
);
