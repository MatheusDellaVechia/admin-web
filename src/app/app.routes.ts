import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ShellComponent } from './shell/shell.component';
import { HomeComponent } from './home/home';
import { UserListComponent } from './admin/user-management/user-list.component';
import { UserDetailsComponent } from './admin/user-management/user-details.component';
import { LogListComponent } from './admin/logs/log-list.component';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { permissionGuard } from './guards/permission.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'home', component: HomeComponent },
      {
        path: 'orders',
        component: OrderListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['ORDER_MANAGEMENT'] },
      },
      {
        path: 'orders/:id',
        component: OrderDetailComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['ORDER_MANAGEMENT'] },
      },
      {
        path: 'admin/users',
        component: UserListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['USER_MANAGEMENT'] },
      },
      {
        path: 'admin/users/:id',
        component: UserDetailsComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['USER_MANAGEMENT'] },
      },
      {
        path: 'admin/logs',
        component: LogListComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['USER_MANAGEMENT'] },
      },
    ],
  },
];
