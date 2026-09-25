# 📥 Installation Guide - AI Trading Bot

Complete step-by-step installation guide for different environments.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [VPS Deployment (Ubuntu)](#vps-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Post-Installation Steps](#post-installation-steps)
6. [Verification](#verification)

---

## 💻 System Requirements

### Minimum Requirements

- **OS**: Ubuntu 20.04+ / Windows 10+ / macOS 10.15+
- **RAM**: 2 GB
- **Disk**: 10 GB free space
- **CPU**: 2 cores

### Recommended Requirements

- **OS**: Ubuntu 22.04 LTS
- **RAM**: 4 GB or more
- **Disk**: 20 GB SSD
- **CPU**: 4 cores or more

### Required Software

- Node.js 18+ and npm 9+
- Python 3.10+ (for backend)
- PostgreSQL 14+
- Redis 6+
- Git

---

## 🛠️ Local Development Setup

### Step 1: Install Prerequisites

#### Ubuntu/Debian

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.10
sudo apt install -y python3 python3-pip python3-venv

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Git
sudo apt install -y git

# Verify installations
node --version  # v18+
npm --version   # 9+
python3 --version  # 3.10+
psql --version  # 14+
redis-cli --version  # 6+
```

#### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@18

# Install Python
brew install python@3.10

# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Install Redis
brew install redis
brew services start redis

# Verify installations
node --version
npm --version
python3 --version
psql --version
redis-cli --version
```

#### Windows

1. Download and install:
   - [Node.js 18+](https://nodejs.org/)
   - [Python 3.10+](https://www.python.org/downloads/)
   - [PostgreSQL 14+](https://www.postgresql.org/download/windows/)
   - [Redis for Windows](https://github.com/tporadowski/redis/releases)
   - [Git](https://git-scm.com/download/win)

2. Verify in Command Prompt:
```cmd
node --version
npm --version
python --version
psql --version
redis-cli --version
```

### Step 2: Clone Repository

```bash
git clone <your-repository-url>
cd ai-trading-bot
```

### Step 3: Setup Frontend

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed
nano .env  # or use any text editor
```

### Step 4: Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create environment file
cp ../.env.example ../.env
```

### Step 5: Setup Database

```bash
# Start PostgreSQL
sudo systemctl start postgresql  # Linux
# OR
brew services start postgresql@14  # macOS

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE USER trading_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE trading_bot OWNER trading_user;
GRANT ALL PRIVILEGES ON DATABASE trading_bot TO trading_user;
\q

# Update .env file with database credentials
nano .env
# Set: DATABASE_URL=postgresql://trading_user:your_secure_password@localhost:5432/trading_bot
```

### Step 6: Setup Redis

```bash
# Start Redis
sudo systemctl start redis-server  # Linux
# OR
brew services start redis  # macOS

# Test connection
redis-cli ping  # Should return PONG

# If Redis requires password, update .env
nano .env
# Set: REDIS_URL=redis://:your_redis_password@localhost:6379
```

### Step 7: Initialize Database

```bash
cd backend
source venv/bin/activate

# Run database migrations (if using Alembic)
alembic upgrade head

# OR create tables directly
python3 -c "
from app.database import engine, Base
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"
```

### Step 8: Start Services

#### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

#### Terminal 2: Frontend

```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

### Step 9: Access Application

Open browser and go to: **http://localhost:5173**

Login with:
- Email: `admin@tradingbot.local`
- Password: `Admin@Secure2024!`
- MFA: `123456`

---

## 🌐 VPS Deployment (Ubuntu 22.04)

### Option 1: Automated Installation (Recommended)

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Clone repository
cd /root
git clone <your-repository-url> ai-trading-bot
cd ai-trading-bot

# Run setup script
chmod +x vps-setup.sh
sudo bash vps-setup.sh
```

The script will:
- ✅ Install all dependencies
- ✅ Setup PostgreSQL and Redis
- ✅ Configure backend and frontend
- ✅ Setup Nginx reverse proxy
- ✅ Configure SSL certificate
- ✅ Create systemd services
- ✅ Start all services

### Option 2: Manual Installation

#### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git build-essential

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Clone and Setup Application

```bash
cd /opt
sudo git clone <your-repository-url> ai-trading-bot
cd ai-trading-bot

# Setup frontend
npm install
npm run build

# Setup backend
cd backend
sudo python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 3. Configure Environment

```bash
cd /opt/ai-trading-bot
sudo cp .env.example .env
sudo nano .env

# Update these values:
# - DOMAIN=your-domain.com
# - DATABASE_URL=postgresql://trading_user:password@localhost:5432/trading_bot
# - REDIS_URL=redis://localhost:6379
# - JWT_SECRET=your-secure-random-secret
# - ADMIN_PASSWORD=your-secure-admin-password
```

#### 4. Setup Database

```bash
sudo -u postgres psql

CREATE USER trading_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE trading_bot OWNER trading_user;
GRANT ALL PRIVILEGES ON DATABASE trading_bot TO trading_user;
\q

# Initialize database
cd /opt/ai-trading-bot/backend
source venv/bin/activate
python3 -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"
```

#### 5. Configure Backend Service

```bash
sudo nano /etc/systemd/system/trading-backend.service
```

Add:

```ini
[Unit]
Description=AI Trading Bot Backend
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ai-trading-bot/backend
Environment="PATH=/opt/ai-trading-bot/backend/venv/bin"
EnvironmentFile=/opt/ai-trading-bot/.env
ExecStart=/opt/ai-trading-bot/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable trading-backend
sudo systemctl start trading-backend
```

#### 6. Configure Frontend with PM2

```bash
cd /opt/ai-trading-bot

# Create PM2 config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'trading-frontend',
    script: 'node_modules/serve/build/serve.js',
    args: '-s dist -l 3000',
    cwd: '/opt/ai-trading-bot',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Install serve
npm install -g serve

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 7. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/ai-trading-bot
```

Add:

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

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/ai-trading-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Setup SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

#### 9. Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🐳 Docker Deployment

### Prerequisites

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

### Setup with Docker

```bash
# Clone repository
git clone <your-repository-url>
cd ai-trading-bot

# Create environment file
cp .env.example .env
nano .env  # Edit with your settings

# Build and start
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

---

## ✅ Post-Installation Steps

### 1. Change Default Password

After first login:
1. Go to Settings
2. Change admin password
3. Enable 2FA/MFA

### 2. Configure Broker API

Edit `.env` file:

```bash
# For Groww
BROKER_NAME=groww
BROKER_API_KEY=your_api_key
BROKER_API_SECRET=your_api_secret
BROKER_ACCESS_TOKEN=your_access_token

# For Zerodha
BROKER_NAME=zerodha
BROKER_API_KEY=your_api_key
BROKER_API_SECRET=your_api_secret
```

### 3. Set Trading Mode

```bash
# Start with paper trading
TRADING_MODE=PAPER

# After testing, switch to live (with caution!)
TRADING_MODE=LIVE
```

### 4. Configure Notifications (Optional)

```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### 5. Setup Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump -U trading_user trading_bot | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup created: db_$TIMESTAMP.sql.gz"
EOF

chmod +x backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## 🔍 Verification

### Check All Services

```bash
# Frontend
curl http://localhost:5173  # Should return HTML

# Backend
curl http://localhost:8000/api/health  # Should return JSON

# Database
psql -U trading_user -d trading_bot -c "SELECT 1"

# Redis
redis-cli ping
```

### Check Logs

```bash
# Backend logs
sudo journalctl -u trading-backend -f

# Frontend logs
pm2 logs trading-frontend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Test Login

1. Open browser: http://localhost:5173 (or https://your-domain.com)
2. Login with admin credentials
3. Verify dashboard loads
4. Check all pages are accessible

---

## 🆘 Common Installation Issues

### Issue: npm install fails

```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Backend won't start

```bash
# Check Python version
python3 --version  # Should be 3.10+

# Recreate virtual environment
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Database connection error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check credentials in .env
cat .env | grep DATABASE_URL

# Test connection
psql -U trading_user -d trading_bot -h localhost
```

### Issue: Port already in use

```bash
# Find process using port
sudo lsof -i :8000  # Backend
sudo lsof -i :5173  # Frontend

# Kill process
sudo kill -9 <PID>
```

---

## 📞 Support

If you encounter issues:

1. Check [README.md](./README.md)
2. Check [QUICKSTART.md](./QUICKSTART.md)
3. Review logs for error messages
4. Verify all services are running
5. Check browser console for frontend errors

---

**Installation Complete! 🎉**

Next steps:
- Read [QUICKSTART.md](./QUICKSTART.md) for usage guide
- Configure your broker API
- Start with paper trading
- Review risk management settings
