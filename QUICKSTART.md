# 🚀 Quick Start Guide - AI Trading Bot

Ye guide aapko step-by-step batayega ki program kaise start karein.

## 📋 Table of Contents

1. [Development Mode (Local Testing)](#development-mode)
2. [Production Mode (VPS Deployment)](#production-mode)
3. [Backend Setup](#backend-setup)
4. [Database Setup](#database-setup)
5. [First Login](#first-login)
6. [Common Commands](#common-commands)
7. [Troubleshooting](#troubleshooting)

---

## 🛠️ Development Mode (Local Testing)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Frontend

```bash
npm run dev
```

**Frontend will be available at:** http://localhost:5173

### Step 3: Start Backend (Separate Terminal)

Agar backend available hai:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Backend will be available at:** http://localhost:8000

### Step 4: Open Browser

Visit: **http://localhost:5173**

---

## 🔑 First Login

### Demo Credentials

```
Email: admin@tradingbot.local
Password: Admin@Secure2024!
MFA Code: 123456 (any 6-digit code)
```

### Quick Login

Login page pe **"Auto-fill Demo"** button click karein - sab credentials automatically fill ho jayenge.

---

## 🌐 Production Mode (VPS Deployment)

### Option 1: Automated Setup (Recommended)

```bash
# Upload files to VPS
scp -r ./* root@your-vps-ip:/root/ai-trading-bot/

# SSH into VPS
ssh root@your-vps-ip

# Run setup script
cd /root/ai-trading-bot
chmod +x vps-setup.sh
sudo bash vps-setup.sh
```

Script automatically:
- ✅ Install all dependencies
- ✅ Setup PostgreSQL & Redis
- ✅ Configure Nginx
- ✅ Setup SSL certificate
- ✅ Create systemd services
- ✅ Start all services

### Option 2: Manual Setup

#### 1. Install System Dependencies

```bash
sudo apt update
sudo apt install -y postgresql redis-server python3 python3-pip python3-venv nodejs npm nginx
```

#### 2. Setup Database

```bash
sudo -u postgres psql

CREATE USER trading_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE trading_bot OWNER trading_user;
\q
```

#### 3. Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp ../.env.example ../.env
nano ../.env  # Edit with your settings

# Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 4. Setup Frontend

```bash
cd frontend
npm install
npm run build

# Install serve for production
npm install -g serve

# Start frontend
serve -s dist -l 3000
```

#### 5. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/ai-trading-bot
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/ai-trading-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🗄️ Database Setup

### PostgreSQL Setup

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql

CREATE USER trading_user WITH PASSWORD 'your_password';
CREATE DATABASE trading_bot OWNER trading_user;
GRANT ALL PRIVILEGES ON DATABASE trading_bot TO trading_user;
\q

# Run migrations (if backend has them)
cd backend
source venv/bin/activate
alembic upgrade head
```

### Redis Setup

```bash
# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping  # Should return PONG
```

---

## 📝 Common Commands

### Frontend Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check code quality
npm run type-check       # TypeScript type checking

# Maintenance
rm -rf node_modules      # Clear dependencies
npm install              # Reinstall dependencies
rm -rf dist              # Clear build folder
```

### Backend Commands

```bash
# Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# With specific host
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Production (no reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Database Commands

```bash
# PostgreSQL
sudo systemctl status postgresql    # Check status
sudo systemctl restart postgresql   # Restart
sudo -u postgres psql               # Open psql

# Redis
sudo systemctl status redis-server  # Check status
sudo systemctl restart redis-server # Restart
redis-cli ping                      # Test connection
```

### Service Management (Production)

```bash
# Backend service
sudo systemctl status trading-backend
sudo systemctl restart trading-backend
sudo journalctl -u trading-backend -f  # View logs

# Frontend (PM2)
pm2 status                             # Check status
pm2 restart trading-frontend           # Restart
pm2 logs trading-frontend              # View logs

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t                          # Test config
```

---

## 🔍 Troubleshooting

### Frontend Issues

#### Port 5173 Already in Use

```bash
# Find process
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

#### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### TypeScript Errors

```bash
npm run type-check
```

### Backend Issues

#### Port 8000 Already in Use

```bash
lsof -i :8000
kill -9 <PID>
```

#### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check credentials in .env
cat .env | grep DATABASE_URL

# Test connection
psql -U trading_user -d trading_bot -h localhost
```

#### Redis Connection Error

```bash
# Check Redis is running
sudo systemctl status redis-server

# Test connection
redis-cli ping
```

### Login Issues

#### Login Not Redirecting

1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```
3. Try incognito mode
4. Check browser console for errors (F12)

#### MFA Code Not Working

- Demo mode: Any 6-digit code works (e.g., 123456)
- Production: Use authenticator app (Google Authenticator)

### Production Issues

#### Nginx 502 Bad Gateway

```bash
# Check backend is running
sudo systemctl status trading-backend

# Check backend logs
sudo journalctl -u trading-backend -n 50

# Restart backend
sudo systemctl restart trading-backend
```

#### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates
```

#### Frontend Not Loading

```bash
# Check frontend is running
pm2 status

# Check frontend logs
pm2 logs trading-frontend

# Restart frontend
pm2 restart trading-frontend

# Rebuild if needed
cd /path/to/frontend
npm run build
pm2 restart trading-frontend
```

---

## 📊 Checking System Health

### Quick Health Check

```bash
# Frontend
curl http://localhost:5173

# Backend
curl http://localhost:8000/api/health

# Database
psql -U trading_user -d trading_bot -c "SELECT 1"

# Redis
redis-cli ping
```

### Full System Check

```bash
# All services
sudo systemctl status postgresql redis-server nginx

# Backend service
sudo systemctl status trading-backend

# Frontend
pm2 status

# View all logs
sudo journalctl -u trading-backend -f &
pm2 logs &
tail -f /var/log/nginx/error.log &
```

---

## 🎯 Quick Reference

### Development Workflow

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 3: Database (if needed)
sudo systemctl start postgresql redis-server

# Open browser
# http://localhost:5173
```

### Production Deployment

```bash
# One-time setup
sudo bash vps-setup.sh

# After deployment
# Access at: https://your-domain.com
# Login with credentials shown at end of setup
```

### Daily Operations

```bash
# Check status
pm2 status
sudo systemctl status trading-backend

# View logs
pm2 logs
sudo journalctl -u trading-backend -f

# Restart services
pm2 restart trading-frontend
sudo systemctl restart trading-backend

# Backup database
./backup.sh
```

---

## 📞 Need Help?

1. Check [README.md](./README.md) for detailed documentation
2. Check browser console (F12) for frontend errors
3. Check backend logs: `sudo journalctl -u trading-backend -f`
4. Check frontend logs: `pm2 logs`
5. Verify all services are running

---

## ⚡ Quick Start Summary

### For Development:

```bash
npm install
npm run dev
# Open http://localhost:5173
# Login: admin@tradingbot.local / Admin@Secure2024! / 123456
```

### For Production:

```bash
sudo bash vps-setup.sh
# Follow prompts
# Access at https://your-domain.com
```

---

**Happy Trading! 📈**

For more details, see [README.md](./README.md)
