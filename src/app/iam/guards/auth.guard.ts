import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Usar el método sincrónico del AuthService para verificar autenticación
    if (this.authService.isAuthenticatedSync()) {
      return true;
    }

    // Si no está autenticado sincrónicamente, verificar con el observable
    return this.authService.getAuthState().pipe(
      take(1),
      map(state => {
        if (state.isAuthenticated) {
          return true;
        }

        // Si no está autenticado, verificar si hay datos en localStorage
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('auth_user');

        if (token && user) {
          // Hay datos almacenados, permitir acceso
          // (el AuthService ya los habrá cargado en su constructor)
          return true;
        }

        // No hay autenticación válida, redirigir al login
        return this.router.createUrlTree(['/auth/login']);
      })
    );
  }
}
