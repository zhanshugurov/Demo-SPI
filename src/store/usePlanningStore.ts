'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ======================
// Типы
// ======================

export interface Customer {
  name: string;
  forecast: number;
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
  workOrders: Record<'toronto' | 'montreal', Customer[]>;
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

  setWorkOrders: (workOrder: Customer[]) => void;
  updateWorkOrder: (index: number, field: keyof Customer, value: string | number) => void;

  updateDrivers: (value: number) => void;
  updateCapacity: (value: number) => void;
}

// ======================
// Исходные данные
// ======================

const initialCustomersToronto: Customer[] = [
  { name: 'MAERSK #1', forecast: 40, vol: 29, init: 35, mon: 10, wed: 10, fri: 15 },
  { name: 'CMA #3', forecast: 20, vol: 9, init: 11, mon: 4, wed: 4, fri: 3 },
  { name: 'HL #4', forecast: 37, vol: 25, init: 30, mon: 10, wed: 10, fri: 10 },
];

const initialCustomersMontreal: Customer[] = [
  { name: 'MSC #1', forecast: 25, vol: 18, init: 22, mon: 6, wed: 6, fri: 10 },
  { name: 'EVERGREEN #2', forecast: 12, vol: 7, init: 9, mon: 3, wed: 3, fri: 3 },
];

// создаем WeekData сразу с actuals, равными плану
const defaultWeekData: WeekData = {
  transferDrivers: 5,
  locations: {
    toronto: { capacity: 0, drivers_total: 0, customers: [] },
    montreal: { capacity: 0, drivers_total: 0, customers: [] },
  },
  actuals: {
    toronto: JSON.parse(JSON.stringify([])),
    montreal: JSON.parse(JSON.stringify([])),
  },
  workOrders: {
    toronto: JSON.parse(JSON.stringify([])),
    montreal: JSON.parse(JSON.stringify([])),
  },
};

const initialWeek32: WeekData = {
  transferDrivers: 5,
  locations: {
    toronto: {
      capacity: 0,
      drivers_total: 0,
      customers: initialCustomersToronto,
    },
    montreal: {
      capacity: 0,
      drivers_total: 0,
      customers: initialCustomersMontreal,
    },
  },
  actuals: {
    toronto: JSON.parse(JSON.stringify(initialCustomersToronto)),
    montreal: JSON.parse(JSON.stringify(initialCustomersMontreal)),
  },
  workOrders: {
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
        32: initialWeek32,
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
          workOrders: {
            ...week.workOrders,
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
          workOrders: {
            ...week.workOrders,
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
        const newWorkOrders = week.workOrders[currentLocation].filter((_, i) => i !== index);

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
              workOrders: {
                ...week.workOrders,
                [currentLocation]: newWorkOrders,
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

      setWorkOrders: (workOrders) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              workOrders: { ...week.workOrders, [currentLocation]: workOrders },
            },
          },
        });
      },

      updateWorkOrder: (index, field, value) => {
        const { currentWeek, currentLocation, weeks } = get();
        const week = weeks[currentWeek];
        const workOrders = week.workOrders[currentLocation] || [];
        const updated = [...workOrders];
        updated[index] = { ...updated[index], [field]: value };

        set({
          weeks: {
            ...weeks,
            [currentWeek]: {
              ...week,
              workOrders: { ...week.workOrders, [currentLocation]: updated },
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
    { name: 'planning-data-v3.2' }
  )
);
