import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationsRepo } from '../../infrastructure/repositories/reservations.repo';

export interface ListReservationsFilters {
  q?: string;
  status?: string[];
  parkingId?: string | number;
  startTime_gte?: string;
  startTime_lte?: string;
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
}

export interface ListReservationsResponse {
  data: Reservation[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ListReservationsUseCase {
  constructor(private repo: ReservationsRepo) {}

  execute(filters: ListReservationsFilters): Observable<ListReservationsResponse> {
    return this.repo.list(filters);
  }
}
