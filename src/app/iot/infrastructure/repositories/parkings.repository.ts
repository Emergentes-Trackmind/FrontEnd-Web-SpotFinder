import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ParkingsPort } from '../../domain/services/parkings.port';
import { ParkingsApi } from '../http/parkings.api';
import { Parking, CreateParkingDto, UpdateParkingDto } from '../../domain/entities/parking.entity';

/**
 * Repositorio de parkings
 * Implementa ParkingsPort delegando a ParkingsApi
 */
@Injectable()
export class ParkingsRepository extends ParkingsPort {
  private api = inject(ParkingsApi);

  getParkings(ownerId?: string): Observable<Parking[]> {
    return this.api.getParkings(ownerId);
  }

  getParkingById(id: string): Observable<Parking> {
    return this.api.getParkingById(id);
  }

  createParking(parking: CreateParkingDto): Observable<Parking> {
    return this.api.createParking(parking);
  }

  updateParking(id: string, parking: UpdateParkingDto): Observable<Parking> {
    return this.api.updateParking(id, parking);
  }

  deleteParking(id: string): Observable<void> {
    return this.api.deleteParking(id);
  }
}

