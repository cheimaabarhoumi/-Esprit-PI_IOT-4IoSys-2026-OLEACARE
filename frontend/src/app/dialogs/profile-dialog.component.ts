import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../models';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements OnInit {
  profileForm!: FormGroup;
  user: User;
  isEditMode = false;
  isLoading = false;
  profileImagePreview: string | null = null;
  selectedImageFile: File | null = null;
  imageRemoved = false;
  imageChangePending = false;

  constructor(
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User; isAdmin: boolean },
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.user = { ...data.user };
    if (this.user.profileImage) {
      this.profileImagePreview = this.user.profileImage;
    }
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.profileForm = this.formBuilder.group({
      firstName: [{ value: this.user.firstName, disabled: !this.isEditMode }, Validators.required],
      lastName: [{ value: this.user.lastName, disabled: !this.isEditMode }, Validators.required],
      email: [{ value: this.user.email, disabled: true }],
      nickname: [{ value: this.user.nickname || '', disabled: !this.isEditMode }],
      phoneNumber: [{ value: this.user.phoneNumber || '', disabled: !this.isEditMode }],
      address: [{ value: this.user.address || '', disabled: !this.isEditMode }],
      city: [{ value: this.user.city || '', disabled: !this.isEditMode }],
      zipCode: [{ value: this.user.zipCode || '', disabled: !this.isEditMode }],
      bio: [{ value: this.user.bio || '', disabled: !this.isEditMode }],
      website: [{ value: this.user.website || '', disabled: !this.isEditMode }],
      farmName: [{ value: this.user.farmName || '', disabled: !this.isEditMode }],
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      Object.keys(this.profileForm.controls).forEach(key => {
        if (key !== 'email') {
          this.profileForm.get(key)?.enable();
        }
      });
    } else {
      Object.keys(this.profileForm.controls).forEach(key => {
        if (key !== 'email') {
          this.profileForm.get(key)?.disable();
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('The image is too large. Maximum 5MB allowed.', 'Close', { duration: 3000 });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file.', 'Close', { duration: 3000 });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        this.selectedImageFile = file;
        this.imageRemoved = false;
        this.imageChangePending = true;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.profileImagePreview = null;
    this.selectedImageFile = null;
    this.imageRemoved = true;
    this.imageChangePending = true;
    this.snackBar.open('Profile photo removed. Save to apply.', 'Close', { duration: 2500 });
  }

  editImage(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  imageHasPendingChanges(): boolean {
    return this.imageChangePending;
  }

  async saveImageChanges(): Promise<void> {
    if (!this.imageHasPendingChanges()) {
      return;
    }

    this.isLoading = true;
    try {
      if (this.imageRemoved && !this.profileImagePreview) {
        await lastValueFrom(this.authService.updateProfileImage(null));
      } else if (this.profileImagePreview) {
        await lastValueFrom(this.authService.updateProfileImage(this.profileImagePreview));
      }

      this.snackBar.open('Profile photo updated.', 'Close', { duration: 3000 });
      this.imageChangePending = false;
      this.selectedImageFile = null;
      this.imageRemoved = false;

      const updatedUser = await lastValueFrom(this.authService.getMe());
      if (updatedUser) {
        this.user = updatedUser;
        this.profileImagePreview = updatedUser.profileImage || null;
        this.initializeForm();
      }
    } catch (error: any) {
      this.snackBar.open(error?.error?.message || 'Failed to update profile photo.', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  cancelImageChanges(): void {
    this.profileImagePreview = this.user.profileImage || null;
    this.selectedImageFile = null;
    this.imageRemoved = false;
    this.imageChangePending = false;
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    try {
      const formValue = this.profileForm.getRawValue();
      const profileData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        nickname: formValue.nickname,
        phoneNumber: formValue.phoneNumber,
        address: formValue.address,
        city: formValue.city,
        zipCode: formValue.zipCode,
        bio: formValue.bio,
        website: formValue.website,
        farmName: formValue.farmName,
      };

      // Update profile
      await lastValueFrom(this.authService.updateProfile(profileData));

      // Update or remove image if changed
      if (this.imageRemoved && !this.profileImagePreview) {
        await lastValueFrom(this.authService.updateProfileImage(null));
      } else if (this.profileImagePreview && this.profileImagePreview !== this.user.profileImage) {
        await lastValueFrom(this.authService.updateProfileImage(this.profileImagePreview));
      }

      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      this.toggleEditMode();
      this.imageRemoved = false;
      
      // Refresh user data
      const updatedUser = await lastValueFrom(this.authService.getMe());
      if (updatedUser) {
        this.user = updatedUser;
        this.profileImagePreview = updatedUser.profileImage || null;
        this.initializeForm();
      }
    } catch (error: any) {
      this.snackBar.open(error?.error?.message || 'Failed to update profile', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  cancel(): void {
    if (this.isEditMode) {
      this.toggleEditMode();
      this.profileImagePreview = this.user.profileImage || null;
      this.imageRemoved = false;
    } else {
      this.dialogRef.close();
    }
  }

  getInitials(): string {
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}
