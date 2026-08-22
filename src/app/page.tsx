"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { MagnifyingGlassIcon, UserCircleIcon, DocumentTextIcon, ChartBarIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Patient } from "@prisma/client";
import { getPatients } from "./actions/patients";

export default function Dashboard() {
  const { data: session } = useSession();
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      getPatients().then(data => {
        setPatients(data);
        setLoading(false);
      });
    } else {
      setPatients([]);
      setLoading(false);
    }
  }, [session]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] dark:bg-gray-950 overflow-hidden font-sans">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navigation (Pixabay Style - Clean, White) */}
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 z-20">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setSelectedPatient(null)}>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
              MedIntel
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-emerald-500 font-medium transition-colors">Explore</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-emerald-500 font-medium transition-colors">Upload Records</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-emerald-500 font-medium transition-colors">Analytics</a>
            
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'D'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Sign Out"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg">
                Log In
              </Link>
            )}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          
          {/* Hero Section (Pixabay Style) */}
          <div className="relative w-full h-[45vh] bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center px-4 overflow-hidden">
            {/* Background Medical Pattern/Overlay (Subtle) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center max-w-2xl tracking-tight z-10">
              Stunning Patient Insights <br/> <span className="text-emerald-400 font-light">Powered by AI</span>
            </h2>
            <p className="text-gray-300 mb-8 text-lg text-center max-w-xl z-10">
              Over 2.4 million medical records, intelligently summarized, analyzed, and ready for review.
            </p>
            
            {/* Massive Search Bar */}
            <div className="w-full max-w-3xl relative z-10 group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-14 pr-32 py-5 rounded-full border-0 text-lg text-gray-900 bg-white shadow-2xl focus:ring-4 focus:ring-emerald-500/30 transition-all placeholder:text-gray-400 outline-none" 
                placeholder="Search for patients, conditions, or medications..." 
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="max-w-7xl mx-auto px-6 mt-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-center justify-between">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                <strong>Important Medical Disclaimer:</strong> This system is an information and decision-support tool. It is not a substitute for professional medical advice.
              </p>
            </div>
          </div>

          {/* Masonry Grid (Patient Cards) */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {searchQuery ? "Search Results" : "Recent Patients"}
              </h3>
              <div className="flex space-x-2 text-sm">
                <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors">All</span>
                <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors">Critical</span>
                <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors">Stable</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {loading ? (
                // Loading Skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm p-6 h-48 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  </div>
                ))
              ) : filteredPatients.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  {session ? "No patients found matching your search." : "Please log in to view your patients."}
                </div>
              ) : filteredPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  onClick={() => setSelectedPatient(patient.id)}
                  className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col ${selectedPatient === patient.id ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{patient.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Age: {patient.age} • ID: #{patient.id}0084</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      patient.status === 'Critical' ? 'bg-red-100 text-red-700' : 
                      patient.status === 'Stable' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                  
                  {/* Card Body (Masonry variable content size) */}
                  <div className="p-6 flex-1">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {patient.summary}
                    </p>
                  </div>
                  
                  {/* Card Footer */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center">
                      <DocumentTextIcon className="w-4 h-4 mr-1" />
                      Updated {new Date(patient.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-emerald-600 font-medium">
                      Open AI Assistant &rarr;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar (AI Chatbot) - Only visible when a patient is selected */}
      <div className={`transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 z-30 ${selectedPatient ? 'w-[400px] translate-x-0' : 'w-0 translate-x-full border-none'}`}>
        <div className="h-full w-[400px]">
          {selectedPatient && (
            <div className="h-full flex flex-col relative">
              {/* Overlay close button */}
              <button 
                onClick={() => setSelectedPatient(null)}
                className="absolute top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm"
              >
                &times;
              </button>
              {/* Pass the patient data down to the ChatSidebar if needed, but for now we render it identically */}
              <ChatSidebar />
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
