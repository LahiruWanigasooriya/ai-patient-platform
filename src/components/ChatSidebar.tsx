"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useRef, useEffect } from "react";
import { 
  PaperClipIcon, 
  CloudIcon, 
  CalculatorIcon, 
  DocumentMagnifyingGlassIcon, 
  XMarkIcon, 
  DocumentTextIcon, 
  HeartIcon, 
  DocumentCheckIcon, 
  ExclamationTriangleIcon, 
  PrinterIcon,
  ShieldExclamationIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  EyeIcon,
  SparklesIcon,
  PhotoIcon,
  MicrophoneIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Patient, Document as PatientDocument, VitalReading, MedicalImage, ClinicalNote } from "@prisma/client";
import { addPatientDocument, createClinicalNote } from "@/app/actions/patients";
import { DocumentViewerModal } from "./DocumentViewerModal";
import { VitalsTrajectoryModal } from "./VitalsTrajectoryModal";
import { ImageAnalysisModal } from "./ImageAnalysisModal";
import { AmbientScribeModal } from "./AmbientScribeModal";
import { FhirExportModal } from "./FhirExportModal";

export type PatientWithDocs = Patient & {
  documents?: PatientDocument[];
  vitalReadings?: VitalReading[];
  images?: MedicalImage[];
  clinicalNotes?: ClinicalNote[];
};

interface ChatSidebarProps {
  patientId?: number | null;
  patient?: PatientWithDocs | null;
  onClose?: () => void;
  onDocumentUploaded?: () => void;
}

