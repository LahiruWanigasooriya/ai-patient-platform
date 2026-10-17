"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
import { 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  ArrowRightOnRectangleIcon, 
  UserPlusIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ShieldExclamationIcon,
  EyeIcon,
  PhotoIcon,
  MicrophoneIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { getPatients, deletePatient } from "./actions/patients";
import { EditPatientModal } from "@/components/EditPatientModal";
import { MoreVertical, Edit2, Trash2, FileText, Scan, TrendingUp, Mic, AlertTriangle, Loader2 } from "lucide-react";

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

  // Edit, Delete & Card 3-dots Menu States
  const [activeMenuPatientId, setActiveMenuPatientId] = useState<number | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientWithDocs | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<PatientWithDocs | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close 3-dots dropdown when clicking outside
  useEffect(() => {
    const handleWindowClick = () => setActiveMenuPatientId(null);
    if (activeMenuPatientId !== null) {
      window.addEventListener("click", handleWindowClick);
      return () => window.removeEventListener("click", handleWindowClick);
    }
  }, [activeMenuPatientId]);

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
    <div className="flex h-screen w-full bg-[#f8f9fa] dark:bg-gray-950 overflow-hidden font-sans">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navigation */}
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 z-20">
          <div 
            className="flex items-center cursor-pointer group py-1" 
            onClick={() => { setSelectedPatient(null); setActiveTab("patients"); }}
          >
            <img
              src="/logo.png"
              alt="MedIntel AI Platform"
              className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => { setActiveTab("patients"); setSelectedPatient(null); }}
                className={`font-medium transition-colors cursor-pointer text-sm px-3 py-1.5 rounded-lg ${
                  activeTab === "patients" 
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-semibold" 
                    : "text-gray-600 dark:text-gray-300 hover:text-emerald-500"
                }`}
              >
                Explore Patients
              </button>

              <button 
                onClick={() => { setActiveTab("analytics"); setSelectedPatient(null); }}
                className={`flex items-center space-x-1.5 font-medium transition-colors cursor-pointer text-sm px-3 py-1.5 rounded-lg ${
                  activeTab === "analytics" 
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-semibold" 
                    : "text-gray-600 dark:text-gray-300 hover:text-emerald-500"
                }`}
              >
                <ChartBarIcon className="w-4 h-4" />
                <span>Cohort Analytics</span>
              </button>
              
              <button 
                onClick={() => setIsAuditModalOpen(true)}
                className="flex items-center space-x-1.5 font-semibold text-xs px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer shadow-2xs"
                title="Open HIPAA Audit Trail & Security Ledger"
              >
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>HIPAA Audit Log</span>
              </button>

              <button 
                onClick={() => setIsAddPatientModalOpen(true)}
                className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <UserPlusIcon className="w-4 h-4" />
                <span>+ Admit Patient</span>
              </button>
            </nav>

            {/* Platform Settings Button (opens Settings Modal with Theme Switcher) */}
            <div className="flex items-center pl-1 md:pl-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group shadow-2xs"
                title="Platform Settings & Theme Preferences"
                aria-label="Settings"
              >
                <Cog6ToothIcon className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              </button>
            </div>
            
            {session ? (
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center space-x-2.5 p-1.5 -m-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800/80 transition cursor-pointer group text-left border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  title="Open Clinician Profile Settings"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600 group-hover:ring-2 group-hover:ring-emerald-500 transition">
                      {currentUserImage ? (
                        <img src={currentUserImage} alt="User avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                          {currentUserName?.charAt(0) || session.user?.email?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>
                    {/* Status Dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {currentUserName || "Dr. Staff"}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                      {session.user?.email}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs">
                Log In
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          
          {/* TAB 1: PATIENTS ROSTER & EXPLORE */}
          {activeTab === "patients" && (
            <div>
              {/* Hero Section */}
              <div className="relative w-full h-[40vh] bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center px-4 overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                />
                
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center max-w-2xl tracking-tight z-10">
                  Stunning Patient Insights <br/> <span className="text-emerald-400 font-light">Powered by AI</span>
                </h2>
                <p className="text-gray-300 mb-6 text-sm md:text-base text-center max-w-xl z-10">
                  Multi-tenant clinical records, longitudinal vitals telemetry, and pharmacological safety intelligence.
                </p>
                
                {/* Search Bar */}
                <div className="w-full max-w-4xl relative z-10 group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-13 pr-32 py-4 rounded-full border-0 text-base text-gray-900 bg-white shadow-xl focus:ring-4 focus:ring-emerald-500/30 transition-all placeholder:text-gray-400 outline-none" 
                    placeholder="Search patients, conditions, or clinical summaries..." 
                  />
                  <div className="absolute inset-y-0 right-1.5 flex items-center">
                    <button 
                      onClick={() => setIsAddPatientModalOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <UserPlusIcon className="w-3.5 h-3.5" />
                      <span>Admit</span>
                    </button>
                  </div>
                </div>
              </div>


              {/* Patient Roster Header & Controls */}
              <div className="max-w-[1500px] mx-auto px-6 py-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                      <span>{searchQuery ? "Search Results" : "Patient Roster"}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                        {filteredPatients.length} active
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Select a patient card to open the AI diagnostic copilot, view historical vitals curves, or inspect source PDF chunks.
                    </p>
                  </div>
                  
                  {/* Status Filter Buttons */}
                  <div className="flex items-center space-x-2">
                    {(["All", "Critical", "Review", "Stable"] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          statusFilter === filter
                            ? "bg-emerald-500 text-white shadow-xs font-semibold"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-400"
                        }`}
                      >
                        {filter} {filter !== "All" && `(${patients.filter(p => p.status === filter).length})`}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsAddPatientModalOpen(true)}
                      className="ml-2 flex items-center space-x-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3.5 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition shadow-xs cursor-pointer"
                    >
                      <UserPlusIcon className="w-3.5 h-3.5" />
                      <span>Admit</span>
                    </button>
                  </div>
                </div>

                {/* Patient Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
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
                    <div 
                      key={patient.id} 
                      onClick={() => setSelectedPatient(patient.id)}
                      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between relative ${
                        selectedPatient === patient.id ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                      }`}
                    >
                      <div>
                        {/* Top Area: Profile Pic, Name/Age/Medical ID, Status & 3-Dots */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          {/* Left: Avatar + Details */}
                          <div className="flex items-start space-x-3.5 min-w-0">
                            {/* Profile Picture */}
                            <div className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0 bg-[#a3a3a3] flex items-center justify-center shadow-2xs">
                              {patient.image ? (
                                <img
                                  src={patient.image}
                                  alt={patient.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-[66px] h-[66px] text-white translate-y-2" viewBox="0 0 24 24" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>

                            {/* Name, Age, Medical ID */}
                            <div className="min-w-0 pt-0.5">
                              <h4 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight truncate group-hover:text-emerald-600 transition-colors">
                                {patient.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                                Age : {patient.age}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                Medical ID : #{patient.id}0084
                              </p>
                            </div>
                          </div>

                          {/* Right: Status Pill & 3-Dots Menu */}
                          <div className="flex items-start space-x-2 flex-shrink-0 relative">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-gray-400 dark:text-gray-500 font-normal mb-1">
                                Status
                              </span>
                              <span className={`text-xs font-semibold px-4 py-1 rounded-full text-white shadow-2xs ${
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
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuPatientId(activeMenuPatientId === patient.id ? null : patient.id);
                                }}
                                className="p-1 -mr-1 text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                                title="Patient Options"
                              >
                                <MoreVertical className="w-5 h-5 stroke-[2.5]" />
                              </button>

                              {/* Dropdown Popup Window */}
                              {activeMenuPatientId === patient.id && (
                                <div 
                                  className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuPatientId(null);
                                      setEditingPatient(patient);
                                    }}
                                    className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition cursor-pointer text-left"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuPatientId(null);
                                      setDeletingPatient(patient);
                                    }}
                                    className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer text-left"
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
                        <p className="text-sm text-[#8e8e93] dark:text-gray-400 font-normal leading-relaxed line-clamp-3 mb-4">
                          {patient.summary}
                        </p>
                      </div>

                      <div>
                        {/* Thin Divider Line */}
                        <div className="border-t border-gray-200/80 dark:border-gray-800 mb-4" />

                        {/* Bottom Footer: 2-Column Metrics Grid & Get FHIR Action */}
                        <div className="flex items-center justify-between">
                          {/* 2-Column Metrics with Lucide Icons */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                            {/* Records */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (patient.documents && patient.documents.length > 0) {
                                  setViewingDoc({
                                    fileName: patient.documents[0].fileName,
                                    patientId: patient.id,
                                    patientName: patient.name,
                                  });
                                }
                              }}
                              className="flex items-center space-x-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-left"
                              title="Inspect medical records"
                            >
                              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="font-normal">{patient.documents?.length || 0} Records</span>
                            </button>

                            {/* Scans */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageAnalysisPatient(patient);
                              }}
                              className="flex items-center space-x-2.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer text-left"
                              title="View diagnostic imaging & radiology scans"
                            >
                              <Scan className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="font-normal">{patient.images?.length || 0} Scans</span>
                            </button>

                            {/* Vitals / Curve */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTrajectoryPatient(patient);
                              }}
                              className="flex items-center space-x-2.5 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer text-left"
                              title="View vitals trajectory curve"
                            >
                              <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="font-normal">{patient.vitalReadings?.length || 0} Records</span>
                            </button>

                            {/* Notes */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setScribePatient(patient);
                              }}
                              className="flex items-center space-x-2.5 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer text-left"
                              title="Ambient AI Scribe & Clinical Voice Notes"
                            >
                              <Mic className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="font-normal">{patient.clinicalNotes?.length || 0} Notes</span>
                            </button>
                          </div>

                          {/* Right: Stacked Sheets Icon & Get FHIR */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFhirExportPatient(patient);
                            }}
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer pl-2 group/fhir flex-shrink-0"
                            title="Export HL7 FHIR Release 4.0 Bundle"
                          >
                            <svg className="w-7 h-7 text-gray-600 dark:text-gray-400 group-hover/fhir:text-emerald-600 dark:group-hover/fhir:text-emerald-400 transition flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="7" y="6" width="13" height="15" rx="2" />
                              <path d="M5 18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              <line x1="10" y1="10" x2="17" y2="10" />
                              <line x1="10" y1="13" x2="17" y2="13" />
                              <line x1="10" y1="16" x2="14" y2="16" />
                            </svg>
                            <span className="text-base font-normal">Get FHIR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COHORT ANALYTICS & ACUITY DASHBOARD */}
          {activeTab === "analytics" && (
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
                    onClick={refreshPatients}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    <span>Refresh Data</span>
                  </button>
                  <button 
                    onClick={() => setIsAddPatientModalOpen(true)}
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
                    onClick={() => { setStatusFilter("Critical"); setActiveTab("patients"); }}
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
                    onClick={() => { setStatusFilter("Review"); setActiveTab("patients"); }}
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
                    onClick={() => { setStatusFilter("Stable"); setActiveTab("patients"); }}
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
                          onClick={() => { setSelectedPatient(p.id); }}
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
                              onClick={() => {
                                setViewingDoc({
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
                            onClick={() => setTrajectoryPatient(p)}
                            className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="View vitals trajectory"
                          >
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                          </button>

                          {p.images && p.images.length > 0 && (
                            <button
                              onClick={() => setImageAnalysisPatient(p)}
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
          )}

        </main>
      </div>

      {/* Right Sidebar (AI Chatbot) - Only visible when a patient is selected */}
      <div className={`transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 z-30 ${selectedPatient ? 'w-[430px] translate-x-0' : 'w-0 translate-x-full border-none'}`}>
        <div className="h-full w-[430px]">
          {selectedPatient && (
            <ChatSidebar 
              key={selectedPatient}
              patientId={selectedPatient}
              patient={patients.find(p => p.id === selectedPatient) || null}
              onClose={() => setSelectedPatient(null)}
              onDocumentUploaded={refreshPatients}
            />
          )}
        </div>
      </div>

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
          onAskAI={(title) => {
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
      {deletingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Patient Record</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">HIPAA Protected Clinical Data Removal</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">{deletingPatient.name}</strong> (Medical ID: #{deletingPatient.id}0084)? All associated documents, vitals curves, diagnostic scans, and clinical notes will be removed from PostgreSQL and ChromaDB.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingPatient(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Patient</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
