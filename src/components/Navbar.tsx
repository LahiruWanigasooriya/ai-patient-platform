"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  UserPlusIcon, 
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export interface NavbarProps {
  activeTab: "patients" | "analytics";
  setActiveTab: (tab: "patients" | "analytics") => void;
  onLogoClick: () => void;
  onOpenAuditModal: () => void;
  onOpenAddPatient: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  currentUserName: string;
  currentUserImage: string | null;
  userEmail?: string | null;
  isAuthenticated: boolean;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onLogoClick,
  onOpenAuditModal,
  onOpenAddPatient,
  onOpenSettings,
  onOpenProfile,
  currentUserName,
  currentUserImage,
  userEmail,
  isAuthenticated,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on resize to desktop (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <header className="relative bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-30">
      <div className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Brand Logo */}
        <div 
          className="flex items-center cursor-pointer group py-1" 
          onClick={() => {
            setIsMobileMenuOpen(false);
            onLogoClick();
          }}
        >
          <img
            src="/logo.png"
            alt="MedIntel AI Platform"
            className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* Right Area: Desktop Nav & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
          {/* Desktop Navigation Tabs & Primary Actions (hidden on mobile/tablet < md) */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <button 
              onClick={() => setActiveTab("patients")}
              className={`font-medium transition-colors cursor-pointer text-sm px-3 py-1.5 rounded-lg ${
                activeTab === "patients" 
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-semibold" 
                  : "text-gray-600 dark:text-gray-300 hover:text-emerald-500"
              }`}
            >
              Explore Patients
            </button>

            <button 
              onClick={() => setActiveTab("analytics")}
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
              onClick={onOpenAuditModal}
              className="flex items-center space-x-1.5 font-semibold text-xs px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer shadow-2xs"
              title="Open HIPAA Audit Trail & Security Ledger"
            >
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>HIPAA Audit Log</span>
            </button>

            <button 
              onClick={onOpenAddPatient}
              className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>+ Admit Patient</span>
            </button>
          </nav>

          {/* Platform Settings Button (always visible for quick theme & preference changes) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group shadow-2xs"
            title="Platform Settings & Theme Preferences"
            aria-label="Settings"
          >
            <Cog6ToothIcon className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          </button>
          
          {/* Clinician Profile Trigger or Login Link */}
          {isAuthenticated ? (
            <div className="flex items-center pl-1 sm:pl-3 md:pl-4 border-l border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center space-x-2 sm:space-x-2.5 p-1 sm:p-1.5 -m-1 sm:-m-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800/80 transition cursor-pointer group text-left border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                title="Open Clinician Profile Settings"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600 group-hover:ring-2 group-hover:ring-emerald-500 transition">
                    {currentUserImage ? (
                      <img src={currentUserImage} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                        {currentUserName?.charAt(0) || userEmail?.charAt(0) || 'D'}
                      </span>
                    )}
                  </div>
                  {/* Online Status Dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
                </div>

                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {currentUserName || "Dr. Staff"}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                    {userEmail}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs">
              Log In
            </Link>
          )}

          {/* Hamburger Menu Toggle Button (Visible below md) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer border border-gray-200 dark:border-gray-700"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Slide-Down Menu (< md) */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200"
        >
          {/* Mobile Navigation Tabs */}
          <div className="flex flex-col space-y-1.5">
            <button 
              onClick={() => {
                setActiveTab("patients");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left ${
                activeTab === "patients" 
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" 
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              }`}
            >
              <span>Explore Patients</span>
            </button>

            <button 
              onClick={() => {
                setActiveTab("analytics");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left ${
                activeTab === "analytics" 
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" 
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              }`}
            >
              <ChartBarIcon className="w-4 h-4 text-emerald-500" />
              <span>Cohort Analytics</span>
            </button>

            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuditModal();
              }}
              className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition cursor-pointer text-left"
            >
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              <span>HIPAA Audit Log</span>
            </button>
          </div>

          {/* Primary CTA Button on Mobile */}
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenAddPatient();
            }}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>+ Admit Patient</span>
          </button>

          {/* Clinician Profile Summary in Mobile Menu */}
          {isAuthenticated && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="flex items-center space-x-3 cursor-pointer py-1"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  {currentUserImage ? (
                    <img src={currentUserImage} alt="User avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                      {currentUserName?.charAt(0) || userEmail?.charAt(0) || 'D'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {currentUserName || "Dr. Staff"}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {userEmail}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
