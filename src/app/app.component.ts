import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { filter } from 'rxjs/operators';
import { AuthService } from './iam/services/auth.service';
import { ToastContainerComponent } from './notifications/components/toast/toast-container.component';
import { FcmService } from './notifications/services/fcm.service';
import { NotificationsService } from './notifications/services/notifications.service';

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
    MatToolbarModule,
    MatBadgeModule,
    ToastContainerComponent
  ]
})
export class AppComponent implements OnInit {
  protected readonly title = signal('spotfinder-frontend-web');

  // Signal para la ruta actual
  private currentRoute = signal<string>('');

  // Signal para controlar el sidebar en móvil
  protected readonly sidebarOpen = signal<boolean>(false);

  // Inyección de dependencias
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fcmService = inject(FcmService);
  protected readonly notificationsService = inject(NotificationsService);

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
      // Cerrar sidebar en móvil al navegar
      this.closeSidebar();
    });

    // Establecer ruta inicial
    this.currentRoute.set(this.router.url);
  }

  ngOnInit(): void {
    // Inicializar FCM si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      this.initializeNotifications();
    }

    // Escuchar cambios de autenticación (si existe user$ observable)
    const userObservable = (this.authService as any).user$;
    if (userObservable) {
      userObservable.subscribe((user: any) => {
        if (user) {
          this.initializeNotifications();
        }
      });
    }
  }

  private initializeNotifications(): void {
    // Inicializar FCM
    this.fcmService.init().catch((err: any) => {
      console.error('Error al inicializar FCM:', err);
    });

    // Cargar notificaciones iniciales
    this.notificationsService.loadInitial().subscribe({
      error: (err: any) => console.error('Error al cargar notificaciones:', err)
    });
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
    const shouldHide = this.hideSidebarRoutes.some((route: string) =>
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

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout();
    this.closeSidebar();
  }
}

