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

export interface WeekData {
  locations: Record<'toronto' | 'montreal', LocationData>;
  transferDrivers: number;
  actuals: Record<'toronto' | 'montreal', Customer[]>;
}

interface PlanningState {
  currentWeek: number;
  setWeek: (week: number) => void;

  currentLocation: 'toronto' | 'montreal';
  setLocation: (loc: 'toronto' | 'montreal') => void;

  weeks: Record<number, WeekData>;

  // Методы
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  removeCustomer: (index: number) => void;
  updateCustomer: (index: number, field: keyof Customer, value: string | number) => void;

  setActuals: (actuals: Customer[]) => void;
  updateActual: (index: number, field: keyof Customer, value: string | number) => void;

  updateDrivers: (value: number) => void;
  updateCapacity: (value: number) => void;
}

// ======================
// Исходные данные
// ======================

const initialCustomersToronto: Customer[] = [
  { name: 'MAERSK #1', vol: 29, init: 35, mon: 10, wed: 10, fri: 15 },
  { name: 'CMA #3', vol: 9, init: 11, mon: 4, wed: 4, fri: 3 },
  { name: 'HL #4', vol: 25, init: 30, mon: 10, wed: 10, fri: 10 },
];

const initialCustomersMontreal: Customer[] = [
  { name: 'MSC #1', vol: 18, init: 22, mon: 6, wed: 6, fri: 10 },
  { name: 'EVERGREEN #2', vol: 7, init: 9, mon: 3, wed: 3, fri: 3 },
];

// создаем WeekData сразу с actuals, равными плану
const defaultWeekData: WeekData = {
  transferDrivers: 5,
  locations: {
    toronto: { capacity: 121.13, drivers_total: 74, customers: initialCustomersToronto },
    montreal: { capacity: 60.22, drivers_total: 20, customers: initialCustomersMontreal },
  },
  actuals: {
    toronto: JSON.parse(JSON.stringify(initialCustomersToronto)),
    montreal: JSON.parse(JSON.stringify(initialCustomersMontreal)),
  },
};

// ======================
// Zustand Store
// ======================

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set, get) => ({
      currentWeek: 32,
      currentLocation: 'toronto',

      weeks: {
        32: defaultWeekData,
      },

      setWeek: (week) => {
        const { weeks } = get();
        if (!weeks[week]) {
          const copy = JSON.parse(JSON.stringify(defaultWeekData));
          set({
            currentWeek: week,
            weeks: { ...weeks, [week]: copy },
          });
        } else {
          set({ currentWeek: week });
        }
      },

      setLocation: (loc) => set({ currentLocation: loc }),

      setCustomers: (customers) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];

        const updatedWeek: WeekData = {
          ...week,
          locations: {
            ...week.locations,
            [currentLocation]: {
              ...week.locations[currentLocation],
              customers,
            },
          },
          // синхронизируем actuals с новыми customers
          actuals: {
            ...week.actuals,
            [currentLocation]: JSON.parse(JSON.stringify(customers)),
          },
        };

        set({
          weeks: { ...weeks, [currentWeek]: updatedWeek },
        });
      },

      addCustomer: (customer) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        const newCustomers = [...week.locations[currentLocation].customers, customer];

        const updatedWeek: WeekData = {
          ...week,
          locations: {
            ...week.locations,
            [currentLocation]: {
              ...week.locations[currentLocation],
              customers: newCustomers,
            },
          },
          actuals: {
            ...week.actuals,
            [currentLocation]: JSON.parse(JSON.stringify(newCustomers)),
          },
        };

        set({
          weeks: { ...weeks, [currentWeek]: updatedWeek },
        });
      },

      removeCustomer: (index) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];

        const newCustomers = week.locations[currentLocation].customers.filter((_, i) => i !== index);
        const newActuals = week.actuals[currentLocation].filter((_, i) => i !== index);

        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              locations: {
                ...week.locations,
                [currentLocation]: {
                  ...week.locations[currentLocation],
                  customers: newCustomers,
                },
              },
              actuals: {
                ...week.actuals,
                [currentLocation]: newActuals,
              },
            },
          },
        });
      },

      updateCustomer: (index, field, value) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        const updatedCustomers = [...week.locations[currentLocation].customers];
        updatedCustomers[index] = { ...updatedCustomers[index], [field]: value };

        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              locations: {
                ...week.locations,
                [currentLocation]: {
                  ...week.locations[currentLocation],
                  customers: updatedCustomers,
                },
              },
            },
          },
        });
      },

      setActuals: (actuals) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              actuals: { ...week.actuals, [currentLocation]: actuals },
            },
          },
        });
      },

      updateActual: (index, field, value) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        const actuals = week.actuals[currentLocation] || [];
        const updated = [...actuals];
        updated[index] = { ...updated[index], [field]: value };

        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              actuals: { ...week.actuals, [currentLocation]: updated },
            },
          },
        });
      },

      updateDrivers: (value) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              locations: {
                ...week.locations,
                [currentLocation]: {
                  ...week.locations[currentLocation],
                  drivers_total: value,
                },
              },
            },
          },
        });
      },

      updateCapacity: (value) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              locations: {
                ...week.locations,
                [currentLocation]: {
                  ...week.locations[currentLocation],
                  capacity: value,
                },
              },
            },
          },
        });
      },
    }),
    { name: 'planning-data-v3' }
  )
);
