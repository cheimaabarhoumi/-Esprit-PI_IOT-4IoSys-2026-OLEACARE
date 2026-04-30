import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { Terrain, SensorReading, Prediction } from '../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-terrain-details',
  templateUrl: './terrain-details.component.html',
  styleUrls: ['./terrain-details.component.scss']
})
export class TerrainDetailsComponent implements OnInit, OnDestroy {
  terrain: Terrain | null = null;
  sensorData: SensorReading[] = [];
  latestPrediction: Prediction | null = null;
  yoloDetection: any = null;
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  temperatureChartConfig: ChartConfiguration<'line'> | null = null;
  humidityChartConfig: ChartConfiguration<'line'> | null = null;
  soilMoistureChartConfig: ChartConfiguration<'line'> | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    const terrainId = this.route.snapshot.paramMap.get('id');
    if (terrainId) {
      this.loadTerrainData(terrainId);
      this.connectSocket(terrainId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTerrainData(terrainId: string): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.apiService.getLatestSensorData(terrainId).toPromise(),
      this.apiService.getLatestPrediction(terrainId).toPromise()
    ]).then(([sensorResponse, predictionResponse]) => {
      if (sensorResponse?.success && sensorResponse.data) {
        this.sensorData = sensorResponse.data;
        this.updateCharts();
      }
      if (predictionResponse?.success && predictionResponse.data) {
        this.latestPrediction = predictionResponse.data;
      }
      this.loading = false;
    }).catch(error => {
      this.error = 'Failed to load terrain data';
      this.loading = false;
    });
  }

  connectSocket(terrainId: string): void {
    this.socketService.connect();
    this.socketService.joinTerrain(terrainId);

    this.socketService.sensorData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.sensorData.push(data);
          if (this.sensorData.length > 50) {
            this.sensorData.shift();
          }
          this.updateCharts();
        }
      });

    this.socketService.prediction$
      .pipe(takeUntil(this.destroy$))
      .subscribe(prediction => {
        if (prediction) {
          this.latestPrediction = prediction;
        }
      });
  }

  updateCharts(): void {
    if (this.sensorData.length === 0) return;

    const timestamps = this.sensorData.map(d => 
      new Date(d.timestamp).toLocaleTimeString()
    );
    const temperatures = this.sensorData.map(d => d.temperature);
    const humidities = this.sensorData.map(d => d.humidity_air);
    const soilMoistures = this.sensorData.map(d => d.soil_moisture);

    this.temperatureChartConfig = {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }]
      }
    } as ChartConfiguration<'line'>;

    this.humidityChartConfig = {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'Humidity (%)',
          data: humidities,
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        }]
      }
    } as ChartConfiguration<'line'>;

    this.soilMoistureChartConfig = {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'Soil Moisture (%)',
          data: soilMoistures,
          borderColor: 'rgb(75, 192, 75)',
          tension: 0.1
        }]
      }
    } as ChartConfiguration<'line'>;
  }

  generatePrediction(terrainId: string): void {
    this.apiService.generatePrediction(terrainId).subscribe({
      next: (response) => {
        if (response.success) {
          this.latestPrediction = response.data || null;
        }
      },
      error: () => {
        this.error = 'Failed to generate prediction';
      }
    });
  }

  runYoloDetection(): void {
    if (!this.terrain?._id) return;
    this.loading = true;
    this.error = '';

    // Mock YOLO detection data - Replace with actual API call when backend is ready
    this.apiService.runYoloDetection(this.terrain._id).subscribe({
      next: (response) => {
        if (response.success || response.data) {
          this.yoloDetection = response.data || response;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('YOLO detection error:', err);
        this.error = 'Failed to run YOLO detection';
        this.loading = false;
      }
    });
  }

  getHarvestRecommendation(): string {
    if (!this.latestPrediction) return 'No prediction available';

    const maturity = this.latestPrediction.maturity_index;
    if (maturity >= 0.85) return 'Ready for harvest';
    if (maturity >= 0.7) return 'Will be ready in 1-2 weeks';
    return 'Not ready yet (2-3 weeks)';
  }

  getQualityColor(quality: string | undefined): string {
    if (!quality) return 'accent';
    switch(quality.toLowerCase()) {
      case 'good': return 'primary';
      case 'medium': return 'accent';
      case 'bad':
      case 'damaged': return 'warn';
      default: return 'accent';
    }
  }

  getColorCode(color: string | undefined): string {
    if (!color) return '#e0e0e0';
    switch(color.toLowerCase()) {
      case 'green': return '#4a7c23';
      case 'violet':
      case 'purple': return '#6b4c9a';
      case 'black': return '#1a1a1a';
      case 'yellow':
      case 'yellowish-green': return '#d4af37';
      case 'red': return '#c45555';
      default: return '#e0e0e0';
    }
  }

  getQualityGradeColor(qualityGrade: string | undefined): string {
    if (!qualityGrade) return '#f0efe8';
    switch(qualityGrade) {
      case 'Extra_Vierge': return '#4a5d23';
      case 'Vierge': return '#86975e';
      case 'Lampante': return '#86975e';
      default: return '#f0efe8';
    }
  }
}
