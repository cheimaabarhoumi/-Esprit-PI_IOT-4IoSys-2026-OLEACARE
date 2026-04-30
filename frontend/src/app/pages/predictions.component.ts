import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { OleaCareMLService, DetectionResult, PredictionResult, SensorData } from '../services/oleacare-ml.service';
import { Prediction } from '../models';

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss']
})
export class PredictionsComponent implements OnInit {
  // Existing properties
  predictions: Prediction[] = [];
  terrainId: string | null = null;
  loading = true;
  error = '';
  livePrediction: any = null;
  currentPage = 0;
  pageSize = 10;
  total = 0;

  // ML Service properties
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  mlLoading = false;
  mlError = '';
  detectionResult: DetectionResult | null = null;
  predictionResult: PredictionResult | null = null;
  mlResultTimestamp: string = '';
  
  // Sensor data
  sensorData: SensorData = {
    temperature: 24.5,
    humidity: 65.0,
    soil_moisture: 45.0,
    light: 800,
    terrain_hectares: 1.5
  };

  apiConnected = false;
  showMLResults = false;

  displayedColumns: string[] = ['createdAt', 'quality_grade', 'maturity_index', 'quality_score', 'total_oil_liters', 'optimal_harvest_date'];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private mlService: OleaCareMLService
  ) { }

  ngOnInit(): void {
    this.terrainId = this.route.snapshot.paramMap.get('id');
    if (this.terrainId) {
      this.loadPredictions();
    }
    this.checkMLApiHealth();
  }

  // ML API Health Check
  checkMLApiHealth(): void {
    this.mlService.health().subscribe({
      next: () => {
        this.apiConnected = true;
        console.log('ML API connected');
      },
      error: (err) => {
        this.apiConnected = false;
        console.warn('ML API not available:', err);
      }
    });
  }

  // Image Upload Handler
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Predict and Detect
  predictAndDetect(): void {
    if (!this.selectedImage) {
      this.mlError = 'Veuillez sélectionner une image';
      return;
    }

    this.mlLoading = true;
    this.mlError = '';
    this.detectionResult = null;
    this.predictionResult = null;

    this.mlService.predictAndDetect(this.selectedImage, this.sensorData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.detectionResult = response.result.detection;
          this.predictionResult = response.result.prediction;
          this.mlResultTimestamp = response.result.timestamp;
          this.showMLResults = true;
        }
        this.mlLoading = false;
      },
      error: (err) => {
        this.mlError = err.message || 'Erreur lors de la détection';
        this.mlLoading = false;
      }
    });
  }

  // Detect Image Only
  detectImageOnly(): void {
    if (!this.selectedImage) {
      this.mlError = 'Veuillez sélectionner une image';
      return;
    }

    this.mlLoading = true;
    this.mlError = '';
    this.detectionResult = null;

    this.mlService.detectImage(this.selectedImage).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.detectionResult = response.result;
          this.predictionResult = null;
          this.mlResultTimestamp = new Date().toISOString();
          this.showMLResults = true;
        }
        this.mlLoading = false;
      },
      error: (err) => {
        this.mlError = err.message || 'Erreur lors de la détection';
        this.mlLoading = false;
      }
    });
  }

  // Predict Sensors Only
  predictSensorsOnly(): void {
    this.mlLoading = true;
    this.mlError = '';
    this.predictionResult = null;

    this.mlService.predictSensors(this.sensorData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.predictionResult = response.result;
          this.detectionResult = null;
          this.mlResultTimestamp = new Date().toISOString();
          this.showMLResults = true;
        }
        this.mlLoading = false;
      },
      error: (err) => {
        this.mlError = err.message || 'Erreur lors de la prédiction';
        this.mlLoading = false;
      }
    });
  }

  // Clear Results
  clearResults(): void {
    this.detectionResult = null;
    this.predictionResult = null;
    this.showMLResults = false;
    this.selectedImage = null;
    this.imagePreview = null;
    this.mlError = '';
  }

  runLivePrediction(): void {
    if (!this.terrainId) return;
    this.loading = true;
    this.error = '';

    const payload = {
      temperature: 25,
      humidity: 60,
      soil_moisture: 40,
      light: 800,
      terrain_hectares: 1.0,
      saison: 'Summer'
    };

    this.apiService.predictLive(payload).subscribe({
      next: (r) => {
        console.log("API RESPONSE =", r);

        this.livePrediction = r.data || r;

        console.log("LIVE PREDICTION =", this.livePrediction);
        this.loading = false;
      },
      error: (err) => {
        console.error("ERROR =", err);
        this.error = 'Failed to call ML service';
        this.loading = false;
      }
    });
  }

  loadPredictions(): void {
    if (!this.terrainId) return;

    this.loading = true;
    this.error = '';

    this.apiService.getAllPredictions(
      this.terrainId,
      this.currentPage * this.pageSize,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.predictions = response.data;
          this.total = response.pagination?.total || 0;
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load predictions';
        this.loading = false;
      }
    });
  }

  getQualityColor(grade: string): string {
    switch (grade) {
      case 'Extra_Vierge': return '#4a5d23';
      case 'Vierge': return '#86975e';
      case 'Lampante': return '#86975e';
      default: return '#f0efe8';
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPredictions();
  }
}
