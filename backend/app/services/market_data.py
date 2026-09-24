"""
Market Data Service - Real-time market data from broker APIs
"""
import asyncio
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import httpx
import structlog

from app.config import settings
from app.brokers.factory import get_active_broker

logger = structlog.get_logger("market_data")


class MarketDataService:
    """
    Fetches real-time market data from broker APIs.
    Supports caching and rate limiting.
    """
    
    def __init__(self):
        self.broker = get_active_broker()
        self._cache: Dict[str, Dict] = {}
        self._cache_ttl = 5  # 5 seconds cache
    
    async def get_quote(self, symbol: str, exchange: str = "NSE") -> Optional[Dict]:
        """
        Get real-time quote for a symbol.
        
        Args:
            symbol: Trading symbol (e.g., "RELIANCE")
            exchange: Exchange (NSE/BSE)
            
        Returns:
            Quote data with LTP, change, volume, etc.
        """
        cache_key = f"{exchange}:{symbol}"
        
        # Check cache first
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            if (datetime.now().timestamp() - cached['timestamp']) < self._cache_ttl:
                return cached['data']
        
        # Fetch from broker
        try:
            quote = await self.broker.get_quote(symbol, exchange)
            if quote:
                data = {
                    'symbol': quote.symbol,
                    'ltp': quote.ltp,
                    'change': quote.change,
                    'change_percent': quote.change_percent,
                    'volume': quote.volume,
                    'timestamp': quote.timestamp,
                }
                
                # Update cache
                self._cache[cache_key] = {
                    'data': data,
                    'timestamp': datetime.now().timestamp()
                }
                
                return data
        except Exception as e:
            logger.error("get_quote_error", symbol=symbol, error=str(e))
        
        return None
    
    async def get_quotes_batch(self, symbols: List[str], exchange: str = "NSE") -> List[Dict]:
        """
        Get quotes for multiple symbols in batch.
        
        Args:
            symbols: List of trading symbols
            exchange: Exchange
            
        Returns:
            List of quote data
        """
        # Check which symbols need fresh data
        to_fetch = []
        results = []
        
        for symbol in symbols:
            cache_key = f"{exchange}:{symbol}"
            if cache_key in self._cache:
                cached = self._cache[cache_key]
                if (datetime.now().timestamp() - cached['timestamp']) < self._cache_ttl:
                    results.append(cached['data'])
                    continue
            to_fetch.append(symbol)
        
        # Fetch fresh data for uncached symbols
        if to_fetch:
            try:
                quotes = await self.broker.get_quotes(to_fetch, exchange)
                for quote in quotes:
                    data = {
                        'symbol': quote.symbol,
                        'ltp': quote.ltp,
                        'change': quote.change,
                        'change_percent': quote.change_percent,
                        'volume': quote.volume,
                        'timestamp': quote.timestamp,
                    }
                    results.append(data)
                    
                    # Update cache
                    cache_key = f"{exchange}:{quote.symbol}"
                    self._cache[cache_key] = {
                        'data': data,
                        'timestamp': datetime.now().timestamp()
                    }
            except Exception as e:
                logger.error("get_quotes_batch_error", error=str(e))
        
        return results
    
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
        try:
            candles = await self.broker.get_historical_data(
                symbol=symbol,
                exchange=exchange,
                timeframe=timeframe,
                from_date=from_date,
                to_date=to_date,
            )
            
            # Format candles
            formatted = []
            for candle in candles:
                formatted.append({
                    'timestamp': candle.get('timestamp'),
                    'open': candle.get('open'),
                    'high': candle.get('high'),
                    'low': candle.get('low'),
                    'close': candle.get('close'),
                    'volume': candle.get('volume'),
                })
            
            return formatted
        except Exception as e:
            logger.error("get_historical_data_error", symbol=symbol, error=str(e))
            return []


# Singleton instance
market_data_service = MarketDataService()
