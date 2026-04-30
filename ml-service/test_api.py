#!/usr/bin/env python3
"""
Test OleaCare API Endpoints
"""

import requests
import json
import sys
from pathlib import Path

API_URL = "http://localhost:5000"

def test_health():
    """Test API health"""
    print("\n🔍 Testing API health...")
    try:
        resp = requests.get(f"{API_URL}/", timeout=5)
        if resp.status_code == 200:
            print("✅ API is running!")
            print(json.dumps(resp.json(), indent=2))
            return True
    except Exception as e:
        print(f"❌ API error: {e}")
        return False


def test_predict_sensors():
    """Test sensor prediction"""
    print("\n🔍 Testing sensor prediction...")
    try:
        sensor_data = {
            "temperature": 24.5,
            "humidity": 65.0,
            "soil_moisture": 45.0,
            "light": 800,
            "terrain_hectares": 1.5,
        }
        resp = requests.post(f"{API_URL}/predict", json=sensor_data, timeout=10)
        print(f"Status: {resp.status_code}")
        result = resp.json()
        print("Response:")
        print(json.dumps(result, indent=2))
        
        if resp.status_code == 200:
            print("✅ Prediction endpoint works!")
            return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_detect_image(image_path):
    """Test image detection"""
    print(f"\n🔍 Testing image detection with {image_path}...")
    
    if not Path(image_path).exists():
        print(f"❌ Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            resp = requests.post(f"{API_URL}/detect", files=files, timeout=30)
        
        print(f"Status: {resp.status_code}")
        result = resp.json()
        
        if result.get('status') == 'success':
            det = result.get('result', {})
            print(f"✅ Detected {det.get('total_detected', 0)} olives")
            print(f"   Avg confidence: {det.get('avg_confidence', 0):.2%}")
            print(f"   Quality distribution: {det.get('statistics', {})}")
            return True
        else:
            print(f"❌ Detection failed: {result.get('message', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    print("=" * 60)
    print("OleaCare API Test Suite")
    print("=" * 60)
    
    # Test health
    if not test_health():
        print("\n❌ API is not running. Start with: python app.py")
        sys.exit(1)
    
    # Test prediction
    test_predict_sensors()
    
    # Test detection (if image exists)
    test_images = [
        "test_image.jpg",
        "sample.jpg",
        "olive.jpg",
    ]
    
    for img in test_images:
        if Path(img).exists():
            test_detect_image(img)
            break
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
