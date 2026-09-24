"""Positions API."""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_positions():
    return {"positions": []}

@router.get("/{position_id}")
async def get_position(position_id: str):
    return {"position": {}}

@router.post("/{position_id}/close")
async def close_position(position_id: str):
    return {"message": "Position closed"}
