"use client";

import { useTheme } from "./ThemeProvider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Render a placeholder before mounting to prevent layout shifts or hydration flicker
  if (!mounted) {
    return (
      <div 
        className={`w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center h-7 w-14 flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 shadow-inner group ${
        isDark 
          ? "bg-slate-800 border border-slate-700/80 shadow-slate-950/40" 
          : "bg-amber-100/90 border border-amber-300/80 shadow-amber-200/40"
      } ${className}`}
    >
      {/* Background Icons for Visual Cue */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none select-none">
        <SunIcon className={`w-3.5 h-3.5 transition-opacity duration-200 ${isDark ? "text-slate-600 opacity-60" : "text-amber-500 opacity-0"}`} />
        <MoonIcon className={`w-3.5 h-3.5 transition-opacity duration-200 ${isDark ? "text-indigo-400 opacity-0" : "text-amber-700/40 opacity-70"}`} />
      </span>

      {/* Animated Sliding Thumb */}
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full shadow-md transition-all duration-300 ease-spring flex items-center justify-center ${
          isDark
            ? "translate-x-7 bg-indigo-600 text-indigo-100 shadow-indigo-900/60 ring-1 ring-indigo-400/30"
            : "translate-x-0 bg-white text-amber-500 shadow-amber-400/30 ring-1 ring-amber-300/40"
        } group-hover:scale-105 group-active:scale-95`}
      >
        {isDark ? (
          <MoonIcon className="w-3.5 h-3.5 transition-transform duration-300 rotate-0" />
        ) : (
          <SunIcon className="w-4 h-4 transition-transform duration-300 rotate-0 group-hover:rotate-45" />
        )}
      </span>
    </button>
  );
}
