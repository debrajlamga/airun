#!/bin/bash

# AI Trading Bot - Native VPS Setup (No Docker)
# Run: sudo bash vps-setup.sh

set -e

echo "🚀 AI Trading Bot - Native VPS Setup (No Docker)"
echo "================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run as root (sudo bash vps-setup.sh)${NC}"
  exit 1
fi

# Get domain
read -p "Enter your domain (e.g., trading.example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
  echo -e "${RED}Error: Domain is required${NC}"
  exit 1
fi

# Get email for SSL
read -p "Enter your email for SSL certificate: " EMAIL
if [ -z "$EMAIL" ]; then
  echo -e "${RED}Error: Email is required${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Configuration saved${NC}"

# Update system
echo -e "\n📦 Updating system..."
apt-get update -qq
apt-get upgrade -y -qq

# Install system dependencies
echo -e "\n📦 Installing system dependencies..."
apt-get install -y -qq \
  curl \
  wget \
  git \
  build-essential \
  software-properties-common \
  ca-certificates \
  gnupg \
  lsb-release \
  ufw \
  fail2ban \
  nginx \
  certbot \
  python3-certbot-nginx

echo -e "${GREEN}✓ System dependencies installed${NC}"

# Install PostgreSQL
echo -e "\n🐘 Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
  sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
  apt-get update -qq
  apt-get install -y -qq postgresql-15
  
  systemctl enable postgresql
  systemctl start postgresql
  
  echo -e "${GREEN}✓ PostgreSQL installed${NC}"
else
  echo -e "${GREEN}✓ PostgreSQL already installed${NC}"
fi

# Setup PostgreSQL database
echo -e "\n🗄️  Setting up database..."
DB_PASSWORD=$(openssl rand -base64 24)

sudo -u postgres psql << EOF
CREATE USER trading_user WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE trading_bot OWNER trading_user;
GRANT ALL PRIVILEGES ON DATABASE trading_bot TO trading_user;
\c trading_bot
EOF

echo -e "${GREEN}✓ Database created${NC}"

# Install Redis
echo -e "\n🔴 Installing Redis..."
if ! command -v redis-server &> /dev/null; then
  apt-get install -y -qq redis-server
  
  # Configure Redis with password
  REDIS_PASSWORD=$(openssl rand -base64 24)
  sed -i "s/# requirepass foobared/requirepass ${REDIS_PASSWORD}/" /etc/redis/redis.conf
  sed -i 's/bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
  
  systemctl enable redis-server
  systemctl restart redis-server
  
  echo -e "${GREEN}✓ Redis installed${NC}"
else
  REDIS_PASSWORD=$(grep "^requirepass" /etc/redis/redis.conf | awk '{print $2}')
  echo -e "${GREEN}✓ Redis already installed${NC}"
fi

# Install Node.js
echo -e "\n📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
  
  echo -e "${GREEN}✓ Node.js installed${NC}"
else
  echo -e "${GREEN}✓ Node.js already installed${NC}"
fi

# Install PM2
echo -e "\n📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  pm2 startup
  echo -e "${GREEN}✓ PM2 installed${NC}"
else
  echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

# Install Python
echo -e "\n🐍 Installing Python..."
if ! command -v python3 &> /dev/null; then
  apt-get install -y -qq python3 python3-pip python3-venv
  
  echo -e "${GREEN}✓ Python installed${NC}"
else
  echo -e "${GREEN}✓ Python already installed${NC}"
fi

# Setup application directory
echo -e "\n📁 Setting up application..."
APP_DIR="/opt/ai-trading-bot"
mkdir -p $APP_DIR

# Copy application files
echo -e "\n📋 Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Generate secrets
echo -e "\n🔐 Generating secure secrets..."
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
ADMIN_PASSWORD=$(openssl rand -base64 16)A1!

# Create .env file
echo -e "\n📝 Creating .env file..."
cat > .env << EOF
# AI Trading Bot - Production Environment
# Generated: $(date)

# Application
NODE_ENV=production
VITE_API_URL=https://${DOMAIN}/api
PORT=8000

# Database
POSTGRES_USER=trading_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=trading_bot
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://trading_user:${DB_PASSWORD}@localhost:5432/trading_bot

# Redis
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379

# Security
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
CORS_ORIGIN=https://${DOMAIN}

# Admin (CHANGE THIS!)
ADMIN_EMAIL=admin@tradingbot.local
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_MFA_SECRET=

# Trading Mode (PAPER or LIVE)
TRADING_MODE=PAPER

# Broker (groww, zerodha, upstox, paper)
BROKER_NAME=paper
BROKER_API_KEY=
BROKER_API_SECRET=
BROKER_ACCESS_TOKEN=

# Domain
DOMAIN=${DOMAIN}
EOF

chmod 600 .env
echo -e "${GREEN}✓ .env file created${NC}"

# Setup Backend
echo -e "\n🐍 Setting up backend..."
cd $APP_DIR/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
echo -e "\n🗄️  Initializing database..."
python3 -c "
import asyncio
import asyncpg
from app.database import engine
from app.models import Base

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('Database tables created')

asyncio.run(init_db())
"

