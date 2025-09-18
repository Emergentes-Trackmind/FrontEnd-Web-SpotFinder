import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResetPasswordRepository } from '../../infrastructure/repositories/auth.repo';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordUseCase {
  constructor(@Inject('ResetPasswordRepository') private resetRepo: ResetPasswordRepository) {}

  execute(token: string, newPassword: string): Observable<{ message: string }> {
    if (!token) {
      throw new Error('Token de recuperación es requerido');
    }

    if (!newPassword) {
      throw new Error('La nueva contraseña es requerida');
    }

    if (newPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    return this.resetRepo.resetPassword(token, newPassword);
  }
}
