import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { importProvidersFrom } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

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

// Loader personalizado para traducciones
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}

// Factory function para el loader de traducciones
export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    importProvidersFrom(
      MatSnackBarModule,
      TranslateModule.forRoot({
        // Establecemos tanto defaultLanguage como fallbackLang para compatibilidad
        defaultLanguage: 'es',
        fallbackLang: 'es',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    ),

    // Asegurarse de que el idioma por defecto se cargue antes del bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => {
        return () => new Promise<void>(resolve => {
          // Establecer idioma por defecto y luego usarlo (cargar fichero)
          translate.setDefaultLang('es');
          translate.use('es').subscribe({ next: () => resolve(), error: () => resolve() });
        });
      },
      deps: [TranslateService],
      multi: true
    },

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
