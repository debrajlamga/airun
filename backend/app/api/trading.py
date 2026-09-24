"""Trading Bot Control API — start/stop/pause/emergency-stop."""
from fastapi import APIRouter
router = APIRouter()

@router.post("/start")
async def start_bot():
    return {"status": "starting"}

@router.post("/stop")
async def stop_bot():
    return {"status": "stopped"}

@router.post("/pause")
async def pause_bot():
    return {"status": "paused"}

@router.post("/emergency-stop")
async def emergency_stop():
    return {"status": "emergency_stopped", "message": "All trading halted"}

@router.post("/resume")
async def resume_bot():
    return {"status": "resumed"}

@router.get("/status")
async def bot_status():
    return {"status": "STOPPED", "mode": "PAPER"}
