/**
 * OleaCare Detection Component
 * Example component for using ML API in frontend
 */

import { Component, OnInit } from '@angular/core';
import { OleaCareMLService, SensorData } from '@app/services/oleacare-ml.service';

@Component({
  selector: 'app-oleacare-detection',
  templateUrl: './oleacare-detection.component.html',
  styleUrls: ['./oleacare-detection.component.scss']
})
export class OleaCareDetectionComponent implements OnInit {
  
  // File upload
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Loading state
  loading = false;
  apiConnected = false;

  // Results
  detectionResult: any = null;
  predictionResult: any = null;
  summary: any = null;

  // Sensor data form
  sensorData: SensorData = {
    temperature: 24.5,
    humidity: 65.0,
    soil_moisture: 45.0,
    light: 800,
    terrain_hectares: 1.5,
    nitrogen_N: 40,
    phosphorus_P: 20,
    potassium_K: 30,
    pH: 7,
    pressure_hpa: 1013,
    season: 'summer'
  };

  // Color mapping
  qualityColors = {
    good: '#27AE60',
    medium: '#F39C12',
    bad: '#E67E22',
    damaged: '#E74C3C'
  };

  constructor(private mlService: OleaCareMLService) {}

  ngOnInit(): void {
    this.checkApiHealth();
  }

  /**
   * Check if API is running
   */
  checkApiHealth(): void {
    this.mlService.health().subscribe(
      (response) => {
        this.apiConnected = true;
        console.log('✅ ML API connected:', response);
      },
      (error) => {
        this.apiConnected = false;
        console.error('❌ ML API not available:', error);
      }
    );
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Predict from sensors only
   */
  predictSensors(): void {
    if (!this.apiConnected) {
      alert('API not connected');
      return;
    }

    this.loading = true;
    this.mlService.predictSensors(this.sensorData).subscribe(
      (response) => {
        this.predictionResult = response.result;
        this.loading = false;
        console.log('Prediction:', this.predictionResult);
      },
      (error) => {
        this.loading = false;
        console.error('Prediction error:', error);
        alert('Prediction failed: ' + error.message);
      }
    );
  }

  /**
   * Detect olives in image
   */
  detectImage(): void {
    if (!this.selectedFile) {
      alert('Please select an image');
      return;
    }

    if (!this.apiConnected) {
      alert('API not connected');
      return;
    }

    this.loading = true;
    this.mlService.detectImage(this.selectedFile).subscribe(
      (response) => {
        this.detectionResult = response.result;
        this.summary = this.mlService.getDetectionSummary(
          this.detectionResult
        );
        this.loading = false;
        console.log('Detection:', this.detectionResult);
      },
      (error) => {
        this.loading = false;
        console.error('Detection error:', error);
        alert('Detection failed: ' + error.message);
      }
    );
  }

  /**
   * Full pipeline: detect + predict
   */
  predictAndDetect(): void {
    if (!this.selectedFile) {
      alert('Please select an image');
      return;
    }

    if (!this.apiConnected) {
      alert('API not connected');
      return;
    }

    this.loading = true;
    this.mlService.predictAndDetect(this.selectedFile, this.sensorData).subscribe(
      (response) => {
        const result = response.result;
        this.detectionResult = result.detection;
        this.predictionResult = result.prediction;
        this.summary = this.mlService.getDetectionSummary(
          this.detectionResult
        );
        this.loading = false;
        console.log('Complete result:', result);
      },
      (error) => {
        this.loading = false;
        console.error('Error:', error);
        alert('Operation failed: ' + error.message);
      }
    );
  }

  /**
   * Download detection image
   */
  downloadDetectionImage(): void {
    if (this.detectionResult?.output_image_url) {
      const link = document.createElement('a');
      link.href = this.detectionResult.output_image_url;
      link.download = 'detection_result.jpg';
      link.click();
    }
  }

  /**
   * Get quality percentage bar width
   */
  getProgressBarWidth(value: number): string {
    return `${Math.min(value, 100)}%`;
  }

  /**
   * Get quality badge color
   */
  getQualityBadgeClass(quality: string): string {
    const mapping: { [key: string]: string } = {
      good: 'badge-success',
      medium: 'badge-warning',
      bad: 'badge-danger',
      damaged: 'badge-danger'
    };
    return mapping[quality] || 'badge-secondary';
  }
}
