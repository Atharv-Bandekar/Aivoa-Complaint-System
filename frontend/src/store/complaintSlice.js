// frontend/src/store/complaintSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial state perfectly matches the backend FastAPI ComplaintData schema.
 */
const initialState = {
  complaint_source: '',
  customer_name: '',
  product_name: '',
  product_strength_grade: '',
  batch_lot_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity_affected: '',
  complaint_type: '',
  complaint_date: '',
  detailed_complaint_description: '',
  initial_severity: '',
  priority: '',
  suggested_next_action: '',
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    /**
     * Takes the exact JSON returned from the LangGraph backend and updates the UI state.
     */
    updateComplaintData: (state, action) => {
      // Merge the incoming extracted data with the current state
      return { ...state, ...action.payload };
    },
    /**
     * Clears the form back to empty strings.
     */
    resetComplaintForm: () => {
      return initialState;
    },
  },
});

export const { updateComplaintData, resetComplaintForm } = complaintSlice.actions;
export default complaintSlice.reducer;