"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { 
  XMarkIcon, 
  UserCircleIcon, 
  EnvelopeIcon, 
  IdentificationIcon, 
  BuildingOffice2Icon, 
  AcademicCapIcon, 
  PhoneIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ArrowRightOnRectangleIcon,
  CheckBadgeIcon,
  SparklesIcon,
  CameraIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { getUserProfile, updateUserProfile, UserProfileData } from "@/app/actions/user";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: { name: string | null; image: string | null }) => void;
}

const PRESET_AVATARS = [
  {
    label: "Male Physician (Diagnostic)",
    url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
  },
  {
    label: "Female Physician (Cardiology)",
    url: "https://images.unsplash.com/photo-1594824813639-4507c6f09204?q=80&w=400&auto=format&fit=crop",
  },
  {
    label: "Attending Surgeon (Scrubs)",
    url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
  },
  {
    label: "Clinical Scientist (Lab)",
    url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop",
  },
];

export function UserProfileModal({ isOpen, onClose, onProfileUpdated }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "credentials" | "avatar">("general");

  // Editable Form States
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [department, setDepartment] = useState("");
  const [hospital, setHospital] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setErrorMessage(null);
    try {
      const data = await getUserProfile();
      if (data) {
        setProfile(data);
        setName(data.name || "");
        setImage(data.image || "");
        setTitle(data.title || "Attending Physician, MD");
        setSpecialty(data.specialty || "Internal Medicine & Cardiology");
        setDepartment(data.department || "Department of Clinical Medicine");
        setHospital(data.hospital || "MedIntel Health Network");
        setPhone(data.phone || "+1 (555) 839-2001");
        setLicenseNumber(data.licenseNumber || "LIC-MED-99420");
        setBio(data.bio || "Board-certified physician leveraging AI clinical intelligence for diagnostic precision and patient care.");
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    const startTime = Date.now();

    try {
      const res = await updateUserProfile({
        name,
        image,
        title,
        specialty,
        department,
        hospital,
        phone,
        licenseNumber,
        bio,
      });

      // Ensure the 'Saving' loader is visible for at least 700ms so the user has clear visual confirmation
      const elapsed = Date.now() - startTime;
      if (elapsed < 700) {
        await new Promise((resolve) => setTimeout(resolve, 700 - elapsed));
      }

      if (res.success && res.user) {
        setProfile(res.user);
        setSaveSuccess(true);
        if (onProfileUpdated) {
          onProfileUpdated({
            name: res.user.name,
            image: res.user.image,
          });
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      const msg = err instanceof Error ? err.message : "Failed to save profile changes. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto z-10 transition-all max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IdentificationIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Clinician Profile & Settings
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Manage your credentials, provider details, and hospital affiliation.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Close Profile Settings"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Clinician Identity Card */}
        <div className="px-6 py-5 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            
            {/* Avatar with Status Ring */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                {image ? (
                  <img src={image} alt="Clinician Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {name?.charAt(0) || "D"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("avatar")}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                title="Change Avatar Photo"
              >
                <CameraIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clinician Headline */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  {name || "Dr. Staff"}
                </h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Licensed Clinician</span>
                </span>
              </div>

              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {title || "Attending Physician"} • {specialty || "Internal Medicine"}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-[11px] text-gray-600 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>{profile?.email || "doctor@medintel.com"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <BuildingOffice2Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span>{hospital || "MedIntel Health"}</span>
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900/40 text-[10px]">
                  {profile?.patientsCount ?? 6} Assigned Patients
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === "general"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            General Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === "credentials"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Clinical Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("avatar")}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === "avatar"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Avatar Presets
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Real-time Saving Loader Banner */}
          {saving && (
            <div className="flex items-center space-x-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-semibold shadow-xs animate-pulse">
              <div className="w-4 h-4 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Saving Clinician Profile Details...</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 font-normal">Persisting credentials to PostgreSQL database and syncing session.</p>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium animate-fadeIn">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Clinician profile and clinical credentials successfully updated!</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center space-x-2.5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl text-xs font-medium">
              <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-7 h-7 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Loading clinician credentials...</p>
            </div>
          ) : activeTab === "general" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Clinician Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Gregory House, MD"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Email Address (Registered)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    title="Email is tied to your clinical login account"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Direct Contact / Pager Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 839-2001"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    State License / Medical ID
                  </label>
                  <div className="relative">
                    <ShieldCheckIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="LIC-MED-99420"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Professional Biography & Practice Summary
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Clinical focus, board certifications, and research interests..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition resize-none"
                />
              </div>
            </div>
          ) : activeTab === "credentials" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Professional Title / Rank
                  </label>
                  <div className="relative">
                    <AcademicCapIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Chief of Cardiology, MD"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Primary Clinical Specialty
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Cardiovascular Disease & Nephrology"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Hospital Department / Unit
                  </label>
                  <div className="relative">
                    <BuildingOffice2Icon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Department of Inpatient Medicine"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Healthcare System / Facility
                  </label>
                  <input
                    type="text"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="e.g. MedIntel Regional Health Network"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Security & Access Summary */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                    <span>HIPAA Security Clearances</span>
                  </span>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                    Authorized for Level-3 ePHI chart audit inspection and HL7 FHIR export.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                  ACTIVE STATUS
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Custom Avatar Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden transition"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Enter any direct image link or choose from our curated clinical portrait presets below.
                </p>
              </div>

              {/* Preset Avatar Selection Grid */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Curated Clinical Avatars
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = image === preset.url;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImage(preset.url)}
                        className={`flex flex-col items-center p-3 rounded-2xl border transition text-center cursor-pointer group ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/40"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden shadow-xs mb-2 border border-gray-200 dark:border-gray-600">
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* LOGOUT BUTTON - MOVED HERE AS REQUESTED */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 transition cursor-pointer shadow-2xs group"
              title="End session and securely sign out of MedIntel"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
              <span>Sign Out of MedIntel</span>
            </button>

            {/* Cancel & Save Buttons */}
            <div className="w-full sm:w-auto flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving || loading}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
