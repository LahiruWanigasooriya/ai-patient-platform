"use client";

import { useState, useEffect, useRef } from "react";
import { MoreVertical, Edit2, Trash2, FileText, Scan, TrendingUp, Mic } from "lucide-react";
import { PatientWithDocs } from "./ChatSidebar";

export interface PatientCardProps {
  patient: PatientWithDocs;
  isSelected: boolean;
  onSelect: (patientId: number) => void;
  onViewDoc?: (doc: { fileName: string; patientId: number; patientName: string }) => void;
  onViewScans?: (patient: PatientWithDocs) => void;
  onViewVitals?: (patient: PatientWithDocs) => void;
  onViewNotes?: (patient: PatientWithDocs) => void;
  onExportFhir?: (patient: PatientWithDocs) => void;
  onEdit?: (patient: PatientWithDocs) => void;
  onDelete?: (patient: PatientWithDocs) => void;
}

export function PatientCard({
  patient,
  isSelected,
  onSelect,
  onViewDoc,
  onViewScans,
  onViewVitals,
  onViewNotes,
  onExportFhir,
  onEdit,
  onDelete,
}: PatientCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div 
      onClick={() => onSelect(patient.id)}
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 lg:p-6 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between relative w-full ${
        isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
      }`}
    >
      <div>
        {/* Top Area: Profile Pic, Name/Age/Medical ID, Status & 3-Dots */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
          {/* Left: Avatar + Details */}
          <div className="flex items-start space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            {/* Profile Picture with Fallback Silhouette */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-[72px] xl:h-[72px] rounded-full overflow-hidden flex-shrink-0 bg-[#a3a3a3] flex items-center justify-center shadow-2xs">
              {patient.image ? (
                <img
                  src={patient.image}
                  alt={patient.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-[66px] xl:h-[66px] text-white translate-y-1 sm:translate-y-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Name, Age, Medical ID */}
            <div className="min-w-0 pt-0.5 flex-1">
              <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate group-hover:text-emerald-600 transition-colors" title={patient.name}>
                {patient.name}
              </h4>
              <p className="text-xs sm:text-[12px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                Age : {patient.age}
              </p>
              <p className="text-xs sm:text-[12px] text-gray-500 dark:text-gray-400 font-normal">
                Medical ID : #{patient.id}0084
              </p>
            </div>
          </div>

          {/* Right: Status Pill & 3-Dots Menu */}
          <div className="flex items-start space-x-1.5 sm:space-x-2 flex-shrink-0 relative">
            <div className="flex flex-col items-center">
              <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-normal mb-0.5 sm:mb-1">
                Status
              </span>
              <span className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-white shadow-2xs whitespace-nowrap ${
                patient.status === 'Critical' 
                  ? 'bg-[#ff3b30]' : 
                patient.status === 'Review' 
                  ? 'bg-[#ff9500]' : 
                  'bg-[#34c759]'
              }`}>
                {patient.status}
              </span>
            </div>

            {/* 3-Dots Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                }}
                className="p-1 sm:p-1.5 -mr-1 text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                title="Patient Options"
                aria-label="Patient Options"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              {/* Dropdown Popup Window */}
              {isMenuOpen && (
                <div 
                  className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onEdit?.(patient);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition cursor-pointer text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onDelete?.(patient);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Patient Clinical Summary */}
        <p className="text-xs sm:text-sm text-[#8e8e93] dark:text-gray-400 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4">
          {patient.summary}
        </p>
      </div>

      <div>
        {/* Thin Divider Line */}
        <div className="border-t border-gray-200/80 dark:border-gray-800 mb-3 sm:mb-4" />

        {/* Bottom Footer: 2-Column Metrics Grid & Get FHIR Action */}
        <div className="flex items-center justify-between gap-2">
          {/* 2-Column Metrics with Lucide Icons */}
          <div className="grid grid-cols-2 gap-x-2.5 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {/* Records */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (patient.documents && patient.documents.length > 0 && onViewDoc) {
                  onViewDoc({
                    fileName: patient.documents[0].fileName,
                    patientId: patient.id,
                    patientName: patient.name,
                  });
                }
              }}
              className="flex items-center space-x-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-left py-0.5 whitespace-nowrap"
              title="Inspect medical records"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="font-normal">{patient.documents?.length || 0} Records</span>
            </button>

            {/* Scans */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewScans?.(patient);
              }}
              className="flex items-center space-x-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer text-left py-0.5 whitespace-nowrap"
              title="View diagnostic imaging & radiology scans"
            >
              <Scan className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="font-normal">{patient.images?.length || 0} Scans</span>
            </button>

            {/* Vitals / Curve */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewVitals?.(patient);
              }}
              className="flex items-center space-x-1.5 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer text-left py-0.5 whitespace-nowrap"
              title="View vitals trajectory curve"
            >
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="font-normal">{patient.vitalReadings?.length || 0} Records</span>
            </button>

            {/* Notes */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewNotes?.(patient);
              }}
              className="flex items-center space-x-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer text-left py-0.5 whitespace-nowrap"
              title="Ambient AI Scribe & Clinical Voice Notes"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="font-normal">{patient.clinicalNotes?.length || 0} Notes</span>
            </button>
          </div>

          {/* Right: Stacked Sheets Icon & Get FHIR */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExportFhir?.(patient);
            }}
            className="flex items-center space-x-1 sm:space-x-1.5 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer pl-1 group/fhir flex-shrink-0 py-0.5"
            title="Export HL7 FHIR Release 4.0 Bundle"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400 group-hover/fhir:text-emerald-600 dark:group-hover/fhir:text-emerald-400 transition flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="7" y="6" width="13" height="15" rx="2" />
              <path d="M5 18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              <line x1="10" y1="10" x2="17" y2="10" />
              <line x1="10" y1="13" x2="17" y2="13" />
              <line x1="10" y1="16" x2="14" y2="16" />
            </svg>
            <span className="text-xs sm:text-sm font-normal whitespace-nowrap">Get FHIR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
