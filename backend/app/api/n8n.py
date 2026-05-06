from fastapi import APIRouter
from app.services.n8n_service import N8NClient
from app.core.config import settings

router = APIRouter(prefix="/n8n", tags=["n8n"])

n8n_client = N8NClient(
    base_url=settings.N8N_BASE_URL,
    auth=(settings.N8N_USERNAME, settings.N8N_PASSWORD),
)

@router.get("/executions")
def get_executions():
    return n8n_client.executions()

@router.get("/search-personas")
def search_personas(search: str | None = None):
    return n8n_client.search_personas(search)

@router.get("/search-grupos")
def search_grupos(nip: str | None = None):
    return n8n_client.search_grupos(nip)

@router.get("/produccion")
def get_produccion(
    tipo: str,
    anio_inicio: int | None = None,
    anio_fin: int | None = None,
):
    return n8n_client.get_produccion(tipo, anio_inicio, anio_fin)

@router.get("/produccion-grupo")
def get_produccion_grupo(
    grupo: str,
    tipo: str,
    anio_inicio: int | None = None,
    anio_fin: int | None = None,
):
    return n8n_client.get_produccion_grupo(grupo, tipo, anio_inicio, anio_fin)

@router.get("/produccion-division")
def get_produccion_division(
    division: str,
    tipo: str,
    anio_inicio: int | None = None,
    anio_fin: int | None = None,
):
    return n8n_client.get_produccion_division(division, tipo, anio_inicio, anio_fin)

@router.get("/produccion-investigador")
def get_produccion_investigador(
    investigadores: str,
    tipo: str,
    anio_inicio: int | None = None,
    anio_fin: int | None = None,
):
    return n8n_client.get_produccion_investigador(investigadores, tipo, anio_inicio, anio_fin)