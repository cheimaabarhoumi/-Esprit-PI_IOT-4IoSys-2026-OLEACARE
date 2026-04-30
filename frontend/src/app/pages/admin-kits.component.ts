import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../services/api.service';
import { DialogService } from '../services/dialog.service';
import { Kit, User } from '../models';

@Component({
  selector: 'app-admin-kits',
  templateUrl: './admin-kits.component.html',
  styleUrls: ['./admin-kits.component.scss']
})
export class AdminKitsComponent implements OnInit {
  kits: Kit[] = [];
  users: User[] = [];
  loading = false;
  displayedColumns = ['kitId', 'model', 'status', 'assignedTo', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.apiService.getKits(0, 100).toPromise(),
      this.apiService.getUsers(0, 100).toPromise()
    ]).then(([kitsRes, usersRes]) => {
      if (kitsRes?.success && kitsRes.data) this.kits = kitsRes.data;
      if (usersRes?.success && usersRes.data) this.users = usersRes.data;
      this.loading = false;
    }).catch(() => {
      this.showError('Error loading data');
      this.loading = false;
    });
  }

  async openCreateDialog(): Promise<void> {
    const result = await this.dialogService.openKitDialog();
    if (!result) return;
    try {
      await this.apiService.createKit(result).toPromise();
      this.showSuccess('Kit saved successfully');
      this.loadData();
    } catch (err: any) {
      this.showError(err?.error?.message || 'Error creating kit');
    }
  }

  async openEditDialog(kit: Kit): Promise<void> {
    const result = await this.dialogService.openKitDialog(kit);
    if (!result) return;
    try {
      await this.apiService.updateKit(kit._id || kit.id!, result).toPromise();
      this.showSuccess('Kit updated');
      this.loadData();
    } catch (err: any) {
      this.showError(err?.error?.message || 'Error updating kit');
    }
  }

  async deleteKit(kit: Kit): Promise<void> {
    const confirmed = await this.dialogService.openDeleteConfirm(kit.kitId);
    if (!confirmed) return;
    try {
      await this.apiService.deleteKit(kit._id || kit.id!).toPromise();
      this.showSuccess('Kit deleted');
      this.loadData();
    } catch (err: any) {
      this.showError(err?.error?.message || 'Error deleting kit');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':    return 'accent';
      case 'assigned':  return 'primary';
      case 'in_stock':  return '';
      case 'offline':   return 'warn';
      case 'maintenance': return 'warn';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active':    return 'wifi';
      case 'assigned':  return 'person';
      case 'in_stock':  return 'inventory';
      case 'offline':   return 'wifi_off';
      case 'maintenance': return 'build';
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
