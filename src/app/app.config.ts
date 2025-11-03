import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { importProvidersFrom } from '@angular/core';

import { routes } from './app.routes';
import { ApiPrefixInterceptor } from './core/http/api-prefix.interceptor';
import { HttpErrorInterceptor } from './core/http/http-error.interceptor';
import { AuthInterceptor } from './iam/infrastructure/http/auth.interceptor';
import { AuthRepository } from './iam/infrastructure/repositories/auth.repo';
import { ProfileRepositoryImpl } from './Profile/infrastructure/repositories/profile.repo';
import { DASHBOARD_PROVIDERS } from './dashboard/dashboard.providers';
import { REVIEWS_PROVIDERS } from './reviews/reviews.providers';
import { IOT_PROVIDERS } from './iot/iot.providers';
import { NOTIFICATIONS_PROVIDERS } from './notifications/notifications.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule),

    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiPrefixInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },

    // Repository Providers para IAM usando tokens
    {
      provide: 'LoginRepository',
      useClass: AuthRepository
    },
    {
      provide: 'RegisterRepository',
      useClass: AuthRepository
    },
    {
      provide: 'RefreshTokenRepository',
      useClass: AuthRepository
    },
    {
      provide: 'ForgotPasswordRepository',
      useClass: AuthRepository
    },
    {
      provide: 'ResetPasswordRepository',
      useClass: AuthRepository
    },

    // Repository Providers para Profile
    {
      provide: 'ProfileRepository',
      useClass: ProfileRepositoryImpl
    },
    {
      provide: 'UpdateProfileRepository',
      useClass: ProfileRepositoryImpl
    },

    // Dashboard Analytics providers
    ...DASHBOARD_PROVIDERS,

    // Reviews providers
    ...REVIEWS_PROVIDERS,

    ...IOT_PROVIDERS,

    // Notifications providers
    ...NOTIFICATIONS_PROVIDERS
  ]
};
