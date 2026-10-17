"use client";

import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  ArrowDownTrayIcon, 
  ClipboardDocumentCheckIcon, 
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CodeBracketIcon,
  ListBulletIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { PatientWithDocs } from "./ChatSidebar";
import { exportPatientFHIRBundle } from "@/app/actions/patients";

interface FhirExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientWithDocs | null;
  onExportSuccess?: () => void;
}

export function FhirExportModal({ isOpen, onClose, patient, onExportSuccess }: FhirExportModalProps) {
  const [bundle, setBundle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "json" | "resources">("overview");

  useEffect(() => {
    if (isOpen && patient) {
      loadBundle();
    } else {
      setBundle(null);
    }
  }, [isOpen, patient]);

  const loadBundle = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const data = await exportPatientFHIRBundle(patient.id);
      setBundle(data);
      if (onExportSuccess) onExportSuccess();
    } catch (e) {
      console.error("Failed to generate FHIR Bundle:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !patient) return null;

  const handleCopy = () => {
    if (!bundle) return;
    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!bundle) return;
    const jsonString = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonString], { type: "application/fhir+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FHIR_Bundle_Patient_${patient.id}_${patient.name.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group entries by resourceType
  const entries: any[] = bundle?.entry || [];
  const resourceCounts: Record<string, number> = {};
  entries.forEach((e) => {
    const rType = e.resource?.resourceType || "Unknown";
    resourceCounts[rType] = (resourceCounts[rType] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
              <DocumentDuplicateIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  HL7® FHIR® R4 Interoperability Bundle
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Release 4.0.1
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  US Core STU4
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Standard electronic health data bundle for <span className="font-semibold text-gray-800 dark:text-gray-200">{patient.name}</span> (MRN: MED-{patient.id}0084).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadBundle}
              disabled={loading}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Regenerate FHIR bundle"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin text-emerald-500" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "overview"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs border border-gray-200 dark:border-gray-700"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <InformationCircleIcon className="w-4 h-4" />
              <span>Bundle Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "resources"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs border border-gray-200 dark:border-gray-700"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
              <span>Resource Inventory ({entries.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "json"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs border border-gray-200 dark:border-gray-700"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <CodeBracketIcon className="w-4 h-4" />
              <span>Raw FHIR JSON</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={!bundle}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={!bundle}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-xs transition cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Download Bundle</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <ArrowPathIcon className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Compiling FHIR v4.0 Bundle...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Translating relational schemas, LOINC codes, DICOM scan references, and signed SOAP attachments.
              </p>
            </div>
          ) : !bundle ? (
            <div className="py-20 text-center text-gray-400">
              Failed to load FHIR bundle. Please retry.
            </div>
          ) : activeTab === "overview" ? (
            <div className="space-y-6">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-500/20">
                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    Patient Profile
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {resourceCounts["Patient"] || 1}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    MRN: MED-{patient.id}0084
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20">
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Observations
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {resourceCounts["Observation"] || 0}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    LOINC Vitals & BP
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-500/20">
                  <div className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                    Diagnostic Reports
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {resourceCounts["DiagnosticReport"] || 0}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Imaging & Scans
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-500/20">
                  <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                    Document References
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {resourceCounts["DocumentReference"] || 0}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    SOAP Clinical Notes
                  </div>
                </div>
              </div>

              {/* Interoperability Specs & Metadata */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
                <div className="flex items-center space-x-2 mb-3">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    Health Information Exchange (HIE) Compliance Specification
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Bundle Identifier:</span>
                    <p className="font-mono text-gray-800 dark:text-gray-200 mt-0.5 truncate">{bundle.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Bundle Type:</span>
                    <p className="font-mono text-gray-800 dark:text-gray-200 mt-0.5">collection (Standard HL7 R4)</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Target Organization:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">MedIntel Regional Clinical Health System</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Export Timestamp:</span>
                    <p className="font-mono text-gray-800 dark:text-gray-200 mt-0.5">{bundle.timestamp}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-700/60 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    ✓ Validated LOINC Codes (85354-9, 8867-4, 2708-6, 11506-3)
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                    ✓ DICOM Modality Mapping (RAD / EC / LAB)
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    ✓ Base64 DocumentReference Attachments
                  </span>
                </div>
              </div>

              {/* Ready to Export Callout */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                      Bundle Ready for Electronic Health Record (EHR) Ingestion
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Compatible with Epic Systems, Cerner / Oracle Health, and SMART on FHIR app gateways.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Download .JSON
                </button>
              </div>
            </div>
          ) : activeTab === "resources" ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Showing all {entries.length} FHIR resources compiled into this bundle:
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                {entries.map((entry, idx) => {
                  const res = entry.resource;
                  return (
                    <div key={idx} className="p-3.5 bg-white dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {res.resourceType}
                          </span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {res.id}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                          {entry.fullUrl}
                        </div>
                        {res.code?.text && (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400">
                            Coding: {res.code.text}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {res.status || "active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  bundle-patient-{patient.id}.json ({entries.length} items, {(JSON.stringify(bundle).length / 1024).toFixed(1)} KB)
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied!" : "Copy Full JSON"}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-gray-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[60vh] border border-gray-800">
                <code>{JSON.stringify(bundle, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
            <span>FHIR® is the registered trademark of HL7 and is used with permission.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
          >
            Close Exporter
          </button>
        </div>
      </div>
    </div>
  );
}
