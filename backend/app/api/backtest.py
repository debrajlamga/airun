"""Backtest API — run historical backtests."""
from fastapi import APIRouter, BackgroundTasks
router = APIRouter()

@router.post("/run")
async def run_backtest(background_tasks: BackgroundTasks):
    """Run a backtest (executed as background task for performance)."""
    return {"backtest_id": "pending", "status": "queued"}

@router.get("/results/{backtest_id}")
async def get_backtest_results(backtest_id: str):
    return {"backtest_id": backtest_id, "status": "pending"}

@router.get("/history")
async def list_backtests():
    return {"backtests": []}
