import React from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Link,
  Chip,
} from '@mui/material'
import { Person, Update, Cancel, BookOnline } from '@mui/icons-material'

interface Activity {
  id: string
  user: string
  action: string
  details: string
  timestamp: string
  type: 'booking' | 'update' | 'cancellation' | 'registration'
}

interface RecentActivityProps {
  activities: Activity[]
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'booking':
        return <BookOnline />
      case 'update':
        return <Update />
      case 'cancellation':
        return <Cancel />
      case 'registration':
        return <Person />
      default:
        return <Person />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'booking':
        return '#4caf50'
      case 'update':
        return '#2196f3'
      case 'cancellation':
        return '#f44336'
      case 'registration':
        return '#ff9800'
      default:
        return '#757575'
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Recent Activity
        </Typography>
        <Link href="#" underline="hover" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          See All
        </Link>
      </Box>
      
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {activities.map((activity) => (
          <ListItem key={activity.id} alignItems="flex-start" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}20`, color: getActivityColor(activity.type) }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box>
                  <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                    {activity.user}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                    {activity.action}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {activity.details}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.timestamp}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default RecentActivity