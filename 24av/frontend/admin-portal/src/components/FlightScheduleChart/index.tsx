import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Box, Typography, FormControl, Select, MenuItem, Chip, TextField } from '@mui/material'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface FlightScheduleData {
  day: string
  domestic: number
  international: number
}

interface FlightScheduleChartProps {
  data: FlightScheduleData[]
}

const FlightScheduleChart: React.FC<FlightScheduleChartProps> = ({ data }) => {
  const [filter, setFilter] = React.useState('all')
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date())

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
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
        max: 400,
        ticks: {
          stepSize: 100,
        },
      },
    },
  }

  const chartData = {
    labels: data.map(d => d.day),
    datasets: [
      {
        label: 'Domestic',
        data: data.map(d => d.domestic),
        backgroundColor: '#90caf9',
        borderRadius: 4,
      },
      {
        label: 'International',
        data: data.map(d => d.international),
        backgroundColor: '#1e3a5f',
        borderRadius: 4,
      },
    ],
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Flights Schedule
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#90caf9', borderRadius: '2px' }} />
                  Domestic
                </Box>
              </MenuItem>
              <MenuItem value="international">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#1e3a5f', borderRadius: '2px' }} />
                  International
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="date"
            size="small"
            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            sx={{ width: 150 }}
          />
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Bar options={options} data={chartData} />
      </Box>
    </Box>
  )
}

export default FlightScheduleChart