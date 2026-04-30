import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../models';

@Component({
  selector: 'app-user-dialog',
  template: `
    <h2 mat-dialog-title>{{ data?.id ? 'Edit User' : 'Create New User' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" placeholder="user@example.com">
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">Invalid email</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" placeholder="John">
          <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">First name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName" placeholder="Doe">
          <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">Last name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="admin">Admin</mat-option>
            <mat-option value="farmer">Farmer</mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('role')?.hasError('required')">Role is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width" *ngIf="!data?.id">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" placeholder="••••••••">
          <mat-error *ngIf="userForm.get('password')?.hasError('required')">Password is required</mat-error>
          <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">Min 8 characters</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!userForm.valid">
        {{ data?.id ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['farmer', Validators.required],
      password: ['', this.data?.id ? [] : [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    if (this.data?.id) {
      this.userForm.patchValue({
        email: this.data.email,
        firstName: this.data.firstName,
        lastName: this.data.lastName,
        role: this.data.role
      });
      this.userForm.get('email')?.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      this.dialogRef.close(formValue);
    }
  }
}
