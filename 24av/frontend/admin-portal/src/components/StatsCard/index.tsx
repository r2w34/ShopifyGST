import React from 'react'
import { Card, CardContent, Typography, Box, Chip } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'

interface StatsCardProps {
  title: string
  value: string | number
  percentage: number
  trend: 'up' | 'down'
  subtitle: string
  icon?: React.ReactNode
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  percentage,
  trend,
  subtitle,
  icon,
}) => {
  const isPositive = trend === 'up'
  const trendColor = isPositive ? '#4caf50' : '#f44336'

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          {icon && (
            <Box sx={{ 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px', 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
          )}
        </Box>
        
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {value}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            icon={isPositive ? <TrendingUp /> : <TrendingDown />}
            label={`${percentage}%`}
            sx={{
              backgroundColor: `${trendColor}20`,
              color: trendColor,
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: trendColor,
              },
            }}
          />
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default StatsCard