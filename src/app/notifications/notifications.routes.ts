import { Routes } from '@angular/router';
import { AuthGuard } from '../iam/guards/auth.guard';

/**
 * Rutas del módulo de notificaciones
 */
export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./pages/notifications-page/notifications-page.component').then(
        (m) => m.NotificationsPageComponent
      ),
    canActivate: [AuthGuard],
    title: 'Notificaciones'
  },
  {
    path: 'notificaciones/demo',
    loadComponent: () =>
      import('./components/toast-demo/toast-demo.component').then(
        (m) => m.ToastDemoComponent
      ),
    canActivate: [AuthGuard],
    title: 'Demo de Toasts'
  }
];

