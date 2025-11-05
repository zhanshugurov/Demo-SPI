"use client"

import Header from '@/components/Header';
import LocationSelector from '@/components/LocationSelector';
import PlanningTable from '@/components/PlanningTable';

export default function PlanningPage() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Header week={32} />
      <LocationSelector />
      <div className="mt-2 text-sm text-gray-600">
        Week: 32 | Date Range: Aug 2nd - Aug 9th | Status: Planning
      </div>
      <PlanningTable />
    </div>
  );
}
