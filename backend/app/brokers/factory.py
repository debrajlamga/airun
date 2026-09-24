"""
Broker Factory — manages broker adapter instances.
Supports multiple brokers with a unified interface.

Supported Brokers:
- Groww (via API or web)
- Zerodha (Kite Connect)
- Upstox
- Angel One
- Paper Broker (simulated)
"""
from typing import Optional, Dict, Type
from abc import ABC, abstractmethod
import structlog

from app.config import settings

logger = structlog.get_logger("broker.factory")


class BrokerInterface(ABC):
    """Abstract broker interface — all brokers must implement these methods."""
    
    @abstractmethod
    async def authenticate(self) -> bool:
        """Authenticate with the broker."""
        pass
    
    @abstractmethod
    async def get_quote(self, symbol: str, exchange: str = "NSE"):
        """Get real-time quote."""
        pass
    
    @abstractmethod
    async def place_order(self, order) -> any:
        """Place an order."""
        pass
    
    @abstractmethod
    async def get_positions(self):
        """Get open positions."""
        pass
    
    @abstractmethod
    async def get_orders(self):
        """Get all orders."""
        pass
    
    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order."""
        pass
    
    @abstractmethod
    async def get_margins(self):
        """Get account margins."""
        pass


class PaperBroker(BrokerInterface):
    """
    Paper Broker — simulated trading for testing.
    No real orders are placed.
    """
    
    def __init__(self):
        self._orders = []
        self._positions = []
        self._authenticated = True
        logger.info("paper_broker_initialized")
    
    async def authenticate(self) -> bool:
        self._authenticated = True
        return True
    
    async def get_quote(self, symbol: str, exchange: str = "NSE"):
        # Return simulated quote
        from dataclasses import dataclass
        
        @dataclass
        class SimQuote:
            symbol: str
            ltp: float
            change: float
            change_percent: float
            volume: int
            timestamp: float
        
        import random
        import time
        base_prices = {
            "RELIANCE": 2487.55, "TCS": 3654.20, "INFY": 1478.30,
            "HDFCBANK": 1642.80, "ICICIBANK": 1024.55, "SBIN": 628.75,
        }
        base = base_prices.get(symbol, 1000.0)
        ltp = base * (1 + (random.random() - 0.5) * 0.02)
        change = ltp - base
        return SimQuote(
            symbol=symbol,
            ltp=round(ltp, 2),
            change=round(change, 2),
            change_percent=round((change / base) * 100, 2),
            volume=random.randint(1000000, 20000000),
            timestamp=time.time(),
        )
    
    async def place_order(self, order):
        from dataclasses import dataclass
        
        @dataclass
        class SimResult:
            success: bool
            order_id: str = ""
            fill_price: float = 0.0
            error: str = ""
        
        import uuid
        order_id = f"PAPER-{uuid.uuid4().hex[:8].upper()}"
        logger.info("paper_order_placed", order_id=order_id, symbol=order.symbol, side=order.side)
        
        quote = await self.get_quote(order.symbol)
        return SimResult(
            success=True,
            order_id=order_id,
            fill_price=quote.ltp if quote else 0.0,
        )
    
    async def get_positions(self):
        return self._positions
    
    async def get_orders(self):
        return self._orders
    
    async def cancel_order(self, order_id: str) -> bool:
        return True
    
    async def get_margins(self):
        return {
            "available_cash": 500000.0,
            "utilized": 150000.0,
            "total": 650000.0,
        }


class BrokerFactory:
    """
    Factory for creating and managing broker instances.
    """
    
    _instances: Dict[str, BrokerInterface] = {}
    
    @classmethod
    def get_broker(cls, broker_name: Optional[str] = None) -> BrokerInterface:
        """
        Get broker instance by name.
        
        Args:
            broker_name: Broker name (groww, zerodha, upstox, angel, paper)
                        If None, uses TRADING_MODE to determine.
        
        Returns:
            Broker instance
        """
        if broker_name is None:
            if settings.TRADING_MODE == "LIVE":
                broker_name = settings.BROKER_NAME.lower() if settings.BROKER_NAME else "paper"
            else:
                broker_name = "paper"
        
        broker_name = broker_name.lower()
        
        if broker_name not in cls._instances:
            cls._instances[broker_name] = cls._create_broker(broker_name)
        
        return cls._instances[broker_name]
    
    @classmethod
    def _create_broker(cls, name: str) -> BrokerInterface:
        """Create a broker instance by name."""
        if name == "paper":
            return PaperBroker()
        
        elif name == "groww":
            from app.brokers.groww import groww_broker
            return groww_broker
        
        elif name == "zerodha":
            # TODO: Implement Zerodha adapter
            logger.warning("zerodha_adapter_not_implemented")
            return PaperBroker()
        
        elif name == "upstox":
            # TODO: Implement Upstox adapter
            logger.warning("upstox_adapter_not_implemented")
            return PaperBroker()
        
        elif name == "angel":
            # TODO: Implement Angel One adapter
            logger.warning("angel_adapter_not_implemented")
            return PaperBroker()
        
        else:
            logger.error("unknown_broker", name=name)
            return PaperBroker()
    
    @classmethod
    async def initialize_all(cls):
        """Initialize all configured brokers."""
        broker = cls.get_broker()
        if hasattr(broker, 'initialize'):
            await broker.initialize()
        
        authenticated = await broker.authenticate()
        if authenticated:
            logger.info("broker_authenticated", broker=type(broker).__name__)
        else:
            logger.warning("broker_auth_failed", broker=type(broker).__name__)
    
    @classmethod
    async def close_all(cls):
        """Close all broker connections."""
        for name, broker in cls._instances.items():
            if hasattr(broker, 'close'):
                await broker.close()
        cls._instances.clear()
        logger.info("all_brokers_closed")


def get_active_broker() -> BrokerInterface:
    """Convenience function to get the currently active broker."""
    return BrokerFactory.get_broker()
