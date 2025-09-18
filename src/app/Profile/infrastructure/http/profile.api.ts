import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Profile, UpdateProfileRequest } from '../../domain/entities/profile.entity';

@Injectable({
  providedIn: 'root'
})
export class ProfileApi {
  private readonly baseUrl = environment.profile.base;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.baseUrl);
  }

  updateProfile(request: UpdateProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(this.baseUrl, request);
  }
}
