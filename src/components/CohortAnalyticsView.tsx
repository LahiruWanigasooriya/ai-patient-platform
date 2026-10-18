"use client";

import { 
  ChartBarIcon, 
  ArrowPathIcon, 
  UserPlusIcon, 
  UserCircleIcon, 
  HeartIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon, 
  CheckCircleIcon, 
  EyeIcon, 
  PhotoIcon 
} from "@heroicons/react/24/outline";
import { PatientWithDocs } from "./ChatSidebar";

export interface CohortAnalyticsViewProps {
  patients: PatientWithDocs[];
  onRefresh: () => void;
  onAdmit: () => void;
  onFilterStatus: (status: "Critical" | "Review" | "Stable") => void;
  onSelectPatient: (patientId: number) => void;
  onViewDoc: (doc: { fileName: string; patientId: number; patientName: string }) => void;
  onViewVitals: (patient: PatientWithDocs) => void;
  onViewScans: (patient: PatientWithDocs) => void;
}

export function CohortAnalyticsView({
  patients,
  onRefresh,
  onAdmit,
  onFilterStatus,
  onSelectPatient,
  onViewDoc,
  onViewVitals,
  onViewScans,
}: CohortAnalyticsViewProps) {
  // Cohort Analytics Calculations
  const totalPatients = patients.length;
  const criticalPatients = patients.filter(p => p.status === "Critical");
  const reviewPatients = patients.filter(p => p.status === "Review");
  const stablePatients = patients.filter(p => p.status === "Stable");

  const criticalCount = criticalPatients.length;
  const reviewCount = reviewPatients.length;
  const stableCount = stablePatients.length;

  const criticalRate = totalPatients > 0 ? Math.round((criticalCount / totalPatients) * 100) : 0;
  const reviewRate = totalPatients > 0 ? Math.round((reviewCount / totalPatients) * 100) : 0;
  const stableRate = totalPatients > 0 ? Math.round((stableCount / totalPatients) * 100) : 0;

  const totalDocuments = patients.reduce((acc, p) => acc + (p.documents?.length || 0), 0);
  const totalVitalsLogged = patients.reduce((acc, p) => acc + (p.vitalReadings?.length || 0), 0);
  const averageAge = totalPatients > 0 
    ? Math.round(patients.reduce((acc, p) => acc + p.age, 0) / totalPatients) 
    : 0;

  // Age Cohorts
  const under35Count = patients.filter(p => p.age < 35).length;
  const age35To55Count = patients.filter(p => p.age >= 35 && p.age <= 55).length;
  const over55Count = patients.filter(p => p.age > 55).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center space-x-2.5">
            <ChartBarIcon className="w-8 h-8 text-emerald-500" />
            <span>Clinical Cohort Analytics</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Population health telemetry, acuity distribution, and vectorized diagnostic record coverage.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={onRefresh}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button 
            type="button"
            onClick={onAdmit}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-xs cursor-pointer"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>+ Admit Patient</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Total Patients */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Cohort Size
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white">
            {totalPatients}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center space-x-1">
            <span className="text-emerald-600 font-semibold">Active Profiles</span>
            <span>in PostgreSQL database</span>
          </div>
        </div>

        {/* Critical Acuity Rate */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Critical Acuity
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <HeartIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600 dark:text-red-400 flex items-center space-x-2">
            <span>{criticalRate}%</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
              {criticalCount} of {totalPatients}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Requires immediate clinical surveillance
          </div>
        </div>

        {/* Total Indexed Documents */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Indexed Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white">
            {totalDocuments}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center space-x-1">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            <span>Embedded in ChromaDB RAG</span>
          </div>
        </div>

        {/* Vitals Telemetry Total */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Logged Vitals Curves
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white">
            {totalVitalsLogged} <span className="text-sm font-normal text-gray-500">records</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Mean cohort age: {averageAge} yrs
          </div>
        </div>
      </div>

      {/* Acuity Breakdown & Progress Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Patient Acuity & Triage Breakdown
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Proportional distribution of patient statuses across the active hospital roster.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-gray-400">
            100% Normalized
          </span>
        </div>

        {/* Segmented Acuity Progress Bar */}
        <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex shadow-inner mb-6">
          <div 
            style={{ width: `${criticalRate}%` }} 
            className="bg-red-500 transition-all duration-500" 
            title={`Critical: ${criticalRate}%`}
          />
          <div 
            style={{ width: `${reviewRate}%` }} 
            className="bg-amber-500 transition-all duration-500" 
            title={`Review: ${reviewRate}%`}
          />
          <div 
            style={{ width: `${stableRate}%` }} 
            className="bg-emerald-500 transition-all duration-500" 
            title={`Stable: ${stableRate}%`}
          />
        </div>

        {/* 3 Interactive Acuity Cohort Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Critical Card */}
          <div 
            onClick={() => onFilterStatus("Critical")}
            className="p-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 hover:border-red-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-xs uppercase text-red-800 dark:text-red-300">Critical Acuity</span>
              </div>
              <span className="text-xl font-black text-red-600">{criticalCount}</span>
            </div>
            <p className="text-xs text-red-700/80 dark:text-red-400/80 mb-3">
              Severe symptoms, hypertensive crisis, or unstable cardiac status.
            </p>
            <span className="text-xs font-bold text-red-600 group-hover:underline">
              View {criticalCount} Critical Patients &rarr;
            </span>
          </div>

          {/* Review Card */}
          <div 
            onClick={() => onFilterStatus("Review")}
            className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-xs uppercase text-amber-800 dark:text-amber-300">Under Review</span>
              </div>
              <span className="text-xl font-black text-amber-600">{reviewCount}</span>
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mb-3">
              Pending diagnostic labs, medication titrations, or follow-up consultations.
            </p>
            <span className="text-xs font-bold text-amber-600 group-hover:underline">
              View {reviewCount} Review Patients &rarr;
            </span>
          </div>

          {/* Stable Card */}
          <div 
            onClick={() => onFilterStatus("Stable")}
            className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-xs uppercase text-emerald-800 dark:text-emerald-300">Stable Condition</span>
              </div>
              <span className="text-xl font-black text-emerald-600">{stableCount}</span>
            </div>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mb-3">
              Normal physiological vitals, controlled chronic conditions, routine care.
            </p>
            <span className="text-xs font-bold text-emerald-600 group-hover:underline">
              View {stableCount} Stable Patients &rarr;
            </span>
          </div>

        </div>
      </div>

      {/* Bottom Split: Age Demographics & Diagnostic Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Age Demographics Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Age Cohort Distribution
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Stratification across key clinical lifecycle brackets.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700 dark:text-gray-300">Young Adult (&lt; 35 yrs)</span>
                <span className="text-gray-500">{under35Count} patients ({totalPatients ? Math.round((under35Count / totalPatients) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalPatients ? (under35Count / totalPatients) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700 dark:text-gray-300">Adult (35 - 55 yrs)</span>
                <span className="text-gray-500">{age35To55Count} patients ({totalPatients ? Math.round((age35To55Count / totalPatients) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalPatients ? (age35To55Count / totalPatients) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700 dark:text-gray-300">Senior (55+ yrs)</span>
                <span className="text-gray-500">{over55Count} patients ({totalPatients ? Math.round((over55Count / totalPatients) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalPatients ? (over55Count / totalPatients) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Record Coverage */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs">
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Diagnostic Records & Vector Telemetry
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Patients with active multi-tenant RAG vector indexes in ChromaDB. Click document icon to view chunks.
          </p>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {patients.map(p => (
              <div 
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition border border-gray-100 dark:border-gray-800"
              >
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => onSelectPatient(p.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                    #{p.id}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Age: {p.age} • Status: {p.status}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {p.documents && p.documents.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        onViewDoc({
                          fileName: p.documents![0].fileName,
                          patientId: p.id,
                          patientName: p.name,
                        });
                      }}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200 transition cursor-pointer flex items-center space-x-1"
                      title="Click to view chunks"
                    >
                      <span>{p.documents.length} PDF{p.documents.length === 1 ? '' : 's'}</span>
                      <EyeIcon className="w-3 h-3 ml-0.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      0 PDFs
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewVitals(p)}
                    className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                    title="View vitals trajectory"
                  >
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  </button>

                  {p.images && p.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onViewScans(p)}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 hover:bg-cyan-200 transition cursor-pointer flex items-center space-x-1"
                      title="Click to view diagnostic scans"
                    >
                      <PhotoIcon className="w-3 h-3 text-cyan-500" />
                      <span>{p.images.length} Scans</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
