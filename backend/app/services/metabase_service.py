import requests

class MetabaseClient:
    def __init__(self, url: str, username: str, password: str):
        self.url = url
        self.session_id = self.login(username, password)

    def login(self, username: str, password: str) -> str:
        """Inicia sesión y devuelve el session_id"""
        try:
            r = requests.post(
                f"{self.url}/api/session",
                json={"username": username, "password": password},
                timeout=10
            )
            r.raise_for_status()
            return r.json()["id"]
        except requests.RequestException as e:
            raise RuntimeError(f"Metabase login failed: {e}")

    def query(self, card_id: int, search_value: str = ""):
        """
        Ejecuta la query de un card, usando search_value si se proporciona.
        """
        headers = {"X-Metabase-Session": self.session_id}

        payload = {
            "parameters": [
                {
                    "type": "text",
                    "target": ["variable", ["template-tag", "search"]],
                    "value": search_value
                }
            ]
        }

        try:
            r = requests.post(
                f"{self.url}/api/card/{card_id}/query/json",
                headers=headers,
                json=payload,
                timeout=10
            )

            # Debug
            print("Payload enviado a Metabase:", payload)
            print("Respuesta Metabase:", r.text)

            r.raise_for_status()
            return r.json()
        except requests.RequestException as e:
            raise RuntimeError(f"Metabase query failed: {e}")
