import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { HomeComponent } from './home/home';
import { UserListComponent } from './admin/user-management/user-list.component';
import { UserDetailsComponent } from './admin/user-management/user-details.component';
import { permissionGuard } from './guards/permission.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'home', component: HomeComponent },
  { 
    path: 'admin/users', 
    component: UserListComponent,
    canActivate: [permissionGuard],
    data: { permissions: ['USER_MANAGEMENT'] }
  },
  { 
    path: 'admin/users/:id', 
    component: UserDetailsComponent,
    canActivate: [permissionGuard],
    data: { permissions: ['USER_MANAGEMENT'] }
  }
];
