from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import metabase, n8n  # 👈 importa también n8n

app = FastAPI(title="Realtime Dashboard API")

# Incluir routers
app.include_router(metabase.router, prefix="/api")
app.include_router(n8n.router, prefix="/api")  # 👈 incluye n8n

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # solo para desarrollo
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}
