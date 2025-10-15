import { createSlice } from '@reduxjs/toolkit'

const revenueSlice = createSlice({
  name: 'revenue',
  initialState: {
    revenue: [],
    loading: false,
    error: null,
  },
  reducers: {},
})

export default revenueSlice.reducer