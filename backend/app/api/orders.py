"""Orders API."""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_orders():
    return {"orders": []}

@router.post("/")
async def place_order():
    return {"order_id": "pending", "status": "validating"}

@router.get("/{order_id}")
async def get_order(order_id: str):
    return {"order": {}}

@router.post("/{order_id}/cancel")
async def cancel_order(order_id: str):
    return {"message": "Order cancelled"}
