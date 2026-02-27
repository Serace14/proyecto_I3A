from fastapi import APIRouter, Query
from typing import Optional
from app.services.metabase_service import MetabaseClient
from app.core.config import settings


router = APIRouter(prefix="/metabase", tags=["metabase"])

metabase_client = MetabaseClient(
    url=settings.METABASE_URL,
    username=settings.METABASE_USERNAME,
    password=settings.METABASE_PASSWORD,
)

@router.get("/card/{card_id}")
def get_card(card_id: int, search: str = Query("", alias="search")):
    """
    Obtiene datos de un card de Metabase filtrando por `search`.
    """
    try:
        result = metabase_client.query(card_id, search_value=search)
        return result
    except Exception as e:
        return {"error": str(e)}