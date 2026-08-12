// frontend/src/App.jsx
import React from 'react';
import ComplaintForm from './components/ComplaintForm';
import AIAssistant from './components/AIAssistant';

/**
 * Main App Layout Component
 * Renders the clean, production-ready dual-pane AIVOA Quality Management System dashboard.
 */
function App() {
  return (
    <div className="h-screen w-screen flex p-4 gap-4 box-border bg-[#0A0A0A]">
      
      {/* LEFT PANE: The QMS Form */}
      <div className="w-1/2 h-full bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col shadow-lg overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-white">Log Customer Complaint</h1>
            <p className="text-sm text-gray-400">API & FDF Quality Assurance Module</p>
          </div>
          <span className="px-3 py-1 text-xs font-medium text-orange-400 bg-orange-950/30 border border-orange-900/50 rounded-md">
            Pending Triage
          </span>
        </div>
        
        {/* Render the clean read-only form component without dashed borders */}
        <div className="flex-1 overflow-y-auto pr-2">
          <ComplaintForm />
        </div>
      </div>

      {/* RIGHT PANE: The AI Copilot */}
      <div className="w-1/2 h-full bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col shadow-lg overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#3B82F6] text-xl">✨</span>
            <h2 className="text-lg font-medium text-white">AI Complaint Intake Assistant</h2>
          </div>
          <span className="px-2 py-1 text-[10px] font-bold text-[#3B82F6] bg-blue-950/30 rounded">
            BETA
          </span>
        </div>

        {/* Render the interactive AI assistant chat component without dashed borders */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AIAssistant />
        </div>
      </div>

    </div>
  );
}

export default App;