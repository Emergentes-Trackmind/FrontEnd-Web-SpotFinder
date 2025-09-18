import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './iam/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [
    RouterOutlet,
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule
  ]
})
export class AppComponent {
  protected readonly title = signal('quadrapp-frontend-web');

  // Inyección de dependencias
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Computed para mostrar el sidebar
  readonly showSidebar = computed(() => this.authService.isAuthenticated());

  getUserInitials(): string {
    const user = this.authService.user();
    if (!user) return 'U';

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
