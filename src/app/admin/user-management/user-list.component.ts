import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserManagementService, UserItem, ListUsersResponse } from '../../services/user-management.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: UserItem[] = [];
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Filters
  searchTerm = '';
  filterActive: boolean | null = null;
  filterRoles: string[] = [];

  loading = false;
  error: string | null = null;

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    this.userManagementService.listUsers(
      this.currentPage,
      this.pageSize,
      this.searchTerm || undefined,
      this.filterActive !== null ? this.filterActive : undefined,
      this.filterRoles.length > 0 ? this.filterRoles : undefined
    ).subscribe({
      next: (response: ListUsersResponse) => {
        this.users = response.users;
        this.currentPage = response.currentPage;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar usuários';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 0;
    this.loadUsers();
  }

  onFilterActiveChange(value: string) {
    if (value === 'all') {
      this.filterActive = null;
    } else {
      this.filterActive = value === 'true';
    }
    this.currentPage = 0;
    this.loadUsers();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  getUserStatusClass(active: boolean): string {
    return active ? 'status-active' : 'status-inactive';
  }

  getUserStatusText(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }
}
