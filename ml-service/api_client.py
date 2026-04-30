"""
OleaCare API Client
Helper functions for calling ML API endpoints
"""

import requests
import json
from pathlib import Path
from typing import Dict, Any


class OleaCareClient:
    """Client for OleaCare ML API"""
    
    def __init__(self, api_url: str = "http://localhost:5000"):
        self.api_url = api_url
        self.session = requests.Session()
    
    def predict_sensors(self, sensor_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict quality/quantity from sensor data only
        
        Args:
            sensor_data: Dict with keys:
                - temperature
                - humidity
                - soil_moisture
                - light
                - terrain_hectares
                - (optional) nitrogen_N, phosphorus_P, potassium_K, pH, season
        
        Returns:
            Response dict with quality, quantity predictions
        """
        response = self.session.post(
            f"{self.api_url}/predict",
            json=sensor_data,
            timeout=30
        )
        return response.json()
    
    def detect_image(self, image_path: str) -> Dict[str, Any]:
        """
        Detect olives in image using YOLO
        
        Args:
            image_path: Path to image file
        
        Returns:
            Response dict with detections
        """
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = self.session.post(
                f"{self.api_url}/detect",
                files=files,
                timeout=60
            )
        return response.json()
    
    def predict_and_detect(self, 
                          image_path: str,
                          sensor_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complete pipeline: detect olives + predict quality/quantity
        
        Args:
            image_path: Path to image file
            sensor_data: Dict with sensor readings
        
        Returns:
            Response dict with both detections and predictions
        """
        with open(image_path, 'rb') as f:
            files = {'image': f}
            data = sensor_data
            
            response = self.session.post(
                f"{self.api_url}/predict-and-detect",
                files=files,
                data=data,
                timeout=60
            )
        return response.json()
    
    def health_check(self) -> bool:
        """Check if API is running"""
        try:
            response = self.session.get(f"{self.api_url}/", timeout=5)
            return response.status_code == 200
        except:
            return False


# Example usage
if __name__ == "__main__":
    client = OleaCareClient()
    
    # Check health
    if client.health_check():
        print("✓ API is running")
    else:
        print("✗ API is not running")
    
    # Example: Just sensor data
    sensor_data = {
        "temperature": 24.5,
        "humidity": 65.0,
        "soil_moisture": 45.0,
        "light": 800,
        "terrain_hectares": 1.5,
    }
    
    result = client.predict_sensors(sensor_data)
    print("Prediction result:", json.dumps(result, indent=2))
    
    # Example: Image detection
    # result = client.detect_image("path/to/image.jpg")
    # print("Detection result:", json.dumps(result, indent=2))
