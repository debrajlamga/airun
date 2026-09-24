"""Market Data API — broker-independent market data interface."""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/quote/{symbol}")
async def get_quote(symbol: str, exchange: str = "NSE"):
    """Get real-time quote for a symbol."""
    return {"symbol": symbol, "exchange": exchange, "status": "configured"}


@router.get("/history/{symbol}")
async def get_history(
    symbol: str,
    timeframe: str = Query("15m", enum=["1m", "5m", "15m", "30m", "1h", "1D"]),
    limit: int = Query(100, ge=1, le=1000),
):
    """Get historical OHLCV data."""
    return {"symbol": symbol, "timeframe": timeframe, "candles": []}


@router.get("/instruments")
async def get_instruments(exchange: Optional[str] = None):
    """List available instruments."""
    return {"instruments": []}
