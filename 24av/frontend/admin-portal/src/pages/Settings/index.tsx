import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Slider,
  Chip,
} from '@mui/material'
import {
  Save,
  Business,
  Notifications,
  Security,
  Payment,
  Email,
  Language,
  Palette,
} from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [saved, setSaved] = useState(false)

  // General settings
  const [companyName, setCompanyName] = useState('24Aviation')
  const [companyEmail, setCompanyEmail] = useState('contact@24aviation.com')
  const [companyPhone, setCompanyPhone] = useState('+1 234-567-8900')
  const [timezone, setTimezone] = useState('UTC-5')
  const [currency, setCurrency] = useState('USD')
  const [language, setLanguage] = useState('en')

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [bookingAlerts, setBookingAlerts] = useState(true)
  const [paymentAlerts, setPaymentAlerts] = useState(true)
  const [systemAlerts, setSystemAlerts] = useState(true)

  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState(30)
  const [passwordExpiry, setPasswordExpiry] = useState(90)
  const [ipWhitelisting, setIpWhitelisting] = useState(false)

  // Payment settings
  const [defaultCommission, setDefaultCommission] = useState(15)
  const [paymentGateway, setPaymentGateway] = useState('stripe')
  const [autoRefund, setAutoRefund] = useState(true)
  const [refundPeriod, setRefundPeriod] = useState(24)

  const handleSave = () => {
    // Save settings logic here
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Business />} label="General" iconPosition="start" />
            <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
            <Tab icon={<Security />} label="Security" iconPosition="start" />
            <Tab icon={<Payment />} label="Payment" iconPosition="start" />
            <Tab icon={<Email />} label="Email" iconPosition="start" />
            <Tab icon={<Language />} label="Localization" iconPosition="start" />
            <Tab icon={<Palette />} label="Appearance" iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    label="Timezone"
                  >
                    <MenuItem value="UTC-8">Pacific Time (UTC-8)</MenuItem>
                    <MenuItem value="UTC-5">Eastern Time (UTC-5)</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="UTC+1">Central European Time (UTC+1)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Currency</InputLabel>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    label="Default Currency"
                  >
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="GBP">GBP - British Pound</MenuItem>
                    <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Language</InputLabel>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    label="Default Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Alert Types
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={bookingAlerts}
                      onChange={(e) => setBookingAlerts(e.target.checked)}
                    />
                  }
                  label="New Booking Alerts"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={paymentAlerts}
                      onChange={(e) => setPaymentAlerts(e.target.checked)}
                    />
                  }
                  label="Payment Alerts"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemAlerts}
                      onChange={(e) => setSystemAlerts(e.target.checked)}
                    />
                  }
                  label="System Alerts"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Session Timeout (minutes): {sessionTimeout}
                </Typography>
                <Slider
                  value={sessionTimeout}
                  onChange={(_, value) => setSessionTimeout(value as number)}
                  min={5}
                  max={120}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Password Expiry (days): {passwordExpiry}
                </Typography>
                <Slider
                  value={passwordExpiry}
                  onChange={(_, value) => setPasswordExpiry(value as number)}
                  min={30}
                  max={365}
                  step={30}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ipWhitelisting}
                      onChange={(e) => setIpWhitelisting(e.target.checked)}
                    />
                  }
                  label="IP Whitelisting"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Payment Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Default Commission Rate: {defaultCommission}%
                </Typography>
                <Slider
                  value={defaultCommission}
                  onChange={(_, value) => setDefaultCommission(value as number)}
                  min={5}
                  max={30}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Gateway</InputLabel>
                  <Select
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    label="Payment Gateway"
                  >
                    <MenuItem value="stripe">Stripe</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                    <MenuItem value="razorpay">Razorpay</MenuItem>
                    <MenuItem value="square">Square</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefund}
                      onChange={(e) => setAutoRefund(e.target.checked)}
                    />
                  }
                  label="Enable Auto-Refund for Cancellations"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Refund Processing Time: {refundPeriod} hours
                </Typography>
                <Slider
                  value={refundPeriod}
                  onChange={(_, value) => setRefundPeriod(value as number)}
                  min={1}
                  max={72}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  disabled={!autoRefund}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Email Configuration
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Configure email templates and SMTP settings for system emails.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  defaultValue="smtp.gmail.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  type="number"
                  defaultValue="587"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  defaultValue="noreply@24aviation.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Password"
                  type="password"
                  defaultValue="••••••••"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" gutterBottom>
              Localization Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Supported Languages
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="English" color="primary" />
                  <Chip label="Spanish" />
                  <Chip label="French" />
                  <Chip label="German" />
                  <Chip label="Chinese" />
                  <Chip label="Arabic" />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select defaultValue="MM/DD/YYYY" label="Date Format">
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <Select defaultValue="12h" label="Time Format">
                    <MenuItem value="12h">12 Hour</MenuItem>
                    <MenuItem value="24h">24 Hour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <Typography variant="h6" gutterBottom>
              Appearance Settings
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Theme settings are controlled by the theme toggle in the header.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Logo & Branding
                </Typography>
                <Button variant="outlined">
                  Upload Logo
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Primary Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: '#1976d2', borderRadius: 1 }} />
                  <Box sx={{ width: 40, height: 40, bgcolor: '#dc004e', borderRadius: 1 }} />
                  <Box sx={{ width: 40, height: 40, bgcolor: '#388e3c', borderRadius: 1 }} />
                  <Box sx={{ width: 40, height: 40, bgcolor: '#f57c00', borderRadius: 1 }} />
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  )
}

export default Settings