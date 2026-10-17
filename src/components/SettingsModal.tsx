"use client";

import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  Cog6ToothIcon, 
  SunIcon, 
  MoonIcon, 
  BellIcon, 
  SpeakerWaveIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useTheme } from "./ThemeProvider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppSettings {
  soundAlerts: boolean;
  aiScribeChimes: boolean;
  compactDensity: boolean;
  highlightMedicalTerms: boolean;
  autoLockMinutes: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundAlerts: true,
  aiScribeChimes: true,
  compactDensity: false,
  highlightMedicalTerms: true,
  autoLockMinutes: 30,
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedBanner, setSavedBanner] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem("medintel-app-settings");
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      localStorage.setItem("medintel-app-settings", JSON.stringify(updated));
    } catch {
      // ignore
    }
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem("medintel-app-settings", JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // ignore
    }
    showSavedFeedback();
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
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto z-10 transition-all max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <Cog6ToothIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Platform Settings
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Manage appearance, notifications, and clinical interface preferences.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Close Settings"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Feedback Toast */}
        {savedBanner && (
          <div className="mx-6 mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Preferences updated and saved to your browser session.</span>
          </div>
        )}

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* SECTION 1: APPEARANCE & THEME */}
          <div>
            <div className="mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Interface Appearance & Theme
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Select your preferred visual mode for clinical workflows.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Light Theme Card */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`relative flex flex-col p-3.5 rounded-2xl border text-left transition cursor-pointer group ${
                  theme === "light"
                    ? "border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-400/40"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <SunIcon className="w-4 h-4" />
                  </div>
                  {theme === "light" && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <CheckIcon className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Light Mode
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Optimal for daylight and bright clinical suites.
                </span>
              </button>

              {/* Dark Theme Card */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`relative flex flex-col p-3.5 rounded-2xl border text-left transition cursor-pointer group ${
                  theme === "dark"
                    ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/40"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <MoonIcon className="w-4 h-4" />
                  </div>
                  {theme === "dark" && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <CheckIcon className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Dark Mode
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Reduces eye strain in low-light hospital wards.
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* SECTION 2: NOTIFICATIONS & SOUNDS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Alerts & Acoustic Chimes
            </h3>

            {/* Critical Patient Audio Alerts */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start space-x-3 pr-2">
                <SpeakerWaveIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Critical Vitals Audio Chimes
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Play a gentle audio tone when high-acuity vital shifts are logged.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateSetting("soundAlerts", !settings.soundAlerts)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.soundAlerts ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
                role="switch"
                aria-checked={settings.soundAlerts}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.soundAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* AI Scribe Chimes */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start space-x-3 pr-2">
                <BellIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Ambient Scribe Synthesis Alerts
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Notify when background voice-to-SOAP quadrant synthesis finishes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateSetting("aiScribeChimes", !settings.aiScribeChimes)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.aiScribeChimes ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
                role="switch"
                aria-checked={settings.aiScribeChimes}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.aiScribeChimes ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* SECTION 3: DISPLAY & CLINICAL WORKFLOW */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Clinical Display & Formatting
            </h3>

            {/* Medical Terminology Highlight */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start space-x-3 pr-2">
                <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Smart Medical Nomenclature Highlighting
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Highlight LOINC codes, CPT modifiers, and ICD-10 diagnostic terms in chat.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateSetting("highlightMedicalTerms", !settings.highlightMedicalTerms)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.highlightMedicalTerms ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
                role="switch"
                aria-checked={settings.highlightMedicalTerms}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.highlightMedicalTerms ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Inactivity Screen Lock */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start space-x-3 pr-2">
                <ShieldCheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    HIPAA Inactivity Session Timeout
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Require re-authentication after period of workstation inactivity.
                  </p>
                </div>
              </div>
              <select
                value={settings.autoLockMinutes}
                onChange={(e) => updateSetting("autoLockMinutes", Number(e.target.value))}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/30 outline-hidden cursor-pointer"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={0}>Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center space-x-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer font-medium"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
