import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Vendors from './pages/Vendors'
import Flights from './pages/Flights'
import Bookings from './pages/Bookings'
import Revenue from './pages/Revenue'
import Settings from './pages/Settings'
import Support from './pages/Support'

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/:id" element={<Vendors />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/reports" element={<Revenue />} />
          <Route path="/support" element={<Support />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App