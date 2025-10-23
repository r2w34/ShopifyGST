import React from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material'
import { FilterList, LocationOn } from '@mui/icons-material'

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

interface TopRoutesTableProps {
  routes: TopRoute[]
}

const TopRoutesTable: React.FC<TopRoutesTableProps> = ({ routes }) => {
  const formatPassengers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    return `${(count / 1000).toFixed(0)}K`
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Top Flight Routes
        </Typography>
        <IconButton size="small">
          <FilterList />
        </IconButton>
      </Box>
      
      <TableContainer sx={{ flexGrow: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Route</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Distance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {route.from} ({route.fromCode}) to {route.to} ({route.toCode})
                    </Typography>
                    <Chip
                      label={`${formatPassengers(route.annualPassengers)} annually`}
                      size="small"
                      sx={{
                        mt: 0.5,
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 500,
                        height: 24,
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {route.distance.toLocaleString()} {route.distanceUnit}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default TopRoutesTable