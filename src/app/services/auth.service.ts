import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  email: string;
  name: string;
  token: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.API_URL}/api/auth`;
  private tokenKey = 'auth_token';
  private permissionsKey = 'auth_permissions';
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.storeUserData(response);
      })
    );
  }

  logout(): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearUserData();
      })
    );
  }

  getCurrentUser(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        this.currentUserSubject.next(response);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getPermissions(): string[] {
    const permissions = localStorage.getItem(this.permissionsKey);
    return permissions ? JSON.parse(permissions) : [];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.some(p => userPermissions.includes(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.every(p => userPermissions.includes(p));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private storeUserData(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.permissionsKey, JSON.stringify(response.permissions));
    this.currentUserSubject.next(response);
  }

  private clearUserData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.permissionsKey);
    this.currentUserSubject.next(null);
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    if (token) {
      // Optionally fetch current user on app init
      this.getCurrentUser().subscribe();
    }
  }
}
