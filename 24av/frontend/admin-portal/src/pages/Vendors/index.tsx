import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Rating,
} from '@mui/material'
import {
  Search,
  Add,
  Verified,
  Warning,
  Flight,
  LocationOn,
  Phone,
  Email,
  Edit,
  Visibility,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface Vendor {
  id: string
  name: string
  companyName: string
  email: string
  phone: string
  location: string
  fleetSize: number
  rating: number
  totalFlights: number
  status: 'verified' | 'pending' | 'suspended'
  joinDate: string
  commission: number
  logo?: string
}

const Vendors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const navigate = useNavigate()

  const mockVendors: Vendor[] = [
    {
      id: '1',
      name: 'John Aviation',
      companyName: 'SkyHigh Airways',
      email: 'contact@skyhigh.com',
      phone: '+1 234-567-8900',
      location: 'New York, USA',
      fleetSize: 25,
      rating: 4.5,
      totalFlights: 1250,
      status: 'verified',
      joinDate: '2023-01-15',
      commission: 15,
    },
    {
      id: '2',
      name: 'Elite Charters',
      companyName: 'Elite Charter Services',
      email: 'info@elitecharters.com',
      phone: '+1 234-567-8901',
      location: 'Los Angeles, USA',
      fleetSize: 18,
      rating: 4.8,
      totalFlights: 980,
      status: 'verified',
      joinDate: '2023-03-20',
      commission: 12,
    },
    {
      id: '3',
      name: 'Global Wings',
      companyName: 'Global Wings Aviation',
      email: 'support@globalwings.com',
      phone: '+1 234-567-8902',
      location: 'Chicago, USA',
      fleetSize: 12,
      rating: 4.2,
      totalFlights: 650,
      status: 'pending',
      joinDate: '2024-01-10',
      commission: 18,
    },
    {
      id: '4',
      name: 'Luxury Air',
      companyName: 'Luxury Air Services',
      email: 'contact@luxuryair.com',
      phone: '+1 234-567-8903',
      location: 'Miami, USA',
      fleetSize: 8,
      rating: 4.9,
      totalFlights: 420,
      status: 'verified',
      joinDate: '2023-06-15',
      commission: 10,
    },
    {
      id: '5',
      name: 'Swift Jets',
      companyName: 'Swift Jet Operations',
      email: 'info@swiftjets.com',
      phone: '+1 234-567-8904',
      location: 'Dallas, USA',
      fleetSize: 15,
      rating: 3.8,
      totalFlights: 320,
      status: 'suspended',
      joinDate: '2023-09-01',
      commission: 20,
    },
  ]

  const filteredVendors = mockVendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success'
      case 'pending':
        return 'warning'
      case 'suspended':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Verified />
      case 'pending':
      case 'suspended':
        return <Warning />
      default:
        return null
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Vendors Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => console.log('Add new vendor')}
        >
          Add Vendor
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search vendors by name, company, or email..."
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
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="All"
                onClick={() => setFilterStatus('all')}
                color={filterStatus === 'all' ? 'primary' : 'default'}
              />
              <Chip
                label="Verified"
                onClick={() => setFilterStatus('verified')}
                color={filterStatus === 'verified' ? 'success' : 'default'}
                icon={<Verified />}
              />
              <Chip
                label="Pending"
                onClick={() => setFilterStatus('pending')}
                color={filterStatus === 'pending' ? 'warning' : 'default'}
              />
              <Chip
                label="Suspended"
                onClick={() => setFilterStatus('suspended')}
                color={filterStatus === 'suspended' ? 'error' : 'default'}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filteredVendors.map((vendor) => (
          <Grid item xs={12} md={6} lg={4} key={vendor.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                      <Flight />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {vendor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {vendor.companyName}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={vendor.status}
                    size="small"
                    color={getStatusColor(vendor.status) as any}
                    icon={getStatusIcon(vendor.status) as any}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Rating value={vendor.rating} readOnly precision={0.5} size="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({vendor.rating})
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Flight sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Fleet Size: {vendor.fleetSize}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Flight sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Flights: {vendor.totalFlights}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {vendor.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {vendor.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {vendor.phone}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    Commission: <strong>{vendor.commission}%</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since: {new Date(vendor.joinDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                >
                  View Details
                </Button>
                <Button size="small" startIcon={<Edit />}>
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Vendors