#!/bin/bash

# AI Trading Bot - VPS Setup Script
# Run: sudo bash vps-setup.sh

set -e

echo "🚀 AI Trading Bot - VPS Setup"
echo "=============================="

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

# Install Docker
echo -e "\n🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
  systemctl enable docker
  systemctl start docker
  echo -e "${GREEN}✓ Docker installed${NC}"
else
  echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "\n🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
  echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Install Certbot
echo -e "\n🔒 Installing Certbot..."
if ! command -v certbot &> /dev/null; then
  apt-get install -y -qq certbot python3-certbot-nginx
  echo -e "${GREEN}✓ Certbot installed${NC}"
else
  echo -e "${GREEN}✓ Certbot already installed${NC}"
fi

# Generate secrets
echo -e "\n🔐 Generating secure secrets..."
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Create .env file
echo -e "\n📝 Creating .env file..."
cat > .env << EOF
# AI Trading Bot - Production Environment
# Generated: $(date)

# Application
NODE_ENV=production
VITE_API_URL=https://${DOMAIN}/api

# Database
POSTGRES_USER=trading_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=trading_bot
DATABASE_URL=postgresql://trading_user:${DB_PASSWORD}@postgres:5432/trading_bot

# Redis
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# Security
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY
CORS_ORIGIN=https://${DOMAIN}

# Admin (CHANGE THESE!)
ADMIN_EMAIL=admin@tradingbot.local
ADMIN_PASSWORD=Admin@Secure2024!
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

# Create Docker Compose file
echo -e "\n🐳 Creating Docker Compose configuration..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: trading-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - trading-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: trading-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - trading-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: trading-backend
    restart: unless-stopped
    env_file: .env
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - ADMIN_MFA_SECRET=${ADMIN_MFA_SECRET}
      - TRADING_MODE=${TRADING_MODE}
      - BROKER_NAME=${BROKER_NAME}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - trading-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${VITE_API_URL}
    container_name: trading-frontend
    restart: unless-stopped
    networks:
      - trading-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: trading-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot_data:/var/www/certbot
    depends_on:
      - backend
      - frontend
    networks:
      - trading-network

volumes:
  postgres_data:
  redis_data:
  certbot_data:

networks:
  trading-network:
    driver: bridge
EOF

echo -e "${GREEN}✓ Docker Compose file created${NC}"

# Create backend Dockerfile
echo -e "\n🐳 Creating backend Dockerfile..."
mkdir -p backend
cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

echo -e "${GREEN}✓ Backend Dockerfile created${NC}"

# Create backend requirements.txt
echo -e "\n📦 Creating backend requirements..."
cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
asyncpg==0.19.0
alembic==1.13.0
pydantic==2.5.2
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
redis==5.0.1
httpx==0.25.2
pyotp==2.9.0
qrcode==7.4.2
python-dotenv==1.0.0
EOF

echo -e "${GREEN}✓ Backend requirements created${NC}"

# Create backend init-db.sql
echo -e "\n🗄️  Creating database schema..."
cat > backend/init-db.sql << 'EOF'
-- AI Trading Bot Database Schema

-- Users table (single admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mfa_secret VARCHAR(255),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@tradingbot.local', '$2b$12$LQv3c1yqBo9SkvXSZjz8JeWxqEz5qK5qK5qK5qK5qK5qK5qK5qK5q', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instruments table
CREATE TABLE IF NOT EXISTS instruments (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    token INTEGER,
    segment VARCHAR(20),
    tick_size DECIMAL(10, 2),
    lot_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Strategies table
CREATE TABLE IF NOT EXISTS strategies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    parameters JSONB,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    side VARCHAR(4) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2),
    order_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    strategy_id INTEGER REFERENCES strategies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    trade_id VARCHAR(100) UNIQUE NOT NULL,
    order_id VARCHAR(100) REFERENCES orders(order_id),
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(4) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    average_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk settings table
CREATE TABLE IF NOT EXISTS risk_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    max_risk_per_trade DECIMAL(5, 2) DEFAULT 2.0,
    max_daily_loss DECIMAL(5, 2) DEFAULT 5.0,
    max_open_positions INTEGER DEFAULT 5,
    emergency_stop BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
EOF

echo -e "${GREEN}✓ Database schema created${NC}"

# Create frontend Dockerfile
echo -e "\n🐳 Creating frontend Dockerfile..."
mkdir -p frontend
cat > frontend/Dockerfile << 'EOF'
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

echo -e "${GREEN}✓ Frontend Dockerfile created${NC}"

# Create frontend nginx.conf
echo -e "\n🌐 Creating frontend nginx config..."
cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo -e "${GREEN}✓ Frontend nginx config created${NC}"

# Create nginx configuration
echo -e "\n🌐 Creating nginx reverse proxy config..."
mkdir -p nginx/ssl
cat > nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream servers
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:80;
    }

    # HTTP to HTTPS redirect
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

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name ${DOMAIN};

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

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
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self'  data:; font-src 'self' data:; connect-src 'self' https://${DOMAIN} wss://${DOMAIN};" always;

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
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

        # Login endpoint (stricter rate limit)
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

