import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  verifyForm!: FormGroup;
  forgotForm!: FormGroup;
  resetForm!: FormGroup;
  isLoginMode = true;
  verifyMode = false;
  forgotMode = false;
  resetMode = false;
  loading = false;
  error = '';
  successMessage = '';
  registeredEmail = '';
  resetEmail = '';
  profileImagePreview: string | null = null;
  showAdvancedFields = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      nickname: [''],
      farmName: [''],
      phoneNumber: [''],
      address: [''],
      city: [''],
      zipCode: [''],
      role: ['farmer', [Validators.required]]
    });

    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.verifyMode = false;
    this.forgotMode = false;
    this.resetMode = false;
    this.error = '';
    this.successMessage = '';
    this.profileImagePreview = null;
    this.showAdvancedFields = false;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size too large. Maximum 5MB allowed.';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select an image file.';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        this.error = '';
      };
      reader.readAsDataURL(file);
    }
  }

  goToLoginMode(): void {
    this.verifyMode = false;
    this.forgotMode = false;
    this.resetMode = false;
    this.isLoginMode = true;
    this.error = '';
    this.successMessage = '';
  }

  goToForgotMode(): void {
    this.verifyMode = false;
    this.isLoginMode = false;
    this.forgotMode = true;
    this.resetMode = false;
    this.error = '';
    this.successMessage = '';
  }

  goToResetMode(email: string): void {
    this.resetMode = true;
    this.forgotMode = false;
    this.verifyMode = false;
    this.isLoginMode = false;
    this.resetEmail = email;
    this.resetForm.patchValue({ email });
    this.error = '';
    this.successMessage = '';
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const credentials: LoginRequest = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        const user = this.authService.getCurrentUser();
        if (user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/farmer']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Login failed';
      }
    });
  }

  register(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const payload = {
      ...this.registerForm.value,
      profileImage: this.profileImagePreview,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.registeredEmail = this.registerForm.value.email;
        this.verifyMode = true;
        this.isLoginMode = false;
        this.verifyForm.patchValue({ email: this.registeredEmail });
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Registration failed';
      }
    });
  }

  verifyEmail(): void {
    if (this.verifyForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const { email, code } = this.verifyForm.value;
    this.authService.verifyEmail(email, code).subscribe({
      next: () => {
        this.loading = false;
        const user = this.authService.getCurrentUser();
        if (user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/farmer']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Verification failed';
      }
    });
  }

  sendResetEmail(): void {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const email = this.forgotForm.value.email;
    this.authService.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message || 'Reset email sent.';
        this.goToResetMode(email);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to send reset email';
      }
    });
  }

  resetPassword(): void {
    if (this.resetForm.invalid) return;

    const newPassword = this.resetForm.get('newPassword')?.value;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const payload = {
      email: this.resetEmail,
      code: this.resetForm.get('code')?.value,
      newPassword,
    };

    this.authService.resetPassword(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message || 'Password reset successfully.';
        this.goToLoginMode();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to reset password';
      }
    });
  }
}

