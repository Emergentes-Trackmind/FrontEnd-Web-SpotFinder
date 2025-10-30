import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  User,
  LoginCredentials,
  RegisterRequest,
  AuthResponse
} from '../domain/entities/user.entity';
import { LoginUseCase } from '../application/use-cases/login.usecase';
import { RegisterUseCase } from '../application/use-cases/register.usecase';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.usecase';
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.usecase';
import { ResetPasswordUseCase } from '../application/use-cases/reset-password.usecase';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface JwtPayload {
  sub?: string;
  userId?: string;
  email?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_KEY = 'auth_refresh';
  private readonly USER_KEY = 'auth_user';

  // Estado con signals
  private readonly authState = signal<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false
  });

  // Getters computados
  readonly user = computed(() => this.authState().user);
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly isLoading = computed(() => this.authState().isLoading);
  readonly accessToken = computed(() => this.authState().accessToken);

  // Observable para compatibilidad
  private readonly authSubject = new BehaviorSubject<AuthState>(this.authState());

  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.updateState({ isLoading: true });

    return this.loginUseCase.execute(credentials).pipe(
      tap(response => {
        this.setAuthData(response);
        this.router.navigate(['/parkings']);
      }),
      catchError(error => {
        this.updateState({ isLoading: false });
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    this.updateState({ isLoading: true });

    return this.registerUseCase.execute(request).pipe(
      tap(response => {
        this.setAuthData(response);
        this.router.navigate(['/parkings']);
      }),
      catchError(error => {
        this.updateState({ isLoading: false });
        return throwError(() => error);
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.forgotPasswordUseCase.execute(email);
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.resetPasswordUseCase.execute(token, newPassword);
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = this.authState().refreshToken;

    if (!refreshToken) {
      return of(false);
    }

    return this.refreshTokenUseCase.execute(refreshToken).pipe(
      tap(response => {
        // Para refresh token, solo actualizamos los tokens, manteniendo el usuario actual
        const currentUser = this.authState().user;
        if (currentUser) {
          const authResponse: AuthResponse = {
            user: currentUser,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            expiresIn: response.expiresIn
          };
          this.setAuthData(authResponse);
        }
      }),
      switchMap(() => of(true)),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this.updateState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false
    });
    this.router.navigate(['/auth/login']);
  }

  private setAuthData(response: AuthResponse): void {
    const state: AuthState = {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
      isLoading: false
    };

    this.updateState(state);
    this.saveToStorage(response);
  }

  private updateState(partial: Partial<AuthState>): void {
    const current = this.authState();
    const newState = { ...current, ...partial };
    this.authState.set(newState);
    this.authSubject.next(newState);
  }

  private loadStoredAuth(): void {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_KEY);
      const userData = localStorage.getItem(this.USER_KEY);

      if (token && refreshToken && userData) {
        const user = JSON.parse(userData);
        this.updateState({
          user,
          accessToken: token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(response: AuthResponse): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, response.accessToken);
      localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    } catch (error) {
      console.error('Error saving auth to storage:', error);
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Método público para verificar autenticación (compatible con AuthGuard)
  isAuthenticatedSync(): boolean {
    return this.authState().isAuthenticated;
  }

  // Observable del estado de autenticación
  getAuthState(): Observable<AuthState> {
    return this.authSubject.asObservable();
  }

  /**
   * Obtener el access token actual
   */
  getAccessToken(): string | null {
    return this.authState().accessToken;
  }

  /**
   * Decodificar y obtener el userId del JWT
   * @returns userId del token o null si no existe/no es válido
   */
  getUserIdFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      console.warn('⚠️ No hay token disponible para decodificar');
      return null;
    }

    try {
      const payload = this.decodeJwt(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        console.error('❌ Token no contiene userId o sub claim');
        return null;
      }

      return userId;
    } catch (error) {
      console.error('❌ Error decodificando JWT:', error);
      return null;
    }
  }

  /**
   * Decodificar JWT (solo lectura, NO validación)
   */
  private decodeJwt(token: string): JwtPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      throw error;
    }
  }

  // Método para obtener el token actual
  getCurrentToken(): string | null {
    return this.authState().accessToken;
  }

  // Método para obtener el usuario actual
  getCurrentUser(): User | null {
    return this.authState().user;
  }

  //hola
  // Método de debug para desarrollo
  debugAuthState(): void {
    const state = this.authState();
    console.group('🔍 Auth Debug State');
    console.log('📊 Current State:', {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      hasUser: !!state.user,
      hasAccessToken: !!state.accessToken,
      hasRefreshToken: !!state.refreshToken,
      user: state.user ? {
        id: state.user.id,
        email: state.user.email,
        firstName: state.user.firstName,
        lastName: state.user.lastName,
        roles: state.user.roles
      } : null
    });

    console.log('💾 localStorage contents:', {
      token: localStorage.getItem(this.TOKEN_KEY),
      refreshToken: localStorage.getItem(this.REFRESH_KEY),
      user: localStorage.getItem(this.USER_KEY) ? 'exists' : 'missing',
      userData: localStorage.getItem(this.USER_KEY) ? JSON.parse(localStorage.getItem(this.USER_KEY) || '{}') : null
    });

    console.log('🔑 Token Info:', {
      accessTokenLength: state.accessToken?.length || 0,
      refreshTokenLength: state.refreshToken?.length || 0,
      tokenStarts: state.accessToken ? state.accessToken.substring(0, 20) + '...' : 'none',
      userId: this.getUserIdFromToken()
    });
    console.groupEnd();
  }
}
