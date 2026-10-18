"use client";

import { Search, UserPlus, X } from "lucide-react";

export interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdmitClick: () => void;
}

export function HeroSearch({
  searchQuery,
  onSearchChange,
  onAdmitClick,
}: HeroSearchProps) {
  return (
    <div className="relative w-full min-h-[380px] md:min-h-[420px] bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900 flex flex-col items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
      
      {/* Dynamic Ambient Background Lights */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"
      />

      {/* Subtle Clinical Dot Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
      />

      {/* Modern, Professional Clinical Headline */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 text-center max-w-4xl tracking-tight z-10 leading-[1.15]">
        Precision Patient Intelligence <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent font-medium">
          Powered by Clinical AI
        </span>
      </h2>

      {/* Professional Clinical Subtitle */}
      <p className="text-gray-300/90 mb-8 text-xs sm:text-sm md:text-base text-center max-w-2xl z-10 leading-relaxed font-normal">
        Unified multi-tenant EHR records, real-time hemodynamic trajectory surveillance, and pharmacological safety intelligence.
      </p>
      
      {/* Global Clinical Search Bar */}
      <div className="w-full max-w-3xl relative z-10 group">
        {/* Search Input Field */}
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-12 pr-36 py-4 rounded-full border border-white/10 text-sm sm:text-base text-gray-900 bg-white shadow-2xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400 outline-none" 
          placeholder="Search patients, conditions, vitals, or clinical records..." 
        />

        {/* Left Search Icon (placed with z-20 so it renders crisply on top of input) */}
        <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none z-20">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        
        {/* Right Action Buttons */}
        <div className="absolute inset-y-0 right-1.5 flex items-center space-x-1.5 z-20">
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button 
            type="button"
            onClick={onAdmitClick}
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Admit</span>
          </button>
        </div>
      </div>

    </div>
  );
}
