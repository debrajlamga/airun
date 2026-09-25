# AI Trading Bot - Frontend

A modern, responsive web interface for the AI Trading Bot platform. Built with React, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Starting the Application](#starting-the-application)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This is the frontend application for the AI Trading Bot platform. It provides a comprehensive dashboard for:

- Real-time market data visualization
- Trading strategy management
- Portfolio tracking
- Risk management
- Order execution
- Performance analytics

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

### Check your versions:

```bash
node --version  # Should be v18+
npm --version   # Should be v9+
git --version
```

## 📦 Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ai-trading-bot-frontend
```

### 2. Install dependencies

```bash
npm install
```

This will install all required packages including:
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Recharts (for charts)
- Lucide React (for icons)

### 3. Environment Setup (Optional)

Create a `.env` file in the root directory if you need to configure API endpoints:

```bash
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## 🚀 Starting the Application

### Development Mode

To start the development server with hot reload:

```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:5173
- **Network**: http://your-network-ip:5173 (accessible from other devices on same network)

### Production Build

To create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This serves the built files at http://localhost:4173

## 🔑 Login Credentials

### Default Admin Account

After installation, use these credentials to login:

```
Email: admin@tradingbot.local
Password: Admin@Secure2024!
MFA Code: 123456 (any 6-digit code works in demo mode)
```

**⚠️ Important**: Change the default password immediately after first login!

### Quick Login

On the login page, click the "Auto-fill Demo" button to automatically fill in the demo credentials.

## ⚙️ Configuration

### API Configuration

The frontend connects to the backend API. Configure the API URL in `.env`:

```bash
# Development
VITE_API_URL=http://localhost:8000/api

# Production
VITE_API_URL=https://your-domain.com/api
```

### Backend Requirements

The frontend requires the backend API to be running. Make sure:

1. Backend is running on port 8000
2. Database (PostgreSQL) is running
3. Redis is running for caching
4. CORS is properly configured in the backend

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run type-check` | Run TypeScript type checking |

## 📁 Project Structure

```
ai-trading-bot-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout with sidebar
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── pages/               # Page components
│   │   ├── Login.tsx        # Login page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Market.tsx       # Market data
│   │   ├── Strategies.tsx   # Strategy management
│   │   ├── Backtest.tsx     # Backtesting
│   │   ├── Orders.tsx       # Order management
│   │   ├── Positions.tsx    # Position tracking
│   │   ├── Portfolio.tsx    # Portfolio overview
│   │   ├── Risk.tsx         # Risk management
│   │   ├── TradeJournal.tsx # Trade history
│   │   ├── Notifications.tsx # Notifications
│   │   └── Settings.tsx     # Settings page
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication logic
│   │   └── useTrading.ts    # Trading state management
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Auth state context
│   ├── types/               # TypeScript type definitions
│   ├── data/                # Mock data and utilities
│   ├── services/            # API services
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.js          # Vite config
└── README.md               # This file
```

## ✨ Features

### Authentication & Security
- ✅ Single admin login system
- ✅ JWT-based authentication
- ✅ MFA/2FA support (demo mode)
- ✅ Session management
- ✅ Brute-force protection

### Dashboard
- Real-time portfolio overview
- P&L tracking
- Win rate statistics
- Drawdown metrics
- Bot status monitoring

### Market Data
- Live price updates (mock data in demo)
- Interactive charts
- Watchlist management
- Multiple timeframes
- Technical indicators

### Trading
- Strategy management
- Backtesting engine
- Order placement
- Position tracking
- Risk management

### User Interface
- Dark theme optimized for trading
- Responsive design
- Real-time notifications
- Emergency stop button
- Intuitive navigation

## 🔍 Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Find process using the port
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- --port 3000
```

### Build Errors

If you encounter build errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### TypeScript Errors

Run type checking:

```bash
npm run type-check
```

### API Connection Issues

If the frontend can't connect to the backend:

1. Check if backend is running:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. Verify `.env` file has correct API URL

3. Check browser console for CORS errors

4. Ensure backend CORS settings allow frontend origin

### Login Not Redirecting

If login doesn't redirect to dashboard:

1. Clear browser cache and localStorage
2. Check browser console for errors
3. Verify AuthContext is properly wrapped in App.tsx
4. Try in incognito/private mode

### Charts Not Loading

If charts don't display:

1. Check browser console for errors
2. Verify Recharts is installed: `npm list recharts`
3. Ensure data format is correct
4. Try refreshing the page

## 🌐 Deployment

### Deploy to VPS

Use the provided setup script:

```bash
chmod +x vps-setup.sh
sudo bash vps-setup.sh
```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Serve the `dist/` folder with any static file server:
   ```bash
   # Using serve
   npm install -g serve
   serve -s dist -l 3000
   
   # Using Python
   cd dist
   python3 -m http.server 3000
   ```

3. Configure Nginx/Apache to serve the files

### Environment Variables for Production

Create `.env.production`:

```bash
VITE_API_URL=https://your-domain.com/api
VITE_WS_URL=wss://your-domain.com/ws
```

## 🔐 Security Notes

- Never commit `.env` files with real credentials
- Change default admin password after first login
- Use HTTPS in production
- Enable MFA for production use
- Regular security updates
- Monitor logs for suspicious activity

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review browser console for errors
- Check backend logs
- Verify all services are running

## ⚠️ Disclaimer

**Trading involves substantial risk of loss. This software is for educational and informational purposes only. Past performance does not guarantee future results. Never trade with money you cannot afford to lose.**

---

**Happy Trading! 📈**
