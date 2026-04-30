# OleaCare ML API Documentation

## Base URL
```
http://localhost:5000
```

## Endpoints

### 1. Health Check
```http
GET /
```

**Response:**
```json
{
  "message": "OleaCare ML API running 🚀",
  "status": "healthy",
  "timestamp": "2026-04-29T23:55:17.559491"
}
```

---

### 2. Predict (Sensors Only)
Predict quality/quantity from sensor data.

```http
POST /predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "temperature": 24.5,
  "humidity": 65.0,
  "soil_moisture": 45.0,
  "light": 800,
  "terrain_hectares": 1.5,
  "nitrogen_N": 40,
  "phosphorus_P": 20,
  "potassium_K": 30,
  "pH": 7,
  "pressure_hpa": 1013,
  "season": "summer"
}
```

**Response:**
```json
{
  "status": "success",
  "timestamp": "2026-04-29T23:55:19.605497",
  "result": {
    "quality": 52.56,
    "quantity": 41.0,
    "integration_mode": "real_ml"
  }
}
```

---

### 3. Detect (YOLO Detection)
Detect olives in image using YOLO.

```http
POST /detect
Content-Type: multipart/form-data
```

**Request:**
- Form field `image`: Image file (JPG/PNG/BMP)

**Response:**
```json
{
  "status": "success",
  "timestamp": "2026-04-29T23:55:20.123456",
  "result": {
    "status": "success",
    "image_path": "/tmp/img.jpg",
    "total_detected": 45,
    "avg_confidence": 0.92,
    "dominant_color": "green",
    "output_image_url": "/path/to/detection_output.jpg",
    "detections": [
      {
        "bbox": {
          "x1": 100,
          "y1": 150,
          "x2": 180,
          "y2": 220,
          "width": 80,
          "height": 70,
          "area": 5600
        },
        "color": "green",
        "quality": "good",
        "confidence": 0.95
      }
    ],
    "statistics": {
      "good_quality": 30,
      "medium_quality": 10,
      "bad_quality": 4,
      "damaged": 1
    }
  }
}
```

---

### 4. Predict and Detect (Complete Pipeline)
Full pipeline: detect olives + predict quality/quantity.

```http
POST /predict-and-detect
Content-Type: multipart/form-data
```

**Request:**
- Form field `image`: Image file
- Form fields: All sensor data (temperature, humidity, etc.)

**Response:**
```json
{
  "status": "success",
  "result": {
    "detection": {
      "status": "success",
      "total_detected": 45,
      "avg_confidence": 0.92,
      "dominant_color": "green",
      "detections": [
        {
          "bbox": {...},
          "color": "green",
          "quality": "good",
          "confidence": 0.95
        }
      ],
      "statistics": {
        "good_quality": 30,
        "medium_quality": 10,
        "bad_quality": 4,
        "damaged": 1
      }
    },
    "prediction": {
      "quality": 52.56,
      "quantity": 41.0,
      "integration_mode": "real_ml"
    },
    "timestamp": "2026-04-29T23:55:20.123456"
  }
}
```

---

## Color Classification

Possible color values returned by YOLO:
- `green` - Green olives
- `yellowish-green` - Yellow-green olives
- `violet` - Violet/purple olives
- `purple` - Purple olives
- `black` - Black/dark olives
- `red` - Red olives
- `brown` - Brown olives

---

## Quality Classification

Possible quality values:
- `good` - High quality (confidence > 0.9, few defects)
- `medium` - Medium quality (confidence > 0.7, some defects)
- `bad` - Low quality (confidence < 0.7, many defects)
- `damaged` - Damaged olives (high defect density)

---

## Example Integrations

### Python Client
```python
from api_client import OleaCareClient

client = OleaCareClient("http://localhost:5000")

# Predict from sensors
result = client.predict_sensors({
    "temperature": 24.5,
    "humidity": 65.0,
    "soil_moisture": 45.0,
    "light": 800,
    "terrain_hectares": 1.5,
})
print(result)

# Detect from image
result = client.detect_image("image.jpg")
print(result)

# Complete pipeline
result = client.predict_and_detect("image.jpg", sensor_data)
print(result)
```

### JavaScript/Frontend (Angular)
```typescript
// Service example
detect(imageFile: File): Observable<any> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  return this.http.post('http://localhost:5000/detect', formData);
}

predictAndDetect(imageFile: File, sensorData: any): Observable<any> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  Object.keys(sensorData).forEach(key => {
    formData.append(key, sensorData[key]);
  });
  
  return this.http.post('http://localhost:5000/predict-and-detect', formData);
}
```

### cURL Examples
```bash
# Health check
curl http://localhost:5000/

# Predict
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 24.5,
    "humidity": 65.0,
    "soil_moisture": 45.0,
    "light": 800,
    "terrain_hectares": 1.5
  }'

# Detect
curl -X POST http://localhost:5000/detect \
  -F "image=@image.jpg"

# Detect and Predict
curl -X POST http://localhost:5000/predict-and-detect \
  -F "image=@image.jpg" \
  -F "temperature=24.5" \
  -F "humidity=65.0" \
  -F "soil_moisture=45.0" \
  -F "light=800" \
  -F "terrain_hectares=1.5"
```

---

## Error Handling

All errors return:
```json
{
  "status": "error",
  "message": "Error description"
}
```

Status codes:
- `200` - Success
- `400` - Bad request (missing fields, invalid image)
- `500` - Server error
