import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = `${environment.API_URL}/api/users`;

  constructor(private http: HttpClient) {}

  sendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-verification-code`, { email });
  }

  validateVerificationCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-verification-code`, { email, code });
  }

  register(userData: { email: string, name: string, password: string, verificationCode: string }): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
}
