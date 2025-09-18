import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../../domain/entities/profile.entity';
import { ProfileRepository } from '../../infrastructure/repositories/profile.repo';

@Injectable({
  providedIn: 'root'
})
export class GetProfileUseCase {
  constructor(@Inject('ProfileRepository') private profileRepo: ProfileRepository) {}

  execute(): Observable<Profile> {
    return this.profileRepo.getProfile();
  }
}
