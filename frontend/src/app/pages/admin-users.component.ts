import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../services/api.service';
import { DialogService } from '../services/dialog.service';
import { User } from '../models';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  displayedColumns = ['user', 'role', 'farmName', 'createdAt', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiService.getUsers(0, 100).subscribe({
      next: (res) => {
        if (res?.success && res.data) this.users = res.data;
        this.loading = false;
      },
      error: () => {
        this.showError('Error loading users');
        this.loading = false;
      }
    });
  }

  async openCreateDialog(): Promise<void> {
    const result = await this.dialogService.openUserDialog();
    if (!result) return;
    try {
      await this.apiService.createUser(result).toPromise();
      this.showSuccess('User created successfully');
      this.loadUsers();
    } catch (err: any) {
      this.showError(err?.error?.message || 'Error creating user');
    }
  }

  async openEditDialog(user: User): Promise<void> {
    const result = await this.dialogService.openUserDialog(user);
    if (!result) return;
    try {
      await this.apiService.updateUser(user._id || user.id!, result).toPromise();
      this.showSuccess('User updated');
      this.loadUsers();
    } catch (err: any) {
      this.showError(err?.error?.message || 'Error updating user');
    }
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.dialogService.openDeleteConfirm(`${user.firstName} ${user.lastName}`);
    if (!confirmed) return;
    try {
      await this.apiService.deleteUser(user._id || user.id!).toPromise();
      this.showSuccess('User deleted');
      this.loadUsers();
    } catch (err: any) {
      this.showError(err?.error?.message || 'Error deleting user');
    }
  }

  getRoleColor(role: string): string {
    return role === 'admin' ? 'primary' : 'accent';
  }

  getInitials(firstName: string, lastName: string): string {
    const initials = `${firstName?.trim().charAt(0) || ''}${lastName?.trim().charAt(0) || ''}`;
    return initials.toUpperCase();
  }

  getAvatarColor(firstName: string): string {
    const colors = [
      'linear-gradient(135deg, #6d7e45 0%, #8a9d61 100%)',
      'linear-gradient(135deg, #4d6d2d 0%, #7b8e53 100%)',
      'linear-gradient(135deg, #5a7240 0%, #7a9555 100%)',
      'linear-gradient(135deg, #556f31 0%, #7a8b51 100%)'
    ];
    const index = (firstName?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top' });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Close', { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['error-snackbar'] });
  }
}
