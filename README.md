# AI Trading Bot — Production-Grade Algorithmic Trading Platform

A secure, production-ready algorithmic trading platform for the Indian stock market (NSE/BSE) with real-time market data, strategy backtesting, paper trading, and live broker integration.

## ⚠️ Risk Disclaimer

**Trading involves substantial risk of loss. This platform does not guarantee profits.**
- Past performance (including backtests) does not guarantee future results.
- Never trade with money you cannot afford to lose.
- Always test strategies thoroughly in paper trading before going live.
- The developers are not responsible for any financial losses.

---

## Architecture

```
Internet
   ↓
Firewall (UFW)
   ↓
Nginx / Reverse Proxy (HTTPS/TLS 1.3)
   ↓
Frontend (React + TypeScript)
   ↓
Backend API (FastAPI + Uvicorn)
   ↓
┌──────────────┬──────────────┬──────────────┐
│  Trading     │  Risk        │  Order       │
│  Engine      │  Engine      │  Pipeline    │
└──────────────┴──────────────┴──────────────┘
   ↓
Broker Adapter (Zerodha/Upstox/Angel)
   ↓
┌──────────────┬──────────────┐
│  PostgreSQL  │  Redis       │
│  (Data)      │  (Cache/WS)  │
└──────────────┴──────────────┘
```

## Features

### Security
- **Single Admin System**: Only ONE admin account exists — no registration, no other users
- **Authentication**: JWT + Refresh tokens with Argon2id password hashing
- **Two-Factor Authentication**: TOTP-based MFA (Google Authenticator compatible)
- **Brute-Force Protection**: Account lockout after failed attempts
- **Rate Limiting**: Per-endpoint and global rate limits via Redis
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via SQLAlchemy
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookies + CSRF tokens
- **Secure Headers**: HSTS, X-Frame-Options, X-Content-Type-Options
- **Secrets Management**: All secrets in .env (never committed)
- **Audit Logging**: Every action logged with timestamps and IPs
- **Network Isolation**: Internal Docker network for DB/Redis

### Trading
- **Three Modes**: BACKTEST / PAPER / LIVE (LIVE disabled by default)
- **Strategy Engine**: EMA Crossover, RSI, VWAP, Combined strategies
- **Backtesting**: Full historical backtesting with transaction costs
- **Risk Management**: Position sizing, stop-loss, daily loss limits
- **Order Pipeline**: 10-stage validation before any order execution
- **Emergency Kill Switch**: One-click halt all trading
- **Position Reconciliation**: Automatic state verification

### Performance
- **Async I/O**: FastAPI + Uvicorn + uvloop for maximum throughput
- **Connection Pooling**: PostgreSQL async connection pool
- **Redis Caching**: Market data and session caching
- **WebSocket**: Real-time price, order, and P&L updates
- **Background Workers**: Celery for non-critical tasks
- **GZip Compression**: Reduced bandwidth usage

---

## Quick Start — One-Click Installation

### On a fresh VPS (Ubuntu 22.04+):

```bash
# Download and run the installer
curl -sSL https://your-domain.com/setup.sh | sudo bash

# Or if already downloaded:
chmod +x setup.sh
sudo ./setup.sh
```

The installer automatically:
1. ✅ Detects OS and checks system requirements
2. ✅ Installs Docker, Docker Compose
3. ✅ Generates cryptographically secure secrets
4. ✅ **Creates single admin account** (credentials shown at end)
5. ✅ Builds backend + frontend
6. ✅ Creates PostgreSQL database with all tables
7. ✅ Configures Nginx reverse proxy
8. ✅ Sets up firewall (UFW) + Fail2ban
9. ✅ Configures automatic backups
10. ✅ Creates systemd service (auto-restart on reboot)
11. ✅ Runs health checks and verification

**Estimated time: 5-15 minutes**

⚠️ **IMPORTANT**: Admin credentials are displayed ONCE at the end of installation. Save them immediately!

---

## Manual Setup

### Prerequisites
- Docker 24+ and Docker Compose v2+
- 2GB+ RAM, 20GB+ disk
- Domain name with DNS pointing to VPS
- Ubuntu 22.04+ (or compatible Linux)

### Steps

```bash
# 1. Clone repository
git clone https://github.com/your-org/ai-trading-bot.git
cd ai-trading-bot

# 2. Copy and configure environment
cp .env.example .env
nano .env  # Fill in all required values

# 3. Generate secrets
openssl rand -base64 48  # For JWT_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY

# 4. Build and start
docker compose build
docker compose up -d

# 5. Verify
docker compose ps
curl http://localhost:8000/api/health
```

### SSL/HTTPS Setup

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot certonly --nginx -d your-domain.com

