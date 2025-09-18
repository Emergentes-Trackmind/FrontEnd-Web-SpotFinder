import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../iam/services/auth.service';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  comingSoon?: boolean;
  disabled?: boolean;
  requiresAuth?: boolean;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule
  ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Signals para manejo del estado
  private readonly _isCollapsed = signal(false);
  private readonly _isOpen = signal(true);
  private readonly _isMobile = signal(false);

  // Computed properties
  readonly isCollapsed = computed(() => this._isCollapsed());
  readonly isOpen = computed(() => this._isOpen());
  readonly isMobile = computed(() => this._isMobile());
  readonly user = computed(() => this.authService.user());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  // Items de navegación
  readonly navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      requiresAuth: true
    },
    {
      id: 'parking-list',
      label: 'Mis Parkings',
      icon: 'local_parking',
      route: '/parking/list',
      requiresAuth: true
    },
    {
      id: 'parking-create',
      label: 'Crear Parking',
      icon: 'add_location',
      route: '/parking/create',
      requiresAuth: true
    },
    {
      id: 'reservations',
      label: 'Reservas',
      icon: 'event_available',
      route: '/reservations',
      comingSoon: true,
      requiresAuth: true
    },
    {
      id: 'analytics',
      label: 'Analíticas',
      icon: 'analytics',
      route: '/parking/analytics',
      requiresAuth: true
    },
    {
      id: 'reviews',
      label: 'Reseñas',
      icon: 'star_rate',
      route: '/reviews',
      comingSoon: true,
      requiresAuth: true
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: 'person',
      route: '/profile',
      requiresAuth: true
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: 'settings',
      route: '/settings',
      comingSoon: true,
      requiresAuth: true
    }
  ];

  // Items de configuración
  readonly configItems: NavigationItem[] = [
    {
      id: 'preferences',
      label: 'Preferencias',
      icon: 'tune',
      route: '/preferences',
      comingSoon: true,
      requiresAuth: true
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: 'notifications',
      route: '/notifications',
      comingSoon: true,
      requiresAuth: true
    },
    {
      id: 'help',
      label: 'Ayuda',
      icon: 'help_outline',
      route: '/help',
      comingSoon: true,
      requiresAuth: false
    },
    {
      id: 'about',
      label: 'Acerca de',
      icon: 'info_outline',
      route: '/about',
      comingSoon: true,
      requiresAuth: false
    }
  ];

  ngOnInit(): void {
    this.observeBreakpoints();
    this.loadSidebarState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private observeBreakpoints(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this._isMobile.set(result.matches);
        if (result.matches) {
          this._isCollapsed.set(false);
          this._isOpen.set(false);
        } else {
          this.loadSidebarState();
        }
      });
  }

  private loadSidebarState(): void {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      this._isCollapsed.set(JSON.parse(savedState));
    }
  }

  private saveSidebarState(): void {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(this._isCollapsed()));
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this._isOpen.set(!this._isOpen());
    } else {
      this._isCollapsed.set(!this._isCollapsed());
      this.saveSidebarState();
    }
  }

  closeSidebar(): void {
    if (this.isMobile()) {
      this._isOpen.set(false);
    }
  }

  openSidebar(): void {
    this._isOpen.set(true);
  }

  onItemClick(item: NavigationItem): void {
    if (item.disabled || item.comingSoon) {
      return;
    }

    if (item.requiresAuth && !this.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (item.route) {
      this.router.navigate([item.route]);

      // Cerrar sidebar en móvil después de navegar
      if (this.isMobile()) {
        this.closeSidebar();
      }
    }
  }

  getUserInitials(): string {
    const user = this.user();
    if (!user) return 'U';

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  getUserFullName(): string {
    const user = this.user();
    if (!user) return 'Usuario';

    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onLogout(): void {
    this.logout();
  }
}
