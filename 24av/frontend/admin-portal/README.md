# 24Aviation Admin Portal

## Overview

The Admin Portal for 24Aviation provides comprehensive management capabilities for the charter flight booking platform. It features a modern, responsive dashboard with real-time analytics and management tools.

## Features

- **Dashboard**: Real-time statistics, flight schedules, top routes, and ticket sales analytics
- **User Management**: Manage passenger accounts and profiles
- **Vendor Management**: Oversee flight operators, verify documents, and manage commissions
- **Flight Management**: Monitor all flights, schedules, and availability
- **Booking Management**: Track and manage all bookings across the platform
- **Revenue Analytics**: Detailed financial reports and commission tracking
- **Settings**: Platform configuration and system settings

## Tech Stack

- React 18 with TypeScript
- Material-UI (MUI) for UI components
- Redux Toolkit for state management
- Chart.js for data visualization
- React Router for navigation
- Vite for fast development

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

The admin portal will be available at `http://localhost:5003`

### Default Login (Development)

For development, you can click the login button without credentials to access the dashboard.

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── store/           # Redux store and slices
├── services/        # API services
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── assets/          # Static assets
```

## Key Components

### Dashboard
- **Stats Cards**: Display key metrics with trend indicators
- **Flight Schedule Chart**: Bar chart showing domestic vs international flights
- **Top Routes Table**: List of most popular flight routes
- **Ticket Sales Chart**: Line chart showing sales trends
- **Recent Activity**: Real-time activity feed

### Layout
- Responsive sidebar navigation
- Top app bar with search and notifications
- User profile menu

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

Proprietary - 24Aviation