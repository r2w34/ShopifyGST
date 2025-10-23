import { createSlice } from '@reduxjs/toolkit'

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState: {
    vendors: [],
    loading: false,
    error: null,
  },
  reducers: {},
})

export default vendorsSlice.reducer