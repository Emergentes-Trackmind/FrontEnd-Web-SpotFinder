import { Routes } from '@angular/router';
import { HomePage } from './dashboard/pages/home-page/home-page';
import { ParkingListPage } from './profileparking/pages/parking-list/parking-list.page';
import { ParkingAnalyticsPage } from './profileparking/pages/parking-analytics/parking-analytics.page';
import { ParkingCreatedPageComponent } from './profileparking/pages/parking-created/parking-created.page';
import { ParkingEditPageComponent } from './profileparking/pages/parking-edit/parking-edit.page';
import { AuthGuard } from './iam/guards/auth.guard';
import { NOTIFICATIONS_ROUTES } from './notifications/notifications.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./iam/presentation/pages/login/login.page').then(m => m.LoginPage),
        title: 'Iniciar Sesión'
      },
      {
        path: 'register',
        loadComponent: () => import('./iam/presentation/pages/register/register.page').then(m => m.RegisterPage),
        title: 'Crear Cuenta'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./iam/presentation/pages/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
        title: 'Recuperar Contraseña'
      },
      {
        path: 'reset-password/:token',
        loadComponent: () => import('./iam/presentation/pages/reset-password/reset-password.page').then(m => m.ResetPasswordPage),
        title: 'Restablecer Contraseña'
      }
    ]
  },
  {
    path: 'dashboard',
    component: HomePage,
    title: 'Dashboard',
    canActivate: [AuthGuard]
  },
  {
    path: 'reviews',
    loadComponent: () => import('./reviews/presentation/pages/reviews/reviews.page').then(m => m.ReviewsPage),
    title: 'Reviews',
    canActivate: [AuthGuard]
  },
  {
    path: 'iot',
    loadChildren: () => import('./iot/iot.routes').then(m => m.IOT_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'parkings',
    component: ParkingListPage,
    title: 'Mis Parkings',
    canActivate: [AuthGuard]
  },
  {
    path: 'parkings/new',
    component: ParkingCreatedPageComponent,
    title: 'Registrar Nuevo Parking',
    canActivate: [AuthGuard]
  },
  {
    path: 'parkings/:id/edit',
    component: ParkingEditPageComponent,
    title: 'Editar Parking',
    canActivate: [AuthGuard]
  },
  {
    path: 'parkings/:id/analytics',
    component: ParkingAnalyticsPage,
    title: 'Analytics del Parking',
    canActivate: [AuthGuard]
  },
  {
    path: 'me',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./Profile/presentation/pages/profile/profile.page').then(m => m.ProfilePage),
        title: 'Mi Perfil'
      }
    ]
  },
  // ✅ RESERVAS HABILITADAS - Conectadas al bounded context DDD
  {
    path: 'reservations',
    canActivate: [AuthGuard],
    loadComponent: () => import('./reservations/presentation/pages/reservations-list/reservations-list.page').then(m => m.ReservationsListPage),
    title: 'Gestión de Reservas'
  },
  {
    path: 'reservations/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./reservations/presentation/pages/reservation-detail/reservation-detail.page').then(m => m.ReservationDetailPage),
    title: 'Detalle de Reserva'
  },
  // Billing - Planes y Suscripción
  {
    path: 'billing',
    canActivate: [AuthGuard],
    loadComponent: () => import('./billing/pages/subscription-page/subscription-page.component').then(m => m.SubscriptionPageComponent),
    title: 'Planes y Suscripción'
  },
  // Notificaciones
  ...NOTIFICATIONS_ROUTES,
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
