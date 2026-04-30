from typing import Any, Dict
from app.services.ml_predictor import predict_all


class PredictionIntegrationService:
    """
    Service unique d'intégration ML.
    Utilise uniquement le modèle sklearn réel (ml_predictor.py).
    
    """

    
    def predict_full(self, payload: Dict[str, Any]) -> Dict[str, Any]:

        validated = self._validate_payload(payload)

        result = predict_all(validated)

        return {
            "quality": float(result["quality"]),
            "quantity": float(result["quantity"]),
            "integration_mode": "real_ml"
        }

    def predict_quality(self, payload: Dict[str, Any]) -> Dict[str, Any]:

        validated = self._validate_payload(payload)

        result = predict_all(validated)

        return {
            "quality": float(result["quality"]),
            "integration_mode": "real_ml"
        }

 
    def predict_quantity(self, payload: Dict[str, Any]) -> Dict[str, Any]:

        validated = self._validate_payload(payload)

        result = predict_all(validated)

        return {
            "quantity": float(result["quantity"]),
            "integration_mode": "real_ml"
        }

   
    def _validate_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:

        required_fields = [
            "temperature",
            "humidity",
            "soil_moisture",
            "light",
            "terrain_hectares"
        ]

        missing = [f for f in required_fields if f not in payload]
        if missing:
            raise ValueError(f"Missing fields: {missing}")

        return {
            "temperature": float(payload["temperature"]),
            "humidity": float(payload["humidity"]),
            "soil_moisture": float(payload["soil_moisture"]),
            "light": float(payload["light"]),
            "terrain_hectares": float(payload["terrain_hectares"]),

            "nitrogen_N": float(payload.get("nitrogen_N", 40)),
            "phosphorus_P": float(payload.get("phosphorus_P", 20)),
            "potassium_K": float(payload.get("potassium_K", 30)),
            "pH": float(payload.get("pH", 7)),
            "pressure_hpa": float(payload.get("pressure_hpa", 1013)),
            "season": payload.get("season", "unknown"),
        }