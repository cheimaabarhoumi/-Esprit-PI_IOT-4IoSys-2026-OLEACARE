import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Terrain, Prediction, SensorReading } from '../models';
import { ChartConfiguration } from 'chart.js';

interface TerrainInsight {
  terrain: Terrain;
  prediction: Prediction | null;
  latestSensor: SensorReading | null;
  recommendations: string[];
}

@Component({
  selector: 'app-farmer-overview',
  templateUrl: './farmer-overview.component.html',
  styleUrls: ['./farmer-overview.component.scss']
})
export class FarmerOverviewComponent implements OnInit {
  loading = true;
  error = '';
  terrains: Terrain[] = [];
  insights: TerrainInsight[] = [];
  isUsingMockData = false;

  qualityChartConfig: ChartConfiguration<'bar'> | null = null;
  quantityChartConfig: ChartConfiguration<'bar'> | null = null;
  maturityChartConfig: ChartConfiguration<'line'> | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.isUsingMockData = false;

    try {
      const terrainsResponse = await this.apiService.getTerrains().toPromise();
      this.terrains = terrainsResponse?.data || [];

      const insightPromises = this.terrains.map(async (terrain) => {
        const terrainId = this.getTerrainId(terrain);

        let prediction: Prediction | null = null;
        let latestSensor: SensorReading | null = null;

        try {
          const predictionResponse = await this.apiService.getLatestPrediction(terrainId).toPromise();
          prediction = predictionResponse?.data || null;
        } catch {
          prediction = null;
        }

        try {
          const sensorResponse = await this.apiService.getLatestSensorData(terrainId).toPromise();
          const readings = sensorResponse?.data || [];
          latestSensor = readings.length ? readings[readings.length - 1] : null;
        } catch {
          latestSensor = null;
        }

        return {
          terrain,
          prediction,
          latestSensor,
          recommendations: this.buildRecommendations(prediction, latestSensor)
        } as TerrainInsight;
      });

      this.insights = await Promise.all(insightPromises);

      const hasUsableData = this.insights.some((item) => item.prediction || item.latestSensor);
      if (!this.insights.length || !hasUsableData) {
        this.applyMockData();
      }

      this.updateCharts();
      this.loading = false;
    } catch {
      this.applyMockData();
      this.error = 'Données réelles indisponibles, affichage des données de démo.';
      this.updateCharts();
      this.loading = false;
    }
  }

  loadMockData(): void {
    this.error = '';
    this.applyMockData();
    this.updateCharts();
  }

  getTerrainId(terrain: Terrain): string {
    return (terrain._id || terrain.id || '') as string;
  }

  getPredictionsCount(): number {
    return this.insights.filter((item) => !!item.prediction).length;
  }

  getAverageQualityScore(): string {
    const scores = this.insights
      .map((item) => item.prediction?.quality_score)
      .filter((score): score is number => score !== undefined);

    if (!scores.length) return 'N/A';
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return avg.toFixed(1);
  }

  getBestHarvestInsight(): TerrainInsight | null {
    const valid = this.insights.filter((item) => item.prediction?.maturity_index !== undefined);
    if (!valid.length) return null;

    return valid.sort((a, b) => (b.prediction!.maturity_index - a.prediction!.maturity_index))[0];
  }

  getHarvestReadiness(prediction: Prediction | null): string {
    if (!prediction) return 'Pas de prédiction';

    if (prediction.maturity_index >= 0.85) return 'Prêt à récolter';
    if (prediction.maturity_index >= 0.7) return 'Récolte proche';
    return 'Pas encore prêt';
  }

  private buildRecommendations(prediction: Prediction | null, sensor: SensorReading | null): string[] {
    const recommendations: string[] = [];

    if (!prediction && !sensor) {
      recommendations.push('Collecter plus de données capteurs pour générer des recommandations.');
      return recommendations;
    }

    if (sensor) {
      if (sensor.soil_moisture < 30) {
        recommendations.push('Humidité du sol faible : prévoir une irrigation légère.');
      } else if (sensor.soil_moisture > 65) {
        recommendations.push('Humidité du sol élevée : surveiller le drainage.');
      }

      if (sensor.temperature > 34) {
        recommendations.push('Température élevée : augmenter la fréquence de surveillance.');
      }
    }

    if (prediction) {
      if (prediction.maturity_index >= 0.85) {
        recommendations.push('Planifier la récolte rapidement pour préserver la qualité.');
      } else {
        recommendations.push('Suivre les capteurs quotidiennement jusqu’à la fenêtre optimale.');
      }

      if (prediction.quality_grade === 'Lampante') {
        recommendations.push('Qualité faible prévue : ajuster irrigation et calendrier de récolte.');
      }
    }

    if (!recommendations.length) {
      recommendations.push('Conditions stables : maintenir la stratégie actuelle.');
    }

    return recommendations;
  }

  private updateCharts(): void {
    const labels = this.insights.map((item) => item.terrain.name);
    const qualityData = this.insights.map((item) => item.prediction?.quality_score || 0);
    const quantityData = this.insights.map((item) => item.prediction?.total_oil_liters || 0);
    const maturityData = this.insights.map((item) => (item.prediction?.maturity_index || 0) * 100);

    const palette = ['rgba(33, 150, 243, 0.85)', 'rgba(76, 175, 80, 0.85)', 'rgba(255, 193, 7, 0.85)', 'rgba(102, 126, 234, 0.85)'];
    const borderPalette = ['rgba(30, 100, 200, 1)', 'rgba(56, 142, 60, 1)', 'rgba(214, 143, 0, 1)', 'rgba(76, 108, 224, 1)'];

    this.qualityChartConfig = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Score qualité (/10)',
          data: qualityData,
          backgroundColor: labels.map((_, index) => palette[index % palette.length]),
          borderColor: labels.map((_, index) => borderPalette[index % borderPalette.length]),
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#ffffff',
            bodyColor: '#d1d5db'
          }
        },
        scales: {
          x: {
            ticks: { color: '#475569', font: { size: 12 } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#475569', font: { size: 12 } },
            grid: { color: 'rgba(148, 163, 184, 0.18)' }
          }
        }
      }
    };

    this.quantityChartConfig = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantité estimée (L)',
          data: quantityData,
          backgroundColor: labels.map((_, index) => palette[(index + 1) % palette.length]),
          borderColor: labels.map((_, index) => borderPalette[(index + 1) % borderPalette.length]),
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#ffffff',
            bodyColor: '#d1d5db'
          }
        },
        scales: {
          x: {
            ticks: { color: '#475569', font: { size: 12 } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#475569', font: { size: 12 } },
            grid: { color: 'rgba(148, 163, 184, 0.18)' }
          }
        }
      }
    };

    this.maturityChartConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Maturité (%)',
          data: maturityData,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.18)',
          tension: 0.25,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#ffffff',
            bodyColor: '#d1d5db'
          }
        },
        scales: {
          x: {
            ticks: { color: '#475569', font: { size: 12 } },
            grid: { color: 'rgba(148, 163, 184, 0.18)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#475569', font: { size: 12 } },
            grid: { color: 'rgba(148, 163, 184, 0.18)' }
          }
        }
      }
    };
  }

  private applyMockData(): void {
    const now = new Date();

    const mockTerrains: Terrain[] = [
      {
        _id: 'mock-terrain-1',
        name: 'Terrain Nord',
        variety: 'Chemlali',
        surface_hectares: 4.5,
        location: { latitude: 36.81, longitude: 10.17 },
      },
      {
        _id: 'mock-terrain-2',
        name: 'Terrain Sud',
        variety: 'Koroneiki',
        surface_hectares: 6.2,
        location: { latitude: 36.75, longitude: 10.24 },
      },
      {
        _id: 'mock-terrain-3',
        name: 'Terrain Ouest',
        variety: 'Arbequina',
        surface_hectares: 3.1,
        location: { latitude: 36.69, longitude: 10.09 },
      },
    ];

    const mockPredictions: Prediction[] = [
      {
        _id: 'mock-pred-1',
        terrainId: 'mock-terrain-1',
        userId: 'mock-user',
        maturity_index: 0.88,
        quality_grade: 'Extra_Vierge',
        quality_score: 8.9,
        acidity: 0.34,
        total_oil_liters: 520,
        oil_value_TND: 6240,
        optimal_harvest_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        confidence: 91,
        createdAt: now,
      },
      {
        _id: 'mock-pred-2',
        terrainId: 'mock-terrain-2',
        userId: 'mock-user',
        maturity_index: 0.73,
        quality_grade: 'Vierge',
        quality_score: 7.4,
        acidity: 0.62,
        total_oil_liters: 610,
        oil_value_TND: 7015,
        optimal_harvest_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12),
        confidence: 84,
        createdAt: now,
      },
      {
        _id: 'mock-pred-3',
        terrainId: 'mock-terrain-3',
        userId: 'mock-user',
        maturity_index: 0.61,
        quality_grade: 'Lampante',
        quality_score: 6.2,
        acidity: 1.72,
        total_oil_liters: 280,
        oil_value_TND: 3020,
        optimal_harvest_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18),
        confidence: 79,
        createdAt: now,
      },
    ];

    const mockSensors: SensorReading[] = [
      {
        _id: 'mock-sensor-1',
        kitId: 'KIT-001',
        terrainId: 'mock-terrain-1',
        timestamp: now,
        temperature: 29.3,
        humidity_air: 61,
        soil_moisture: 42,
        light: 820,
      },
      {
        _id: 'mock-sensor-2',
        kitId: 'KIT-002',
        terrainId: 'mock-terrain-2',
        timestamp: now,
        temperature: 33.1,
        humidity_air: 54,
        soil_moisture: 29,
        light: 860,
      },
      {
        _id: 'mock-sensor-3',
        kitId: 'KIT-003',
        terrainId: 'mock-terrain-3',
        timestamp: now,
        temperature: 27.6,
        humidity_air: 68,
        soil_moisture: 67,
        light: 760,
      },
    ];

    this.terrains = mockTerrains;
    this.insights = mockTerrains.map((terrain) => {
      const prediction = mockPredictions.find((item) => item.terrainId === terrain._id) || null;
      const latestSensor = mockSensors.find((item) => item.terrainId === terrain._id) || null;
      return {
        terrain,
        prediction,
        latestSensor,
        recommendations: this.buildRecommendations(prediction, latestSensor),
      };
    });

    this.isUsingMockData = true;
  }
}
