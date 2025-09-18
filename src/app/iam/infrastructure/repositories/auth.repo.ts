import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthApi } from '../http/auth.api';
import {
  LoginCredentials,
  RegisterRequest,
  AuthResponse,
  TokenRefreshResponse
} from '../../domain/entities/user.entity';

export interface LoginRepository {
  login(credentials: LoginCredentials): Observable<AuthResponse>;
}

export interface RegisterRepository {
  register(request: RegisterRequest): Observable<AuthResponse>;
}

export interface RefreshTokenRepository {
  refreshToken(refreshToken: string): Observable<TokenRefreshResponse>;
}

export interface ForgotPasswordRepository {
  forgotPassword(email: string): Observable<{ message: string }>;
}

export interface ResetPasswordRepository {
  resetPassword(token: string, newPassword: string): Observable<{ message: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthRepository implements
  LoginRepository,
  RegisterRepository,
  RefreshTokenRepository,
  ForgotPasswordRepository,
  ResetPasswordRepository {

  constructor(private authApi: AuthApi) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.authApi.login(credentials);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.authApi.register(request);
  }

  refreshToken(refreshToken: string): Observable<TokenRefreshResponse> {
    return this.authApi.refreshToken(refreshToken);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.authApi.forgotPassword(email);
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.authApi.resetPassword(token, newPassword);
  }
}