deactivate
echo -e "${GREEN}✓ Backend setup complete${NC}"

# Create backend systemd service
echo -e "\n🔧 Creating backend service..."
cat > /etc/systemd/system/trading-backend.service << EOF
[Unit]
Description=AI Trading Bot Backend
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}/backend
Environment="PATH=${APP_DIR}/backend/venv/bin"
EnvironmentFile=${APP_DIR}/.env
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable trading-backend
systemctl start trading-backend

echo -e "${GREEN}✓ Backend service created and started${NC}"

# Setup Frontend
echo -e "\n🎨 Setting up frontend..."
cd $APP_DIR/frontend

# Install dependencies
npm install

# Build frontend
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'trading-frontend',
    script: 'node_modules/serve/build/serve.js',
    args: '-s dist -l 3000',
    cwd: '${APP_DIR}/frontend',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Install serve for static files
npm install -g serve

# Start frontend with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}✓ Frontend setup complete${NC}"

# Configure Nginx
echo -e "\n🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/ai-trading-bot << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect everything else to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/ai-trading-bot /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

# Get SSL certificate
echo -e "\n🔒 Getting SSL certificate..."
certbot --nginx -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive --redirect

echo -e "${GREEN}✓ SSL certificate installed${NC}"

# Setup firewall
echo -e "\n🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"

# Setup fail2ban
echo -e "\n🛡️  Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5
EOF

systemctl enable fail2ban
systemctl restart fail2ban

echo -e "${GREEN}✓ Fail2ban configured${NC}"

# Create backup script
echo -e "\n💾 Creating backup script..."
cat > $APP_DIR/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump -U trading_user trading_bot | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup created: db_$TIMESTAMP.sql.gz"
EOF

chmod +x $APP_DIR/backup.sh

# Setup automatic backups
echo -e "\n💾 Setting up automatic backups..."
cat > /etc/cron.daily/trading-bot-backup << EOF
#!/bin/bash
cd $APP_DIR
./backup.sh >> /var/log/trading-bot-backup.log 2>&1
EOF

chmod +x /etc/cron.daily/trading-bot-backup

# Create health check script
echo -e "\n🏥 Creating health check script..."
cat > $APP_DIR/health-check.sh << 'EOF'
#!/bin/bash
echo "Checking services..."

# Check backend
if systemctl is-active --quiet trading-backend; then
    echo "✓ Backend is running"
else
    echo "✗ Backend is not running"
    systemctl start trading-backend
fi

# Check frontend
if pm2 describe trading-frontend > /dev/null; then
    echo "✓ Frontend is running"
else
    echo "✗ Frontend is not running"
    pm2 start $APP_DIR/frontend/ecosystem.config.js
fi

# Check PostgreSQL
if systemctl is-active --quiet postgresql; then
    echo "✓ Database is running"
else
    echo "✗ Database is not running"
    systemctl start postgresql
fi

# Check Redis
if systemctl is-active --quiet redis-server; then
    echo "✓ Redis is running"
else
    echo "✗ Redis is not running"
    systemctl start redis-server
fi

# Check API health
if curl -f https://${DOMAIN}/api/health > /dev/null 2>&1; then
    echo "✓ API is healthy"
else
    echo "✗ API is not healthy"
fi

echo "Health check complete"
EOF

chmod +x $APP_DIR/health-check.sh

# Setup automatic health checks
echo -e "\n🏥 Setting up automatic health checks..."
cat > /etc/cron.hourly/trading-bot-health << EOF
#!/bin/bash
cd $APP_DIR
./health-check.sh >> /var/log/trading-bot-health.log 2>&1
EOF

chmod +x /etc/cron.hourly/trading-bot-health

# Final message
echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "\n🌐 Your trading bot is live at: https://${DOMAIN}"
echo -e "\n🔐 Admin Credentials:"
echo -e "   Email: admin@tradingbot.local"
echo -e "   Password: ${ADMIN_PASSWORD}"
echo -e "\n⚠️  IMPORTANT: Change the admin password immediately!"
echo -e "\n📋 Useful Commands:"
echo -e "   Backend logs: journalctl -u trading-backend -f"
echo -e "   Frontend logs: pm2 logs trading-frontend"
echo -e "   Restart backend: systemctl restart trading-backend"
echo -e "   Restart frontend: pm2 restart trading-frontend"
echo -e "   Backup: $APP_DIR/backup.sh"
echo -e "   Health check: $APP_DIR/health-check.sh"
echo -e "\n🔒 Security:"
echo -e "   - SSL certificate auto-renews"
echo -e "   - Database backs up daily"
echo -e "   - Health checks run hourly"
echo -e "   - Firewall configured"
echo -e "   - Fail2ban active"
echo -e "\n${YELLOW}⚠️  Next Steps:${NC}"
echo -e "   1. Change admin password in $APP_DIR/.env"
echo -e "   2. Configure broker API keys in .env"
echo -e "   3. Set TRADING_MODE=LIVE when ready"
echo -e "   4. Run: systemctl restart trading-backend"
echo -e "\n${GREEN}Happy Trading! 🚀${NC}"
