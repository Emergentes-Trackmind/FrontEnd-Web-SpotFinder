import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | boolean | UrlTree {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No se requieren roles específicos
    }

    return this.authService.getAuthState().pipe(
      take(1),
      map(state => {
        if (!state.isAuthenticated || !state.user) {
          return this.router.createUrlTree(['/auth/login']);
        }

        const userRoles = state.user.roles || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (hasRequiredRole) {
          return true;
        }

        // Redirigir si no tiene los roles necesarios
        return this.router.createUrlTree(['/unauthorized']);
      })
    );
  }
}
