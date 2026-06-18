import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  UserManagementService, 
  UserDetailsResponse,
  RoleInfo,
  ListRolesResponse
} from '../../services/user-management.service';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HasPermissionDirective],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  userId!: string;
  user: UserDetailsResponse | null = null;
  availableRoles: RoleInfo[] = [];
  selectedRoleIds: Set<string> = new Set();
  
  loading = false;
  loadingRoles = false;
  actionLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  showRoleModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userManagementService: UserManagementService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.loadUserDetails();
      this.loadAvailableRoles();
    });
  }

  loadUserDetails() {
    this.loading = true;
    this.error = null;

    this.userManagementService.getUserDetails(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.selectedRoleIds = new Set(user.roles.map(r => r.id));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar detalhes do usuário';
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadAvailableRoles() {
    this.loadingRoles = true;

    this.userManagementService.listRoles().subscribe({
      next: (response: ListRolesResponse) => {
        this.availableRoles = response.roles;
        this.loadingRoles = false;
      },
      error: (err) => {
        console.error('Erro ao carregar papéis', err);
        this.loadingRoles = false;
      }
    });
  }

  activateUser() {
    if (!this.user || this.user.active) return;

    if (!confirm(`Tem certeza que deseja ativar o usuário ${this.user.name}?`)) {
      return;
    }

    this.actionLoading = true;
    this.error = null;
    this.successMessage = null;

    this.userManagementService.activateUser(this.userId).subscribe({
      next: () => {
        this.successMessage = 'Usuário ativado com sucesso!';
        this.actionLoading = false;
        this.loadUserDetails();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao ativar usuário. Certifique-se de que o usuário tem pelo menos um papel atribuído.';
        console.error(err);
        this.actionLoading = false;
      }
    });
  }

  deactivateUser() {
    if (!this.user || !this.user.active) return;

    if (!confirm(`Tem certeza que deseja desativar o usuário ${this.user.name}? O usuário não poderá mais acessar o sistema.`)) {
      return;
    }

    this.actionLoading = true;
    this.error = null;
    this.successMessage = null;

    this.userManagementService.deactivateUser(this.userId).subscribe({
      next: () => {
        this.successMessage = 'Usuário desativado com sucesso!';
        this.actionLoading = false;
        this.loadUserDetails();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao desativar usuário';
        console.error(err);
        this.actionLoading = false;
      }
    });
  }

  openRoleModal() {
    this.showRoleModal = true;
  }

  closeRoleModal() {
    this.showRoleModal = false;
    if (this.user) {
      this.selectedRoleIds = new Set(this.user.roles.map(r => r.id));
    }
  }

  toggleRole(roleId: string) {
    if (this.selectedRoleIds.has(roleId)) {
      this.selectedRoleIds.delete(roleId);
    } else {
      this.selectedRoleIds.add(roleId);
    }
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds.has(roleId);
  }

  saveRoles() {
    this.actionLoading = true;
    this.error = null;
    this.successMessage = null;

    const roleIds = Array.from(this.selectedRoleIds);

    this.userManagementService.assignRoles(this.userId, { roleIds }).subscribe({
      next: () => {
        this.successMessage = 'Papéis atualizados com sucesso!';
        this.actionLoading = false;
        this.showRoleModal = false;
        this.loadUserDetails();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = 'Erro ao atualizar papéis';
        console.error(err);
        this.actionLoading = false;
      }
    });
  }

  getUserStatusClass(active: boolean): string {
    return active ? 'status-active' : 'status-inactive';
  }

  getUserStatusText(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }
}
