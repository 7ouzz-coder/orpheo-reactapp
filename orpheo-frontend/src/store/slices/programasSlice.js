import { createSlice } from '@reduxjs/toolkit';

const programasSlice = createSlice({
  name: 'programas',
  initialState: {
    programas: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default programasSlice.reducer;