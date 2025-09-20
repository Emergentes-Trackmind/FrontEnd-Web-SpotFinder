import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ListReservationsFilters, ListReservationsResponse } from '../../application/use-cases/list-reservations.usecase';

@Injectable({ providedIn: 'root' })
export class ReservationsApi {
  private http = inject(HttpClient);
  private base = environment.reservations.base;

  list(filters: ListReservationsFilters): Observable<ListReservationsResponse> {
    let httpParams = new HttpParams();

    // Agregar filtros a los parámetros HTTP
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(val => {
            httpParams = httpParams.append(key, val.toString());
          });
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });

    return this.http.get<Reservation[]>(this.base, {
      params: httpParams,
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Reservation[]>) => ({
        data: response.body || [],
        total: +(response.headers.get('X-Total-Count') || '0')
      }))
    );
  }

  get(id: string | number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.base}/${id}`);
  }

  patch(id: string | number, data: Partial<Reservation>): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/${id}`, data);
  }
}
