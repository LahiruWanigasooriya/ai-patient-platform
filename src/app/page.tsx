import { ChatSidebar } from "@/components/ChatSidebar";

export default function Dashboard() {
  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-950 overflow-hidden">
      
      {/* Left Sidebar (Navigation Placeholder) */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 hidden md:flex flex-col">
        <h1 className="text-xl font-black text-blue-600 dark:text-blue-400 mb-8 tracking-tighter">
          MedIntel
        </h1>
        <nav className="space-y-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium cursor-pointer">
            Patients
          </div>
          <div className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer">
            Uploads
          </div>
          <div className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer">
            Settings
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Patient Dashboard: John Doe</h2>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              <strong>Important Medical Disclaimer:</strong> This system is an information and decision-support tool. It is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 h-64">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Patient Summary</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Database and Auth integration pending (Epic 1)...</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 h-64">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Health Trends</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Charts pending (Epic 4)...</p>
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar (AI Chatbot) */}
      <ChatSidebar />
      
    </div>
  );
}
