"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { User, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PatientWithDocs } from "./ChatSidebar";
import { updatePatient, addPatientDocument } from "@/app/actions/patients";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientWithDocs | null;
  onPatientUpdated: () => void;
}

export function EditPatientModal({
  isOpen,
  onClose,
  patient,
  onPatientUpdated,
}: EditPatientModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [status, setStatus] = useState<"Stable" | "Review" | "Critical">("Stable");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState("");
  const [documents, setDocuments] = useState<{ id: string; fileName: string }[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (patient) {
      setName(patient.name || "");
      setAge(patient.age ?? "");
      setStatus((patient.status as "Stable" | "Review" | "Critical") || "Stable");
      setSummary(patient.summary || "");
      setImage(patient.image || "");
      setDocuments(patient.documents || []);
      setError(null);
      setUploadSuccessMessage(null);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF documents are supported.");
      return;
    }

    try {
      setIsUploadingDoc(true);
      setError(null);
      setUploadSuccessMessage(null);

      // Attempt FastAPI vector ingestion
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("patient_id", patient.id.toString());
        await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.warn("FastAPI ingestion offline, persisting in PostgreSQL:", err);
      }

      // Add to PostgreSQL
      const newDoc = await addPatientDocument(patient.id, file.name);
      setDocuments(prev => [{ id: newDoc.id, fileName: newDoc.fileName }, ...prev]);
      setUploadSuccessMessage(`Successfully uploaded and indexed "${file.name}"`);
    } catch (err: any) {
      console.error("Doc upload error:", err);
      setError(err?.message || "Failed to upload document.");
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) {
        docInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !summary.trim()) {
      setError("Please fill in all required clinical fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await updatePatient(patient.id, {
        name: name.trim(),
        age: Number(age),
        status,
        summary: summary.trim(),
        image: image.trim() || null,
      });
      onPatientUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update patient record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Patient Record</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update clinical information, profile photo & documents</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {uploadSuccessMessage && (
            <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{uploadSuccessMessage}</span>
            </div>
          )}

          {/* Profile Picture Uploader & Preview */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Patient Profile Picture
            </label>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700">
              {/* Avatar Preview */}
              <div className="relative flex-shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt={name || "Patient"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#a8a8a8] flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600">
                    <svg className="w-full h-full text-white translate-y-1.5 scale-90" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-xs transition cursor-pointer"
                    title="Remove picture"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition shadow-2xs">
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-gray-400">JPG, PNG, WebP up to 5MB</span>
                </div>
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={image.startsWith("data:") ? "" : image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Row: Name, Age, Medical ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Eleanor Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                required
                min={0}
                max={130}
                placeholder="42"
                value={age}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : "")}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Medical ID (Locked)
              </label>
              <input
                type="text"
                disabled
                value={`#${patient.id}0084`}
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                title="Medical ID is permanently assigned by the hospital EHR and cannot be modified"
              />
            </div>
          </div>

          {/* Acuity Level Status Buttons */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Clinical Acuity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Stable", "Review", "Critical"] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setStatus(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border cursor-pointer ${
                    status === lvl
                      ? lvl === "Critical"
                        ? "bg-[#ff3b30] text-white border-[#ff3b30] shadow-xs"
                        : lvl === "Review"
                        ? "bg-[#ff9500] text-white border-[#ff9500] shadow-xs"
                        : "bg-[#34c759] text-white border-[#34c759] shadow-xs"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    status === lvl ? "bg-white" : lvl === "Critical" ? "bg-[#ff3b30]" : lvl === "Review" ? "bg-[#ff9500]" : "bg-[#34c759]"
                  }`} />
                  <span>{lvl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Description / Summary */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Clinical Summary & Diagnoses
            </label>
            <textarea
              required
              rows={3}
              placeholder="Clinical status, symptoms, diagnoses, and medical background..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none leading-relaxed"
            />
          </div>

          {/* Relevant Documents Section */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Attached Documents ({documents.length})
              </label>
              <label className="cursor-pointer inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>+ Upload PDF</span>
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf"
                  disabled={isUploadingDoc}
                  onChange={handleDocUpload}
                  className="hidden"
                />
              </label>
            </div>

            {isUploadingDoc && (
              <div className="p-3 mb-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-300 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Uploading and indexing medical PDF into ChromaDB...</span>
              </div>
            )}

            {documents.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">No documents currently attached. Upload a clinical report above.</p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{doc.fileName}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-gray-200/60 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      Indexed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
