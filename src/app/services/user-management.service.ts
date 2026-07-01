import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roleNames: string[];
  createdAt: string;
}

export interface ListUsersResponse {
  users: UserItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface RoleInfo {
  id: string;
  name: string;
  description: string;
}

export interface UserDetailsResponse {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: RoleInfo[];
  effectivePermissions: string[];
  createdAt: string;
}

export interface AssignRolesRequest {
  roleIds: string[];
}

export interface AssignRolesResponse {
  userId: string;
  assignedRoleIds: string[];
}

export interface ActivateUserResponse {
  userId: string;
  active: boolean;
}

export interface ListRolesResponse {
  roles: RoleInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.API_URL}/api/admin`;

  constructor(private http: HttpClient) {}

  listUsers(
    page?: number,
    size?: number,
    search?: string,
    active?: boolean,
    roleNames?: string[]
  ): Observable<ListUsersResponse> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    if (search) params = params.set('search', search);
    if (active !== undefined) params = params.set('active', active.toString());
    if (roleNames && roleNames.length > 0) params = params.set('roleNames', roleNames.join(','));

    return this.http.get<ListUsersResponse>(`${this.apiUrl}/users`, { params });
  }

  getUserDetails(userId: string): Observable<UserDetailsResponse> {
    return this.http.get<UserDetailsResponse>(`${this.apiUrl}/users/${userId}`);
  }

  assignRoles(userId: string, request: AssignRolesRequest): Observable<AssignRolesResponse> {
    return this.http.put<AssignRolesResponse>(`${this.apiUrl}/users/${userId}/roles`, request);
  }

  activateUser(userId: string): Observable<ActivateUserResponse> {
    return this.http.put<ActivateUserResponse>(`${this.apiUrl}/users/${userId}/activate`, {});
  }

  deactivateUser(userId: string): Observable<ActivateUserResponse> {
    return this.http.put<ActivateUserResponse>(`${this.apiUrl}/users/${userId}/deactivate`, {});
  }

  listRoles(): Observable<ListRolesResponse> {
    return this.http.get<ListRolesResponse>(`${this.apiUrl}/users/roles`);
  }
}
