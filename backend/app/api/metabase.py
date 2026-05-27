from fastapi import APIRouter, Query
from typing import Optional
from app.services.metabase_service import MetabaseClient
from app.core.config import settings

from pydantic import BaseModel
import requests

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
    

class SaveOverrideRequest(BaseModel):
    table_name: str
    record_id: str
    column_name: str
    value: str | None = None


@router.post("/save-override")
def save_override(payload: SaveOverrideRequest):
    allowed_tables = [
        "proyectos",
        "articulos",
        "capitulos",
        "tesis",
        "libros",
    ]

    if payload.table_name not in allowed_tables:
        return {
            "success": False,
            "error": "tabla no permitida"
        }

    r = requests.post(
        f"{settings.N8N_BASE_URL}/webhook/save-override",
        json=payload.model_dump(),
        timeout=15
    )

    print("Status:", r.status_code)
    print("Respuesta n8n:", r.text)

    if not r.ok:
        return {
            "success": False,
            "status": r.status_code,
            "n8n_error": r.text
        }

    return r.json()


class GetOverridesRequest(BaseModel):
    table_name: str

@router.get("/get-overrides")
def get_overrides(table_name: str):

    allowed_tables = [
        "proyectos",
        "articulos",
        "capitulos",
        "tesis",
        "libros",
    ]

    if table_name not in allowed_tables:
        return {
            "success": False,
            "error": "tabla no permitida"
        }

    r = requests.get(
        f"{settings.N8N_BASE_URL}/webhook/get-overrides",
        params={
            "table_name": table_name
        },
        timeout=15
    )

    print("Status:", r.status_code)
    print("Respuesta n8n:", r.text)

    if not r.ok:
        return {
            "success": False,
            "status": r.status_code,
            "n8n_error": r.text
        }

    return r.json()
