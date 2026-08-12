// frontend/src/components/AIAssistant.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateComplaintData } from '../store/complaintSlice';
import { Send, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

/**
 * AIAssistant Component
 * Handles the interactive right-pane chat interface, communicates with the 
 * FastAPI/LangGraph backend, and dispatches extracted JSON data to the Redux store.
 */
const AIAssistant = () => {
  const dispatch = useDispatch();
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  /**
   * Handles the submission of the complaint prompt to the backend API.
   * * @param {Event} e - Form submission event
   */
  const handleExtraction = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Analyzing complaint data and running initial risk assessment...' });

    try {
      const response = await fetch('http://localhost:8000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract complaint details from the backend.');
      }

      const extractedJson = await response.json();
      
      // Dispatch the payload to update the global Redux form state
      dispatch(updateComplaintData(extractedJson));

      setStatusMessage({ 
        type: 'success', 
        text: 'Complaint parsed successfully. Form populated and risk assessment generated.' 
      });
      setPromptText(''); // Clear input box

    } catch (error) {
      console.error('API Error:', error);
      setStatusMessage({ 
        type: 'error', 
        text: 'Error processing complaint. Ensure the backend server is running.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Helper function to quickly load the sample prompt from the AIVOA demo video.
   */
  const loadSamplePrompt = () => {
    setPromptText(
      "Apollo Pharmacy reported discolored capsules in Amoxicillin Capsules 500 mg. Batch number AMX240602. Manufacturing date March 2026. Expiry date February 2028. Please log this complaint"
    );
  };

  return (
    <div className="flex flex-col h-full justify-between text-sm">
      
      {/* Top Helper Box / Chat History Area */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        <div className="bg-[#1A1A1A] border border-borderDark rounded-xl p-4 text-gray-300">
          <p className="mb-2">
            Ready to process new complaints. You can paste a raw email from the customer, upload a PDF, or type a prompt below. I will extract the data and run the initial risk assessment.
          </p>
          <button
            onClick={loadSamplePrompt}
            className="text-xs text-accentBlue hover:underline flex items-center gap-1 font-medium mt-2"
          >
            <span>⚡ Load Demo Prompt (Apollo Pharmacy)</span>
          </button>
        </div>

        {/* Status / Feedback Banner */}
        {statusMessage && (
          <div className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
              : 'bg-blue-950/30 border-blue-900/50 text-blue-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Loader2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-spin" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Input Form Section */}
      <div className="mt-4 pt-4 border-t border-borderDark">
        <form onSubmit={handleExtraction} className="relative">
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type a message or paste a complaint description..."
            className="w-full bg-[#1A1A1A] border border-borderDark rounded-xl p-3 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accentBlue resize-none text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !promptText.trim()}
            className="absolute right-3 bottom-5 bg-accentBlue text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-accentBlue transition-colors cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-gray-500 text-center mt-2">
          AI responses may contain errors. Powered by LangGraph & Groq (llama-3.3-70b-versatile).
        </p>
      </div>

    </div>
  );
};

export default AIAssistant;