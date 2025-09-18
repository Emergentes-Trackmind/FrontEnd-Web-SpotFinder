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

  canActivate(): Observable<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.getAuthState().pipe(
      take(1),
      map(state => {
        if (state.isAuthenticated && state.user) {
          return true;
        }

        // Redirigir al login si no está autenticado
        return this.router.createUrlTree(['/auth/login']);
      })
    );
  }
}
