# ── Backend – FastAPI ──────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Dependencias del sistema (psycopg2-binary las incluye, pero por si acaso)
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python
COPY requeriments.txt .
RUN pip install --no-cache-dir -r requeriments.txt

# Copiar el código fuente (sin venv ni __pycache__)
COPY app/ app/

# Exponer el puerto del servidor
EXPOSE 8000

# Arrancar con uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]