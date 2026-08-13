// frontend/src/components/AIAssistant.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateComplaintData } from '../store/complaintSlice';
import { Send, UploadCloud, CheckCircle2, AlertCircle, Loader2, Bot, User } from 'lucide-react';

/**
 * AIAssistant Component
 * Manages the interactive chat log, document uploads, and conversational
 * state updates synced with the global Redux store.
 */
const AIAssistant = () => {
  const dispatch = useDispatch();
  const complaintData = useSelector((state) => state.complaint);

  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: Chat message history state to keep conversation visible
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Hello! Upload a complaint document or paste text below to begin extraction and risk assessment.' }
  ]);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    const userMessage = promptText;
    setPromptText('');
    
    // Append user message to chat history immediately
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    const isEditing = !!complaintData.product_name;

    try {
      const response = await fetch('http://localhost:8000/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          current_state: isEditing ? complaintData : null 
        }),
      });

      if (!response.ok) throw new Error('Failed to process complaint details.');

      const extractedJson = await response.json();
      dispatch(updateComplaintData(extractedJson));

      // 👉 Append success response to chat history
      setMessages((prev) => [
        ...prev, 
        { 
          sender: 'assistant', 
          text: isEditing 
            ? 'Form successfully updated with your requested refinements.' 
            : 'Complaint parsed successfully. Form populated and risk assessment generated.' 
        }
      ]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages((prev) => [
        ...prev, 
        { sender: 'assistant', text: 'Error processing request. Ensure the backend server is running.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setMessages((prev) => [...prev, { sender: 'user', text: `Uploaded document: ${file.name}` }]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/extract-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse uploaded document.');

      const extractedJson = await response.json();
      dispatch(updateComplaintData(extractedJson));

      setMessages((prev) => [
        ...prev, 
        { sender: 'assistant', text: `Document "${file.name}" parsed successfully. Form populated.` }
      ]);
    } catch (error) {
      console.error('Upload Error:', error);
      setMessages((prev) => [
        ...prev, 
        { sender: 'assistant', text: `Failed to extract data from "${file.name}". Check file format.` }
      ]);
    } finally {
      setIsLoading(false);
      event.target.value = null;
    }
  };

  const loadSamplePrompt = () => {
    setPromptText(
      "On August 12th, 2026, Apollo Pharmacy reported that patient Michael Scott returned 3 boxes of Amoxicillin Capsules 500 mg due to discolored capsules. Batch number AMX240602. Manufacturing date March 2026. Expiry date February 2028. Please log this complaint."
    );
  };

  return (
    <div className="flex flex-col h-full justify-between text-sm">
      
      {/* Scrollable Chat Area */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-2 mb-4">
        
        {/* Document Upload Dropzone */}
        <label className="border-2 border-dashed border-borderDark hover:border-accentBlue rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-[#171717] transition-colors group">
          <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-accentBlue mb-1 transition-colors" />
          <p className="text-xs text-gray-300 font-medium text-center">
            Drag & drop document or <span className="text-accentBlue underline">browse</span>
          </p>
          <input type="file" accept=".pdf,.txt,.eml" onChange={handleFileUpload} className="hidden" />
        </label>

        <button
          onClick={loadSamplePrompt}
          className="w-full text-xs text-accentBlue bg-blue-950/20 border border-blue-900/40 hover:bg-blue-950/40 py-2 px-3 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors"
        >
          <span>⚡ Load Demo Prompt (Apollo Pharmacy)</span>
        </button>

        {/* Render Persistent Chat Messages */}
        <div className="space-y-3 pt-2">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${
                msg.sender === 'user' 
                  ? 'bg-[#1E1E1E] text-gray-200 ml-6 border border-[#2A2A2A]' 
                  : 'bg-[#141414] text-gray-300 mr-6 border border-[#222]'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              ) : (
                <Bot className="w-4 h-4 text-accentBlue shrink-0 mt-0.5" />
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#141414] text-gray-400 text-xs border border-[#222] mr-6">
              <Loader2 className="w-4 h-4 text-accentBlue animate-spin shrink-0" />
              <span>Analyzing data and updating form state...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Form Section */}
      <div className="pt-3 border-t border-borderDark shrink-0">
        <form onSubmit={handleTextSubmit} className="relative">
          <textarea
            rows={2}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type a message or ask AI to refine fields..."
            className="w-full bg-[#1A1A1A] border border-borderDark rounded-xl p-3 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accentBlue resize-none text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !promptText.trim()}
            className="absolute right-3 bottom-4 bg-accentBlue text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIAssistant;