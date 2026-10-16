"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useRef, useEffect } from "react";
import { PaperClipIcon, CloudIcon, CalculatorIcon, DocumentMagnifyingGlassIcon, XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Patient, Document as PatientDocument } from "@prisma/client";
import { addPatientDocument } from "@/app/actions/patients";

export type PatientWithDocs = Patient & {
  documents?: PatientDocument[];
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
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      {/* Header */}
      <header className="p-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {patient ? patient.name : "Patient AI Assistant"}
            </h2>
            {patient && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                patient.status === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' :
                patient.status === 'Stable' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400'
              }`}>
                {patient.status}
              </span>
            )}
          </div>
          {patient && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Age: {patient.age} • ID: #{patient.id}0084
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-md shadow-xs border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 transition cursor-pointer"
        >
          {isUploading ? "Uploading..." : "+ Upload PDF"}
        </button>
      </div>

      {/* Document Chips */}
      {documents.length > 0 && (
        <div className="px-4 py-1.5 bg-gray-50/90 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
          {documents.map((doc, idx) => (
            <span key={idx} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-xs">
              <DocumentTextIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="truncate max-w-[120px]">{doc}</span>
            </span>
          ))}
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
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border dark:border-gray-700 shadow-sm rounded-bl-none"
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
                    
                    if (toolName === "getWeather") {
                      return (
                        <div key={index} className="flex flex-col my-2">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-3 rounded-lg shadow-sm text-sm">
                            <div className="flex items-center space-x-1 mb-1">
                              <CloudIcon className="w-4 h-4" />
                              <span className="font-semibold">{input?.location || "Weather"}</span>
                            </div>
                            <div className="opacity-90">{output}</div>
                          </div>
                        </div>
                      );
                    }
                    
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
                    
                    if (toolName === "searchDocuments") {
                      return (
                        <div key={index} className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded w-fit border border-indigo-100 dark:border-indigo-800 my-2 text-xs">
                           <DocumentMagnifyingGlassIcon className="w-3 h-3" />
                           <span>Retrieved context for: "{input?.query}"</span>
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
        
        {/* Processing Animation */}
        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex-shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 items-center"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            title="Upload PDF"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isUploading ? "Uploading..." : "Ask a question..."}
            disabled={isUploading}
            className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isUploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
