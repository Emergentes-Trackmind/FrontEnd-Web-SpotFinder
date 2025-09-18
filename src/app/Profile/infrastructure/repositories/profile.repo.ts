import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileApi } from '../http/profile.api';
import { Profile, UpdateProfileRequest } from '../../domain/entities/profile.entity';

export interface ProfileRepository {
  getProfile(): Observable<Profile>;
}

export interface UpdateProfileRepository {
  updateProfile(request: UpdateProfileRequest): Observable<Profile>;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileRepositoryImpl implements ProfileRepository, UpdateProfileRepository {
  constructor(private profileApi: ProfileApi) {}

  getProfile(): Observable<Profile> {
    return this.profileApi.getProfile();
  }

  updateProfile(request: UpdateProfileRequest): Observable<Profile> {
    return this.profileApi.updateProfile(request);
  }
}
