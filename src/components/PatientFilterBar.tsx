"use client";

import { UserPlusIcon } from "@heroicons/react/24/outline";

export interface PatientFilterBarProps {
  searchQuery: string;
  totalFiltered: number;
  statusFilter: "All" | "Critical" | "Review" | "Stable";
  onStatusFilterChange: (status: "All" | "Critical" | "Review" | "Stable") => void;
  counts: {
    critical: number;
    review: number;
    stable: number;
  };
  onAdmitClick: () => void;
}

export function PatientFilterBar({
  searchQuery,
  totalFiltered,
  statusFilter,
  onStatusFilterChange,
  counts,
  onAdmitClick,
}: PatientFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <span>{searchQuery ? "Search Results" : "Patient Roster"}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
            {totalFiltered} active
          </span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select a patient card to open the AI diagnostic copilot, view historical vitals curves, or inspect source PDF chunks.
        </p>
      </div>
      
      {/* Status Filter Buttons */}
      <div className="flex items-center space-x-2">
        {(["All", "Critical", "Review", "Stable"] as const).map(filter => {
          const filterCount = 
            filter === "Critical" ? counts.critical :
            filter === "Review" ? counts.review :
            filter === "Stable" ? counts.stable : null;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => onStatusFilterChange(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-emerald-500 text-white shadow-xs font-semibold"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-400"
              }`}
            >
              {filter} {filterCount !== null && `(${filterCount})`}
            </button>
          );
        })}
        
        <button
          type="button"
          onClick={onAdmitClick}
          className="ml-2 flex items-center space-x-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3.5 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition shadow-xs cursor-pointer"
        >
          <UserPlusIcon className="w-3.5 h-3.5" />
          <span>Admit</span>
        </button>
      </div>
    </div>
  );
}
