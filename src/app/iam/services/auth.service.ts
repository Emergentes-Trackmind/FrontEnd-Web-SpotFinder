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
        this.updateTokens(response.accessToken, response.refreshToken);
      }),
      switchMap(() => of(true)),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private setAuthData(response: AuthResponse): void {
    const newState: AuthState = {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
      isLoading: false
    };

    this.authState.set(newState);
    this.authSubject.next(newState);
    this.storeAuthData(response);
  }

  private updateTokens(accessToken: string, refreshToken: string): void {
    const currentState = this.authState();
    const newState = {
      ...currentState,
      accessToken,
      refreshToken
    };

    this.authState.set(newState);
    this.authSubject.next(newState);

    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  private updateState(partial: Partial<AuthState>): void {
    const currentState = this.authState();
    const newState = { ...currentState, ...partial };

    this.authState.set(newState);
    this.authSubject.next(newState);
  }

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    console.log('🔍 Cargando auth desde localStorage:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!userStr,
      tokenValue: token ? token.substring(0, 20) + '...' : null
    });

    if (token && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        const newState: AuthState = {
          user,
          accessToken: token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false
        };

        console.log('✅ Estado de auth restaurado:', {
          userId: user.id,
          email: user.email,
          isAuthenticated: true,
          tokenLength: token.length
        });

        this.authState.set(newState);
        this.authSubject.next(newState);
      } catch (error) {
        console.error('❌ Error al parsear datos de auth:', error);
        this.clearAuthData();
      }
    } else {
      console.log('⚠️ No hay datos de auth en localStorage - Usuario no logueado');
    }
  }

  // Método para debugging - verificar estado de auth
  debugAuthState(): void {
    const currentState = this.authState();
    console.log('🔎 Estado actual de autenticación:', {
      isAuthenticated: currentState.isAuthenticated,
      hasUser: !!currentState.user,
      hasToken: !!currentState.accessToken,
      userId: currentState.user?.id,
      userEmail: currentState.user?.email,
      tokenPreview: currentState.accessToken?.substring(0, 30) + '...'
    });
  }

  private clearAuthData(): void {
    const newState: AuthState = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false
    };

    this.authState.set(newState);
    this.authSubject.next(newState);

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Observable para guards y componentes que lo necesiten
  getAuthState(): Observable<AuthState> {
    return this.authSubject.asObservable();
  }
}
