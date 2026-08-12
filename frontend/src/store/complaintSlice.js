// frontend/src/store/complaintSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSaved: false, // <-- Add this tracking flag
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
  suggested_next_action: ''
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateComplaintData: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetComplaintData: () => {
      return initialState;
    }
  }
});

export const { updateComplaintData, resetComplaintData } = complaintSlice.actions;
export default complaintSlice.reducer;