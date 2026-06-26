import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HasPermissionDirective } from '../directives/has-permission.directive';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule, HasPermissionDirective],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent implements OnInit {
  isCollapsed = false;
  isMobileOpen = false;
  userName = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.authService.currentUser$.subscribe((user) => {
      if (user) this.userName = user.name;
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeMobile() {
    this.isMobileOpen = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