# Update nginx/nginx.conf with your domain
# Restart nginx
docker compose restart nginx
```

---

## Configuration

### Trading Mode

Edit `.env`:
```bash
TRADING_MODE=PAPER  # Options: BACKTEST | PAPER | LIVE
```

**LIVE trading requires:**
1. Broker API credentials configured
2. Risk management settings verified
3. Strategies tested in paper trading
4. Explicit confirmation in the UI

### Broker Integration

Supported brokers (via adapter pattern):
- **Groww** (API integration)
- Zerodha (Kite Connect)
- Upstox
- Angel One
- ICICI Direct
- 5paisa

#### Groww Integration

Groww broker is fully supported with the following features:
- Real-time market data (quotes, OHLCV)
- Order placement (MARKET, LIMIT, SL, SL-M)
- Position management
- Margin checking
- Order status tracking

**Configuration:**
```bash
# .env
BROKER_NAME=groww
BROKER_API_KEY=your_groww_api_key
BROKER_API_SECRET=your_groww_api_secret
BROKER_ACCESS_TOKEN=your_access_token
GROWW_API_METHOD=api_key  # or: access_token, session
GROWW_BASE_URL=https://api.groww.in
GROWW_PRODUCT_TYPE=MIS  # MIS (intraday) or CNC (delivery)
```

**⚠️ Important Notes for Groww:**
- Groww's public API availability may be limited compared to Zerodha/Upstox
- Ensure you have proper authorization from Groww before using in production
- For enterprise/institutional access, contact Groww support
- Alternative: Use Zerodha Kite Connect for most reliable API access

**Testing Groww Connection:**
1. Go to Settings → Broker
2. Select Groww
3. Enter your API credentials
4. Click "Test Connection"
5. If successful, you'll see a green "Connected" status

**Groww API Methods:**
- `api_key` — Official API key + secret (recommended)
- `access_token` — OAuth access token
- `session` — Web session token (use with caution)

---

## API Documentation

When `APP_DEBUG=true`, API docs available at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login (returns JWT) |
| `/api/auth/mfa/verify` | POST | Verify MFA code |
| `/api/health` | GET | Health check |
| `/api/market/quote/{symbol}` | GET | Real-time quote |
| `/api/market/history/{symbol}` | GET | Historical OHLCV |
| `/api/strategies` | GET/POST | List/create strategies |
| `/api/backtest/run` | POST | Run backtest |
| `/api/trading/start` | POST | Start bot |
| `/api/trading/stop` | POST | Stop bot |
| `/api/trading/emergency-stop` | POST | Emergency halt |
| `/api/orders` | GET/POST | List/place orders |
| `/api/positions` | GET | Open positions |
| `/api/portfolio` | GET | Portfolio overview |
| `/api/risk/settings` | GET/PUT | Risk configuration |

---

## Security Notes

### What's Protected
- ✅ Passwords: Argon2id hashing (memory-hard, GPU-resistant)
- ✅ Sessions: JWT with short expiry + refresh token rotation
- ✅ API: Rate limiting, input validation, CORS restrictions
- ✅ Network: Internal Docker network, firewall rules
- ✅ Secrets: Encrypted at rest, never in logs or git
- ✅ Audit: All actions logged with IP, timestamp, metadata

### Security Checklist
- [ ] Change all default passwords after installation
- [ ] Configure HTTPS/SSL before exposing to internet
- [ ] Enable 2FA for all user accounts
- [ ] Review firewall rules (`ufw status`)
- [ ] Verify .env file permissions (`chmod 600 .env`)
- [ ] Set up monitoring/alerting
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Regular backup verification

---

## Maintenance

### View Logs
```bash
docker compose logs -f           # All services
docker compose logs -f backend   # Backend only
tail -f /opt/ai-trading-bot/logs/app.log
```

### Backup Database
```bash
/opt/ai-trading-bot/scripts/backup.sh
```

### Health Check
```bash
/opt/ai-trading-bot/scripts/healthcheck.sh
```

### Restart Services
```bash
docker compose restart
# or
systemctl restart ai-trading-bot
```

### Update Application
```bash
cd /opt/ai-trading-bot
git pull
docker compose build
docker compose up -d
```

---

## File Structure

```
ai-trading-bot/
├── setup.sh                    # One-click installer
├── docker-compose.yml          # Production Docker setup
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
│
├── backend/                    # FastAPI Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # Application entry
│       ├── config.py           # Settings from env
│       ├── database.py         # SQLAlchemy async
│       ├── security.py         # Auth, hashing, JWT
│       ├── api/                # API routes
│       ├── models/             # Database models
│       ├── schemas/            # Pydantic schemas
│       ├── services/           # Business logic
│       ├── strategies/         # Trading strategies
│       ├── brokers/            # Broker adapters
│       ├── backtesting/        # Backtest engine
│       ├── risk/               # Risk management
│       ├── indicators/         # Technical indicators
│       ├── workers/            # Celery workers
│       └── middleware/         # Security middleware
│
├── frontend/                   # React Frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── App.tsx
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── types/
│       └── data/
│
├── nginx/
│   └── nginx.conf              # Reverse proxy config
│
├── scripts/
│   ├── init-db.sql             # Database schema
│   ├── backup.sh               # Automated backup
│   └── healthcheck.sh          # Service health check
│
├── data/                       # Market data storage
├── logs/                       # Application logs
└── backups/                    # Database backups
```

---

## License

This software is provided "as is" without warranty. Use at your own risk.
Trading involves substantial risk of financial loss.
