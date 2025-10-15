import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const PrivateRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  
  // For development, allow access without authentication
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return isAuthenticated || isDevelopment ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute