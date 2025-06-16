import { createSlice } from '@reduxjs/toolkit';

const documentosSlice = createSlice({
  name: 'documentos',
  initialState: {
    documentos: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default documentosSlice.reducer;