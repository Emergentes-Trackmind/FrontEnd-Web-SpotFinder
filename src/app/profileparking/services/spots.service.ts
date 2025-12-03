import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  SpotData,
  SpotResponse,
  CreateSpotRequest,
  ManualSpotInput,
  SpotStatistics,
  SpotFilters,
  SpotStatus,
  SPOT_CONSTANTS
} from '../models/spots.models';
import { SpotGeneratorHelper } from '../helpers/spot-generator.helper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotsService {
  private readonly baseUrl = environment.apiBase + '/parkings';
  public spotsSubject = new BehaviorSubject<SpotData[]>([]);

  spots$ = this.spotsSubject.asObservable();

  constructor(private http: HttpClient) {}

  generateAutoSpots(totalSpots: number): CreateSpotRequest[] {
    if (totalSpots < SPOT_CONSTANTS.MIN_TOTAL_SPOTS || totalSpots > SPOT_CONSTANTS.MAX_TOTAL_SPOTS) {
      console.error(`Total de spots debe estar entre ${SPOT_CONSTANTS.MIN_TOTAL_SPOTS} y ${SPOT_CONSTANTS.MAX_TOTAL_SPOTS}`);
      return [];
    }

    return SpotGeneratorHelper.generateAutoSpots(totalSpots);
  }

  createBulkSpots(parkingId: string, spots: CreateSpotRequest[]): Observable<SpotResponse[]> {
    console.log(`Creando ${spots.length} spots para parking ${parkingId}`);

    return this.http.post<SpotResponse[]>(`${this.baseUrl}/${parkingId}/spots/bulk`, spots)
      .pipe(
        map(response => {
          console.log(`${response.length} spots creados exitosamente`);
          this.loadSpotsForParking(parkingId).subscribe();
          return response;
        }),
        catchError(error => {
          console.error('Error creando spots:', error);
          return throwError(error);
        })
      );
  }

  createManualSpot(parkingId: string, input: ManualSpotInput): Observable<SpotResponse> {
    const spotRequest = SpotGeneratorHelper.createManualSpot(input.columnLetter, input.rowNumber);

    if (!spotRequest) {
      return throwError('Datos de spot inválidos');
    }

    const existingSpots = this.spotsSubject.value;
    if (SpotGeneratorHelper.labelExists(spotRequest.label, existingSpots)) {
      return throwError(`El spot ${spotRequest.label} ya existe`);
    }

    console.log(`Creando spot manual: ${spotRequest.label}`);

    return this.http.post<SpotResponse>(`${this.baseUrl}/${parkingId}/spots`, spotRequest)
      .pipe(
        map(response => {
          console.log(`Spot ${response.label} creado exitosamente`);
          this.loadSpotsForParking(parkingId).subscribe();
          return response;
        }),
        catchError(error => {
          console.error('Error creando spot manual:', error);
          return throwError(error);
        })
      );
  }

  loadSpotsForParking(parkingId: string): Observable<SpotResponse[]> {
    return this.http.get<SpotResponse[]>(`${this.baseUrl}/${parkingId}/spots`)
      .pipe(
        map(response => {
          const spotsData = this.mapResponseToSpotData(response);
          this.spotsSubject.next(spotsData);
          console.log(`Cargados ${response.length} spots para parking ${parkingId}`);
          return response;
        }),
        catchError(error => {
          console.error('Error cargando spots:', error);
          return throwError(error);
        })
      );
  }

  updateSpotStatus(parkingId: string, spotId: string, status: SpotStatus): Observable<SpotResponse> {
    return this.http.patch<SpotResponse>(`${this.baseUrl}/${parkingId}/spots/${spotId}`, { status })
      .pipe(
        map(response => {
          console.log(`Spot ${response.label} actualizado a ${status}`);
          this.loadSpotsForParking(parkingId).subscribe();
          return response;
        }),
        catchError(error => {
          console.error('Error actualizando spot:', error);
          return throwError(error);
        })
      );
  }

  deleteSpot(parkingId: string, spotId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${parkingId}/spots/${spotId}`)
      .pipe(
        map(() => {
          console.log(`Spot eliminado exitosamente`);
          this.loadSpotsForParking(parkingId).subscribe();
        }),
        catchError(error => {
          console.error('Error eliminando spot:', error);
          return throwError(error);
        })
      );
  }

  private mapResponseToSpotData(spots: SpotResponse[]): SpotData[] {
    return spots.map(spot => ({
      id: spot.id,
      parkingId: spot.parkingId,
      row: spot.rowIndex,
      column: spot.columnIndex,
      label: spot.label,
      status: spot.status,
      lastUpdated: new Date()
    }));
  }

  getSpotStatistics(): Observable<SpotStatistics> {
    return this.spots$.pipe(
      map(spots => ({
        total: spots.length,
        available: spots.filter(s => s.status === 'AVAILABLE').length,
        occupied: spots.filter(s => s.status === 'OCCUPIED').length,
        reserved: spots.filter(s => s.status === 'RESERVED').length
      }))
    );
  }

  getFilteredSpots(filters: SpotFilters): Observable<SpotData[]> {
    return this.spots$.pipe(
      map(spots => {
        let filteredSpots = [...spots];

        if (filters.status) {
          filteredSpots = filteredSpots.filter(spot => spot.status === filters.status);
        }

        if (filters.hasDevice !== undefined) {
          filteredSpots = filteredSpots.filter(spot =>
            filters.hasDevice ? !!spot.deviceId : !spot.deviceId
          );
        }

        if (filters.column) {
          filteredSpots = filteredSpots.filter(spot => spot.column === filters.column);
        }

        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          filteredSpots = filteredSpots.filter(spot =>
            spot.label.toLowerCase().includes(searchTerm) ||
            (spot.deviceId && spot.deviceId.toLowerCase().includes(searchTerm))
          );
        }

        return filteredSpots;
      })
    );
  }

  labelExists(label: string): boolean {
    const currentSpots = this.spotsSubject.value;
    return SpotGeneratorHelper.labelExists(label, currentSpots);
  }

  clearSpots(): void {
    this.spotsSubject.next([]);
  }
}