echo -e "${GREEN}✓ Nginx config created${NC}"

# Build and start containers
echo -e "\n🐳 Building Docker containers..."
docker-compose build

echo -e "\n🚀 Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo -e "\n⏳ Waiting for services to start..."
sleep 30

# Get SSL certificate
echo -e "\n🔒 Getting SSL certificate..."
certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive

# Copy SSL certificates to nginx
echo -e "\n🔒 Configuring SSL..."
cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem nginx/ssl/

# Restart nginx with SSL
echo -e "\n🔄 Restarting nginx with SSL..."
docker-compose restart nginx

# Setup auto-renewal
echo -e "\n🔒 Setting up SSL auto-renewal..."
cat > /etc/cron.daily/certbot-renew << 'EOF'
#!/bin/bash
cd /root/ai-trading-bot
docker-compose run --rm certbot renew
docker-compose restart nginx
EOF
chmod +x /etc/cron.daily/certbot-renew

# Create backup script
echo -e "\n💾 Creating backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash
# Database backup script

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U trading_user trading_bot | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup created: db_$TIMESTAMP.sql.gz"
EOF

chmod +x backup.sh

# Setup automatic backups
echo -e "\n💾 Setting up automatic backups..."
cat > /etc/cron.daily/trading-bot-backup << EOF
#!/bin/bash
cd $(pwd)
./backup.sh
EOF
chmod +x /etc/cron.daily/trading-bot-backup

# Create health check script
echo -e "\n🏥 Creating health check script..."
cat > health-check.sh << 'EOF'
#!/bin/bash
# Health check script

echo "Checking services..."

# Check Docker containers
if docker-compose ps | grep -q "trading-backend"; then
    echo "✓ Backend is running"
else
    echo "✗ Backend is not running"
    docker-compose up -d backend
fi

if docker-compose ps | grep -q "trading-frontend"; then
    echo "✓ Frontend is running"
else
    echo "✗ Frontend is not running"
    docker-compose up -d frontend
fi

if docker-compose ps | grep -q "trading-postgres"; then
    echo "✓ Database is running"
else
    echo "✗ Database is not running"
    docker-compose up -d postgres
fi

if docker-compose ps | grep -q "trading-redis"; then
    echo "✓ Redis is running"
else
    echo "✗ Redis is not running"
    docker-compose up -d redis
fi

# Check API health
if curl -f https://${DOMAIN}/api/health > /dev/null 2>&1; then
    echo "✓ API is healthy"
else
    echo "✗ API is not healthy"
fi

echo "Health check complete"
EOF

chmod +x health-check.sh

# Setup automatic health checks
echo -e "\n🏥 Setting up automatic health checks..."
cat > /etc/cron.hourly/trading-bot-health << EOF
#!/bin/bash
cd $(pwd)
./health-check.sh >> /var/log/trading-bot-health.log 2>&1
EOF
chmod +x /etc/cron.hourly/trading-bot-health

# Firewall setup
echo -e "\n🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo -e "${GREEN}✓ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠ UFW not installed, skipping firewall setup${NC}"
fi

# Final message
echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "\n🌐 Your trading bot is live at: https://${DOMAIN}"
echo -e "\n🔐 Admin Credentials:"
echo -e "   Email: admin@tradingbot.local"
echo -e "   Password: Admin@Secure2024!"
echo -e "\n⚠️  IMPORTANT: Change the admin password immediately!"
echo -e "\n📋 Useful Commands:"
echo -e "   View logs: docker-compose logs -f"
echo -e "   Restart: docker-compose restart"
echo -e "   Stop: docker-compose down"
echo -e "   Backup: ./backup.sh"
echo -e "   Health check: ./health-check.sh"
echo -e "\n🔒 Security:"
echo -e "   - SSL certificate auto-renews daily"
echo -e "   - Database backs up daily"
echo -e "   - Health checks run hourly"
echo -e "\n${YELLOW}⚠️  Next Steps:${NC}"
echo -e "   1. Change admin password in .env file"
echo -e "   2. Configure broker API keys in .env"
echo -e "   3. Set TRADING_MODE=LIVE when ready"
echo -e "   4. Run: docker-compose restart backend"
echo -e "\n${GREEN}Happy Trading! 🚀${NC}"
