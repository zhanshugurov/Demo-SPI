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

const defaultWeekData: WeekData = {
  transferDrivers: 5,
  locations: {
    toronto: { capacity: 121.13, drivers_total: 74, customers: initialCustomersToronto },
    montreal: { capacity: 60.22, drivers_total: 20, customers: initialCustomersMontreal },
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
          // если недели нет — создаём пустую копию
          set({
            currentWeek: week,
            weeks: {
              ...weeks,
              [week]: JSON.parse(JSON.stringify(defaultWeekData)),
            },
          });
        } else {
          set({ currentWeek: week });
        }
      },

      setLocation: (loc) => set({ currentLocation: loc }),

      setCustomers: (customers) => {
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
                  customers,
                },
              },
            },
          },
        });
      },

      addCustomer: (customer) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        const customers = week.locations[currentLocation].customers;
        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              locations: {
                ...week.locations,
                [currentLocation]: {
                  ...week.locations[currentLocation],
                  customers: [...customers, customer],
                },
              },
            },
          },
        });
      },

      removeCustomer: (index) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        const customers = week.locations[currentLocation].customers.filter((_, i) => i !== index);
        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              locations: {
                ...week.locations,
                [currentLocation]: {
                  ...week.locations[currentLocation],
                  customers,
                },
              },
            },
          },
        });
      },

      updateCustomer: (index, field, value) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        const updatedCustomers = [...week.locations[currentLocation].customers];
        updatedCustomers[index] = {
          ...updatedCustomers[index],
          [field]: value,
        };
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
    {
      name: 'planning-data-v2',
    }
  )
);
