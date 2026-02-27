import os
from dotenv import load_dotenv

load_dotenv()

def _required(value: str, name: str) -> str:
    if not value:
        raise RuntimeError(f"Missing environment variable: {name}")
    return value

class Settings:
    N8N_BASE_URL = _required(os.getenv("N8N_BASE_URL"), "N8N_BASE_URL")
    N8N_USERNAME = _required(os.getenv("N8N_USERNAME"), "N8N_USERNAME")
    N8N_PASSWORD = _required(os.getenv("N8N_PASSWORD"), "N8N_PASSWORD")

    METABASE_URL = _required(os.getenv("METABASE_URL"), "METABASE_URL")
    METABASE_USERNAME = _required(os.getenv("METABASE_USERNAME"), "METABASE_USERNAME")
    METABASE_PASSWORD = _required(os.getenv("METABASE_PASSWORD"), "METABASE_PASSWORD")


settings = Settings()
