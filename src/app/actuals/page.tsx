'use client';

import Header from '@/components/Header';
import LocationSelector from '@/components/LocationSelector';
import ActualsTable from '@/components/ActualsTable';
import { usePlanningStore } from '@/store/usePlanningStore';

export default function ActualsPage() {
  const {
    week
  } = usePlanningStore();

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <Header week={week} />

      <LocationSelector

      />

      <div className="text-sm text-gray-600">
        Week: {week} | Date Range: Aug 2nd – Aug 9th | Status: In Progress
      </div>

      <ActualsTable />
    </div>
  );
}
