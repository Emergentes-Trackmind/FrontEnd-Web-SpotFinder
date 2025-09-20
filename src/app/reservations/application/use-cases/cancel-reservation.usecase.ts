import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationsRepo } from '../../infrastructure/repositories/reservations.repo';
import { canCancel } from '../../domain/policies/reservation-policies';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';

@Injectable({ providedIn: 'root' })
export class CancelReservationUseCase {
  constructor(private repo: ReservationsRepo) {}

  execute(id: string | number): Observable<Reservation> {
    return this.repo.get(id).pipe(
      tap(reservation => {
        if (!canCancel(reservation.status)) {
          throw new Error(`No se puede cancelar una reserva en estado ${reservation.status}`);
        }
      }),
      switchMap(() => this.repo.patch(id, {
        status: ReservationStatus.CANCELLED,
        updatedAt: new Date().toISOString()
      }))
    );
  }
}
