import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.API_URL}/api/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  logout(): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/logout`, {});
  }

  getCurrentUser(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${this.apiUrl}/me`);
  }
}
