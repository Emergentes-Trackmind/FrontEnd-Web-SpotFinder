import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReservationsApi } from '../http/reservations.api';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ListReservationsFilters, ListReservationsResponse } from '../../application/use-cases/list-reservations.usecase';

@Injectable({ providedIn: 'root' })
export class ReservationsRepo {
  constructor(private api: ReservationsApi) {}

  list(filters: ListReservationsFilters): Observable<ListReservationsResponse> {
    return this.api.list(filters);
  }

  get(id: string | number): Observable<Reservation> {
    return this.api.get(id);
  }

  patch(id: string | number, data: Partial<Reservation>): Observable<Reservation> {
    return this.api.patch(id, data);
  }
}
