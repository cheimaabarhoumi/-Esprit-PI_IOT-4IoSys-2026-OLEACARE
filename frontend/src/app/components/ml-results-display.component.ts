import { Component, Input, OnInit } from '@angular/core';
import { Detection, DetectionResult, PredictionResult } from '../services/oleacare-ml.service';

@Component({
  selector: 'app-ml-results-display',
  templateUrl: './ml-results-display.component.html',
  styleUrls: ['./ml-results-display.component.scss']
})
export class MLResultsDisplayComponent implements OnInit {
  @Input() detection: DetectionResult | null = null;
  @Input() prediction: PredictionResult | null = null;
  @Input() timestamp: string = '';

  detectionsByColor: { [key: string]: Detection[] } = {};
  detectionsByQuality: { [key: string]: Detection[] } = {};
  colorCounts: { color: string; count: number; percentage: number }[] = [];
  qualityCounts: { quality: string; count: number; percentage: number }[] = [];

  qualityColors: { [key: string]: string } = {
    'good': '#10b981',
    'medium': '#f59e0b',
    'bad': '#ef4444',
    'damaged': '#dc2626'
  };

  qualityLabels: { [key: string]: string } = {
    'good': 'Bonne qualité',
    'medium': 'Qualité moyenne',
    'bad': 'Mauvaise qualité',
    'damaged': 'Endommagée'
  };

  colorLabels: { [key: string]: string } = {
    'green': 'Vert',
    'yellowish-green': 'Jaune-vert',
    'violet': 'Violet',
    'purple': 'Mauve',
    'black': 'Noir',
    'red': 'Rouge',
    'brown': 'Marron'
  };

  constructor() {}

  ngOnInit(): void {
    if (this.detection) {
      this.processDetectionData();
    }
  }

  processDetectionData(): void {
    if (!this.detection) return;

    // Group by color
    this.detectionsByColor = {};
    this.detection.detections.forEach(det => {
      if (!this.detectionsByColor[det.color]) {
        this.detectionsByColor[det.color] = [];
      }
      this.detectionsByColor[det.color].push(det);
    });

    // Group by quality
    this.detectionsByQuality = {};
    this.detection.detections.forEach(det => {
      if (!this.detectionsByQuality[det.quality]) {
        this.detectionsByQuality[det.quality] = [];
      }
      this.detectionsByQuality[det.quality].push(det);
    });

    // Calculate color distribution
    this.colorCounts = Object.keys(this.detectionsByColor).map(color => ({
      color,
      count: this.detectionsByColor[color].length,
      percentage: (this.detectionsByColor[color].length / this.detection!.total_detected) * 100
    })).sort((a, b) => b.count - a.count);

    // Calculate quality distribution
    const stats = this.detection.statistics;
    this.qualityCounts = [
      { quality: 'good', count: stats.good_quality || 0, percentage: ((stats.good_quality || 0) / this.detection.total_detected) * 100 },
      { quality: 'medium', count: stats.medium_quality || 0, percentage: ((stats.medium_quality || 0) / this.detection.total_detected) * 100 },
      { quality: 'bad', count: stats.bad_quality || 0, percentage: ((stats.bad_quality || 0) / this.detection.total_detected) * 100 },
      { quality: 'damaged', count: stats.damaged || 0, percentage: ((stats.damaged || 0) / this.detection.total_detected) * 100 }
    ];
  }

  getQualityColor(quality: string): string {
    return this.qualityColors[quality] || '#6b7280';
  }

  getQualityLabel(quality: string): string {
    return this.qualityLabels[quality] || quality;
  }

  getColorLabel(color: string): string {
    return this.colorLabels[color] || color;
  }

  getDetectionsForQuality(quality: string): Detection[] {
    return this.detectionsByQuality[quality] || [];
  }

  getProgressBarWidth(percentage: number): string {
    return `${Math.min(percentage, 100)}%`;
  }

  isLightColor(color: string): boolean {
    // Map of colors to hex values
    const colorMap: { [key: string]: string } = {
      'green': '#10b981',
      'yellowish-green': '#fbbf24',
      'violet': '#a78bfa',
      'purple': '#a78bfa',
      'black': '#1f2937',
      'red': '#ef4444',
      'brown': '#92400e'
    };

    const hex = colorMap[color.toLowerCase()] || color;
    
    // Extract RGB values
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5;
  }
}
