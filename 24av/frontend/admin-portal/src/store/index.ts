import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import usersReducer from './slices/usersSlice'
import vendorsReducer from './slices/vendorsSlice'
import flightsReducer from './slices/flightsSlice'
import bookingsReducer from './slices/bookingsSlice'
import revenueReducer from './slices/revenueSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
    vendors: vendorsReducer,
    flights: flightsReducer,
    bookings: bookingsReducer,
    revenue: revenueReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch