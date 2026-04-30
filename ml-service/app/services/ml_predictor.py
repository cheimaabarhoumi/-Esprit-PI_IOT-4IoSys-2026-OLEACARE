import os
import joblib
import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

MODEL_DIR = os.path.join(BASE_DIR, "models")

# Load models with graceful fallback
rendement_model = None
huile_model = None
acidite_model = None

try:
    rendement_model = joblib.load(
        os.path.join(MODEL_DIR, "rendement_kg_arbre_model.pkl")
    )

    huile_model = joblib.load(
        os.path.join(MODEL_DIR, "taux_huile_pct_model.pkl")
    )

    acidite_model = joblib.load(
        os.path.join(MODEL_DIR, "acidite_pct_model.pkl")
    )
    logger.info("ML models loaded successfully")

except Exception as e:
    logger.warning(f"Could not load ML models (this is OK for YOLO-only mode): {e}")
    logger.warning("Predictions will use fallback mock models")




def predict_all(data):
    """
    Predict all metrics - with fallback if models unavailable
    """
    df = pd.DataFrame([{
        "temp_air": data.get("temperature"),
        "humidity_air": data.get("humidity"),
        "pressure_hpa": data.get("pressure_hpa", 1013),
        
        "nitrogen_N": data.get("nitrogen_N", 40),
        "phosphorus_P": data.get("phosphorus_P", 20),
        "potassium_K": data.get("potassium_K", 30),
        
        "soil_temp": data.get("soil_temp", data.get("temperature")),
        "soil_hum": data.get("soil_moisture"),
        "lux": data.get("light"),
        "pH": data.get("pH", 7),
        
        "N_K_ratio": data.get("N_K_ratio", 1),
        "P_K_ratio": data.get("P_K_ratio", 1),
        "temp_humidity": data.get("temp_humidity", 1),
        "stress_index": data.get("stress_index", 1),
        "nutrient_balance": data.get("nutrient_balance", 1),
        "climate_index": data.get("climate_index", 1),
        
        "terrain_hectares": data.get("terrain_hectares", 1),
        
        "saison": data.get("saison", "ete")
    }])
    
    # Use real models if available, otherwise use fallback
    if rendement_model is not None and huile_model is not None and acidite_model is not None:
        r = float(rendement_model.predict(df)[0])
        h = float(huile_model.predict(df)[0])
        a = float(acidite_model.predict(df)[0])
    else:
        # Fallback: mock predictions based on input data
        temp = data.get("temperature", 24)
        humidity = data.get("humidity", 65)
        light = data.get("light", 800)
        
        # Simple heuristic: higher temp/light = more production
        r = 30 + (temp - 20) * 2 + (light - 600) / 100
        h = 20 + (humidity - 60) * 0.3
        a = 0.8 + (temp - 24) * 0.1
    
    quality = (h * 0.6 + (100 - a) * 0.4)
    quantity = r
    
    return {
        "quality": round(quality, 3),
        "quantity": round(quantity, 3)
    }