import requests
from requests.auth import HTTPBasicAuth

class N8NClient:
    def __init__(self, base_url: str, auth: tuple[str, str]):
        self.base_url = base_url
        self.auth = HTTPBasicAuth(*auth)

    def executions(self):
        """Devuelve la lista de ejecuciones de n8n"""
        try:
            r = requests.get(
                f"{self.base_url}/rest/executions",
                auth=self.auth,
                timeout=10
            )
            r.raise_for_status()
            return r.json()
        except requests.RequestException as e:
            raise RuntimeError(f"n8n executions fetch failed: {e}")
        
    def search_personas(self, search: str | None = None):
        try:
            url = f"{self.base_url}/webhook/search-personas"

            params = {}
            if search:
                params["search"] = search

            r = requests.get(
                url,
                params=params,
                timeout=10
            )
            r.raise_for_status()
            data = r.json()

            # 🔹 Forzamos siempre array
            if not data or (isinstance(data, dict) and len(data) == 0):
                return []  # si es {} o None, devolvemos []
            elif isinstance(data, list):
                return data  # si ya es lista, la devolvemos
            elif isinstance(data, dict):
                return [data]  # si es dict con contenido, lo ponemos dentro de lista
            else:
                return []  # cualquier otro tipo raro, devolvemos []

        except requests.RequestException as e:
            raise RuntimeError(f"n8n search failed: {e}")
        
    def search_grupos(self, nip: str | None = None):
        try:
            url = f"{self.base_url}/webhook/search-grupos"
            params = {}
            if nip:
                params["nip"] = nip

            r = requests.get(url, params=params, timeout=10)
            r.raise_for_status()
            data = r.json()

            # 🔹 Normalizamos para que siempre sea lista
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            else:
                return []
        except requests.RequestException as e:
            raise RuntimeError(f"n8n search-grupos failed: {e}")
        
    def get_produccion(
        self,
        tipo: str,
        anio_inicio: int | None = None,
        anio_fin: int | None = None,
    ):
        try:
            # 🔹 Mapeo tipo → webhook
            webhook_map = {
                "articulos": "articulos-fecha",
                "libros": "libros-fecha",
                "tesis": "tesis-fecha",
                "proyectos": "proyectos-fecha",
                "capitulos": "capitulos-fecha",
            }

            if tipo not in webhook_map:
                return []

            url = f"{self.base_url}/webhook/{webhook_map[tipo]}"

            params = {}
            if anio_inicio:
                params["anio_inicio"] = anio_inicio
            if anio_fin:
                params["anio_fin"] = anio_fin

            r = requests.get(url, params=params, timeout=20)
            r.raise_for_status()
            data = r.json()

            # 🔹 Normalizamos siempre a lista
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            return []

        except requests.RequestException as e:
            raise RuntimeError(f"n8n produccion failed: {e}")

    def get_produccion_grupo(
        self,
        grupo: str,
        tipo: str,
        anio_inicio: int | None = None,
        anio_fin: int | None = None,
    ):
        try:
            webhook_map = {
                "articulos": "articulos-grupo-fecha",
                "libros": "libros-grupo-fecha",
                "tesis": "tesis-grupo-fecha",
                "proyectos": "proyectos-grupo-fecha",
                "capitulos": "capitulos-grupo-fecha",
            }

            if tipo not in webhook_map:
                return []

            url = f"{self.base_url}/webhook/{webhook_map[tipo]}"

            params = {}
            if grupo:
                params["grupo"] = grupo
            if anio_inicio:
                params["anio_inicio"] = anio_inicio
            if anio_fin:
                params["anio_fin"] = anio_fin

            r = requests.get(url, params=params, timeout=20)
            r.raise_for_status()
            data = r.json()

            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            return []

        except requests.RequestException as e:
            raise RuntimeError(f"n8n produccion failed: {e}")
        
    def get_produccion_division(
        self,
        division: str,
        tipo: str,
        anio_inicio: int | None = None,
        anio_fin: int | None = None,
    ):
        try:
            webhook_map = {
                "articulos": "articulos-division-fecha",
                "libros": "libros-division-fecha",
                "tesis": "tesis-division-fecha",
                "proyectos": "proyectos-division-fecha",
                "capitulos": "capitulos-division-fecha",
            }

            if tipo not in webhook_map:
                return []

            url = f"{self.base_url}/webhook/{webhook_map[tipo]}"

            params = {}
            if division:
                params["division"] = division
            if anio_inicio:
                params["anio_inicio"] = anio_inicio
            if anio_fin:
                params["anio_fin"] = anio_fin

            r = requests.get(url, params=params, timeout=20)
            r.raise_for_status()
            data = r.json()

            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            return []

        except requests.RequestException as e:
            raise RuntimeError(f"n8n produccion failed: {e}")
        
    def get_produccion_investigador(
        self,
        investigadores: str,
        tipo: str,
        anio_inicio: int | None = None,
        anio_fin: int | None = None,
    ):
        try:
            webhook_map = {
                "articulos": "articulos-investigador-fecha",
                "libros": "libros-investigador-fecha",
                "tesis": "tesis-investigador-fecha",
                "proyectos": "proyectos-investigador-fecha",
                "capitulos": "capitulos-investigador-fecha",
            }

            if tipo not in webhook_map:
                return []

            url = f"{self.base_url}/webhook/{webhook_map[tipo]}"

            params = {}
            if investigadores:
                params["investigadores"] = investigadores
            if anio_inicio:
                params["anio_inicio"] = anio_inicio
            if anio_fin:
                params["anio_fin"] = anio_fin

            r = requests.get(url, params=params, timeout=20)
            r.raise_for_status()
            data = r.json()

            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            return []

        except requests.RequestException as e:
            raise RuntimeError(f"n8n produccion failed: {e}")
        
        