export function ChatSidebar({ patientId, patient, onClose, onDocumentUploaded }: ChatSidebarProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      body: { patientId },
    }),
    messages: [
      {
        id: "initial",
        role: "assistant",
        parts: [{ 
          type: "text", 
          text: patient 
            ? `Hello! I am your AI clinical assistant for **${patient.name}** (Age ${patient.age}, Status: ${patient.status}). How can I assist you with this patient's case today?` 
            : "Hello! I am your AI assistant for this patient. How can I help you today?" 
        }],
      } as UIMessage,
    ],
  });

  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<string[]>(patient?.documents?.map(d => d.fileName) || []);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [isTrajectoryOpen, setIsTrajectoryOpen] = useState(false);
  const [isImageAnalysisOpen, setIsImageAnalysisOpen] = useState(false);
  const [isScribeOpen, setIsScribeOpen] = useState(false);
  const [signedSoapNotes, setSignedSoapNotes] = useState<Record<string, boolean>>({});
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (patient?.documents) {
      setDocuments(patient.documents.map(d => d.fileName));
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isUploading) return;
    sendMessage({ text: input }, { body: { patientId } });
    setInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      alert("Only PDF files are supported!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (patientId) {
      formData.append("patient_id", patientId.toString());
    }

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      const data = await response.json();
      console.log("Upload successful:", data);

      // Record in PostgreSQL document table
      if (patientId) {
        await addPatientDocument(patientId, file.name);
        setDocuments(prev => [file.name, ...prev]);
        if (onDocumentUploaded) {
          onDocumentUploaded();
        }
      }
      
      // Let the LLM know the file was uploaded successfully
      sendMessage({ 
        text: `[System Update]: I just uploaded a new clinical PDF titled '${file.name}'. It was successfully chunked into ${data.chunks_created} parts and embedded in ChromaDB strictly for Patient #${patientId} (${patient?.name || "current patient"}). You may now search this document.` 
      }, { body: { patientId } });

    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file. Please check if the FastAPI backend is running.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Header */}
      <header className="p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-xs flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {patient ? patient.name : "Patient AI Assistant"}
            </h2>
            {patient && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                patient.status === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' :
                patient.status === 'Stable' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              }`}>
                {patient.status}
              </span>
            )}
          </div>
          {patient && (
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Age: {patient.age} • ID: #{patient.id}0084
              </span>
              <span>•</span>
              <button
                onClick={() => setIsTrajectoryOpen(true)}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center space-x-0.5 cursor-pointer"
              >
                <ArrowTrendingUpIcon className="w-3 h-3" />
                <span>Vitals Trajectory</span>
              </button>
              <span>•</span>
              <button
                onClick={() => setIsScribeOpen(true)}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center space-x-0.5 cursor-pointer"
              >
                <MicrophoneIcon className="w-3 h-3" />
                <span>AI Scribe</span>
              </button>

            </div>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            aria-label="Close Sidebar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Subheader: Active Indexed Documents for this Patient */}
      <div className="px-4 py-2 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <DocumentTextIcon className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold truncate">
            {documents.length > 0 
              ? `${documents.length} Medical Record${documents.length > 1 ? 's' : ''} Linked`
              : "No Records Uploaded Yet"}
          </span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-md shadow-2xs border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 transition cursor-pointer"
        >
          {isUploading ? "Uploading..." : "+ Upload PDF"}
        </button>
      </div>

      {/* Interactive Document Chips (Click to view inside DocumentViewerModal) */}
      {documents.length > 0 && (
        <div className="px-4 py-1.5 bg-gray-50/90 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
          {documents.map((doc, idx) => (
            <button
              key={idx}
              onClick={() => setViewingDoc(doc)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-2xs hover:border-emerald-500 hover:text-emerald-600 transition cursor-pointer group"
              title="Click to inspect document & citations"
            >
              <DocumentTextIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="truncate max-w-[120px] font-medium">{doc}</span>
              <EyeIcon className="w-2.5 h-2.5 text-gray-400 group-hover:text-emerald-500 ml-0.5" />
            </button>
          ))}
          {patient?.images && patient.images.length > 0 && (
            <button
              onClick={() => setIsImageAnalysisOpen(true)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-2xs hover:border-cyan-400 transition cursor-pointer group"
              title="Click to inspect patient diagnostic radiographs & scans"
            >
              <PhotoIcon className="w-3 h-3 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
              <span className="font-semibold">{patient.images.length} Diagnostic Scans</span>
              <EyeIcon className="w-2.5 h-2.5 text-cyan-500 ml-0.5" />
            </button>
          )}
          {patient && (
            <button
              onClick={() => setIsScribeOpen(true)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-2xs hover:border-rose-400 transition cursor-pointer group"
              title="Ambient AI Scribe & Clinical Voice Dictation"
            >
              <MicrophoneIcon className="w-3 h-3 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span className="font-semibold">Ambient Scribe</span>
              {patient.clinicalNotes && patient.clinicalNotes.length > 0 && (
                <span className="ml-0.5 px-1 bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 rounded-full text-[9px] font-bold">
                  {patient.clinicalNotes.length}
                </span>
              )}
            </button>
          )}

        </div>
      )}

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border dark:border-gray-700 shadow-2xs rounded-bl-none"
              }`}
            >
              {msg.parts?.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <div key={index} className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {part.text}
                      </ReactMarkdown>
                    </div>
                  );
                }
                
                if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                  const toolName = part.type === "dynamic-tool" ? (part as any).toolName : part.type.slice(5);
                  const state = (part as any).state;
                  
                  // Generative UI: Completed Tools
                  if (state === "output-available") {
                    const output = (part as any).output;
                    const input = (part as any).input;
                    
                    // 1. Weather Tool
                    if (toolName === "getWeather") {
                      return (
                        <div key={index} className="flex flex-col my-2">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-3 rounded-lg shadow-xs text-sm">
                            <div className="flex items-center space-x-1 mb-1">
                              <CloudIcon className="w-4 h-4" />
                              <span className="font-semibold">{input?.location || "Weather"}</span>
                            </div>
                            <div className="opacity-90">{output}</div>
                          </div>
                        </div>
                      );
                    }
                    
                    // 2. Calculator Tool
                    if (toolName === "calculator") {
                      return (
                        <div key={index} className="flex flex-col my-2">
                          <div className="bg-gray-800 text-green-400 font-mono p-2 rounded-lg shadow-inner border border-gray-700 w-fit text-sm">
                            <div className="flex items-center space-x-1 text-[10px] text-gray-400 mb-1 border-b border-gray-700 pb-1">
                              <CalculatorIcon className="w-3 h-3" />
                              <span>CALC</span>
                            </div>
                            <div>
                              {input?.a} {input?.operation === 'add' ? '+' : input?.operation === 'subtract' ? '-' : input?.operation === 'multiply' ? '×' : '÷'} {input?.b}
                            </div>
                            <div className="font-bold">= {output}</div>
                          </div>
                        </div>
                      );
                    }
                    
                    // 3. Vitals Assessment Generative UI Card
                    if (toolName === "evaluateVitals") {
                      const v = output || {};
                      const isCrisis = v.severity === "critical";
                      const isHigh = v.severity === "high";
                      const isModerate = v.severity === "moderate";

                      const borderClass = isCrisis ? "border-red-500/80 bg-red-500/10" :
                        isHigh ? "border-amber-500/80 bg-amber-500/10" :
                        isModerate ? "border-yellow-500/80 bg-yellow-500/10" :
                        "border-emerald-500/80 bg-emerald-500/10";

                      const badgeClass = isCrisis ? "bg-red-600 text-white animate-pulse" :
                        isHigh ? "bg-amber-600 text-white" :
                        isModerate ? "bg-yellow-600 text-white" :
                        "bg-emerald-600 text-white";

                      return (
                        <div key={index} className={`my-3 p-4 rounded-xl border ${borderClass} shadow-xs backdrop-blur-xs text-left w-full max-w-sm`}>
                          <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 pb-2 mb-3">
                            <div className="flex items-center space-x-2">
                              <HeartIcon className={`w-5 h-5 ${isCrisis || isHigh ? 'text-red-500' : 'text-emerald-500'}`} />
                              <span className="font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                Vitals Assessment
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                              {v.category || "Evaluated"}
                            </span>
                          </div>

                          {/* BP, MAP, Pulse Pressure */}
                          <div className="grid grid-cols-3 gap-2 text-center my-2">
                            <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                              <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Blood Pressure</div>
                              <div className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                                {v.systolic}/{v.diastolic}
                                <span className="text-[9px] font-normal text-gray-400 block">mmHg</span>
                              </div>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                              <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Mean Arterial</div>
                              <div className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                                {v.map}
                                <span className="text-[9px] font-normal text-gray-400 block">MAP</span>
                              </div>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                              <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Pulse Pressure</div>
                              <div className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                                {v.pulsePressure}
                                <span className="text-[9px] font-normal text-gray-400 block">mmHg</span>
                              </div>
                            </div>
                          </div>

                          {/* Recommendation Box */}
                          {v.recommendation && (
                            <div className="mt-3 p-2.5 bg-white/70 dark:bg-gray-800/70 rounded-lg text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 flex items-start space-x-2">
                              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div className="leading-relaxed">
                                <span className="font-semibold text-gray-900 dark:text-white">Guidance: </span>
                                {v.recommendation}
                              </div>
                            </div>
                          )}

                          {/* Trajectory Link */}
                          <div className="mt-2.5 pt-2 border-t border-gray-200/40 dark:border-gray-700/40 flex justify-between items-center text-[11px]">
                            <span className="text-gray-400 text-[10px]">Saved to DB trajectory</span>
                            <button
                              onClick={() => setIsTrajectoryOpen(true)}
                              className="text-rose-600 dark:text-rose-400 font-bold hover:underline inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <span>View Historical Curve &rarr;</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // 4. Clinical Consultation Note Card
                    if (toolName === "generateClinicalSummary") {
                      const rep = output || {};
                      return (
                        <div key={index} className="my-3 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/30 dark:to-gray-900 shadow-2xs text-left w-full max-w-sm">
                          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-800/40 pb-2 mb-3">
                            <div className="flex items-center space-x-2">
                              <DocumentCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                              <div>
                                <h4 className="font-bold text-xs text-gray-900 dark:text-white leading-tight">
                                  {rep.summaryTitle || "Clinical Consultation Note"}
                                </h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {rep.patientName} • {rep.date}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => window.print()}
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 shadow-2xs transition cursor-pointer"
                              title="Print or Save as PDF"
                            >
                              <PrinterIcon className="w-3 h-3" />
                              <span>Print</span>
                            </button>
                          </div>

                          {/* Key Findings */}
                          {rep.keyFindings && rep.keyFindings.length > 0 && (
                            <div className="mb-2">
                              <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                                Clinical Diagnoses
                              </div>
                              <ul className="space-y-0.5 text-xs text-gray-700 dark:text-gray-300">
                                {rep.keyFindings.map((finding: string, fi: number) => (
                                  <li key={fi} className="flex items-start space-x-1.5">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <span>{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Prescriptions */}
                          {rep.prescriptions && rep.prescriptions.length > 0 && (
                            <div className="mb-2 p-2 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-indigo-50 dark:border-indigo-900/40">
                              <div className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1">
                                Prescribed Medications (Rx)
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {rep.prescriptions.map((rx: string, ri: number) => (
                                  <span key={ri} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 font-medium">
                                    💊 {rx}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Follow-up */}
                          {rep.followUp && (
                            <div className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                              <span className="font-semibold text-gray-800 dark:text-gray-200 not-italic">Plan: </span>
                              {rep.followUp}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // 5. Drug-Drug Interaction & Allergy Safety Matrix Card
                    if (toolName === "checkDrugInteractions") {
                      const d = output || {};
                      const hasConflict = d.hasSevereConflict;
                      const hasInteractions = d.interactions && d.interactions.length > 0;
                      const hasAllergies = d.allergyAlerts && d.allergyAlerts.length > 0;

                      const cardBorder = hasConflict
                        ? "border-red-500/80 bg-red-500/10"
                        : hasInteractions
                        ? "border-amber-500/80 bg-amber-500/10"
                        : "border-emerald-500/80 bg-emerald-500/10";

                      return (
                        <div key={index} className={`my-3 p-4 rounded-xl border ${cardBorder} shadow-xs text-left w-full max-w-sm backdrop-blur-xs`}>
                          <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 pb-2 mb-3">
                            <div className="flex items-center space-x-2">
                              <ShieldExclamationIcon className={`w-5 h-5 ${hasConflict ? 'text-red-500 animate-pulse' : hasInteractions ? 'text-amber-500' : 'text-emerald-500'}`} />
                              <span className="font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                Drug Safety & DDI Review
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              hasConflict ? "bg-red-600 text-white" : hasInteractions ? "bg-amber-600 text-white" : "bg-emerald-600 text-white"
                            }`}>
                              {hasConflict ? "CRITICAL RISK" : hasInteractions ? "MODERATE RISK" : "COMPATIBLE"}
                            </span>
                          </div>

                          {/* Evaluated Medications Chips */}
                          <div className="mb-2.5">
                            <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                              Analyzed Regimen ({d.medications?.length || 0})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {d.medications?.map((m: string, mi: number) => (
                                <span key={mi} className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-medium shadow-2xs">
                                  💊 {m}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Allergy Alerts */}
                          {hasAllergies && (
                            <div className="mb-3 p-2.5 rounded-lg bg-red-100/80 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 space-y-1">
                              <div className="font-bold flex items-center space-x-1 text-red-700 dark:text-red-300">
                                <span>⚠️ Allergic Cross-Reactivity Alert</span>
                              </div>
                              {d.allergyAlerts.map((a: any, ai: number) => (
                                <div key={ai} className="text-[11px] leading-relaxed">
                                  <strong>{a.drug}</strong> conflicts with known <strong>{a.allergen}</strong> allergy ({a.reactionRisk}).
                                  <div className="font-bold text-red-700 dark:text-red-400 mt-0.5">{a.action}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Specific Drug-Drug Interactions */}
                          {hasInteractions ? (
                            <div className="space-y-2">
                              {d.interactions.map((inter: any, ii: number) => (
                                <div key={ii} className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 text-xs shadow-2xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {inter.drugA} ⇄ {inter.drugB}
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      inter.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {inter.severity.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed mb-1.5">
                                    <strong className="text-gray-900 dark:text-gray-100">Mechanism: </strong>
                                    {inter.mechanism}
                                  </div>
                                  <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[10px] text-amber-900 dark:text-amber-200">
                                    <div className="font-bold">Recommendation: {inter.recommendedAction}</div>
                                    {inter.saferAlternatives?.length > 0 && (
                                      <div className="mt-1">
                                        <span className="text-gray-600 dark:text-gray-400">Safer options: </span>
                                        {inter.saferAlternatives.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : !hasAllergies && (
                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>No major pharmacological contraindications detected for this regimen.</span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // 6. Medical Vision & Radiology Scan Analysis
                    if (toolName === "analyzeMedicalScan") {
                      const scan = output || {};
                      return (
                        <div key={index} className="my-3 p-4 rounded-xl bg-gray-950 border border-cyan-500/30 text-gray-100 shadow-lg shadow-cyan-950/20 text-xs">
                          {/* Card Header */}
                          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                                <PhotoIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-xs tracking-tight">
                                  {scan.scanTitle || "Medical Diagnostic Vision Review"}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {scan.modality || scan.scanType} • {scan.analyzedAt}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              AI Vision Analyzed
                            </span>
                          </div>

                          {/* Thumbnail & Key Metrics Row */}
                          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-900 border border-gray-800 mb-3">
                            {scan.imageUrl && (
                              <div 
                                onClick={() => setIsImageAnalysisOpen(true)}
                                className="w-16 h-16 rounded-md bg-black border border-gray-700 overflow-hidden flex-shrink-0 cursor-pointer relative group"
                                title="Click to expand scan in high-resolution inspector"
                              >
                                <img src={scan.imageUrl} alt={scan.scanTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <EyeIcon className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Differential Diagnosis</span>
                              <div className="flex flex-wrap gap-1">
                                {scan.differentialDiagnosis?.map((d: string, i: number) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-200 border border-gray-700 font-sans">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Findings List */}
                          <div className="space-y-1.5 mb-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Observed Findings</span>
                            {scan.findings?.map((f: any, i: number) => (
                              <div key={i} className="flex items-start justify-between gap-2 p-2 rounded-md bg-gray-900/60 border border-gray-800/80">
                                <div>
                                  <span className="font-semibold text-gray-200 block text-[11px]">{f.anatomicalRegion}</span>
                                  <span className="text-gray-400 text-[11px]">{f.finding}</span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${
                                  f.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                                  f.severity === 'severe' ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
                                  f.severity === 'moderate' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                                  f.severity === 'mild' ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30' :
                                  'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {f.severity}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Radiologist AI Impression Box */}
                          {scan.radiologicalImpression && (
                            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 mb-3">
                              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Radiological Impression:</span>
                              <p className="text-cyan-100 text-xs font-sans leading-relaxed">{scan.radiologicalImpression}</p>
                            </div>
                          )}

                          {/* Actionable Recommendations */}
                          {scan.recommendations && scan.recommendations.length > 0 && (
                            <div className="mb-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Clinical Follow-up & Next Steps</span>
                              <ul className="list-disc list-inside text-[11px] text-gray-300 space-y-0.5">
                                {scan.recommendations.map((r: string, i: number) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Footer Button */}
                          <button
                            onClick={() => setIsImageAnalysisOpen(true)}
                            className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            Open in High-Resolution Vision Inspector
                          </button>
                        </div>
                      );
                    }

                    // 7. Ambient AI Scribe & Clinical SOAP Note Generative UI Card
                    if (toolName === "synthesizeSoapNote") {
                      const soap = output || {};
                      const noteKey = `${soap.patientId || patientId}-${index}`;
                      const isSigned = signedSoapNotes[noteKey];

                      return (
                        <div key={index} className="my-3 p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-rose-500/30 text-gray-100 shadow-xl shadow-rose-950/20 text-xs">
                          {/* Header */}
                          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
                                <MicrophoneIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-xs tracking-tight">
                                  {soap.noteTitle || "Clinical SOAP Consultation Note"}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {soap.encounterType} • {soap.synthesizedAt || "Live Synthesized"}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                              Ambient Scribe AI
                            </span>
                          </div>

                          {/* 4 Quadrants */}
                          <div className="space-y-2.5 mb-3">
                            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px]">
                              <span className="font-bold text-blue-300 block mb-0.5">S • Subjective:</span>
                              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{soap.subjective}</p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-[11px]">
                              <span className="font-bold text-emerald-300 block mb-0.5">O • Objective:</span>
                              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{soap.objective}</p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-[11px]">
                              <span className="font-bold text-amber-300 block mb-0.5">A • Assessment:</span>
                              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{soap.assessment}</p>
                            </div>

                            <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-900/40 text-[11px]">
                              <span className="font-bold text-purple-300 block mb-0.5">P • Plan:</span>
                              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{soap.plan}</p>
                            </div>
                          </div>

                          {/* Suggested Billing Codes */}
                          {soap.cptCodes && soap.cptCodes.length > 0 && (
                            <div className="mb-3 p-2 bg-gray-900/80 rounded-lg border border-gray-800">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                Suggested Billing (CPT / ICD-10):
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {soap.cptCodes.map((c: any, ci: number) => (
                                  <span key={ci} className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-indigo-300 border border-indigo-900/60">
                                    <strong>{c.code}</strong>: {c.desc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                            {isSigned ? (
                              <div className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 font-semibold text-xs flex items-center justify-center space-x-1.5">
                                <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                                <span>Signed & Committed to EHR Chart</span>
                              </div>
                            ) : (
                              <button
                                onClick={async () => {
                                  if (!patientId) return;
                                  try {
                                    await createClinicalNote(patientId, {
                                      title: soap.noteTitle || "Consultation SOAP Note",
                                      noteType: "SOAP",
                                      subjective: soap.subjective || "",
                                      objective: soap.objective || "",
                                      assessment: soap.assessment || "",
                                      plan: soap.plan || "",
                                      rawTranscript: soap.rawTranscript || "",
                                      dictatedBy: "Dr. Gregory House, MD",
                                    });
                                    setSignedSoapNotes(prev => ({ ...prev, [noteKey]: true }));
                                    if (onDocumentUploaded) onDocumentUploaded();
                                  } catch (err) {
                                    console.error("Failed to commit note:", err);
                                  }
                                }}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-rose-950/40"
                              >
                                <CheckBadgeIcon className="w-4 h-4" />
                                <span>Sign & Commit Note to Chart</span>
                              </button>
                            )}
                            <button
                              onClick={() => setIsScribeOpen(true)}
                              className="py-1.5 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Open Ambient Scribe Studio"
                            >
                              <MicrophoneIcon className="w-3.5 h-3.5 text-rose-400" />
                              <span>Open Scribe</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // 8. HL7 FHIR Interoperability Bundle Generative UI Card
                    if (toolName === "exportFhirBundle") {
                      const fhir = output || {};
                      const counts = fhir.resourceCounts || {};

                      return (
                        <div key={index} className="my-3 p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-emerald-500/40 text-gray-100 shadow-xl shadow-emerald-950/20 text-xs">
                          {/* Header */}
                          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                <DocumentDuplicateIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-xs tracking-tight">
                                  HL7® FHIR® R4 Interoperability Bundle
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {fhir.patientName || patient?.name} • US Core STU4 Release 4.0.1
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {fhir.totalResources || 0} Resources
                            </span>
                          </div>

                          {/* Metadata Summary */}
                          <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-[11px]">
                            <div>
                              <span className="text-gray-400">Patient Identifier:</span>
                              <p className="font-mono font-bold text-emerald-300">{fhir.mrn || `MED-${patientId}0084`}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Standard Profile:</span>
                              <p className="font-mono text-gray-200 truncate">US Core / HL7 R4</p>
                            </div>
                          </div>

                          {/* Resource Breakdown Pills */}
                          <div className="mb-3">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              Compiled Health Resources ({fhir.totalResources || 0}):
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                              <span className="px-2 py-1 rounded bg-gray-900/90 border border-gray-800 text-gray-300 flex items-center justify-between">
                                <span>🧑 Patient Profile:</span>
                                <strong className="text-white">1</strong>
                              </span>
                              <span className="px-2 py-1 rounded bg-gray-900/90 border border-gray-800 text-gray-300 flex items-center justify-between">
                                <span>🩺 Observations:</span>
                                <strong className="text-emerald-400">{counts.Observation || 0}</strong>
                              </span>
                              <span className="px-2 py-1 rounded bg-gray-900/90 border border-gray-800 text-gray-300 flex items-center justify-between">
                                <span>🩻 Diagnostic Scans:</span>
                                <strong className="text-cyan-400">{counts.DiagnosticReport || 0}</strong>
                              </span>
                              <span className="px-2 py-1 rounded bg-gray-900/90 border border-gray-800 text-gray-300 flex items-center justify-between">
                                <span>📝 Clinical Notes:</span>
                                <strong className="text-rose-400">{counts.DocumentReference || 0}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Coding Standards Tag */}
                          <div className="mb-3 text-[10px] text-gray-400 flex items-center space-x-1 font-mono">
                            <span className="text-emerald-400 font-bold">LOINC:</span>
                            <span className="truncate">85354-9 (BP), 18748-4 (Scans), 11506-3 (SOAP)</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                            <button
                              onClick={() => setIsFhirModalOpen(true)}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950/40"
                            >
                              <DocumentDuplicateIcon className="w-4 h-4" />
                              <span>Inspect FHIR Bundle & Download</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // 9. Search Documents Citation
                    if (toolName === "searchDocuments") {
                      return (
                        <div 
                          key={index} 
                          onClick={() => setViewingDoc(documents[0] || null)}
                          className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg w-fit border border-indigo-100 dark:border-indigo-800 my-2 text-xs shadow-2xs cursor-pointer group transition"
                          title="Click to inspect document chunks"
                        >
                          <DocumentMagnifyingGlassIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span className="truncate max-w-[220px]">Searched records for: "{input?.query}"</span>
                          <span className="text-[10px] text-indigo-400 group-hover:underline">View &rarr;</span>
                        </div>
                      );
                    }

                    // Fallback for other completed tools
                    return (
                      <div key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded w-fit border border-gray-200 dark:border-gray-700 my-2 text-xs">
                        <span>✓</span>
                        <span>{toolName} complete</span>
                      </div>
                    );
                  }

                  // Loading State
                  return (
                    <div key={index} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded w-fit border border-blue-100 dark:border-blue-800 my-2 text-xs">
                      <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <span>Running {toolName}...</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Input Form */}
      <footer className="p-3 border-t bg-white dark:bg-gray-800 dark:border-gray-700 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* File Upload Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            title="Upload Clinical PDF (ChromaDB Indexed)"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isUploading ? "Uploading & chunking PDF..." : "Ask a medical question, evaluate vitals, or check drug safety..."}
            disabled={isUploading}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition border border-transparent focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={status !== "ready" || isUploading || !input.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer shadow-xs disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </footer>

      {/* In-App Document Viewer & Citation Inspector */}
      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        fileName={viewingDoc}
        patientId={patientId || null}
        patientName={patient?.name}
        onAskAI={(prompt) => sendMessage({ text: prompt }, { body: { patientId } })}
      />

      {/* Longitudinal Vitals Trajectory Chart Modal */}
      <VitalsTrajectoryModal
        isOpen={isTrajectoryOpen}
        onClose={() => setIsTrajectoryOpen(false)}
        patientName={patient?.name || "Patient"}
        patientId={patientId || null}
        status={patient?.status || "Stable"}
        vitals={patient?.vitalReadings || []}
      />

      {/* High-Resolution Diagnostic Vision & Radiology Modal */}
      {isImageAnalysisOpen && patient && patient.images && patient.images.length > 0 && (
        <ImageAnalysisModal
          isOpen={isImageAnalysisOpen}
          onClose={() => setIsImageAnalysisOpen(false)}
          patientName={patient.name}
          patientId={patient.id}
          initialImages={patient.images}
          onAskAI={(title) => {
            setIsImageAnalysisOpen(false);
            sendMessage({ text: `Please analyze the medical scan titled '${title}' for this patient.` }, { body: { patientId } });
          }}
        />
      )}

      {/* Ambient AI Scribe & Clinical Voice Dictation Modal */}
      <AmbientScribeModal
        isOpen={isScribeOpen}
        onClose={() => setIsScribeOpen(false)}
        patient={patient || null}
        onNoteSaved={() => {
          if (onDocumentUploaded) onDocumentUploaded();
        }}
      />

      {/* HL7 FHIR v4.0 Interoperability Export Modal */}
      <FhirExportModal
        isOpen={isFhirModalOpen}
        onClose={() => setIsFhirModalOpen(false)}
        patient={patient || null}
        onExportSuccess={() => {
          if (onDocumentUploaded) onDocumentUploaded();
        }}
      />

    </div>
  );
}
