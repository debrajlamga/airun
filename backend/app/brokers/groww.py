"""
Groww Broker Adapter — Integration with Groww trading platform.

⚠️  IMPORTANT: 
- Groww does not have a widely available public trading API as of 2025
- This adapter supports:
  1. Official Groww API (if you have enterprise/partner access)
  2. Groww's web API endpoints (use with caution — may violate ToS)
  
- For production use, ensure you have proper authorization
- Consider using Zerodha/Upstox/Angel One for official API support
"""
import httpx
import asyncio
from typing import Optional, Dict, List, Any
from dataclasses import dataclass
from datetime import datetime
import structlog

from app.config import settings

logger = structlog.get_logger("broker.groww")


@dataclass
class GrowwOrderResult:
    success: bool
    order_id: Optional[str] = None
    fill_price: Optional[float] = None
    error: Optional[str] = None
    raw_response: Optional[Dict] = None


@dataclass
class GrowwQuote:
    symbol: str
    ltp: float
    change: float
    change_percent: float
    volume: int
    timestamp: float


class GrowwBrokerAdapter:
    """
    Groww Broker Adapter — handles authentication, orders, positions, and market data.
    
    Authentication Methods:
    1. API Key + Secret (official partner API)
    2. Access Token (OAuth flow)
    3. Session cookies (web automation — not recommended)
    """
    
    BASE_URL = "https://api.groww.in"  # Official API (if available)
    WEB_URL = "https://groww.in"  # Web platform
    
    def __init__(self):
        self.api_key = settings.BROKER_API_KEY
        self.api_secret = settings.BROKER_API_SECRET
        self.access_token = settings.BROKER_ACCESS_TOKEN
        self.client: Optional[httpx.AsyncClient] = None
        self._authenticated = False
        
    async def initialize(self):
        """Initialize HTTP client with connection pooling for low latency."""
        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            timeout=httpx.Timeout(10.0, connect=5.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
            headers=self._get_headers(),
        )
        logger.info("groww_client_initialized")
    
    async def close(self):
        """Close HTTP client gracefully."""
        if self.client:
            await self.client.aclose()
            logger.info("groww_client_closed")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get authentication headers."""
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "AI-Trading-Bot/1.0",
        }
        
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        elif self.api_key:
            headers["X-API-Key"] = self.api_key
            
        return headers
    
    # ─── Authentication ──────────────────────────────────────────────────────
    
    async def authenticate(self) -> bool:
        """
        Authenticate with Groww.
        
        For official API: Use API key/secret
        For web API: May require session token or cookies
        
        Returns: True if authenticated successfully
        """
        if not self.client:
            await self.initialize()
        
        try:
            # Try official API authentication
            if self.api_key and self.api_secret:
                response = await self.client.post(
                    "/v1/auth/token",
                    json={
                        "api_key": self.api_key,
                        "api_secret": self.api_secret,
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.access_token = data.get("access_token")
                    self._authenticated = True
                    logger.info("groww_auth_success", method="api_key")
                    return True
            
            # Try access token validation
            elif self.access_token:
                response = await self.client.get("/v1/user/profile")
                if response.status_code == 200:
                    self._authenticated = True
                    logger.info("groww_auth_success", method="access_token")
                    return True
            
            logger.warning("groww_auth_failed", reason="no_valid_credentials")
            return False
            
        except Exception as e:
            logger.error("groww_auth_error", error=str(e))
            return False
    
    async def is_authenticated(self) -> bool:
        """Check if currently authenticated."""
        return self._authenticated
    
    # ─── Market Data ─────────────────────────────────────────────────────────
    
    async def get_quote(self, symbol: str, exchange: str = "NSE") -> Optional[GrowwQuote]:
        """
        Get real-time quote for a symbol.
        
        Args:
            symbol: Trading symbol (e.g., "RELIANCE")
            exchange: Exchange (NSE/BSE)
            
        Returns:
            GrowwQuote object or None if failed
        """
        if not self._authenticated:
            logger.error("get_quote_failed", reason="not_authenticated")
            return None
        
        try:
            # Groww API endpoint for quotes
            response = await self.client.get(
                f"/v1/market/quote/{exchange}:{symbol}"
            )
            
            if response.status_code == 200:
                data = response.json()
                return GrowwQuote(
                    symbol=symbol,
                    ltp=data.get("last_price", 0),
                    change=data.get("change", 0),
                    change_percent=data.get("change_percent", 0),
                    volume=data.get("volume", 0),
                    timestamp=data.get("timestamp", datetime.now().timestamp()),
                )
            
            logger.warning("get_quote_failed", symbol=symbol, status=response.status_code)
            return None
            
        except Exception as e:
            logger.error("get_quote_error", symbol=symbol, error=str(e))
            return None
    
    async def get_quotes(self, symbols: List[str], exchange: str = "NSE") -> List[GrowwQuote]:
        """Get quotes for multiple symbols (batch request for efficiency)."""
        if not self._authenticated:
            return []
        
        try:
            # Batch quote request
            symbols_param = ",".join([f"{exchange}:{s}" for s in symbols])
            response = await self.client.get(
                f"/v1/market/quotes?symbols={symbols_param}"
            )
            
            if response.status_code == 200:
                data = response.json()
                quotes = []
                for symbol_data in data.get("quotes", []):
                    quotes.append(GrowwQuote(
                        symbol=symbol_data.get("symbol"),
                        ltp=symbol_data.get("last_price", 0),
                        change=symbol_data.get("change", 0),
                        change_percent=symbol_data.get("change_percent", 0),
                        volume=symbol_data.get("volume", 0),
                        timestamp=symbol_data.get("timestamp", 0),
                    ))
                return quotes
            
            return []
            
        except Exception as e:
            logger.error("get_quotes_error", error=str(e))
            return []
    
    async def get_historical_data(
        self,
        symbol: str,
        exchange: str = "NSE",
        timeframe: str = "15m",
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> List[Dict]:
        """
        Get historical OHLCV data.
        
        Args:
            symbol: Trading symbol
            exchange: Exchange
            timeframe: 1m, 5m, 15m, 30m, 1h, 1D
            from_date: Start date (YYYY-MM-DD)
            to_date: End date (YYYY-MM-DD)
            
        Returns:
            List of OHLCV candles
        """
        if not self._authenticated:
            return []
        
        try:
            params = {
                "symbol": f"{exchange}:{symbol}",
                "interval": timeframe,
            }
            if from_date:
                params["from"] = from_date
            if to_date:
                params["to"] = to_date
            
            response = await self.client.get("/v1/market/history", params=params)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("candles", [])
            
            return []
            
        except Exception as e:
            logger.error("get_historical_data_error", symbol=symbol, error=str(e))
            return []
    
    # ─── Order Management ────────────────────────────────────────────────────
    
    async def place_order(
        self,
        symbol: str,
        exchange: str,
        side: str,  # BUY or SELL
        quantity: int,
        order_type: str,  # MARKET, LIMIT, SL, SL-M
        price: Optional[float] = None,
        trigger_price: Optional[float] = None,
    ) -> GrowwOrderResult:
        """
        Place an order with Groww.
        
        ⚠️  CRITICAL: This sends REAL orders when in LIVE mode!
        
        Args:
            symbol: Trading symbol
            exchange: NSE/BSE
            side: BUY or SELL
            quantity: Number of shares
            order_type: MARKET, LIMIT, SL, SL-M
            price: Price for LIMIT orders
            trigger_price: Trigger price for SL orders
            
        Returns:
            GrowwOrderResult with order_id or error
        """
        if not self._authenticated:
            return GrowwOrderResult(success=False, error="Not authenticated")
        
        # Safety check — ensure we're in LIVE mode
        if settings.TRADING_MODE != "LIVE":
            logger.warning(
                "order_blocked_not_live",
                symbol=symbol,
                side=side,
                mode=settings.TRADING_MODE,
            )
            return GrowwOrderResult(
                success=False,
                error=f"Orders blocked in {settings.TRADING_MODE} mode"
            )
        
        try:
            order_payload = {
                "tradingsymbol": symbol,
                "exchange": exchange,
                "transaction_type": side,
                "quantity": quantity,
                "order_type": order_type,
                "product": "MIS",  # Intraday (change to CNC for delivery)
            }
            
            if price:
                order_payload["price"] = price
            if trigger_price:
                order_payload["trigger_price"] = trigger_price
            
            response = await self.client.post("/v1/orders", json=order_payload)
            
            if response.status_code in (200, 201):
                data = response.json()
                order_id = data.get("order_id")
                logger.info(
                    "order_placed_success",
                    order_id=order_id,
                    symbol=symbol,
                    side=side,
                    quantity=quantity,
                )
                return GrowwOrderResult(
                    success=True,
                    order_id=order_id,
                    raw_response=data,
                )
            
            error_msg = response.json().get("message", "Unknown error")
            logger.error("order_placed_failed", symbol=symbol, error=error_msg)
            return GrowwOrderResult(success=False, error=error_msg, raw_response=response.json())
            
        except Exception as e:
            logger.error("order_placed_error", symbol=symbol, error=str(e))
            return GrowwOrderResult(success=False, error=str(e))
    
    async def get_order_status(self, order_id: str) -> Optional[Dict]:
        """Get status of a specific order."""
        if not self._authenticated:
            return None
        
        try:
            response = await self.client.get(f"/v1/orders/{order_id}")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error("get_order_status_error", order_id=order_id, error=str(e))
            return None
    
    async def get_orders(self) -> List[Dict]:
        """Get all orders for today."""
        if not self._authenticated:
            return []
        
        try:
            response = await self.client.get("/v1/orders")
            if response.status_code == 200:
                return response.json().get("orders", [])
            return []
        except Exception as e:
            logger.error("get_orders_error", error=str(e))
            return []
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an open order."""
        if not self._authenticated:
            return False
        
        try:
            response = await self.client.delete(f"/v1/orders/{order_id}")
            if response.status_code == 200:
                logger.info("order_cancelled", order_id=order_id)
                return True
            return False
        except Exception as e:
            logger.error("cancel_order_error", order_id=order_id, error=str(e))
            return False
    
    # ─── Positions & Holdings ────────────────────────────────────────────────
    
    async def get_positions(self) -> List[Dict]:
        """Get current open positions."""
        if not self._authenticated:
            return []
        
        try:
            response = await self.client.get("/v1/positions")
            if response.status_code == 200:
                return response.json().get("positions", [])
            return []
        except Exception as e:
            logger.error("get_positions_error", error=str(e))
            return []
    
    async def get_holdings(self) -> List[Dict]:
        """Get long-term holdings (CNC positions)."""
        if not self._authenticated:
            return []
        
        try:
            response = await self.client.get("/v1/holdings")
            if response.status_code == 200:
                return response.json().get("holdings", [])
            return []
        except Exception as e:
            logger.error("get_holdings_error", error=str(e))
            return []
    
    # ─── Account & Margin ────────────────────────────────────────────────────
    
    async def get_margins(self) -> Optional[Dict]:
        """Get account margins and available funds."""
        if not self._authenticated:
            return None
        
        try:
            response = await self.client.get("/v1/margins")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error("get_margins_error", error=str(e))
            return None
    
    async def get_profile(self) -> Optional[Dict]:
        """Get user profile information."""
        if not self._authenticated:
            return None
        
        try:
            response = await self.client.get("/v1/user/profile")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            logger.error("get_profile_error", error=str(e))
            return None


# ─── Singleton Instance ──────────────────────────────────────────────────────

groww_broker = GrowwBrokerAdapter()
