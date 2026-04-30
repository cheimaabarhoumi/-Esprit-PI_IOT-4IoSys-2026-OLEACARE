import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { DialogService } from '../services/dialog.service';
import { Terrain, Kit, Alert } from '../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PredictionService } from '../services/prediction.service';

@Component({
  selector: 'app-farmer-dashboard',
  templateUrl: './farmer-dashboard.component.html',
  styleUrls: ['./farmer-dashboard.component.scss']
})
export class FarmerDashboardComponent implements OnInit, OnDestroy {
  terrains: Terrain[] = [];
  kits: Kit[] = [];
  alerts: Alert[] = [];
  recentAlerts: Alert[] = [];
  unreadAlertCount = 0;
  kitTerrainSelection: { [kitId: string]: string } = {};
  updatingKitId: string | null = null;
  loading = true;
  error = '';
  currentUser: any = null;
  predictions: any[] = [];
  latestPrediction: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router,
    private dialogService: DialogService,
    private snackBar: MatSnackBar,
    private predictionService: PredictionService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }



  ngOnInit(): void {
    this.loadData();
    this.connectSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.disconnect();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.apiService.getTerrains().toPromise(),
      this.apiService.getMyKits().toPromise(),
      this.apiService.getAlerts().toPromise(),
      this.apiService.getUnreadAlertCount().toPromise()
    ]).then(([terrainsResponse, kitsResponse, alertsResponse, countResponse]) => {
      if (terrainsResponse?.success && terrainsResponse.data) {
        this.terrains = terrainsResponse.data;
      }
      if (kitsResponse?.success && kitsResponse.data) {
        this.kits = kitsResponse.data;
        this.kits.forEach((kit) => {
          const kitId = this.getKitId(kit);
          const terrain: any = kit.terrainId as any;
          this.kitTerrainSelection[kitId] = terrain?._id || terrain?.id || '';
        });
      }
      if (alertsResponse?.success && alertsResponse.data) {
        this.alerts = alertsResponse.data;
        this.recentAlerts = this.alerts.slice(0, 3);
      }
      if (countResponse?.success && countResponse.data) {
        this.unreadAlertCount = countResponse.data.unreadCount;
      }
      this.loading = false;
    }).catch(error => {
      this.error = 'Failed to load data';
      this.loading = false;
      this.showError('Failed to load data');
    });
  }

  connectSocket(): void {
    this.socketService.connect();

    this.socketService.alert$
      .pipe(takeUntil(this.destroy$))
      .subscribe(alert => {
        if (alert) {
          this.alerts.unshift(alert);
          this.recentAlerts = this.alerts.slice(0, 3);
          this.unreadAlertCount++;
        }
      });
  }

  // Terrain Management
  async openCreateTerrainDialog(): Promise<void> {
    const result = await this.dialogService.openTerrainDialog();
    if (result) {
      try {
        const response = await this.apiService.createTerrain(result).toPromise();
        this.showSuccess('Terrain created successfully');
        this.loadData();
      } catch (error) {
        this.showError('Failed to create terrain');
      }
    }
  }

  async openEditTerrainDialog(terrain: Terrain): Promise<void> {
    const result = await this.dialogService.openTerrainDialog(terrain);
    if (result) {
      try {
        const response = await this.apiService.updateTerrain(terrain._id!, result).toPromise();
        this.showSuccess('Terrain updated successfully');
        this.loadData();
      } catch (error) {
        this.showError('Failed to update terrain');
      }
    }
  }

  async deleteTerrain(terrain: Terrain): Promise<void> {
    const confirmed = await this.dialogService.openDeleteConfirm(terrain.name);
    if (confirmed) {
      try {
        await this.apiService.deleteTerrain(terrain._id!).toPromise();
        this.showSuccess('Terrain deleted successfully');
        this.loadData();
      } catch (error) {
        this.showError('Failed to delete terrain');
      }
    }
  }

  viewTerrain(terrain: Terrain): void {
    this.router.navigate(['/farmer/terrain', terrain._id]);
  }

  getKitId(kit: Kit): string {
    return (kit._id || kit.id || '') as string;
  }

  async saveKitTerrainAssignment(kit: Kit): Promise<void> {
    const kitId = this.getKitId(kit);
    const terrainId = this.kitTerrainSelection[kitId];

    if (!kitId || !terrainId) {
      this.showError('Please select a terrain first');
      return;
    }

    this.updatingKitId = kitId;
    try {
      const response = await this.apiService.assignMyKitToTerrain(kitId, terrainId).toPromise();
      if (response?.success && response.data) {
        const updated = response.data;
        const index = this.kits.findIndex((current) => this.getKitId(current) === kitId);
        if (index >= 0) this.kits[index] = updated;
      }
      this.showSuccess('Kit assignment updated successfully');
    } catch (error: any) {
      this.showError(error?.error?.message || 'Failed to update kit assignment');
    } finally {
      this.updatingKitId = null;
    }
  }

  async unassignKitTerrain(kit: Kit): Promise<void> {
    const kitId = this.getKitId(kit);
    if (!kitId) return;

    this.updatingKitId = kitId;
    try {
      const response = await this.apiService.unassignMyKitFromTerrain(kitId).toPromise();
      if (response?.success && response.data) {
        const updated = response.data;
        const index = this.kits.findIndex((current) => this.getKitId(current) === kitId);
        if (index >= 0) this.kits[index] = updated;
      }
      this.kitTerrainSelection[kitId] = '';
      this.showSuccess('Kit unassigned from terrain');
    } catch (error: any) {
      this.showError(error?.error?.message || 'Failed to unassign kit');
    } finally {
      this.updatingKitId = null;
    }
  }

  getAssignedTerrainName(kit: Kit): string {
    const terrain: any = kit.terrainId as any;
    return terrain?.name || 'Not assigned to a terrain';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  markAlertAsRead(alert: Alert): void {
    if (!alert.read) {
      this.apiService.markAlertAsRead(alert._id).subscribe({
        next: () => {
          alert.read = true;
          this.unreadAlertCount--;
        }
      });
    }
  }

  markAllAlertsAsRead(): void {
    this.alerts.forEach(alert => {
      if (!alert.read) {
        this.apiService.markAlertAsRead(alert._id).subscribe();
      }
    });
    this.unreadAlertCount = 0;
  }

  navigateToAlerts(): void {
    this.router.navigate(['/farmer/alerts']);
  }

  navigateToPredictions(): void {
    this.router.navigate(['/farmer/predictions', this.terrains[0]._id || this.terrains[0].id]);
  }

  getTerrainArea(terrain: Terrain): number | null {
    return terrain.surface_hectares ?? terrain.area ?? null;
  }

  getTerrainLocation(terrain: Terrain): string {
    const latitude = terrain.location?.latitude ?? terrain.coordinates?.latitude;
    const longitude = terrain.location?.longitude ?? terrain.coordinates?.longitude;

    if (latitude === undefined || longitude === undefined) {
      return 'Location not set';
    }

    return `${latitude}, ${longitude}`;
  }

  getKitLastUpdate(kit: Kit): Date | null {
    return (kit.lastSeen as Date) || (kit.lastUpdate as Date) || (kit.createdAt as Date) || null;
  }

  getKitStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'in_stock': return 'accent';
      case 'offline': return 'warn';
      default: return 'primary';
    }
  }


  predictLive(data: any) {

    this.predictionService.predict(data).subscribe(res => {

      const prediction = res.data;

      this.latestPrediction = prediction;

      this.predictions.unshift(prediction);

    });

  }

  getAlertTypeIcon(type: string): string {
    switch (type) {
      case 'harvest': return 'local_offer';
      case 'weather': return 'cloud';
      case 'maintenance': return 'build';
      case 'alert': return 'warning';
      default: return 'info';
    }
  }


  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top' });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['error-snackbar'] });
  }
}
