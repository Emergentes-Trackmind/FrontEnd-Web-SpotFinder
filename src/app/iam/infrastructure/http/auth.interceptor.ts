import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.accessToken();

    console.log('🔍 AuthInterceptor:', {
      url: req.url,
      hasToken: !!token,
      shouldAddToken: this.shouldAddToken(req.url)
    });

    // Solo agregar token si existe y la URL requiere autenticación
    if (token && this.shouldAddToken(req.url)) {
      console.log('✅ Agregando token Bearer a la petición');
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });

      return next.handle(authReq).pipe(
        catchError(error => {
          console.error('❌ Error en petición con token:', error);
          // Si el token expiró (401), intentar refresh
          if (error.status === 401 && !req.url.includes('/auth/refresh')) {
            return this.handleTokenExpiry(req, next);
          }
          return throwError(() => error);
        })
      );
    } else {
      console.log('⚠️ No se agrega token:', { hasToken: !!token, shouldAdd: this.shouldAddToken(req.url) });
    }

    return next.handle(req);
  }

  private shouldAddToken(url: string): boolean {
    // No agregar token a rutas de autenticación públicas
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
    return !publicRoutes.some(route => url.includes(route));
  }

  private handleTokenExpiry(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap(success => {
        if (success) {
          const newToken = this.authService.accessToken();
          const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newToken}`)
          });
          return next.handle(authReq);
        } else {
          // Si el refresh falló, logout
          this.authService.logout();
          return throwError(() => new Error('Sesión expirada'));
        }
      }),
      catchError(error => {
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }
}
