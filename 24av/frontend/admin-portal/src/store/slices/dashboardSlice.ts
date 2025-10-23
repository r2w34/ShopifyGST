import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface DashboardStats {
  completedFlights: {
    count: number
    percentage: number
    trend: 'up' | 'down'
  }
  activeFlights: {
    count: number
    percentage: number
    trend: 'up' | 'down'
  }
  cancelledFlights: {
    count: number
    percentage: number
    trend: 'up' | 'down'
  }
  totalRevenue: {
    amount: number
    percentage: number
    trend: 'up' | 'down'
    currency: string
  }
  ticketSales: {
    count: number
    percentage: number
    trend: 'up' | 'down'
  }
}

interface FlightScheduleData {
  day: string
  domestic: number
  international: number
}

interface TopRoute {
  id: string
  from: string
  to: string
  fromCode: string
  toCode: string
  annualPassengers: number
  distance: number
  distanceUnit: string
}

interface RecentActivity {
  id: string
  user: string
  action: string
  details: string
  timestamp: string
  type: 'booking' | 'update' | 'cancellation' | 'registration'
}

interface TicketSalesData {
  date: string
  sales: number
}

interface DashboardState {
  stats: DashboardStats | null
  flightSchedule: FlightScheduleData[]
  topRoutes: TopRoute[]
  recentActivity: RecentActivity[]
  ticketSalesData: TicketSalesData[]
  loading: boolean
  error: string | null
  dateRange: {
    start: Date
    end: Date
  }
}

const initialState: DashboardState = {
  stats: null,
  flightSchedule: [],
  topRoutes: [],
  recentActivity: [],
  ticketSalesData: [],
  loading: false,
  error: null,
  dateRange: {
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date(),
  },
}

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (dateRange?: { start: Date; end: Date }) => {
    // Simulated API calls
    const [stats, schedule, routes, activity, sales] = await Promise.all([
      fetch('/api/v1/admin/dashboard/stats').then(res => res.json()),
      fetch('/api/v1/admin/dashboard/flight-schedule').then(res => res.json()),
      fetch('/api/v1/admin/dashboard/top-routes').then(res => res.json()),
      fetch('/api/v1/admin/dashboard/recent-activity').then(res => res.json()),
      fetch('/api/v1/admin/dashboard/ticket-sales').then(res => res.json()),
    ])
    
    return { stats, schedule, routes, activity, sales }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
        state.flightSchedule = action.payload.schedule
        state.topRoutes = action.payload.routes
        state.recentActivity = action.payload.activity
        state.ticketSalesData = action.payload.sales
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch dashboard data'
      })
  },
})

export const { setDateRange, clearError } = dashboardSlice.actions
export default dashboardSlice.reducer