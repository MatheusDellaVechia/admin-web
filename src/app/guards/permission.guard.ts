import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export interface PermissionGuardData {
  permissions: string[];
  requireAll?: boolean; // If true, requires all permissions. If false, requires at least one
}

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const data = route.data as PermissionGuardData;
  if (!data || !data.permissions || data.permissions.length === 0) {
    return true; // No permission required
  }

  const hasPermission = data.requireAll
    ? authService.hasAllPermissions(data.permissions)
    : authService.hasAnyPermission(data.permissions);

  if (!hasPermission) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
