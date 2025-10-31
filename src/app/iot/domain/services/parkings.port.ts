import { Observable } from 'rxjs';
import { Parking, CreateParkingDto, UpdateParkingDto } from '../entities/parking.entity';

/**
 * Puerto de dominio para operaciones de parkings
 * Define el contrato que debe implementar la infraestructura
 */
export abstract class ParkingsPort {
  // Consultas
  abstract getParkings(ownerId?: string): Observable<Parking[]>;
  abstract getParkingById(id: string): Observable<Parking>;

  // Comandos
  abstract createParking(parking: CreateParkingDto): Observable<Parking>;
  abstract updateParking(id: string, parking: UpdateParkingDto): Observable<Parking>;
  abstract deleteParking(id: string): Observable<void>;
  abstract deleteManyParkings(ids: string[]): Observable<void>;
}
