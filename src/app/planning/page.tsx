"use client"

import Header from '@/components/Header';
import LocationSelector from '@/components/LocationSelector';
import PlanningTable from '@/components/PlanningTable';
import { usePlanningStore } from '@/store/usePlanningStore';

export default function PlanningPage() {
  const {
    currentWeek
  } = usePlanningStore();

  return (
    <div className="p-4 mx-auto space-y-4">
      <Header />
      <LocationSelector />
      <div className="mt-2 text-sm text-gray-600">
        Week: {currentWeek} | Status: Planning
      </div>
      <PlanningTable />
    </div>
  );
}
