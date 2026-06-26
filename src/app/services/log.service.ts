import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LogListResponse, LogType } from '../models/log.model';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private apiUrl = `${environment.API_URL}/api/logs`;

  constructor(private http: HttpClient) {}

  getLogs(page: number, size: number, type?: LogType): Observable<LogListResponse> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (type) params = params.set('type', type);
    return this.http.get<LogListResponse>(this.apiUrl, { params });
  }
}
