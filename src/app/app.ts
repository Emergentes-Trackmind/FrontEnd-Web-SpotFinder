import { Component, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter } from 'rxjs/operators';
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
  protected readonly title = signal('spotfinder-frontend-web');

  // Signal para la ruta actual
  private currentRoute = signal<string>('');

  // Inyección de dependencias
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Rutas donde NO se debe mostrar el sidebar
  private readonly hideSidebarRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/unauthorized'
  ];

  constructor() {
    // Escuchar cambios de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.url);
    });

    // Establecer ruta inicial
    this.currentRoute.set(this.router.url);
  }

  // Computed para mostrar el sidebar
  readonly showSidebar = computed(() => {
    // Obtener la ruta actual del signal
    const currentUrl = this.currentRoute();

    // No mostrar sidebar si no está autenticado
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    // No mostrar sidebar en rutas de autenticación
    const shouldHide = this.hideSidebarRoutes.some(route =>
      currentUrl.startsWith(route)
    );

    return !shouldHide;
  });

  getUserInitials(): string {
    const user = this.authService.user();
    if (!user) return 'U';

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
