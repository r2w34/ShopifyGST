import { createSlice } from '@reduxjs/toolkit'

const flightsSlice = createSlice({
  name: 'flights',
  initialState: {
    flights: [],
    loading: false,
    error: null,
  },
  reducers: {},
})

export default flightsSlice.reducer