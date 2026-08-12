// frontend/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import complaintReducer from './complaintSlice';

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
  },
});