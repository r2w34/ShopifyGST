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
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
  Search,
  Add,
  FlightTakeoff,
  FlightLand,
  Schedule,
  Edit,
  Delete,
  Visibility,
  FilterList,
} from '@mui/icons-material'

interface Flight {
  id: string
  flightNumber: string
  airline: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  departureTime: string
  arrivalTime: string
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled' | 'delayed'
  aircraft: string
  availableSeats: number
  totalSeats: number
  price: number
}

const Flights: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [tabValue, setTabValue] = useState(0)

  const columns: GridColDef[] = [
    {
      field: 'flightNumber',
      headerName: 'Flight No.',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'airline',
      headerName: 'Airline',
      width: 150,
    },
    {
      field: 'route',
      headerName: 'Route',
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box>
            <Typography variant="body2">
              {params.row.origin} ({params.row.originCode})
            </Typography>
          </Box>
          <FlightTakeoff sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body2">
              {params.row.destination} ({params.row.destinationCode})
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'departureTime',
      headerName: 'Departure',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {new Date(params.value).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(params.value).toLocaleTimeString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const getStatusColor = () => {
          switch (params.value) {
            case 'scheduled':
              return 'info'
            case 'boarding':
              return 'warning'
            case 'departed':
            case 'arrived':
              return 'success'
            case 'cancelled':
              return 'error'
            case 'delayed':
              return 'warning'
            default:
              return 'default'
          }
        }
        return (
          <Chip
            label={params.value}
            size="small"
            color={getStatusColor() as any}
          />
        )
      },
    },
    {
      field: 'seats',
      headerName: 'Seats',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.row.availableSeats}/{params.row.totalSeats}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
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
          <IconButton size="small">
            <Visibility />
          </IconButton>
          <IconButton size="small">
            <Edit />
          </IconButton>
          <IconButton size="small" color="error">
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ]

  const mockFlights: Flight[] = [
    {
      id: '1',
      flightNumber: 'SA101',
      airline: 'SkyHigh Airways',
      origin: 'New York',
      originCode: 'JFK',
      destination: 'London',
      destinationCode: 'LHR',
      departureTime: '2024-10-16T08:00:00',
      arrivalTime: '2024-10-16T20:00:00',
      status: 'scheduled',
      aircraft: 'Boeing 777',
      availableSeats: 45,
      totalSeats: 300,
      price: 1200,
    },
    {
      id: '2',
      flightNumber: 'EC202',
      airline: 'Elite Charters',
      origin: 'Los Angeles',
      originCode: 'LAX',
      destination: 'Tokyo',
      destinationCode: 'NRT',
      departureTime: '2024-10-15T14:30:00',
      arrivalTime: '2024-10-16T18:30:00',
      status: 'departed',
      aircraft: 'Airbus A350',
      availableSeats: 0,
      totalSeats: 280,
      price: 1500,
    },
    {
      id: '3',
      flightNumber: 'GW303',
      airline: 'Global Wings',
      origin: 'Chicago',
      originCode: 'ORD',
      destination: 'Miami',
      destinationCode: 'MIA',
      departureTime: '2024-10-15T10:00:00',
      arrivalTime: '2024-10-15T14:30:00',
      status: 'arrived',
      aircraft: 'Boeing 737',
      availableSeats: 0,
      totalSeats: 180,
      price: 450,
    },
    {
      id: '4',
      flightNumber: 'LA404',
      airline: 'Luxury Air',
      origin: 'Dubai',
      originCode: 'DXB',
      destination: 'Paris',
      destinationCode: 'CDG',
      departureTime: '2024-10-17T02:00:00',
      arrivalTime: '2024-10-17T07:30:00',
      status: 'scheduled',
      aircraft: 'Airbus A380',
      availableSeats: 120,
      totalSeats: 500,
      price: 2200,
    },
    {
      id: '5',
      flightNumber: 'SJ505',
      airline: 'Swift Jets',
      origin: 'Sydney',
      originCode: 'SYD',
      destination: 'Singapore',
      destinationCode: 'SIN',
      departureTime: '2024-10-15T22:00:00',
      arrivalTime: '2024-10-16T04:30:00',
      status: 'delayed',
      aircraft: 'Boeing 787',
      availableSeats: 80,
      totalSeats: 250,
      price: 800,
    },
  ]

  const filteredFlights = mockFlights.filter(flight => {
    const matchesSearch = 
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (tabValue === 0) return matchesSearch // All flights
    if (tabValue === 1) return matchesSearch && flight.status === 'scheduled'
    if (tabValue === 2) return matchesSearch && ['departed', 'boarding'].includes(flight.status)
    if (tabValue === 3) return matchesSearch && flight.status === 'arrived'
    if (tabValue === 4) return matchesSearch && ['cancelled', 'delayed'].includes(flight.status)
    
    return matchesSearch
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Flights Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => console.log('Add new flight')}
        >
          Add Flight
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Flights" />
          <Tab label="Scheduled" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
          <Tab label="Issues" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by flight number, airline, origin, or destination..."
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
          <Button
            variant="outlined"
            startIcon={<FilterList />}
          >
            Filters
          </Button>
        </Box>

        <DataGrid
          rows={filteredFlights}
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

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule color="primary" />
              <Typography variant="h6">Total Flights</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {mockFlights.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FlightTakeoff color="success" />
              <Typography variant="h6">Active</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {mockFlights.filter(f => ['departed', 'boarding'].includes(f.status)).length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FlightLand color="info" />
              <Typography variant="h6">Scheduled</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {mockFlights.filter(f => f.status === 'scheduled').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule color="error" />
              <Typography variant="h6">Issues</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {mockFlights.filter(f => ['cancelled', 'delayed'].includes(f.status)).length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Flights