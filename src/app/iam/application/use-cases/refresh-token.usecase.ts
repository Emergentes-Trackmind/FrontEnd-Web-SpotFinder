import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenRefreshResponse } from '../../domain/entities/user.entity';
import { RefreshTokenRepository } from '../../infrastructure/repositories/auth.repo';

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenUseCase {
  constructor(@Inject('RefreshTokenRepository') private refreshRepo: RefreshTokenRepository) {}

  execute(refreshToken: string): Observable<TokenRefreshResponse> {
    if (!refreshToken) {
      throw new Error('Refresh token es requerido');
    }

    return this.refreshRepo.refreshToken(refreshToken);
  }
}
