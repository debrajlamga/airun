"""Portfolio API."""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def get_portfolio():
    return {"portfolio": {"total_value": 0, "cash": 0, "invested": 0}}

@router.get("/history")
async def portfolio_history():
    return {"history": []}

@router.get("/allocation")
async def portfolio_allocation():
    return {"allocation": []}
