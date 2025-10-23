import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Download,
  CalendarMonth,
  Receipt,
  AccountBalance,
} from '@mui/icons-material'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Revenue: React.FC = () => {
  const [period, setPeriod] = useState('month')
  const [year, setYear] = useState('2024')

  // Revenue trend data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [65000, 72000, 68000, 85000, 92000, 88000, 95000, 98000, 102000, 108000, 112000, 118000],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [45000, 48000, 46000, 52000, 55000, 53000, 58000, 60000, 62000, 65000, 68000, 70000],
        borderColor: '#dc004e',
        backgroundColor: 'rgba(220, 0, 78, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Commission by vendor data
  const commissionData = {
    labels: ['SkyHigh Airways', 'Elite Charters', 'Global Wings', 'Luxury Air', 'Swift Jets'],
    datasets: [
      {
        label: 'Commission Revenue',
        data: [25000, 22000, 18000, 15000, 12000],
        backgroundColor: [
          '#1976d2',
          '#42a5f5',
          '#66bb6a',
          '#ffa726',
          '#ef5350',
        ],
      },
    ],
  }

  // Revenue by route data
  const routeRevenueData = {
    labels: ['JFK-LHR', 'LAX-NRT', 'SYD-SIN', 'DXB-LHR', 'CDG-JFK'],
    datasets: [
      {
        data: [180000, 150000, 120000, 100000, 80000],
        backgroundColor: [
          '#1976d2',
          '#42a5f5',
          '#66bb6a',
          '#ffa726',
          '#ef5350',
        ],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const transactions = [
    {
      id: 'TXN001',
      date: '2024-10-15',
      type: 'Booking',
      description: 'Flight SA101 - JFK to LHR',
      amount: 1200,
      status: 'completed',
      vendor: 'SkyHigh Airways',
      commission: 180,
    },
    {
      id: 'TXN002',
      date: '2024-10-15',
      type: 'Booking',
      description: 'Flight EC202 - LAX to NRT',
      amount: 3000,
      status: 'completed',
      vendor: 'Elite Charters',
      commission: 360,
    },
    {
      id: 'TXN003',
      date: '2024-10-14',
      type: 'Refund',
      description: 'Flight LA404 - DXB to CDG',
      amount: -2200,
      status: 'refunded',
      vendor: 'Luxury Air',
      commission: -220,
    },
    {
      id: 'TXN004',
      date: '2024-10-14',
      type: 'Booking',
      description: 'Flight GW303 - ORD to MIA',
      amount: 450,
      status: 'pending',
      vendor: 'Global Wings',
      commission: 81,
    },
    {
      id: 'TXN005',
      date: '2024-10-13',
      type: 'Booking',
      description: 'Flight SJ505 - SYD to SIN',
      amount: 1600,
      status: 'completed',
      vendor: 'Swift Jets',
      commission: 320,
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Revenue Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Period">
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="quarter">Quarter</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} onChange={(e) => setYear(e.target.value)} label="Year">
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
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
                    $1.2M
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2" color="success.main">
                      15.3% from last month
                    </Typography>
                  </Box>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 32 }} />
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
                    Net Profit
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                    $420K
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2" color="success.main">
                      12.8% from last month
                    </Typography>
                  </Box>
                </Box>
                <AccountBalance color="success" sx={{ fontSize: 32 }} />
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
                    Commission Earned
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                    $92K
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2" color="success.main">
                      18.5% from last month
                    </Typography>
                  </Box>
                </Box>
                <Receipt color="warning" sx={{ fontSize: 32 }} />
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
                    Avg. Transaction
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                    $1,850
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
                    <Typography variant="body2" color="error.main">
                      3.2% from last month
                    </Typography>
                  </Box>
                </Box>
                <CalendarMonth color="info" sx={{ fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Revenue & Expenses Trend
            </Typography>
            <Box sx={{ height: 320 }}>
              <Line data={revenueData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Route
            </Typography>
            <Box sx={{ height: 320 }}>
              <Doughnut data={routeRevenueData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Commission by Vendor
            </Typography>
            <Box sx={{ height: 320 }}>
              <Bar data={commissionData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Commission</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.vendor}</TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={transaction.amount < 0 ? 'error' : 'inherit'}
                          sx={{ fontWeight: 600 }}
                        >
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={transaction.commission < 0 ? 'error' : 'success.main'}
                        >
                          ${Math.abs(transaction.commission)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={
                            transaction.status === 'completed'
                              ? 'success'
                              : transaction.status === 'refunded'
                              ? 'error'
                              : 'warning'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Revenue