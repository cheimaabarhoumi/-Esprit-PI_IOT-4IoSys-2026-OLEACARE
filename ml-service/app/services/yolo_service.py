"""
YOLO Service for Olive Detection and Classification
Detects olives in images using YOLOv8 and classifies them by color and quality
"""

import os
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any
import logging

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

logger = logging.getLogger(__name__)


class YoloService:
    """Service for YOLO-based olive detection and classification"""
    
    def __init__(self):
        """Initialize YOLO service with model"""
        self.model = None
        self.model_path = None
        self.initialize_model()
        
        # Color and quality definitions
        self.olive_colors = {
            'green': (76, 153, 35),
            'yellowish-green': (212, 175, 55),
            'violet': (107, 76, 154),
            'purple': (107, 76, 154),
            'black': (26, 26, 26),
            'red': (196, 85, 85),
            'brown': (139, 69, 19),
        }
        
        self.quality_grades = ['good', 'medium', 'bad', 'damaged']
        
    def initialize_model(self) -> bool:
        """Initialize YOLO model"""
        try:
            if YOLO is None:
                logger.warning("YOLO not installed. Install with: pip install ultralytics")
                return False
                
            # Try to load best model
            model_dir = Path(__file__).parent.parent.parent / 'models' / 'yolo'
            best_model = model_dir / 'best.pt'
            
            if best_model.exists():
                self.model = YOLO(str(best_model))
                self.model_path = str(best_model)
                logger.info(f"YOLO model loaded from {best_model}")
                return True
            else:
                logger.warning(f"Best model not found at {best_model}. Using YOLOv8n (nano) pretrained model.")
                self.model = YOLO('yolov8n.pt')
                logger.info("Using YOLOv8n pretrained model")
                return True
                
        except Exception as e:
            logger.error(f"Error initializing YOLO model: {str(e)}")
            return False
    
    def detect_olives(self, image_path: str) -> Dict[str, Any]:
        """
        Detect olives in an image using YOLO
        
        Args:
            image_path: Path to input image
            
        Returns:
            Dictionary with detection results
        """
        if self.model is None:
            return {
                'status': 'error',
                'message': 'YOLO model not initialized',
                'total_detected': 0,
                'detections': []
            }
        
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                return {
                    'status': 'error',
                    'message': f'Could not read image: {image_path}',
                    'total_detected': 0,
                    'detections': []
                }
            
            # Run YOLO detection
            results = self.model(image, verbose=False)
            
            detections = []
            total_detected = 0
            total_confidence = 0.0
            
            # Process each detection
            for r in results:
                boxes = r.boxes
                
                for box in boxes:
                    total_detected += 1
                    
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf[0].cpu().numpy())
                    
                    # Extract olive region
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    olive_region = image[y1:y2, x1:x2]
                    
                    # Classify color and quality
                    color = self._classify_color(olive_region)
                    quality = self._classify_quality(olive_region, confidence)
                    
                    total_confidence += confidence
                    
                    detections.append({
                        'bbox': {
                            'x1': x1,
                            'y1': y1,
                            'x2': x2,
                            'y2': y2,
                            'width': x2 - x1,
                            'height': y2 - y1,
                            'area': (x2 - x1) * (y2 - y1)
                        },
                        'color': color,
                        'quality': quality,
                        'confidence': confidence
                    })
            
            # Calculate statistics
            avg_confidence = (total_confidence / total_detected * 100) if total_detected > 0 else 0
            dominant_color = self._get_dominant_color(detections) if detections else 'unknown'
            
            # Save detection image
            output_image_path = None
            try:
                output_image = self._draw_detections(image, detections)
                output_dir = Path(image_path).parent / 'detections'
                output_dir.mkdir(exist_ok=True)
                output_image_path = str(output_dir / f'detection_{Path(image_path).stem}.jpg')
                cv2.imwrite(output_image_path, output_image)
            except Exception as e:
                logger.warning(f"Could not save detection image: {str(e)}")
            
            return {
                'status': 'success',
                'timestamp': str(np.datetime64('now')),
                'image_path': image_path,
                'output_image_url': output_image_path,
                'total_detected': total_detected,
                'avg_confidence': avg_confidence / 100.0 if avg_confidence > 0 else 0.0,
                'dominant_color': dominant_color,
                'detections': detections,
                'statistics': {
                    'good_quality': len([d for d in detections if d['quality'] == 'good']),
                    'medium_quality': len([d for d in detections if d['quality'] == 'medium']),
                    'bad_quality': len([d for d in detections if d['quality'] == 'bad']),
                    'damaged': len([d for d in detections if d['quality'] == 'damaged']),
                }
            }
            
        except Exception as e:
            logger.error(f"Error during YOLO detection: {str(e)}")
            return {
                'status': 'error',
                'message': f'Detection error: {str(e)}',
                'total_detected': 0,
                'detections': []
            }
    
    def _classify_color(self, region: np.ndarray) -> str:
        """Classify olive color from image region"""
        try:
            # Convert BGR to HSV
            hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
            
            # Calculate average color
            avg_color = np.mean(hsv, axis=(0, 1))
            h, s, v = avg_color
            
            # Classify based on HSV
            # Hue: 0-10 (red), 10-25 (orange), 25-35 (yellow), 35-80 (green), 80-130 (cyan), 
            #      130-170 (blue), 170-180 (red again)
            
            if h < 10 or h > 170:
                return 'red'
            elif 10 <= h < 25:
                return 'brown'
            elif 25 <= h < 40:
                if s > 150:
                    return 'yellowish-green'
                else:
                    return 'yellow'
            elif 40 <= h < 80:
                return 'green'
            elif 80 <= h < 130:
                return 'cyan'
            elif 130 <= h < 170:
                if h > 150:
                    return 'purple'
                else:
                    return 'blue'
            else:
                # If very low saturation and value, likely black
                if s < 50 and v < 100:
                    return 'black'
                else:
                    return 'green'
                    
        except Exception as e:
            logger.warning(f"Error classifying color: {str(e)}")
            return 'unknown'
    
    def _classify_quality(self, region: np.ndarray, confidence: float) -> str:
        """Classify olive quality based on visual features"""
        try:
            # Check for defects using edge detection
            gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            
            # Check for damage/spots using morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            morph = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
            spots = cv2.absdiff(gray, morph)
            spot_density = np.sum(spots > 50) / spots.size
            
            # Analyze color uniformity
            hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
            h_std = np.std(hsv[:, :, 0])
            
            # Classify based on features
            if confidence > 0.9 and spot_density < 0.05 and h_std < 20:
                return 'good'
            elif confidence > 0.7 and spot_density < 0.15:
                return 'medium'
            elif spot_density > 0.2 or h_std > 40:
                return 'damaged'
            else:
                return 'bad'
                
        except Exception as e:
            logger.warning(f"Error classifying quality: {str(e)}")
            # Default classification based on confidence
            if confidence > 0.85:
                return 'good'
            elif confidence > 0.7:
                return 'medium'
            else:
                return 'bad'
    
    def _get_dominant_color(self, detections: List[Dict]) -> str:
        """Get the most common color among detected olives"""
        if not detections:
            return 'unknown'
        
        colors = [d['color'] for d in detections]
        color_counts = {}
        for color in colors:
            color_counts[color] = color_counts.get(color, 0) + 1
        
        return max(color_counts, key=color_counts.get)
    
    def _draw_detections(self, image: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """Draw detection boxes and labels on image"""
        output = image.copy()
        
        for detection in detections:
            bbox = detection['bbox']
            color_name = detection['color']
            quality = detection['quality']
            confidence = detection['confidence']
            
            # Get color for drawing (BGR format)
            draw_color = self.olive_colors.get(color_name, (0, 255, 0))
            
            # Draw bounding box
            cv2.rectangle(
                output,
                (bbox['x1'], bbox['y1']),
                (bbox['x2'], bbox['y2']),
                draw_color,
                2
            )
            
            # Draw label
            label = f"{color_name} ({quality}) {confidence:.2f}"
            cv2.putText(
                output,
                label,
                (bbox['x1'], bbox['y1'] - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                draw_color,
                2
            )
        
        return output
    
    def batch_detect(self, image_paths: List[str]) -> List[Dict[str, Any]]:
        """Detect olives in multiple images"""
        results = []
        for image_path in image_paths:
            result = self.detect_olives(image_path)
            results.append(result)
        return results


# Singleton instance
_yolo_service = None

def get_yolo_service() -> YoloService:
    """Get or create YOLO service instance"""
    global _yolo_service
    if _yolo_service is None:
        _yolo_service = YoloService()
    return _yolo_service
