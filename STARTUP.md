# 🚀 How to Start - AI Trading Bot

Complete guide on how to start the AI Trading Bot application in different scenarios.

## 📋 Quick Navigation

- [Development Mode](#development-mode) - For local testing
- [Production Mode](#production-mode) - For VPS deployment
- [Docker Mode](#docker-mode) - Using Docker containers
- [Troubleshooting](#troubleshooting) - Common startup issues

---

## 💻 Development Mode

### Prerequisites Check

Before starting, verify you have:

```bash
node --version     # Should be v18+
npm --version      # Should be 9+
python3 --version  # Should be 3.10+
```

### Step-by-Step Start

#### 1. Start Frontend

```bash
# Navigate to project directory
cd ai-trading-bot

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend URL:** http://localhost:5173

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

#### 2. Start Backend (New Terminal)

```bash
# Open new terminal
cd ai-trading-bot/backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install dependencies (first time only)
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend URL:** http://localhost:8000

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### 3. Start Database Services

```bash
# Start PostgreSQL
sudo systemctl start postgresql  # Linux
# OR
brew services start postgresql@14  # macOS

# Start Redis
sudo systemctl start redis-server  # Linux
# OR
brew services start redis  # macOS

# Verify services
sudo systemctl status postgresql
sudo systemctl status redis-server
```

#### 4. Access Application

Open browser: **http://localhost:5173**

**Login Credentials:**
```
Email: admin@tradingbot.local
Password: Admin@Secure2024!
MFA Code: 123456
```

---

## 🌐 Production Mode (VPS)

### After Installation

If you used `vps-setup.sh`, services should already be running.

#### Check Service Status

```bash
# Check backend
sudo systemctl status trading-backend

# Check frontend
pm2 status

# Check database
sudo systemctl status postgresql
sudo systemctl status redis-server

# Check nginx
sudo systemctl status nginx
```

#### Start Services (If Stopped)

```bash
# Start backend
sudo systemctl start trading-backend

# Start frontend
pm2 start trading-frontend
# OR
pm2 start ecosystem.config.js

# Start database
sudo systemctl start postgresql
sudo systemctl start redis-server

# Start nginx
sudo systemctl start nginx
```

#### View Logs

```bash
# Backend logs
sudo journalctl -u trading-backend -f

# Frontend logs
pm2 logs trading-frontend

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# All logs at once
sudo journalctl -u trading-backend -f &
pm2 logs &
sudo tail -f /var/log/nginx/error.log &
```

#### Access Application

**URL:** https://your-domain.com

Login with credentials shown at end of installation.

---

## 🐳 Docker Mode

### Start All Services

```bash
# Navigate to project directory
cd ai-trading-bot

# Start all containers
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

You should see all services running:
```
NAME                STATUS
trading-frontend    Up
trading-backend     Up
trading-postgres    Up
trading-redis       Up
trading-nginx       Up
```

### Stop All Services

```bash
docker compose down
```

### Restart Services

```bash
docker compose restart
```

### Access Application

**URL:** http://localhost (or https://your-domain.com if SSL configured)

---

## 🔧 Starting Individual Components

### Frontend Only

```bash
# Development
npm run dev

# Production
npm run build
npm run preview

# With PM2 (Production)
pm2 start ecosystem.config.js
```

### Backend Only

```bash
cd backend
source venv/bin/activate

# Development (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Production (multiple workers)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Database Only

```bash
# PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Auto-start on boot

# Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server  # Auto-start on boot
```

### Nginx Only

```bash
sudo systemctl start nginx
sudo systemctl enable nginx  # Auto-start on boot
```

---

## 📊 Verification After Start

### 1. Check Frontend

```bash
curl http://localhost:5173
# Should return HTML content
```

Or open browser and verify page loads.

### 2. Check Backend

```bash
curl http://localhost:8000/api/health
# Should return JSON: {"status": "healthy", ...}
```

### 3. Check Database

```bash
# PostgreSQL
psql -U trading_user -d trading_bot -c "SELECT 1"
# Should return: ?column? = 1

# Redis
redis-cli ping
# Should return: PONG
```

### 4. Check Nginx (Production)

```bash
curl -I https://your-domain.com
# Should return HTTP/2 200
```

### 5. Test Login

1. Open browser
2. Go to http://localhost:5173 (dev) or https://your-domain.com (prod)
3. Enter credentials
4. Verify dashboard loads

---

## 🔄 Restarting Services

### Development Mode

```bash
# Frontend - Press Ctrl+C, then:
npm run dev

# Backend - Press Ctrl+C, then:
uvicorn app.main:app --reload --port 8000
```

### Production Mode

```bash
# Backend
sudo systemctl restart trading-backend

# Frontend
pm2 restart trading-frontend

# Database
sudo systemctl restart postgresql
sudo systemctl restart redis-server

# Nginx
sudo systemctl restart nginx

# All at once
sudo systemctl restart trading-backend postgresql redis-server nginx
pm2 restart trading-frontend
```

### Docker Mode

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

---

## 🛑 Stopping Services

### Development Mode

```bash
# Frontend - Press Ctrl+C in terminal
# Backend - Press Ctrl+C in terminal

# Or kill processes
pkill -f "vite"
pkill -f "uvicorn"
```

### Production Mode

```bash
# Backend
sudo systemctl stop trading-backend

# Frontend
pm2 stop trading-frontend

# Database
sudo systemctl stop postgresql
sudo systemctl stop redis-server

# Nginx
sudo systemctl stop nginx

# All at once
sudo systemctl stop trading-backend postgresql redis-server nginx
pm2 stop trading-frontend
```

### Docker Mode

```bash
# Stop all
docker compose down

# Stop and remove volumes
docker compose down -v
```

---

## 🔍 Troubleshooting Startup Issues

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5173`

**Solution:**

```bash
# Find process using port
sudo lsof -i :5173  # Frontend
sudo lsof -i :8000  # Backend

# Kill process
sudo kill -9 <PID>

# Or use different port
npm run dev -- --port 3000  # Frontend
uvicorn app.main:app --port 8001  # Backend
```

### Issue: Backend Won't Start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Database Connection Error

**Error:** `could not connect to server`

**Solution:**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check credentials in .env
cat .env | grep DATABASE_URL

# Test connection
psql -U trading_user -d trading_bot -h localhost
```

### Issue: Redis Connection Error

**Error:** `Error: Redis connection to localhost:6379 failed`

**Solution:**

```bash
# Check if Redis is running
sudo systemctl status redis-server

# Start if not running
sudo systemctl start redis-server

# Test connection
redis-cli ping
```

### Issue: Frontend Shows Blank Page

**Solution:**

1. Check browser console (F12) for errors
2. Verify backend is running
3. Check `.env` file has correct API URL
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try incognito mode

### Issue: Login Not Working

**Solution:**

1. Verify backend is running: `curl http://localhost:8000/api/health`
2. Check browser console for errors
3. Clear localStorage: `localStorage.clear()` in browser console
4. Try different browser
5. Check credentials are correct

### Issue: Nginx 502 Bad Gateway

**Solution:**

```bash
# Check backend is running
sudo systemctl status trading-backend

# Check backend logs
sudo journalctl -u trading-backend -n 50

# Restart backend
sudo systemctl restart trading-backend

# Check nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## 📝 Startup Scripts

### Create Quick Start Script

```bash
cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting AI Trading Bot (Development Mode)"
echo "=============================================="

# Start PostgreSQL
echo "Starting PostgreSQL..."
sudo systemctl start postgresql

# Start Redis
echo "Starting Redis..."
sudo systemctl start redis-server

# Start Backend
echo "Starting Backend..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start-dev.sh
```

**Usage:**

```bash
./start-dev.sh
```

### Create Production Start Script

```bash
cat > start-prod.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting AI Trading Bot (Production Mode)"
echo "============================================="

# Start services
echo "Starting PostgreSQL..."
sudo systemctl start postgresql

echo "Starting Redis..."
sudo systemctl start redis-server

echo "Starting Backend..."
sudo systemctl start trading-backend

echo "Starting Frontend..."
pm2 start trading-frontend

echo "Starting Nginx..."
sudo systemctl start nginx

echo ""
echo "✅ All services started!"
echo "Access: https://your-domain.com"
echo ""
echo "Check status:"
echo "  Backend: sudo systemctl status trading-backend"
echo "  Frontend: pm2 status"
echo "  Database: sudo systemctl status postgresql"
echo "  Redis: sudo systemctl status redis-server"
echo "  Nginx: sudo systemctl status nginx"
EOF

chmod +x start-prod.sh
```

**Usage:**

```bash
sudo ./start-prod.sh
```

---

## 📊 Service Status Summary

### Development Mode

| Service | Command | URL |
|---------|---------|-----|
| Frontend | `npm run dev` | http://localhost:5173 |
| Backend | `uvicorn app.main:app --reload` | http://localhost:8000 |
| PostgreSQL | `sudo systemctl start postgresql` | localhost:5432 |
| Redis | `sudo systemctl start redis-server` | localhost:6379 |

### Production Mode

| Service | Command | URL |
|---------|---------|-----|
| Frontend | `pm2 start trading-frontend` | https://your-domain.com |
| Backend | `sudo systemctl start trading-backend` | https://your-domain.com/api |
| PostgreSQL | `sudo systemctl start postgresql` | localhost:5432 |
| Redis | `sudo systemctl start redis-server` | localhost:6379 |
| Nginx | `sudo systemctl start nginx` | https://your-domain.com |

### Docker Mode

| Service | Command | URL |
|---------|---------|-----|
| All | `docker compose up -d` | http://localhost |
| Frontend | `docker compose up frontend` | http://localhost:3000 |
| Backend | `docker compose up backend` | http://localhost:8000 |
| PostgreSQL | `docker compose up postgres` | localhost:5432 |
| Redis | `docker compose up redis` | localhost:6379 |

---

## ✅ Checklist Before Starting

- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed
- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Dependencies installed (`npm install`, `pip install -r requirements.txt`)
- [ ] `.env` file configured
- [ ] Database created and initialized
- [ ] Correct ports available (5173, 8000, 5432, 6379)

---

## 🎯 Quick Start Commands

### Development (One-liner)

```bash
# Terminal 1
npm run dev

# Terminal 2
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 3
sudo systemctl start postgresql redis-server
```

### Production (One-liner)

```bash
sudo systemctl start postgresql redis-server nginx trading-backend && pm2 start trading-frontend
```

### Docker (One-liner)

```bash
docker compose up -d
```

---

**Ready to Start! 🚀**

For more details:
- [README.md](./README.md) - Full documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [INSTALLATION.md](./INSTALLATION.md) - Installation guide
