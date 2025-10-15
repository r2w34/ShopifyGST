import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  ExpandMore,
  Search,
  HelpOutline,
  ContactSupport,
  Email,
  Phone,
  Chat,
  Article,
  VideoLibrary,
  School,
  CheckCircle,
} from '@mui/icons-material'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const Support: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false)

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I add a new vendor to the platform?',
      answer: 'To add a new vendor, navigate to the Vendors page and click the "Add Vendor" button. Fill in all required information including company details, contact information, and fleet details. The vendor will receive an email invitation to complete their registration.',
      category: 'Vendors',
    },
    {
      id: '2',
      question: 'How is commission calculated for bookings?',
      answer: 'Commission is calculated as a percentage of the total booking amount. The default commission rate can be set in Settings > Payment, and individual vendor commission rates can be customized in their vendor profile. Commission is automatically deducted from vendor payouts.',
      category: 'Payments',
    },
    {
      id: '3',
      question: 'What happens when a flight is cancelled?',
      answer: 'When a flight is cancelled, all affected passengers are automatically notified via email and SMS (if enabled). Refunds are processed according to the cancellation policy. If auto-refund is enabled, refunds are processed within the configured timeframe.',
      category: 'Bookings',
    },
    {
      id: '4',
      question: 'How do I export booking data?',
      answer: 'You can export booking data from the Bookings page by clicking the "Export" button. Choose your desired format (CSV, Excel, or PDF) and date range. The export will include all booking details, passenger information, and payment status.',
      category: 'Reports',
    },
    {
      id: '5',
      question: 'How do I manage user permissions?',
      answer: 'User permissions are managed through role-based access control. Navigate to Users > Roles & Permissions to create custom roles and assign specific permissions. Users can be assigned roles when creating or editing their accounts.',
      category: 'Users',
    },
    {
      id: '6',
      question: 'What payment gateways are supported?',
      answer: '24Aviation supports multiple payment gateways including Stripe, PayPal, Razorpay, and Square. You can configure your preferred payment gateway in Settings > Payment. Multiple gateways can be enabled simultaneously.',
      category: 'Payments',
    },
  ]

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false)
  }

  const categories = [...new Set(faqs.map(faq => faq.category))]

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Help & Support
      </Typography>

      <Grid container spacing={3}>
        {/* Contact Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Email color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6">Email Support</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Get help via email
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    support@24aviation.com
                  </Typography>
                  <Button variant="outlined" fullWidth startIcon={<Email />}>
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Phone color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6">Phone Support</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Talk to our team
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    +1 (800) 24-AVIATION
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mon-Fri 9AM-6PM EST
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chat color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6">Live Chat</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Instant assistance
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Online"
                    color="success"
                    size="small"
                    icon={<CheckCircle />}
                    sx={{ mb: 2 }}
                  />
                  <Button variant="contained" fullWidth startIcon={<Chat />}>
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Frequently Asked Questions
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mb: 2 }}>
              {categories.map(category => (
                <Chip
                  key={category}
                  label={category}
                  sx={{ mr: 1, mb: 1 }}
                  onClick={() => setSearchTerm(category)}
                />
              ))}
            </Box>

            {filteredFAQs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expandedPanel === faq.id}
                onChange={handlePanelChange(faq.id)}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <HelpOutline color="primary" />
                    <Typography sx={{ flexGrow: 1 }}>{faq.question}</Typography>
                    <Chip label={faq.category} size="small" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* Resources */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resources
            </Typography>
            <List>
              <ListItem button>
                <ListItemIcon>
                  <Article color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Documentation"
                  secondary="Comprehensive guides and API docs"
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <VideoLibrary color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Video Tutorials"
                  secondary="Step-by-step video guides"
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <School color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Training Center"
                  secondary="Online courses and certifications"
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <ContactSupport color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Community Forum"
                  secondary="Connect with other users"
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">API Services</Typography>
                <Chip label="Operational" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Payment Gateway</Typography>
                <Chip label="Operational" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Email Service</Typography>
                <Chip label="Operational" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">SMS Service</Typography>
                <Chip label="Degraded" color="warning" size="small" />
              </Box>
            </Box>
            <Button
              variant="text"
              size="small"
              sx={{ mt: 2 }}
              onClick={() => window.open('https://status.24aviation.com', '_blank')}
            >
              View Full Status Page
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Support