import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Profile, UpdateProfileRequest } from '../domain/entities/profile.entity';
import { GetProfileUseCase } from '../application/use-cases/get-profile.usecase';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.usecase';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly profileSubject = new BehaviorSubject<Profile | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Signals para estado reactivo
  readonly profile = signal<Profile | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor(
    private getProfileUseCase: GetProfileUseCase,
    private updateProfileUseCase: UpdateProfileUseCase
  ) {}

  loadProfile(): Observable<Profile> {
    this.setLoading(true);

    return this.getProfileUseCase.execute().pipe(
      tap(profile => {
        this.profile.set(profile);
        this.profileSubject.next(profile);
        this.setLoading(false);
      })
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<Profile> {
    this.setLoading(true);

    return this.updateProfileUseCase.execute(request).pipe(
      tap(updatedProfile => {
        this.profile.set(updatedProfile);
        this.profileSubject.next(updatedProfile);
        this.setLoading(false);
      })
    );
  }

  private setLoading(loading: boolean): void {
    this.isLoading.set(loading);
    this.loadingSubject.next(loading);
  }

  // Observable para compatibilidad
  getProfile$(): Observable<Profile | null> {
    return this.profileSubject.asObservable();
  }

  getLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }
}
