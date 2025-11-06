'use client';

import Header from '@/components/Header';
import LocationSelector from '@/components/LocationSelector';
import ActualsTable from '@/components/ActualsTable';
import { usePlanningStore } from '@/store/usePlanningStore';

export default function ActualsPage() {
  const {
    currentWeek
  } = usePlanningStore();

  return (
    <div className="p-4 mx-auto space-y-4">
      <Header />

      <LocationSelector

      />

      <div className="text-sm text-gray-600">
        Week: {currentWeek} |  Status: In Progress
      </div>

      <ActualsTable />
    </div>
  );
}
