import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../services/api.service';
import { AssignKitDialogComponent } from '../dialogs/assign-kit-dialog.component';
import { Kit, User } from '../models';

@Component({
  selector: 'app-admin-assign',
  templateUrl: './admin-assign.component.html',
  styleUrls: ['./admin-assign.component.scss']
})
export class AdminAssignComponent implements OnInit {
  kits: Kit[] = [];
  users: User[] = [];
  terrains: any[] = [];
  loading = false;
  displayedColumns = ['kitId', 'model', 'status', 'assignedTo', 'terrain', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      const kitsRes: any = await this.apiService.getKits(0, 100).toPromise();
      const usersRes: any = await this.apiService.getUsers(0, 100).toPromise();
      const terrainsRes: any = await this.apiService.getAdminTerrains().toPromise();

      if (kitsRes?.success && kitsRes.data) this.kits = kitsRes.data;
      if (usersRes?.success && usersRes.data) this.users = usersRes.data;
      if (terrainsRes?.success && terrainsRes.data) this.terrains = terrainsRes.data;
    } catch (e) {
      this.showError('Error loading data');
    } finally {
      this.loading = false;
    }
  }

  openAssignDialog(kit: Kit): void {
    const dialogRef = this.dialog.open(AssignKitDialogComponent, {
      width: '520px',
      data: { kit, users: this.users, terrains: this.terrains }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) return;
        try {
        const kitId = kit._id || kit.id!;
        await this.apiService.assignKit(kitId, result.farmerId, result.terrainId).toPromise();
        this.showSuccess(`Kit ${kit.kitId} assigned successfully`);
        this.loadData();
      } catch (err: any) {
        this.showError(err?.error?.message || 'Error assigning kit');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':   return 'accent';
      case 'assigned': return 'primary';
      case 'in_stock': return '';
      case 'offline':  return 'warn';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active':   return 'wifi';
      case 'assigned': return 'person';
      case 'in_stock': return 'inventory';
      case 'offline':  return 'wifi_off';
      default: return 'device_unknown';
    }
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top' });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['error-snackbar'] });
  }
}
