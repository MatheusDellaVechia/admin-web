import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Attachment } from '../models/attachment.model';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private apiUrl = `${environment.API_URL}/api/admin/orders`;

  constructor(private http: HttpClient) {}

  listAttachments(orderId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/${orderId}/attachments`);
  }

  uploadAttachment(orderId: string, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.apiUrl}/${orderId}/attachments`, formData);
  }

  downloadFile(orderId: string, fileId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/attachments/${fileId}`, { responseType: 'blob' });
  }
}
