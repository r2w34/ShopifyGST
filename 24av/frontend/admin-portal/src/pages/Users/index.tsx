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
  Menu,
  MenuItem,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
} from '@mui/icons-material'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'passenger' | 'vendor' | 'admin'
  status: 'active' | 'inactive' | 'blocked'
  joinDate: string
  lastActive: string
  totalBookings: number
}

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(userId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'User',
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {params.row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'admin' ? 'error' : params.value === 'vendor' ? 'warning' : 'default'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          icon={params.value === 'active' ? <CheckCircle /> : <Block />}
          color={params.value === 'active' ? 'success' : params.value === 'blocked' ? 'error' : 'default'}
        />
      ),
    },
    {
      field: 'totalBookings',
      headerName: 'Bookings',
      width: 100,
      align: 'center',
    },
    {
      field: 'joinDate',
      headerName: 'Join Date',
      width: 120,
    },
    {
      field: 'lastActive',
      headerName: 'Last Active',
      width: 120,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row.id)}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ]

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234-567-8900',
      role: 'passenger',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-10-14',
      totalBookings: 12,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 234-567-8901',
      role: 'vendor',
      status: 'active',
      joinDate: '2023-11-20',
      lastActive: '2024-10-15',
      totalBookings: 0,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      phone: '+1 234-567-8902',
      role: 'passenger',
      status: 'blocked',
      joinDate: '2024-03-10',
      lastActive: '2024-09-20',
      totalBookings: 5,
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      phone: '+1 234-567-8903',
      role: 'admin',
      status: 'active',
      joinDate: '2023-06-15',
      lastActive: '2024-10-15',
      totalBookings: 0,
    },
    {
      id: '5',
      name: 'Robert Brown',
      email: 'robert.b@example.com',
      phone: '+1 234-567-8904',
      role: 'passenger',
      status: 'inactive',
      joinDate: '2024-02-28',
      lastActive: '2024-08-10',
      totalBookings: 8,
    },
  ]

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => console.log('Add new user')}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users by name, email, or phone..."
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
          rows={filteredUsers}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit User
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Block sx={{ mr: 1 }} fontSize="small" />
          Block User
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete User
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Users