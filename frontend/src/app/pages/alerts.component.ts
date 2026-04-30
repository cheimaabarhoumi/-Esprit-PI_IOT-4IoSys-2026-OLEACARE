import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Alert } from '../models';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  alerts: Alert[] = [];
  loading = true;
  error = '';
  currentPage = 0;
  pageSize = 10;
  total = 0;

  // Terrain and kit names cache for better performance
  private terrainNames: { [key: string]: string } = {};

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getAlerts(
      this.currentPage * this.pageSize,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.alerts = response.data;
          this.total = response.pagination?.total || 0;
          // Cache terrain and kit names
          this.cacheNames();
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les alertes. Vérifiez votre connexion.';
        this.loading = false;
      }
    });
  }

  private cacheNames(): void {
    // Extract unique terrain IDs
    const terrainIds = [...new Set(this.alerts.map(a => a.terrainId).filter(id => id))];

    // In a real implementation, you would fetch terrain names from the API
    // For now, we'll use placeholder names
    terrainIds.forEach(id => {
      this.terrainNames[id] = `Terrain ${id.substring(0, 8)}`;
    });
  }

  getAlertTypeIcon(type: string): string {
    switch (type) {
      case 'harvest': return 'local_offer';
      case 'battery': return 'battery_alert';
      case 'offline': return 'cloud_off';
      case 'soil': return 'water_drop';
      default: return 'notifications';
    }
  }

  getAlertTypeColor(type: string): string {
    switch (type) {
      case 'harvest': return 'accent';
      case 'battery': return 'warn';
      case 'offline': return 'warn';
      case 'soil': return 'primary';
      default: return 'primary';
    }
  }

  getAlertTypeColorHex(type: string): string {
    switch (type) {
      case 'harvest': return '#5c7d3f';
      case 'battery': return '#a73f23';
      case 'offline': return '#8b4513';
      case 'soil': return '#6b7a58';
      case 'weather': return '#7b8e53';
      case 'maintenance': return '#4d6d2d';
      case 'alert': return '#2c3c24';
      default: return '#4d6d2d';
    }
  }

  getAlertTitle(alert: Alert): string {
    switch (alert.type) {
      case 'harvest': return 'Récolte recommandée';
      case 'battery': return 'Batterie faible';
      case 'offline': return 'Équipement hors ligne';
      case 'soil': return 'Problème d\'humidité du sol';
      case 'weather': return 'Conditions météorologiques';
      case 'maintenance': return 'Maintenance requise';
      case 'alert': return 'Alerte générale';
      default: return alert.type || 'Alerte';
    }
  }

  getAlertPriorityClass(alert: Alert): string {
    if (this.isUrgentAlert(alert)) {
      return 'priority-urgent';
    }
    return alert.read ? 'priority-read' : 'priority-unread';
  }

  getAlertPriorityText(alert: Alert): string {
    if (this.isUrgentAlert(alert)) {
      return 'Urgent';
    }
    return alert.read ? 'Lu' : 'Non lu';
  }

  isUrgentAlert(alert: Alert): boolean {
    return alert.type === 'offline' || alert.type === 'battery';
  }

  getAlertCardClasses(alert: Alert): { [key: string]: boolean } {
    return {
      'unread': !alert.read,
      'urgent': this.isUrgentAlert(alert)
    };
  }

  toggleReadStatus(alert: Alert): void {
    const newReadStatus = !alert.read;
    this.apiService.markAlertAsRead(alert._id).subscribe({
      next: () => {
        alert.read = newReadStatus;
      },
      error: () => {
        // Revert on error
        alert.read = !newReadStatus;
      }
    });
  }

  markAsRead(alert: Alert): void {
    if (!alert.read) {
      this.toggleReadStatus(alert);
    }
  }

  dismissAlert(alert: Alert): void {
    // In a real implementation, you might want to mark as dismissed
    // For now, just mark as read
    this.markAsRead(alert);
  }

  viewTerrain(terrainId: string): void {
    this.router.navigate(['/farmer/terrain', terrainId]);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAlerts();
  }

  trackByAlertId(index: number, alert: Alert): string {
    return alert._id;
  }

  // Filter methods (to be implemented)
  applyFilters(): void {
    // TODO: Implement filtering logic
    this.loadAlerts();
  }

  clearFilters(): void {
    // TODO: Clear all filters
    this.loadAlerts();
  }

  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.read).length;
  }

  getTerrainName(terrainId: string): string {
    return this.terrainNames[terrainId] || `Terrain ${terrainId?.substring(0, 8) || 'Inconnu'}`;
  }
}
