import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from '../dialogs/user-dialog.component';
import { KitDialogComponent } from '../dialogs/kit-dialog.component';
import { TerrainDialogComponent } from '../dialogs/terrain-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  openUserDialog(user?: any): Promise<any> {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(UserDialogComponent, {
        width: '500px',
        data: user || {}
      });
      dialogRef.afterClosed().subscribe(result => resolve(result));
    });
  }

  openKitDialog(kit?: any): Promise<any> {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(KitDialogComponent, {
        width: '550px',
        data: kit || {}
      });
      dialogRef.afterClosed().subscribe(result => resolve(result));
    });
  }

  openTerrainDialog(terrain?: any): Promise<any> {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(TerrainDialogComponent, {
        width: '550px',
        data: terrain || {}
      });
      dialogRef.afterClosed().subscribe(result => resolve(result));
    });
  }

  openConfirm(title: string, message: string, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = 'primary'): Promise<boolean> {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: { title, message, confirmText, cancelText, confirmColor }
      });
      dialogRef.afterClosed().subscribe(result => resolve(result || false));
    });
  }

  openDeleteConfirm(itemName: string): Promise<boolean> {
    return this.openConfirm(
      'Delete Confirmation',
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'warn'
    );
  }
}
