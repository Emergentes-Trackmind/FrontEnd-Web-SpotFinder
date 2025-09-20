import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationsRepo } from '../../infrastructure/repositories/reservations.repo';

@Injectable({ providedIn: 'root' })
export class GetReservationUseCase {
  constructor(private repo: ReservationsRepo) {}

  execute(id: string | number): Observable<Reservation> {
    return this.repo.get(id);
  }
}
