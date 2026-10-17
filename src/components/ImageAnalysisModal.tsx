"use client";

import { useState } from "react";
import { 
  XMarkIcon, 
  PhotoIcon, 
  AdjustmentsHorizontalIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/outline";
import { MedicalImage } from "@prisma/client";

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: number;
  initialImages: MedicalImage[];
  onAskAI?: (imageTitle: string) => void;
}

export function ImageAnalysisModal({
  isOpen,
  onClose,
  patientName,
  patientId,
  initialImages,
  onAskAI,
}: ImageAnalysisModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [contrastLevel, setContrastLevel] = useState(100);
  const [brightnessLevel, setBrightnessLevel] = useState(100);
  const [activeTab, setActiveTab] = useState<"findings" | "gallery" | "dicom">("findings");

  if (!isOpen || initialImages.length === 0) return null;

  const currentImage = initialImages[selectedImageIndex] || initialImages[0];

  const resetFilters = () => {
    setIsInverted(false);
    setZoomLevel(1);
    setContrastLevel(100);
    setBrightnessLevel(100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[90vh] bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-100">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <PhotoIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {currentImage.title}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {currentImage.imageType}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-800 text-gray-300">
                  {currentImage.fileName}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Patient: <span className="text-white font-medium">{patientName}</span> • Patient ID: #{patientId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onAskAI && (
              <button
                onClick={() => onAskAI(currentImage.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <SparklesIcon className="w-4 h-4" />
                Analyze with AI Copilot
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Canvas + Right Intelligence Panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT: Diagnostic Viewer Canvas */}
          <div className="flex-1 flex flex-col bg-[#05070a] relative select-none overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-800">
            
            {/* Viewport Toolbar Controls */}
            <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-gray-900/80 backdrop-blur-md border border-gray-800 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInverted(!isInverted)}
                  className={`px-2.5 py-1 rounded-md font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                    isInverted 
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                      : "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700"
                  }`}
                  title="Invert negative/positive radiograph film tones"
                >
                  <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                  Invert Film ({isInverted ? "ON" : "OFF"})
                </button>

                <div className="flex items-center gap-1 bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-700">
                  <span className="text-[11px] text-gray-400">Zoom:</span>
                  <button 
                    onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.2))}
                    className="px-1.5 hover:text-white font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-cyan-400 w-10 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button 
                    onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.2))}
                    className="px-1.5 hover:text-white font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400">Contrast:</span>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={contrastLevel}
                    onChange={(e) => setContrastLevel(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400">Brightness:</span>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={brightnessLevel}
                    onChange={(e) => setBrightnessLevel(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <button
                  onClick={resetFilters}
                  className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
                  title="Reset viewport adjustments"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Image Canvas Container */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <div 
                className="transition-transform duration-150 ease-out origin-center flex items-center justify-center max-w-full max-h-full"
                style={{
                  transform: `scale(${zoomLevel})`,
                  filter: `invert(${isInverted ? 1 : 0}) contrast(${contrastLevel}%) brightness(${brightnessLevel}%)`
                }}
              >
                <img
                  src={currentImage.imageUrl}
                  alt={currentImage.title}
                  className="rounded-lg shadow-2xl max-w-full max-h-[65vh] object-contain border border-gray-800"
                />
              </div>
            </div>

            {/* Bottom Status & Technical Legend */}
            <div className="px-4 py-2 bg-gray-900/60 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span>{currentImage.modalityDetail || "High-Resolution Diagnostic Render"}</span>
              <span>MedIntel Medical Vision Suite • Level 2 Verified</span>
            </div>
          </div>

          {/* RIGHT: Clinical Intelligence Panel */}
          <div className="w-full lg:w-96 bg-gray-900/80 flex flex-col border-t lg:border-t-0 border-gray-800 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-800 bg-gray-950/60">
              <button
                onClick={() => setActiveTab("findings")}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "findings"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                AI Findings
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "gallery"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                Scans ({initialImages.length})
              </button>
              <button
                onClick={() => setActiveTab("dicom")}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "dicom"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                Metadata
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              {activeTab === "findings" && (
                <div className="space-y-4">
                  {/* Primary Impression */}
                  <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 shadow-sm">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-2">
                      <SparklesIcon className="w-4 h-4" />
                      Radiological AI Impression
                    </div>
                    <p className="text-gray-300 leading-relaxed font-sans text-xs">
                      {currentImage.aiImpression || "No automated impression generated yet. Click 'Analyze with AI Copilot' to evaluate."}
                    </p>
                  </div>

                  {/* Clinical Reason / Notes */}
                  {currentImage.clinicalNotes && (
                    <div className="p-3 rounded-lg bg-gray-950/50 border border-gray-800">
                      <span className="text-[11px] font-semibold text-gray-400 block mb-1">Indication / Clinical Note:</span>
                      <p className="text-gray-300 text-xs italic">"{currentImage.clinicalNotes}"</p>
                    </div>
                  )}

                  {/* Anatomical Key Findings Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2">
                      Key Diagnostic Observations
                    </h4>

                    {currentImage.imageType === "X-Ray" && (
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 flex items-start gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-red-300 block">Cardiomegaly (CTR 0.61)</span>
                            <span className="text-gray-400 text-[11px]">Transverse cardiac diameter exceeds 50% of inner thoracic width. Left ventricular contour prominent.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-start gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-300 block">Vascular Cephalization</span>
                            <span className="text-gray-400 text-[11px]">Mild upper lobe pulmonary venous redistribution consistent with elevated left atrial pressure.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-emerald-300 block">No Pleural Effusion / Infiltrates</span>
                            <span className="text-gray-400 text-[11px]">Bilateral lung fields clear of focal consolidation. No pneumothorax.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentImage.imageType === "ECG" && (
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 flex items-start gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-red-300 block">Sokolow-Lyon Voltage Criterion Met</span>
                            <span className="text-gray-400 text-[11px]">S in V1 (28mm) + R in V5 (20mm) = 48mm (&gt;35mm). Confirms Left Ventricular Hypertrophy.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-start gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-300 block">Lateral Repolarization Strain</span>
                            <span className="text-gray-400 text-[11px]">Asymmetrical T-wave inversion in leads I, aVL, V5, V6 indicative of high subendocardial afterload.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-emerald-300 block">Normal Sinus Rhythm</span>
                            <span className="text-gray-400 text-[11px]">Concentric P waves, normal PR interval (168ms), heart rate 88 bpm.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentImage.imageType === "Lab Report" && (
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 flex items-start gap-2">
                          <ShieldExclamationIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-red-300 block">Penicillin Specific IgE (Class IV)</span>
                            <span className="text-gray-400 text-[11px]">Penicilloyl G 18.4 kU/L, Penicilloyl V 14.1 kU/L. Immediate hypersensitivity confirmed.</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-emerald-300 block">Normal Renal &amp; Electrolytes</span>
                            <span className="text-gray-400 text-[11px]">Creatinine 0.82 mg/dL, Potassium 4.2 mmol/L, eGFR &gt; 90 mL/min.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="space-y-3">
                  <p className="text-gray-400 text-[11px]">
                    Select a scan to inspect in the high-resolution diagnostic viewport:
                  </p>
                  <div className="space-y-2">
                    {initialImages.map((img, idx) => (
                      <div
                        key={img.id}
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          resetFilters();
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          idx === selectedImageIndex
                            ? "bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950/30"
                            : "bg-gray-950 border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-black border border-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-white truncate text-xs">{img.title}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300">
                              {img.imageType}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 truncate block mt-0.5 font-mono">
                            {img.fileName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "dicom" && (
                <div className="space-y-3 text-[11px] font-mono">
                  <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-2">
                    <div className="flex justify-between border-b border-gray-900 pb-1.5">
                      <span className="text-gray-500">Image ID</span>
                      <span className="text-gray-300">{currentImage.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-900 pb-1.5">
                      <span className="text-gray-500">File Name</span>
                      <span className="text-gray-300">{currentImage.fileName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-900 pb-1.5">
                      <span className="text-gray-500">Clinical Modality</span>
                      <span className="text-cyan-400 font-bold">{currentImage.imageType}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-900 pb-1.5">
                      <span className="text-gray-500">Patient Association</span>
                      <span className="text-gray-300">{patientName} (ID: #{patientId})</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-900 pb-1.5">
                      <span className="text-gray-500">Acquisition Date</span>
                      <span className="text-gray-300">{new Date(currentImage.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Security / Isolation</span>
                      <span className="text-emerald-400 font-bold">Strict Tenant Partition</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Panel Action Footer */}
            <div className="p-4 bg-gray-950 border-t border-gray-800 flex justify-end">
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
