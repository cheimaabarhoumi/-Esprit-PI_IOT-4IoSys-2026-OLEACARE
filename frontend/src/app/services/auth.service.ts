import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          localStorage.setItem('token', (response as any).token);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, userData);
  }

  verifyEmail(email: string, code: string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/verify-email`, { email, code }).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          localStorage.setItem('token', (response as any).token);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/reset-password`, data);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isFarmer(): boolean {
    return this.currentUserSubject.value?.role === 'farmer';
  }

  getMe(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
      }),
      map(response => response.data)
    );
  }

  updateProfile(profileData: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, profileData).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  updateProfileImage(imageData: string | null): Observable<ApiResponse<User>> {
    const mimeType = imageData ? this.getMimeType(imageData) : null;
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile-image`, {
      imageData,
      imageMime: mimeType
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  private getMimeType(base64String: string | null): string | null {
    if (!base64String) {
      return null;
    }
    const match = base64String.match(/^data:([^;]*)/);
    return match ? match[1] : 'image/png';
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }
}
