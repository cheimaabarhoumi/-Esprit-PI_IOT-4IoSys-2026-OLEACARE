"""
Machine Learning Models for OleaCare
Predicts olive oil quality and quantity based on sensor data
Pure Python implementation without heavy dependencies
"""

import random
from datetime import datetime, timedelta

random.seed(42)


class QualityPredictor:
    """Predict olive oil quality and optimal harvest date"""
    
    def __init__(self):
        pass
    
    def predict(self, features):
        """
        Predict quality metrics
        
        features: [temperature, humidity, soil_moisture, light]
        returns: dict with quality predictions
        """
        temp, humidity, soil_moisture, light = features
        
        # Calculate maturity index (0-1)
        # Temperature 20-28°C is optimal
        temp_factor = 1 - abs(temp - 24) / 15
        
        # Humidity 55-75% is optimal
        humidity_factor = 1 - abs(humidity - 65) / 20
        
        # Soil moisture 35-55% is optimal
        soil_factor = 1 - abs(soil_moisture - 45) / 20
        
        # Light 700-900 is optimal
        light_factor = min(light / 800, 1.0)
        
        # Combined maturity index
        maturity_index = (temp_factor * 0.35 + 
                         humidity_factor * 0.25 + 
                         soil_factor * 0.25 + 
                         light_factor * 0.15)
        
        # Clamp to 0-1
        maturity_index = max(0, min(1, maturity_index))
        
        # Determine quality grade based on maturity
        if maturity_index >= 0.8:
            quality_grade = "Extra_Vierge"
            quality_score = 8.5 + (maturity_index - 0.8) * 2
            acidity = 0.2 + random.uniform(-0.05, 0.05)
        elif maturity_index >= 0.6:
            quality_grade = "Vierge"
            quality_score = 7.0 + (maturity_index - 0.6) * 2.5
            acidity = 0.5 + random.uniform(-0.1, 0.1)
        else:
            quality_grade = "Lampante"
            quality_score = 5.0 + maturity_index * 2
            acidity = 2.0 + random.uniform(-0.5, 0.5)
        
        # Ensure quality score is in valid range
        quality_score = max(0, min(10, quality_score))
        
        # Calculate optimal harvest date
        days_to_harvest = max(1, int((1 - maturity_index) * 30))
        optimal_harvest_date = (datetime.now() + timedelta(days=days_to_harvest)).strftime('%Y-%m-%d')
        
        # Confidence based on feature alignment
        confidence = int(80 + maturity_index * 15)
        
        return {
            'maturity_index': round(maturity_index, 3),
            'quality_grade': quality_grade,
            'quality_score': round(quality_score, 1),
            'acidity': round(max(0.1, min(3.0, acidity)), 2),
            'optimal_harvest_date': optimal_harvest_date,
            'confidence': confidence
        }


class QuantityPredictor:
    """Predict olive oil yield and value"""
    
    def __init__(self):
        pass
    
    def predict(self, features):
        """
        Predict oil quantity and value
        
        features: [temperature, humidity, soil_moisture, light, terrain_hectares]
        returns: dict with quantity predictions
        """
        temp, humidity, soil_moisture, light, terrain_hectares = features
        
        # Base production rate: 3-8 liters per hectare depending on conditions
        base_rate = 5.0
        
        # Environmental factor
        temp_factor = 1 - abs(temp - 24) / 20
        humidity_factor = 1 - abs(humidity - 65) / 25
        soil_factor = 1 - abs(soil_moisture - 45) / 25
        light_factor = min(light / 850, 1.2)
        
        # Weighted environmental score
        env_score = (temp_factor * 0.3 + 
                    humidity_factor * 0.25 + 
                    soil_factor * 0.25 + 
                    light_factor * 0.2)
        
        # Production rate adjusted by environment
        production_rate = base_rate * (0.5 + env_score)
        
        # Total liters
        total_oil_liters = round(production_rate * terrain_hectares + random.uniform(-5, 10), 1)
        total_oil_liters = max(1, total_oil_liters)
        
        # Oil value in Tunisian Dinars (base price: 12 TND/liter)
        base_price = 12
        quality_multiplier = 0.8 + (env_score * 0.4)  # Better conditions = higher price
        oil_value_TND = round(total_oil_liters * base_price * quality_multiplier, 2)
        
        return {
            'total_oil_liters': total_oil_liters,
            'oil_value_TND': oil_value_TND,
            'estimated_harvest_date': (datetime.now() + timedelta(days=15)).strftime('%Y-%m-%d'),
            'confidence': int(70 + (env_score * 25))
        }
