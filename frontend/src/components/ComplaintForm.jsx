// frontend/src/components/ComplaintForm.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

/**
 * ComplaintForm Component
 * Renders the QMS form and handles persisting the data to the PostgreSQL database.
 */
const ComplaintForm = () => {
  const complaintData = useSelector((state) => state.complaint);
  
  // Local state for the save button UI
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  const handleSaveComplaint = async () => {
    // Basic validation to ensure we aren't saving an empty form
    if (!complaintData.complaint_source && !complaintData.detailed_complaint_description) {
      alert("No extracted data to save yet. Please process a complaint first.");
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('http://localhost:8000/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      });

      if (!response.ok) {
        throw new Error('Failed to save complaint to database');
      }

      setSaveStatus('success');
      
      // Reset the success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);

    } catch (error) {
      console.error('Database Save Error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pr-3 text-sm pb-4">
      
      {/* 1. Origin & Customer Details */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          1. Origin & Customer Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Complaint Source</label>
            <input
              type="text"
              readOnly
              value={complaintData.complaint_source || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Customer Name</label>
            <input
              type="text"
              readOnly
              value={complaintData.customer_name || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
        </div>
      </div>

      {/* 2. Product & Batch Identification */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          2. Product & Batch Identification
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Product Name</label>
            <input
              type="text"
              readOnly
              value={complaintData.product_name || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Product Strength/Grade</label>
            <input
              type="text"
              readOnly
              value={complaintData.product_strength_grade || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Batch/Lot Number</label>
            <input
              type="text"
              readOnly
              value={complaintData.batch_lot_number || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Quantity Affected</label>
            <input
              type="text"
              readOnly
              value={complaintData.quantity_affected || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Manufacturing Date</label>
            <input
              type="text"
              readOnly
              value={complaintData.manufacturing_date || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Expiry Date</label>
            <input
              type="text"
              readOnly
              value={complaintData.expiry_date || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
        </div>
      </div>

      {/* 3. Complaint Details */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          3. Complaint Details
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Complaint Type</label>
              <input
                type="text"
                readOnly
                value={complaintData.complaint_type || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Complaint Date</label>
              <input
                type="text"
                readOnly
                value={complaintData.complaint_date || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Detailed Complaint Description</label>
            <textarea
              readOnly
              rows={3}
              value={complaintData.detailed_complaint_description || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default resize-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Initial Assessment & Priority (AI Copilot Section) */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          4. Initial Assessment & Priority (AI Co-Pilot)
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Initial Severity</label>
            <input
              type="text"
              readOnly
              value={complaintData.initial_severity || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-blue-400 font-medium placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Priority</label>
            <input
              type="text"
              readOnly
              value={complaintData.priority || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-blue-400 font-medium placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Suggested Next Action</label>
          <textarea
            readOnly
            rows={2}
            value={complaintData.suggested_next_action || ''}
            placeholder="Awaiting AI extraction..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default resize-none"
          />
        </div>
      </div>

      {/* 5. Database Save Actions */}
      <div className="pt-6 mt-4 border-t border-[#2A2A2A] flex items-center justify-end gap-4">
        
        {saveStatus === 'success' && (
          <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Saved to Postgres!
          </span>
        )}
        
        {saveStatus === 'error' && (
          <span className="text-rose-400 text-xs flex items-center gap-1 font-medium">
            <AlertCircle className="w-4 h-4" /> Failed to save
          </span>
        )}

        <button
          onClick={handleSaveComplaint}
          disabled={isSaving}
          className="bg-[#3B82F6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Complaint
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default ComplaintForm;