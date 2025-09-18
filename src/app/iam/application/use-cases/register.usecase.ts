import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RegisterRequest, AuthResponse } from '../../domain/entities/user.entity';
import { RegisterRepository } from '../../infrastructure/repositories/auth.repo';

@Injectable({
  providedIn: 'root'
})
export class RegisterUseCase {
  constructor(@Inject('RegisterRepository') private registerRepo: RegisterRepository) {}

  execute(request: RegisterRequest): Observable<AuthResponse> {
    if (!request.email || !request.password || !request.firstName || !request.lastName) {
      throw new Error('Todos los campos son requeridos');
    }

    if (!request.acceptTerms) {
      throw new Error('Debe aceptar los términos y condiciones');
    }

    return this.registerRepo.register(request);
  }
}
