import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Box, Typography, Select, MenuItem, FormControl, Chip } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const TicketSalesChart: React.FC = () => {
  const [year, setYear] = React.useState('2026')

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 10000,
        ticks: {
          stepSize: 2500,
          callback: function(value: any) {
            return value.toLocaleString()
          },
        },
      },
    },
  }

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Ticket Sales',
        data: [7500, 8200, 7800, 8500, 9000, 8300, 7900, 8600, 8100, 8800, 8400, 9200],
        borderColor: '#90caf9',
        backgroundColor: 'rgba(144, 202, 249, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Ticket Sales
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              8,303
            </Typography>
            <Chip
              size="small"
              icon={<TrendingUp />}
              label="6.9%"
              sx={{
                backgroundColor: '#4caf5020',
                color: '#4caf50',
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: '#4caf50',
                },
              }}
            />
          </Box>
        </Box>
        <FormControl size="small">
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            sx={{ minWidth: 100 }}
          >
            <MenuItem value="2024">Year 2024</MenuItem>
            <MenuItem value="2025">Year 2025</MenuItem>
            <MenuItem value="2026">Year 2026</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <Line options={options} data={data} />
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: '#1e3a5f',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          2,423
          <Typography variant="caption" display="block" sx={{ fontSize: '0.75rem' }}>
            August 2026
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default TicketSalesChart