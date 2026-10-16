"use client";

import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  PrinterIcon, 
  SparklesIcon, 
  DocumentCheckIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";

interface ChunkData {
  id: string;
  text: string;
  wordCount: number;
  source: string;
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  patientId: number | null;
  patientName?: string;
  onAskAI?: (prompt: string) => void;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  fileName,
  patientId,
  patientName = "Patient",
  onAskAI,
}: DocumentViewerModalProps) {
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"chunks" | "fulltext">("chunks");

  useEffect(() => {
    if (!isOpen || !fileName || !patientId) {
      setChunks([]);
      return;
    }

    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/documents/${patientId}/${encodeURIComponent(fileName)}/chunks`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chunks) {
          setChunks(data.chunks);
        } else {
          setChunks([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load chunks:", err);
        setChunks([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, fileName, patientId]);

  if (!isOpen || !fileName) return null;

  const filteredChunks = chunks.filter((c) =>
    c.text.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const fullText = chunks.map((c) => c.text).join("\n\n---\n\n");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[88vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-md">
                  {fileName}
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  ChromaDB Indexed
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Assigned to: <strong className="text-gray-700 dark:text-gray-200">{patientName}</strong> • Patient #{patientId}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
              title="Print Document"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader Toolbar & Tabs */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("chunks")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "chunks"
                  ? "bg-emerald-500 text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Semantic Chunks ({chunks.length})
            </button>
            <button
              onClick={() => setActiveTab("fulltext")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "fulltext"
                  ? "bg-emerald-500 text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Synthesized Clinical View
            </button>
          </div>

          {/* Search within document */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Fetching vectorized chunks from ChromaDB...</p>
            </div>
          ) : chunks.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No indexed text chunks found for this file.</p>
              <p className="text-xs text-gray-500 mt-1">
                The document may have been recently uploaded or indexed under a different identifier.
              </p>
            </div>
          ) : activeTab === "chunks" ? (
            <div className="space-y-4">
              {filteredChunks.map((chunk, idx) => (
                <div
                  key={chunk.id || idx}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 pb-2.5 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate max-w-sm">
                        {chunk.id}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {chunk.wordCount} words
                    </span>
                  </div>

                  <p className="text-xs text-gray-800 dark:text-gray-200 font-mono leading-relaxed whitespace-pre-wrap">
                    {chunk.text}
                  </p>

                  {onAskAI && (
                    <div className="mt-3 pt-2.5 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-end">
                      <button
                        onClick={() => {
                          onAskAI(`Based on chunk #${idx + 1} of ${fileName}: ${chunk.text.slice(0, 120)}... please summarize clinical implications.`);
                          onClose();
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                      >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>Analyze this chunk with AI &rarr;</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <DocumentCheckIcon className="w-5 h-5 text-emerald-500" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Full Clinical Report Content
                </h4>
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200 font-sans leading-relaxed whitespace-pre-wrap">
                {fullText}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Source: ChromaDB Partitioned Collection (Namespace: patient_{patientId}_)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold hover:opacity-90 transition cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
