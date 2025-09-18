import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile, UpdateProfileRequest } from '../../domain/entities/profile.entity';
import { UpdateProfileRepository } from '../../infrastructure/repositories/profile.repo';

@Injectable({
  providedIn: 'root'
})
export class UpdateProfileUseCase {
  constructor(@Inject('UpdateProfileRepository') private updateRepo: UpdateProfileRepository) {}

  execute(request: UpdateProfileRequest): Observable<Profile> {
    if (!request || Object.keys(request).length === 0) {
      throw new Error('Los datos del perfil son requeridos');
    }

    return this.updateRepo.updateProfile(request);
  }
}
