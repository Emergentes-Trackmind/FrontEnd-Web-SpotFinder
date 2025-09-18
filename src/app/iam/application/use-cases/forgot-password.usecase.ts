import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ForgotPasswordRepository } from '../../infrastructure/repositories/auth.repo';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordUseCase {
  constructor(@Inject('ForgotPasswordRepository') private forgotRepo: ForgotPasswordRepository) {}

  execute(email: string): Observable<{ message: string }> {
    if (!email) {
      throw new Error('El email es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }

    return this.forgotRepo.forgotPassword(email);
  }
}
