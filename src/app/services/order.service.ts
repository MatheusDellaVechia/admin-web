import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Order, OrderFilters, OrderListResponse, OrderStatus, StatusHistoryItem } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.API_URL}/api/admin/orders`;

  constructor(private http: HttpClient) {}

  listOrders(page: number, size: number, filters?: OrderFilters): Observable<OrderListResponse> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.customerSearch) params = params.set('customerEmail', filters.customerSearch);
    if (filters?.dateFrom) params = params.set('from', `${filters.dateFrom}T00:00:00Z`);
    if (filters?.dateTo) params = params.set('to', `${filters.dateTo}T23:59:59Z`);
    return this.http.get<OrderListResponse>(this.apiUrl, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  getHistory(id: string): Observable<StatusHistoryItem[]> {
    return this.http.get<StatusHistoryItem[]>(`${this.apiUrl}/${id}/history`);
  }
}
