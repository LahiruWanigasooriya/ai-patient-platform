"use client";

import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  BeakerIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  AcademicCapIcon, 
  TagIcon, 
  SparklesIcon, 
  CheckBadgeIcon, 
  ArrowPathIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { PatientWithDocs, TrialMatchWithTrial } from "./ChatSidebar";
import { getPatientTrialMatches, enrollPatientInTrial } from "@/app/actions/patients";

interface ClinicalTrialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientWithDocs | null;
  onPatientUpdated?: () => void;
}

export function ClinicalTrialsModal({ isOpen, onClose, patient, onPatientUpdated }: ClinicalTrialsModalProps) {
  const [filter, setFilter] = useState<"all" | "eligible" | "enrolled">("all");
  const [matches, setMatches] = useState<TrialMatchWithTrial[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patient) {
      loadMatches();
    }
  }, [isOpen, patient]);

  const loadMatches = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const data = await getPatientTrialMatches(patient.id);
      setMatches(data as TrialMatchWithTrial[]);
    } catch (e) {
      console.error("Failed to load trial matches:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (trialId: string) => {
    if (!patient) return;
    setEnrollingId(trialId);
    try {
      await enrollPatientInTrial(patient.id, trialId);
      await loadMatches();
      if (onPatientUpdated) onPatientUpdated();
    } catch (e) {
      console.error("Failed to enroll patient in trial:", e);
      alert("Error enrolling patient in protocol.");
    } finally {
      setEnrollingId(null);
    }
  };

  if (!isOpen || !patient) return null;

  const filteredMatches = matches.filter((m) => {
    if (filter === "eligible") return m.matchScore >= 70 && m.status !== "Ineligible";
    if (filter === "enrolled") return m.status === "Enrolled";
    return true;
  });

  const highMatchCount = matches.filter((m) => m.matchScore >= 70).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-5xl h-[90vh] max-h-[880px] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <header className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <BeakerIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Clinical Trial & Protocol Matching Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Precision Biomarker Matcher
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Patient: <span className="font-semibold text-gray-800 dark:text-gray-200">{patient.name}</span> (ID #{patient.id}, Age {patient.age}, Status: {patient.status}) • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{highMatchCount} High-Probability Protocol{highMatchCount !== 1 ? 's' : ''} Identified</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Filter Pills */}
            <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filter === "all"
                    ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                All Trials ({matches.length})
              </button>
              <button
                onClick={() => setFilter("eligible")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filter === "eligible"
                    ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                Eligible Only ({highMatchCount})
              </button>
              <button
                onClick={() => setFilter("enrolled")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filter === "enrolled"
                    ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                Enrolled ({matches.filter(m => m.status === "Enrolled").length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50 dark:bg-gray-900">
          
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
              <span>Analyzing patient genotype, vitals, and laboratory biomarkers against trial registries...</span>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <BeakerIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h5 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                No Clinical Trials Match This Filter
              </h5>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Try switching the filter to "All Trials" to inspect candidate protocols and inclusion/exclusion scoring.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMatches.map((m) => {
                const trial = m.trial;
                const isHighlyEligible = m.matchScore >= 90;
                const isCandidate = m.matchScore >= 70 && m.matchScore < 90;
                const isEnrolled = m.status === "Enrolled";
                const hasExclusion = m.exclusionFlags && m.exclusionFlags.length > 0;

                const scoreBadgeClass = isEnrolled
                  ? "bg-emerald-600 text-white"
                  : isHighlyEligible
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : isCandidate
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30";

                return (
                  <div
                    key={m.id}
                    className={`bg-white dark:bg-gray-800 rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${
                      isEnrolled 
                        ? "border-emerald-500/80 bg-emerald-50/10 dark:bg-emerald-950/20" 
                        : isHighlyEligible
                        ? "border-emerald-400/60 dark:border-emerald-600/40"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {/* Top Row: Title, Phase, Score */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-3.5 mb-3.5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            {trial.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {trial.phase}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {trial.condition}
                          </span>
                          {isEnrolled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center space-x-1">
                              <ShieldCheckIcon className="w-3 h-3" />
                              <span>ENROLLED PROTOCOL</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white pt-0.5">
                          {trial.title}
                        </h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Sponsor: <strong>{trial.sponsor}</strong> • Status: <span className="text-emerald-600 font-semibold">{trial.status}</span>
                        </div>
                      </div>

                      {/* Match Score Gauge */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start">
                        <div className={`px-3 py-1 rounded-xl border text-xs font-black flex items-center space-x-1.5 ${scoreBadgeClass}`}>
                          <span>{m.matchScore}% MATCH</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium sm:mt-1">
                          {isEnrolled ? "Active Trial Subject" : isHighlyEligible ? "Prime Eligibility" : isCandidate ? "Borderline Candidate" : "Excluded / Low Match"}
                        </span>
                      </div>
                    </div>

                    {/* Summary Narrative */}
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3.5">
                      {trial.summary}
                    </p>

                    {/* Target Biomarkers Chips */}
                    {trial.targetBiomarkers && trial.targetBiomarkers.length > 0 && (
                      <div className="mb-3.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center space-x-1">
                          <TagIcon className="w-3.5 h-3.5 text-amber-500" />
                          <span>Required Clinical Biomarkers & Criteria:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {trial.targetBiomarkers.map((b, bi) => (
                            <span
                              key={bi}
                              className="px-2 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 font-medium"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Criteria Evaluation Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3.5">
                      {/* Matched Inclusions */}
                      <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1 mb-2">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>Satisfied Inclusion Criteria ({m.matchedInclusions.length})</span>
                        </span>
                        {m.matchedInclusions.length > 0 ? (
                          <ul className="space-y-1 text-[11px] text-gray-700 dark:text-gray-300">
                            {m.matchedInclusions.map((inc, ii) => (
                              <li key={ii} className="flex items-start space-x-1.5">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No specific inclusions documented yet</span>
                        )}
                      </div>

                      {/* Exclusion Flags & Pending */}
                      <div className={`p-3 rounded-xl border ${
                        hasExclusion 
                          ? "bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-900/50"
                          : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700"
                      }`}>
                        <span className={`font-bold flex items-center space-x-1 mb-2 ${
                          hasExclusion ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-300"
                        }`}>
                          {hasExclusion ? (
                            <XCircleIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                          <span>Exclusion Protocol Status</span>
                        </span>
                        {hasExclusion ? (
                          <div className="space-y-1 text-[11px] text-red-800 dark:text-red-200">
                            {m.exclusionFlags.map((ef, efi) => (
                              <div key={efi} className="font-medium">
                                {ef}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center space-x-1">
                            <span>✓</span>
                            <span>No disqualifying exclusion criteria identified.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Precision Rationale Box */}
                    {m.aiRationale && (
                      <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30 mb-3.5">
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                          <SparklesIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>AI Protocol Matching Rationale</span>
                        </div>
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                          {m.aiRationale}
                        </p>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60">
                      <div className="text-[11px] text-gray-400">
                        Evaluated: {new Date(m.evaluatedAt).toLocaleDateString()}
                      </div>

                      {isEnrolled ? (
                        <div className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
                          <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
                          <span>Patient Enrolled in Protocol</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnroll(trial.id)}
                          disabled={enrollingId === trial.id || hasExclusion}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs ${
                            hasExclusion
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20"
                          }`}
                        >
                          {enrollingId === trial.id ? (
                            <>
                              <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              <span>Enrolling in Protocol...</span>
                            </>
                          ) : (
                            <>
                              <CheckBadgeIcon className="w-4 h-4" />
                              <span>Refer Patient & Enroll in Trial</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
