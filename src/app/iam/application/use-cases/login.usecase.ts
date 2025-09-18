import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginCredentials, AuthResponse } from '../../domain/entities/user.entity';
import { LoginRepository } from '../../infrastructure/repositories/auth.repo';

@Injectable({
  providedIn: 'root'
})
export class LoginUseCase {
  constructor(@Inject('LoginRepository') private loginRepo: LoginRepository) {}

  execute(credentials: LoginCredentials): Observable<AuthResponse> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    return this.loginRepo.login(credentials);
  }
}
