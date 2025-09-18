import { Routes } from '@angular/router';
import { HomePage } from './dashboard/pages/home-page/home-page';
import { ParkingProfileComponent } from './profileparking/components/parking-profile/parking-profile';
import { ParkingListPage } from './profileparking/pages/parking-list/parking-list.page';
import { ParkingAnalyticsPage } from './profileparking/pages/parking-analytics/parking-analytics.page';
import { ParkingCreatedPageComponent } from './profileparking/pages/parking-created/parking-created.page';
import { AuthGuard } from './iam/guards/auth.guard';

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
    component: ParkingProfileComponent,
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
  {
    path: 'reservations',
    loadComponent: () => import('./shared/pages/reservations/reservations.page').then(m => m.ReservationsPage),
    title: 'Reservaciones',
    canActivate: [AuthGuard]
  },
  {
    path: 'reviews',
    loadComponent: () => import('./shared/pages/reviews/reviews.page').then(m => m.ReviewsPage),
    title: 'Reseñas',
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./shared/pages/settings/settings.page').then(m => m.SettingsPage),
    title: 'Configuración',
    canActivate: [AuthGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/pages/unauthorized/unauthorized.page').then(m => m.UnauthorizedPage),
    title: 'Acceso Denegado'
  }
];
