"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChatSidebar, PatientWithDocs } from "@/components/ChatSidebar";
import { AddPatientModal } from "@/components/AddPatientModal";
import { DocumentViewerModal } from "@/components/DocumentViewerModal";
import { VitalsTrajectoryModal } from "@/components/VitalsTrajectoryModal";
import { ImageAnalysisModal } from "@/components/ImageAnalysisModal";
import { AmbientScribeModal } from "@/components/AmbientScribeModal";
import { AuditTrailModal } from "@/components/AuditTrailModal";
import { FhirExportModal } from "@/components/FhirExportModal";
import { UserProfileModal } from "@/components/UserProfileModal";
import { SettingsModal } from "@/components/SettingsModal";
import { EditPatientModal } from "@/components/EditPatientModal";
import { PatientCard } from "@/components/PatientCard";
import { Navbar } from "@/components/Navbar";
import { HeroSearch } from "@/components/HeroSearch";
import { PatientFilterBar } from "@/components/PatientFilterBar";
import { CohortAnalyticsView } from "@/components/CohortAnalyticsView";
import { ResizableSidebar } from "@/components/ResizableSidebar";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getPatients, deletePatient } from "./actions/patients";

export default function Dashboard() {
  const { data: session } = useSession();
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Critical" | "Review" | "Stable">("All");
  const [activeTab, setActiveTab] = useState<"patients" | "analytics">("patients");
  const [patients, setPatients] = useState<PatientWithDocs[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  // Epic 5, 6, 7 & 8 Modals
  const [viewingDoc, setViewingDoc] = useState<{ fileName: string; patientId: number; patientName: string } | null>(null);
  const [trajectoryPatient, setTrajectoryPatient] = useState<PatientWithDocs | null>(null);
  const [imageAnalysisPatient, setImageAnalysisPatient] = useState<PatientWithDocs | null>(null);
  const [scribePatient, setScribePatient] = useState<PatientWithDocs | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [fhirExportPatient, setFhirExportPatient] = useState<PatientWithDocs | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [profileOverride, setProfileOverride] = useState<{ name: string | null; image: string | null } | null>(null);

  // Edit & Delete Modal States
  const [editingPatient, setEditingPatient] = useState<PatientWithDocs | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<PatientWithDocs | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingPatient) return;
    try {
      setIsDeleting(true);
      await deletePatient(deletingPatient.id);
      if (selectedPatient === deletingPatient.id) {
        setSelectedPatient(null);
      }
      setDeletingPatient(null);
      refreshPatients();
    } catch (err) {
      console.error("Failed to delete patient record:", err);
      alert("Failed to delete patient record. Please check backend connection.");
    } finally {
      setIsDeleting(false);
    }
  };

  const currentUserName = profileOverride?.name ?? session?.user?.name ?? "Dr. Gregory House";
  const currentUserImage = profileOverride?.image ?? session?.user?.image ?? null;

  const refreshPatients = () => {
    setLoading(true);
    getPatients().then(data => {
      setPatients(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (session) {
      refreshPatients();
    } else {
      setPatients([]);
      setLoading(false);
    }
  }, [session]);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const patientCounts = {
    critical: patients.filter(p => p.status === "Critical").length,
    review: patients.filter(p => p.status === "Review").length,
    stable: patients.filter(p => p.status === "Stable").length,
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] dark:bg-gray-950 overflow-hidden font-sans">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedPatient(null);
          }}
          onLogoClick={() => {
            setSelectedPatient(null);
            setActiveTab("patients");
          }}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
          onOpenAddPatient={() => setIsAddPatientModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          currentUserName={currentUserName}
          currentUserImage={currentUserImage}
          userEmail={session?.user?.email}
          isAuthenticated={!!session}
        />

        <main className="flex-1 overflow-y-auto scroll-smooth">
          
          {/* TAB 1: PATIENTS ROSTER & EXPLORE */}
          {activeTab === "patients" && (
            <div>
              {/* Hero Search Section */}
              <HeroSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAdmitClick={() => setIsAddPatientModalOpen(true)}
              />

              {/* Patient Roster Header & Controls */}
              <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <PatientFilterBar
                  searchQuery={searchQuery}
                  totalFiltered={filteredPatients.length}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  counts={patientCounts}
                  onAdmitClick={() => setIsAddPatientModalOpen(true)}
                />

                {/* Patient Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-20">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xs p-6 h-48 animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                      </div>
                    ))
                  ) : filteredPatients.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
                      <UserCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">No matching clinical records</h4>
                      <p className="text-xs text-gray-400 mb-4">Try adjusting your search query or acuity filter, or admit a new patient.</p>
                      <button 
                        onClick={() => { setSearchQuery(""); setStatusFilter("All"); }}
                        className="text-xs text-emerald-600 font-semibold hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : filteredPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      isSelected={selectedPatient === patient.id}
                      onSelect={(patientId) => setSelectedPatient(patientId)}
                      onViewDoc={(doc) => setViewingDoc(doc)}
                      onViewScans={(p) => setImageAnalysisPatient(p)}
                      onViewVitals={(p) => setTrajectoryPatient(p)}
                      onViewNotes={(p) => setScribePatient(p)}
                      onExportFhir={(p) => setFhirExportPatient(p)}
                      onEdit={(p) => setEditingPatient(p)}
                      onDelete={(p) => setDeletingPatient(p)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COHORT ANALYTICS & ACUITY DASHBOARD */}
          {activeTab === "analytics" && (
            <CohortAnalyticsView
              patients={patients}
              onRefresh={refreshPatients}
              onAdmit={() => setIsAddPatientModalOpen(true)}
              onFilterStatus={(status) => {
                setStatusFilter(status);
                setActiveTab("patients");
              }}
              onSelectPatient={(patientId) => setSelectedPatient(patientId)}
              onViewDoc={(doc) => setViewingDoc(doc)}
              onViewVitals={(p) => setTrajectoryPatient(p)}
              onViewScans={(p) => setImageAnalysisPatient(p)}
            />
          )}

        </main>
      </div>

      {/* Right Sidebar (AI Chatbot) - Resizable with draggable left margin splitter */}
      <ResizableSidebar isOpen={!!selectedPatient}>
        {selectedPatient && (
          <ChatSidebar 
            key={selectedPatient}
            patientId={selectedPatient}
            patient={patients.find(p => p.id === selectedPatient) || null}
            onClose={() => setSelectedPatient(null)}
            onDocumentUploaded={refreshPatients}
          />
        )}
      </ResizableSidebar>

      {/* Admit Patient Modal */}
      <AddPatientModal 
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onPatientCreated={refreshPatients}
      />

      {/* In-App Document Viewer & Citation Inspector */}
      {viewingDoc && (
        <DocumentViewerModal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          fileName={viewingDoc.fileName}
          patientId={viewingDoc.patientId}
          patientName={viewingDoc.patientName}
          onAskAI={() => {
            setSelectedPatient(viewingDoc.patientId);
            setViewingDoc(null);
          }}
        />
      )}

      {/* Longitudinal Vitals Trajectory Chart Modal */}
      {trajectoryPatient && (
        <VitalsTrajectoryModal
          isOpen={!!trajectoryPatient}
          onClose={() => setTrajectoryPatient(null)}
          patientName={trajectoryPatient.name}
          patientId={trajectoryPatient.id}
          status={trajectoryPatient.status}
          vitals={trajectoryPatient.vitalReadings || []}
        />
      )}

      {/* High-Resolution Diagnostic Vision & Radiology Modal */}
      {imageAnalysisPatient && imageAnalysisPatient.images && imageAnalysisPatient.images.length > 0 && (
        <ImageAnalysisModal
          isOpen={!!imageAnalysisPatient}
          onClose={() => setImageAnalysisPatient(null)}
          patientName={imageAnalysisPatient.name}
          patientId={imageAnalysisPatient.id}
          initialImages={imageAnalysisPatient.images}
          onAskAI={() => {
            setSelectedPatient(imageAnalysisPatient.id);
            setImageAnalysisPatient(null);
          }}
        />
      )}

      {/* Ambient AI Scribe & Clinical Voice Dictation Modal */}
      {scribePatient && (
        <AmbientScribeModal
          isOpen={!!scribePatient}
          onClose={() => setScribePatient(null)}
          patient={scribePatient}
          onNoteSaved={refreshPatients}
        />
      )}

      {/* HIPAA Compliance & Security Audit Ledger Modal */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onOpenFhirExport={(patientId) => {
          const pt = patients.find(p => p.id === patientId);
          if (pt) {
            setFhirExportPatient(pt);
          }
        }}
      />

      {/* HL7 FHIR v4.0 Interoperability Export Modal */}
      {fhirExportPatient && (
        <FhirExportModal
          isOpen={!!fhirExportPatient}
          onClose={() => setFhirExportPatient(null)}
          patient={fhirExportPatient}
          onExportSuccess={refreshPatients}
        />
      )}

      {/* Clinician Profile Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updated) => setProfileOverride(updated)}
      />

      {/* Platform Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        onPatientUpdated={refreshPatients}
      />

      {/* Delete Patient Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={!!deletingPatient}
        patient={deletingPatient}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPatient(null)}
      />
      
    </div>
  );
}
