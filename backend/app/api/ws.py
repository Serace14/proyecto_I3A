from fastapi import WebSocket, APIRouter
import asyncio

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    while True:
        await ws.send_json({"status": "alive"})
        await asyncio.sleep(2)
