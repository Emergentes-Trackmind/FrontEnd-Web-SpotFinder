import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LoginCredentials,
  RegisterRequest,
  AuthResponse,
  TokenRefreshResponse
} from '../../domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private readonly baseUrl = environment.auth.base;

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}${environment.auth.endpoints.login}`,
      credentials
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}${environment.auth.endpoints.register}`,
      request
    );
  }

  refreshToken(refreshToken: string): Observable<TokenRefreshResponse> {
    return this.http.post<TokenRefreshResponse>(
      `${this.baseUrl}${environment.auth.endpoints.refresh}`,
      { refreshToken }
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}${environment.auth.endpoints.forgot}`,
      { email }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}${environment.auth.endpoints.reset}`,
      { token, newPassword }
    );
  }
}
