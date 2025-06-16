import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    loading: false,
    darkMode: true,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export const { setLoading, toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;