from flask import Flask, request, jsonify
from datetime import datetime
from flask_cors import CORS
import cv2
import numpy as np
import tempfile
import os


from app.services.prediction_integration_service import PredictionIntegrationService
from app.services.yolo_service import get_yolo_service


app = Flask(__name__)
CORS(app)

service = PredictionIntegrationService()
yolo_service = get_yolo_service()



@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "OleaCare ML API running 🚀",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    })



@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict quality/quantity from sensor data
    Body: JSON with sensor data
    """
    try:
        payload = request.get_json()

        if not payload:
            return jsonify({
                "status": "error",
                "message": "Empty request body"
            }), 400

        result = service.predict_full(payload)

        return jsonify({
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "result": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/detect", methods=["POST"])
def detect():
    """
    Detect olives in image using YOLO
    Body: multipart/form-data with 'image' file
    """
    try:
        if 'image' not in request.files:
            return jsonify({
                "status": "error",
                "message": "No image file provided"
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                "status": "error",
                "message": "No image selected"
            }), 400
        
        # Read image
        image_data = file.read()
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({
                "status": "error",
                "message": "Could not decode image"
            }), 400
        
        # Save temp image for YOLO
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            tmp_path = tmp.name
            cv2.imwrite(tmp_path, image)
        
        try:
            # Run YOLO detection
            detection_result = yolo_service.detect_olives(tmp_path)
            
            return jsonify({
                "status": "success",
                "timestamp": datetime.utcnow().isoformat(),
                "result": detection_result
            })
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/predict-and-detect", methods=["POST"])
def predict_and_detect():
    """
    Complete pipeline: detect olives + predict quality/quantity
    Body: multipart/form-data with 'image' file and sensor data
    """
    try:
        # Get sensor data
        data = request.form.to_dict()
        
        # Get image
        if 'image' not in request.files:
            return jsonify({
                "status": "error",
                "message": "No image file provided"
            }), 400
        
        file = request.files['image']
        
        # Read image
        image_data = file.read()
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({
                "status": "error",
                "message": "Could not decode image"
            }), 400
        
        # Save temp image for YOLO
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            tmp_path = tmp.name
            cv2.imwrite(tmp_path, image)
        
        try:
            # Step 1: YOLO Detection
            detection_result = yolo_service.detect_olives(tmp_path)
            
            # Step 2: Predict quality/quantity from sensor data
            try:
                # Convert sensor data to proper format
                sensor_data = {
                    "temperature": float(data.get("temperature", 24)),
                    "humidity": float(data.get("humidity", 65)),
                    "soil_moisture": float(data.get("soil_moisture", 45)),
                    "light": float(data.get("light", 800)),
                    "terrain_hectares": float(data.get("terrain_hectares", 1)),
                    "nitrogen_N": float(data.get("nitrogen_N", 40)),
                    "phosphorus_P": float(data.get("phosphorus_P", 20)),
                    "potassium_K": float(data.get("potassium_K", 30)),
                    "pH": float(data.get("pH", 7)),
                    "pressure_hpa": float(data.get("pressure_hpa", 1013)),
                    "season": data.get("season", "unknown"),
                }
                prediction = service.predict_full(sensor_data)
            except Exception as e:
                prediction = {"quality": 0, "quantity": 0, "error": str(e)}
            
            # Combine results
            combined_result = {
                "detection": detection_result,
                "prediction": prediction,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return jsonify({
                "status": "success",
                "result": combined_result
            })
            
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@app.route("/predict/quality", methods=["POST"])
def predict_quality():
    try:
        payload = request.get_json()

        if not payload:
            return jsonify({"error": "Empty request"}), 400

        result = service.predict_quality(payload)

        return jsonify({
            "status": "success",
            "result": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@app.route("/predict/quantity", methods=["POST"])
def predict_quantity():
    try:
        payload = request.get_json()

        if not payload:
            return jsonify({"error": "Empty request"}), 400

        result = service.predict_quantity(payload)

        return jsonify({
            "status": "success",
            "result": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@app.route("/yolo/detect", methods=["POST"])
def yolo_detect():
    """Run YOLO detection on uploaded image"""
    try:
        if 'image' not in request.files:
            return jsonify({
                "status": "error",
                "message": "No image file provided"
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                "status": "error",
                "message": "No image selected"
            }), 400
        
        # Save temporary file
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name
        
        try:
            # Run detection
            result = yolo_service.detect_olives(tmp_path)
            
            return jsonify({
                "status": "success",
                "timestamp": datetime.utcnow().isoformat(),
                "data": result
            })
        finally:
            # Clean up
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@app.route("/yolo/detect-base64", methods=["POST"])
def yolo_detect_base64():
    """Run YOLO detection on base64 encoded image"""
    try:
        payload = request.get_json()
        
        if not payload or 'image' not in payload:
            return jsonify({
                "status": "error",
                "message": "No image data provided"
            }), 400
        
        import base64
        import tempfile
        import os
        
        # Decode base64 image
        image_data = base64.b64decode(payload['image'])
        
        # Save temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            tmp.write(image_data)
            tmp_path = tmp.name
        
        try:
            # Run detection
            result = yolo_service.detect_olives(tmp_path)
            
            return jsonify({
                "status": "success",
                "timestamp": datetime.utcnow().isoformat(),
                "data": result
            })
        finally:
            # Clean up
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@app.route("/yolo/health", methods=["GET"])
def yolo_health():
    """Check YOLO service health"""
    return jsonify({
        "status": "healthy",
        "yolo_model_loaded": yolo_service.model is not None,
        "model_path": yolo_service.model_path,
        "timestamp": datetime.utcnow().isoformat()
    })



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)