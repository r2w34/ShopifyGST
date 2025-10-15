import React, { useEffect } from 'react'
import { Grid, Box, Typography, Paper } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchDashboardData } from '@/store/slices/dashboardSlice'
import StatsCard from '@/components/StatsCard'
import FlightScheduleChart from '@/components/FlightScheduleChart'
import TopRoutesTable from '@/components/TopRoutesTable'
import TicketSalesChart from '@/components/TicketSalesChart'
import RecentActivity from '@/components/RecentActivity'
import { Flight, Cancel, CheckCircle, AttachMoney } from '@mui/icons-material'

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { stats, flightSchedule, topRoutes, recentActivity, ticketSalesData, loading } = useSelector(
    (state: RootState) => state.dashboard
  )

  useEffect(() => {
    // Fetch dashboard data on mount
    dispatch(fetchDashboardData())
  }, [dispatch])

  // Mock data for development
  const mockStats = {
    completedFlights: { count: 1325, percentage: 8.9, trend: 'down' as const },
    activeFlights: { count: 772, percentage: 5.9, trend: 'down' as const },
    cancelledFlights: { count: 243, percentage: 6.9, trend: 'down' as const },
    totalRevenue: { amount: 111325, percentage: 6.9, trend: 'down' as const, currency: 'USD' },
  }

  const mockFlightSchedule = [
    { day: 'Mon', domestic: 150, international: 200 },
    { day: 'Tue', domestic: 180, international: 250 },
    { day: 'Wed', domestic: 200, international: 280 },
    { day: 'Thu', domestic: 170, international: 300 },
    { day: 'Fri', domestic: 220, international: 320 },
    { day: 'Sat', domestic: 190, international: 280 },
    { day: 'Sun', domestic: 210, international: 350 },
  ]

  const mockTopRoutes = [
    { id: '1', from: 'New York', to: 'London', fromCode: 'JFK', toCode: 'LHR', annualPassengers: 3200000, distance: 5555, distanceUnit: 'km' },
    { id: '2', from: 'Los Angeles', to: 'Tokyo', fromCode: 'LAX', toCode: 'NRT', annualPassengers: 2500000, distance: 8775, distanceUnit: 'km' },
    { id: '3', from: 'Sydney', to: 'Singapore', fromCode: 'SYD', toCode: 'SIN', annualPassengers: 1800000, distance: 6300, distanceUnit: 'km' },
    { id: '4', from: 'Dubai', to: 'London', fromCode: 'DXB', toCode: 'LHR', annualPassengers: 2200000, distance: 5510, distanceUnit: 'km' },
    { id: '5', from: 'Paris', to: 'New York', fromCode: 'CDG', toCode: 'JFK', annualPassengers: 2900000, distance: 5850, distanceUnit: 'km' },
  ]

  const mockRecentActivity = [
    { id: '1', user: 'Giorgia Romano', action: 'registered a new user and created a booking', details: 'Booking ID U78890 for the route CDG to NYC with SkyHigh Airways', timestamp: '05:20 PM', type: 'booking' as const },
    { id: '2', user: 'Mateo Martinez', action: 'updated flight schedule for Booking ID EF5012', details: 'Flight SYD to SIN with Oceanic Airways has been rescheduled to 8:00 AM', timestamp: '04:45 PM', type: 'update' as const },
  ]

  const displayStats = stats || mockStats
  const displayFlightSchedule = flightSchedule.length > 0 ? flightSchedule : mockFlightSchedule
  const displayTopRoutes = topRoutes.length > 0 ? topRoutes : mockTopRoutes
  const displayRecentActivity = recentActivity.length > 0 ? recentActivity : mockRecentActivity

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Flight Schedule Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <FlightScheduleChart data={displayFlightSchedule} />
          </Paper>
        </Grid>

        {/* Top Flight Routes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '400px', overflow: 'auto' }}>
            <TopRoutesTable routes={displayTopRoutes} />
          </Paper>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Completed Flights"
                value={displayStats.completedFlights.count}
                percentage={displayStats.completedFlights.percentage}
                trend={displayStats.completedFlights.trend}
                subtitle="This Week"
                icon={<CheckCircle sx={{ color: '#4caf50' }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Active Flights"
                value={displayStats.activeFlights.count}
                percentage={displayStats.activeFlights.percentage}
                trend={displayStats.activeFlights.trend}
                subtitle="This Week"
                icon={<Flight sx={{ color: '#2196f3' }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Cancelled Flights"
                value={displayStats.cancelledFlights.count}
                percentage={displayStats.cancelledFlights.percentage}
                trend={displayStats.cancelledFlights.trend}
                subtitle="This Week"
                icon={<Cancel sx={{ color: '#f44336' }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Revenue"
                value={`$${displayStats.totalRevenue.amount.toLocaleString()}`}
                percentage={displayStats.totalRevenue.percentage}
                trend={displayStats.totalRevenue.trend}
                subtitle="This Week"
                icon={<AttachMoney sx={{ color: '#ff9800' }} />}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Ticket Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '350px' }}>
            <TicketSalesChart />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '350px', overflow: 'auto' }}>
            <RecentActivity activities={displayRecentActivity} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard