import React from 'react';
import { useSelector } from 'react-redux';
import ComplaintForm from './components/ComplaintForm';
import AIAssistant from './components/AIAssistant';

function App() {
  // LISTENING FOR THE SAVE FLAG FROM REDUX
  const isSaved = useSelector((state) => state.complaint.isSaved);

  return (
    <div className="h-screen w-screen flex p-4 gap-4 box-border bg-[#0A0A0A]">
      
      {/* LEFT PANE */}
      <div className="w-1/2 h-full bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col shadow-lg overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-white">Log Customer Complaint</h1>
            <p className="text-sm text-gray-400">API & FDF Quality Assurance Module</p>
          </div>
          
          {/* THE DYNAMIC BADGE LOGIC */}
          {isSaved ? (
            <span className="px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-md transition-colors duration-500">
              Complaint Logged
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-medium text-orange-400 bg-orange-950/30 border border-orange-900/50 rounded-md transition-colors duration-500">
              Pending Triage
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <ComplaintForm />
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col shadow-lg overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-white">AI Complaint Intake Assistant</h2>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <AIAssistant />
        </div>
      </div>

    </div>
  );
}

export default App;