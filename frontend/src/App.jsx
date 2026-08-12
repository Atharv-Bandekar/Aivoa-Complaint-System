import React from 'react';
import { useSelector } from 'react-redux';


function App() {
  return (
    <div className="h-screen w-screen flex p-4 gap-4 box-border">
      
      {/* LEFT PANE: The QMS Form */}
      <div className="w-1/2 h-full bg-paneDark border border-borderDark rounded-xl p-6 flex flex-col shadow-lg overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Log Customer Complaint</h1>
            <p className="text-sm text-gray-400">API & FDF Quality Assurance Module</p>
          </div>
          <span className="px-3 py-1 text-xs font-medium text-orange-400 bg-orange-950/30 border border-orange-900/50 rounded-md">
            Pending Triage
          </span>
        </div>
        
        {/* <ComplaintForm /> */}
        <div className="flex-1 border-2 border-dashed border-borderDark rounded-lg flex items-center justify-center text-gray-500">
          [ Form Component Placeholder ]
        </div>
      </div>

      {/* RIGHT PANE: The AI Copilot */}
      <div className="w-1/2 h-full bg-paneDark border border-borderDark rounded-xl p-6 flex flex-col shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-accentBlue text-xl">✨</span>
            <h2 className="text-lg font-medium text-white">AI Complaint Intake Assistant</h2>
          </div>
          <span className="px-2 py-1 text-[10px] font-bold text-accentBlue bg-blue-950/30 rounded">
            BETA
          </span>
        </div>

        {/* <AIAssistant /> */}
        <div className="flex-1 border-2 border-dashed border-borderDark rounded-lg flex items-center justify-center text-gray-500">
          [ AI Chat Component Placeholder ]
        </div>
      </div>

    </div>
  );
}

export default App;