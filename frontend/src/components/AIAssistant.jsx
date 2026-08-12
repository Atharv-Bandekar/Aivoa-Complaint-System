// frontend/src/components/AIAssistant.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateComplaintData } from '../store/complaintSlice';
import { Send, UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';

/**
 * AIAssistant Component
 * Handles the interactive right-pane chat interface and document drag-and-drop uploads,
 * communicating with FastAPI/LangGraph and updating the Redux global state.
 */
const AIAssistant = () => {
  const dispatch = useDispatch();
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  /**
   * Handles text prompt submissions to /api/extract
   */
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Analyzing complaint text and running risk assessment...' });

    try {
      const response = await fetch('http://localhost:8000/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) throw new Error('Failed to extract complaint details.');

      const extractedJson = await response.json();
      dispatch(updateComplaintData(extractedJson));

      setStatusMessage({ 
        type: 'success', 
        text: 'Complaint parsed successfully. Form populated and risk assessment generated.' 
      });
      setPromptText('');
    } catch (error) {
      console.error('API Error:', error);
      setStatusMessage({ 
        type: 'error', 
        text: 'Error processing request. Ensure backend server is running.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles document file uploads (PDF, TXT, etc.) to /api/extract-document
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: `Analyzing document content (${file.name}). Please wait...` });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/extract-document', {
        method: 'POST',
        body: formData, // FastAPI automatically parses Multipart Form Data
      });

      if (!response.ok) throw new Error('Failed to parse uploaded document.');

      const extractedJson = await response.json();
      dispatch(updateComplaintData(extractedJson));

      setStatusMessage({ 
        type: 'success', 
        text: `Document "${file.name}" parsed successfully via OCR/Text extraction.` 
      });
    } catch (error) {
      console.error('Upload Error:', error);
      setStatusMessage({ 
        type: 'error', 
        text: 'Failed to extract data from document. Check file format.' 
      });
    } finally {
      setIsLoading(false);
      event.target.value = null; // Reset file input
    }
  };

  const loadSamplePrompt = () => {
    setPromptText(
      "Apollo Pharmacy reported discolored capsules in Amoxicillin Capsules 500 mg. Batch number AMX240602. Manufacturing date March 2026. Expiry date February 2028. Please log this complaint"
    );
  };

  return (
    <div className="flex flex-col h-full justify-between text-sm">
      
      {/* Top Helper Box & Drag-and-Drop Dropzone */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        
        {/* Document Upload Dropzone Box matching reference UI */}
        <label className="border-2 border-dashed border-borderDark hover:border-accentBlue rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#171717] transition-colors group">
          <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-accentBlue mb-2 transition-colors" />
          <p className="text-xs text-gray-300 font-medium text-center">
            Drag & drop complaint document here <br />
            <span className="text-accentBlue underline">or click to browse</span>
          </p>
          <span className="text-[10px] text-gray-500 mt-1">Supported formats: PDF, TXT, EML (Max 10MB)</span>
          <input 
            type="file" 
            accept=".pdf,.txt,.eml" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </label>

        <div className="text-center text-xs text-gray-500 uppercase tracking-wider font-semibold my-1">OR</div>

        <div className="bg-[#171717] border border-borderDark rounded-xl p-3 text-gray-300 text-xs">
          <p className="mb-2">
            Paste raw text or email below. The AI copilot will automatically extract entities and assess risk.
          </p>
          <button
            onClick={loadSamplePrompt}
            className="text-xs text-accentBlue hover:underline flex items-center gap-1 font-medium"
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
      <div className="mt-4 pt-4 border-t border-borderDark shrink-0">
        <form onSubmit={handleTextSubmit} className="relative">
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type a message or paste a complaint..."
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