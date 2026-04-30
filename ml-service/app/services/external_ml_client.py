import os
from typing import Any, Dict, Optional

import requests


class ExternalMLClient:
    def __init__(self):
        self.base_url = os.getenv("EXTERNAL_ML_BASE_URL", "").rstrip("/")
        self.quality_url = os.getenv("EXTERNAL_ML_QUALITY_URL", "").strip()
        self.quantity_url = os.getenv("EXTERNAL_ML_QUANTITY_URL", "").strip()
        self.timeout = float(os.getenv("EXTERNAL_ML_TIMEOUT_SECONDS", "10"))

        if not self.quality_url and self.base_url:
            self.quality_url = f"{self.base_url}/predict/quality"
        if not self.quantity_url and self.base_url:
            self.quantity_url = f"{self.base_url}/predict/quantity"

    def is_configured(self) -> bool:
        return bool(self.quality_url and self.quantity_url)

    def predict_quality(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.quality_url:
            raise ValueError("External quality endpoint is not configured")
        return self._post_json(self.quality_url, payload)

    def predict_quantity(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.quantity_url:
            raise ValueError("External quantity endpoint is not configured")
        return self._post_json(self.quantity_url, payload)

    def _post_json(self, url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(url, json=payload, timeout=self.timeout)
        response.raise_for_status()
        return response.json()
