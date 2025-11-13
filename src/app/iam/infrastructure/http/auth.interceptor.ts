import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Rutas públicas que NO requieren token (expresiones regulares)
  private readonly publicRoutes = [
    /\/auth\/login$/,
    /\/auth\/register$/,
    /\/auth\/refresh$/,
    /\/auth\/forgot-password$/,
    /\/auth\/reset-password$/
  ];

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    const shouldSkip = this.isPublicRoute(req.url) || this.isAssetRequest(req.url);

    console.log('🔍 AuthInterceptor:', {
      url: req.url,
      method: req.method,
      hasToken: !!token,
      isPublicRoute: shouldSkip,
      willAddToken: !shouldSkip && !!token
    });

    // Solo agregar token si NO es ruta pública Y existe token
    if (!shouldSkip && token) {
      console.log('✅ Agregando token Bearer a la petición:', req.url);
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });

      return next.handle(authReq).pipe(
        catchError(error => {
          console.error('❌ Error en petición con token:', {
            url: req.url,
            status: error.status,
            message: error.message
          });

          // Si el token expiró (401), intentar refresh
          if (error.status === 401 && !req.url.includes('/auth/refresh')) {
            console.log('🔄 Token expirado, intentando refresh...');
            return this.handleTokenExpiry(req, next);
          }

          return throwError(() => error);
        })
      );
    }

    if (shouldSkip) {
      console.log('⚪ Ruta pública, no se agrega token:', req.url);
    } else if (!token) {
      console.warn('⚠️ No se agrega token: token no disponible para', req.url);
    }

    return next.handle(req);
  }

  /**
   * Verifica si la URL es una ruta pública
   */
  private isPublicRoute(url: string): boolean {
    return this.publicRoutes.some(pattern => pattern.test(url));
  }

  /**
   * Verifica si la petición es a archivos estáticos (assets)
   */
  private isAssetRequest(url: string): boolean {
    return url.startsWith('./assets') ||
           url.startsWith('/assets') ||
           url.includes('/assets/');
  }

  /**
   * Maneja la expiración del token intentando refreshear
   */
  private handleTokenExpiry(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap(success => {
        if (success) {
          const newToken = this.authService.getAccessToken();
          console.log('✅ Token refrescado exitosamente');

          const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newToken}`)
          });
          return next.handle(authReq);
        } else {
          // Si el refresh falló, logout
          console.error('❌ Refresh token falló, cerrando sesión');
          this.authService.logout();
          return throwError(() => new Error('Sesión expirada'));
        }
      }),
      catchError(error => {
        console.error('❌ Error en refresh token:', error);
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }
}
