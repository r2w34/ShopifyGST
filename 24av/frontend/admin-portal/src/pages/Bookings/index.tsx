import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
  Search,
  Download,
  Print,
  Email,
  CheckCircle,
  Cancel,
  Schedule,
  AttachMoney,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material'

interface Booking {
  id: string
  bookingId: string
  passengerName: string
  passengerEmail: string
  flightNumber: string
  route: string
  bookingDate: string
  travelDate: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  paymentStatus: 'paid' | 'pending' | 'refunded'
  amount: number
  seats: number
}

const Bookings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [tabValue, setTabValue] = useState(0)

  const columns: GridColDef[] = [
    {
      field: 'bookingId',
      headerName: 'Booking ID',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'passengerName',
      headerName: 'Passenger',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.passengerEmail}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'flightNumber',
      headerName: 'Flight',
      width: 100,
    },
    {
      field: 'route',
      headerName: 'Route',
      width: 200,
    },
    {
      field: 'travelDate',
      headerName: 'Travel Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const getStatusColor = () => {
          switch (params.value) {
            case 'confirmed':
              return 'success'
            case 'pending':
              return 'warning'
            case 'cancelled':
              return 'error'
            case 'completed':
              return 'info'
            default:
              return 'default'
          }
        }
        const getStatusIcon = () => {
          switch (params.value) {
            case 'confirmed':
            case 'completed':
              return <CheckCircle />
            case 'cancelled':
              return <Cancel />
            case 'pending':
              return <Schedule />
            default:
              return null
          }
        }
        return (
          <Chip
            label={params.value}
            size="small"
            color={getStatusColor() as any}
            icon={getStatusIcon() as any}
          />
        )
      },
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'paid' ? 'success' : params.value === 'refunded' ? 'error' : 'warning'}
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ${params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: () => (
        <Box>
          <IconButton size="small" title="View Details">
            <Email />
          </IconButton>
          <IconButton size="small" title="Print">
            <Print />
          </IconButton>
          <IconButton size="small" title="Download">
            <Download />
          </IconButton>
        </Box>
      ),
    },
  ]

  const mockBookings: Booking[] = [
    {
      id: '1',
      bookingId: 'BK001234',
      passengerName: 'John Doe',
      passengerEmail: 'john.doe@example.com',
      flightNumber: 'SA101',
      route: 'JFK → LHR',
      bookingDate: '2024-10-10',
      travelDate: '2024-10-20',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 1200,
      seats: 2,
    },
    {
      id: '2',
      bookingId: 'BK001235',
      passengerName: 'Jane Smith',
      passengerEmail: 'jane.smith@example.com',
      flightNumber: 'EC202',
      route: 'LAX → NRT',
      bookingDate: '2024-10-12',
      travelDate: '2024-10-15',
      status: 'completed',
      paymentStatus: 'paid',
      amount: 3000,
      seats: 2,
    },
    {
      id: '3',
      bookingId: 'BK001236',
      passengerName: 'Mike Johnson',
      passengerEmail: 'mike.j@example.com',
      flightNumber: 'GW303',
      route: 'ORD → MIA',
      bookingDate: '2024-10-13',
      travelDate: '2024-10-18',
      status: 'pending',
      paymentStatus: 'pending',
      amount: 450,
      seats: 1,
    },
    {
      id: '4',
      bookingId: 'BK001237',
      passengerName: 'Sarah Williams',
      passengerEmail: 'sarah.w@example.com',
      flightNumber: 'LA404',
      route: 'DXB → CDG',
      bookingDate: '2024-10-14',
      travelDate: '2024-10-25',
      status: 'cancelled',
      paymentStatus: 'refunded',
      amount: 2200,
      seats: 1,
    },
    {
      id: '5',
      bookingId: 'BK001238',
      passengerName: 'Robert Brown',
      passengerEmail: 'robert.b@example.com',
      flightNumber: 'SJ505',
      route: 'SYD → SIN',
      bookingDate: '2024-10-15',
      travelDate: '2024-10-22',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 1600,
      seats: 2,
    },
  ]

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = 
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passengerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (tabValue === 0) return matchesSearch // All bookings
    if (tabValue === 1) return matchesSearch && booking.status === 'confirmed'
    if (tabValue === 2) return matchesSearch && booking.status === 'pending'
    if (tabValue === 3) return matchesSearch && booking.status === 'completed'
    if (tabValue === 4) return matchesSearch && booking.status === 'cancelled'
    
    return matchesSearch
  })

  // Calculate statistics
  const totalRevenue = mockBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)
  
  const totalBookings = mockBookings.length
  const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed').length
  const cancelledBookings = mockBookings.filter(b => b.status === 'cancelled').length

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Bookings Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
          >
            Print Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                    ${totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoney color="primary" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2" color="success.main">
                  12.5% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Bookings
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                    {totalBookings}
                  </Typography>
                </Box>
                <Schedule color="info" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2" color="success.main">
                  8.2% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Confirmed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                    {confirmedBookings}
                  </Typography>
                </Box>
                <CheckCircle color="success" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {((confirmedBookings / totalBookings) * 100).toFixed(1)}% of total
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Cancelled
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                    {cancelledBookings}
                  </Typography>
                </Box>
                <Cancel color="error" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
                <Typography variant="body2" color="error.main">
                  3.1% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Bookings" />
          <Tab label="Confirmed" />
          <Tab label="Pending" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by booking ID, passenger name, email, or flight number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <DataGrid
          rows={filteredBookings}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight
        />
      </Paper>
    </Box>
  )
}

export default Bookings