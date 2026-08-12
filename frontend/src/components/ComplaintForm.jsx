// frontend/src/components/ComplaintForm.jsx
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * ComplaintForm Component
 * Renders the read-only QMS form fields mapped directly to the Redux global state.
 * Arranged with symmetrical spacing and proper faded placeholders.
 */
const ComplaintForm = () => {
  const complaintData = useSelector((state) => state.complaint);

  return (
    <div className="space-y-6 pr-3 text-sm">
      
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
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Customer Name</label>
            <input
              type="text"
              readOnly
              value={complaintData.customer_name || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
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
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Product Strength/Grade</label>
            <input
              type="text"
              readOnly
              value={complaintData.product_strength_grade || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Batch/Lot Number</label>
            <input
              type="text"
              readOnly
              value={complaintData.batch_lot_number || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Quantity Affected</label>
            <input
              type="text"
              readOnly
              value={complaintData.quantity_affected || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Manufacturing Date</label>
            <input
              type="text"
              readOnly
              value={complaintData.manufacturing_date || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Expiry Date</label>
            <input
              type="text"
              readOnly
              value={complaintData.expiry_date || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
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
                className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Complaint Date</label>
              <input
                type="text"
                readOnly
                value={complaintData.complaint_date || ''}
                placeholder="Awaiting AI extraction..."
                className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default"
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
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default resize-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Initial Assessment & Priority (AI Copilot Section) */}
      <div className="pb-2">
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
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-blue-400 font-medium placeholder-gray-600 focus:outline-none cursor-default"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Priority</label>
            <input
              type="text"
              readOnly
              value={complaintData.priority || ''}
              placeholder="Awaiting AI extraction..."
              className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-blue-400 font-medium placeholder-gray-600 focus:outline-none cursor-default"
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
            className="w-full bg-[#1A1A1A] border border-borderDark rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none cursor-default resize-none"
          />
        </div>
      </div>

    </div>
  );
};

export default ComplaintForm;