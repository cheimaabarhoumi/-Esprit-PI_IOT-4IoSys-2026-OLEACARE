/**
 * OleaCare ML Service
 * Angular service for calling ML API endpoints
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface DetectionResult {
  status: string;
  total_detected: number;
  avg_confidence: number;
  dominant_color: string;
  detections: Detection[];
  statistics: QualityStats;
}

export interface Detection {
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    area: number;
  };
  color: string;
  quality: string;
  confidence: number;
}

export interface QualityStats {
  good_quality: number;
  medium_quality: number;
  bad_quality: number;
  damaged: number;
}

export interface PredictionResult {
  quality: number;
  quantity: number;
  integration_mode: string;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  light: number;
  terrain_hectares: number;
  nitrogen_N?: number;
  phosphorus_P?: number;
  potassium_K?: number;
  pH?: number;
  pressure_hpa?: number;
  season?: string;
}

export interface PredictAndDetectResult {
  detection: DetectionResult;
  prediction: PredictionResult;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class OleaCareMLService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  /**
   * Set custom API URL
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * Check API health
   */
  health(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * Predict quality/quantity from sensor data
   */
  predictSensors(sensorData: SensorData): Observable<any> {
    return this.http.post(`${this.apiUrl}/predict`, sensorData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Detect olives in image
   */
  detectImage(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post(`${this.apiUrl}/detect`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Complete pipeline: detect + predict
   */
  predictAndDetect(
    imageFile: File,
    sensorData: SensorData
  ): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);

    // Add sensor data to form
    Object.keys(sensorData).forEach((key) => {
      const value = sensorData[key as keyof SensorData];
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return this.http.post(
      `${this.apiUrl}/predict-and-detect`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Parse detection result and extract statistics
   */
  getDetectionSummary(result: DetectionResult): any {
    const total = result.total_detected;
    const stats = result.statistics;

    return {
      total,
      good: stats.good_quality,
      medium: stats.medium_quality,
      bad: stats.bad_quality,
      damaged: stats.damaged,
      goodPercent: total > 0 ? (stats.good_quality / total) * 100 : 0,
      mediumPercent: total > 0 ? (stats.medium_quality / total) * 100 : 0,
      badPercent: total > 0 ? (stats.bad_quality / total) * 100 : 0,
      damagedPercent: total > 0 ? (stats.damaged / total) * 100 : 0,
      avgConfidence: result.avg_confidence,
      dominantColor: result.dominant_color,
    };
  }

  /**
   * Group detections by color
   */
  getDetectionsByColor(detections: Detection[]): Map<string, Detection[]> {
    const byColor = new Map<string, Detection[]>();

    detections.forEach((det) => {
      if (!byColor.has(det.color)) {
        byColor.set(det.color, []);
      }
      byColor.get(det.color)!.push(det);
    });

    return byColor;
  }

  /**
   * Group detections by quality
   */
  getDetectionsByQuality(detections: Detection[]): Map<string, Detection[]> {
    const byQuality = new Map<string, Detection[]>();

    detections.forEach((det) => {
      if (!byQuality.has(det.quality)) {
        byQuality.set(det.quality, []);
      }
      byQuality.get(det.quality)!.push(det);
    });

    return byQuality;
  }

  /**
   * Get color RGB for visualization
   */
  getColorRGB(colorName: string): string {
    const colors: { [key: string]: string } = {
      green: 'rgb(76, 153, 35)',
      'yellowish-green': 'rgb(212, 175, 55)',
      violet: 'rgb(107, 76, 154)',
      purple: 'rgb(107, 76, 154)',
      black: 'rgb(26, 26, 26)',
      red: 'rgb(196, 85, 85)',
      brown: 'rgb(139, 69, 19)',
    };

    return colors[colorName] || 'rgb(200, 200, 200)';
  }

  /**
   * Get quality badge color
   */
  getQualityColor(quality: string): string {
    const colors: { [key: string]: string } = {
      good: 'success',
      medium: 'warning',
      bad: 'danger',
      damaged: 'danger',
    };
    return colors[quality] || 'secondary';
  }

  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
