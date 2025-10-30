import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ParkingsPort } from '../domain/services/parkings.port';
import { Parking, CreateParkingDto, UpdateParkingDto } from '../domain/entities/parking.entity';
import { AuthService } from '../../iam/services/auth.service';

/**
 * Facade para parkings
 * Expone operaciones de negocio relacionadas con parkings
 */
@Injectable({
  providedIn: 'root'
})
export class ParkingsFacade {
  private parkingsPort = inject(ParkingsPort);
  private authService = inject(AuthService);

  /**
   * Obtiene todos los parkings, opcionalmente filtrados por propietario
   */
  getParkings(ownerId?: string): Observable<Parking[]> {
    console.log('🏢 [ParkingsFacade] Obteniendo parkings', { ownerId });
    return this.parkingsPort.getParkings(ownerId).pipe(
      tap(parkings => console.log(`✅ [ParkingsFacade] ${parkings.length} parkings obtenidos`))
    );
  }

  /**
   * Obtiene un parking por su ID
   */
  getParkingById(id: string): Observable<Parking> {
    console.log('🏢 [ParkingsFacade] Obteniendo parking por ID', { id });
    return this.parkingsPort.getParkingById(id).pipe(
      tap(parking => console.log('✅ [ParkingsFacade] Parking obtenido:', parking.name))
    );
  }

  /**
   * Crea un nuevo parking
   */
  createParking(dto: CreateParkingDto): Observable<Parking> {
    console.log('🏢 [ParkingsFacade] Creando parking', { name: dto.name });
    return this.parkingsPort.createParking(dto).pipe(
      tap(parking => console.log('✅ [ParkingsFacade] Parking creado:', parking.id))
    );
  }

  /**
   * Actualiza un parking existente
   */
  updateParking(id: string, dto: UpdateParkingDto): Observable<Parking> {
    console.log('🏢 [ParkingsFacade] Actualizando parking', { id });
    return this.parkingsPort.updateParking(id, dto).pipe(
      tap(parking => console.log('✅ [ParkingsFacade] Parking actualizado:', parking.id))
    );
  }

  /**
   * Elimina un parking
   */
  deleteParking(id: string): Observable<void> {
    console.log('🏢 [ParkingsFacade] Eliminando parking', { id });
    return this.parkingsPort.deleteParking(id).pipe(
      tap(() => console.log('✅ [ParkingsFacade] Parking eliminado:', id))
    );
  }

  /**
   * Obtiene los parkings del usuario autenticado
   */
  getUserParkings(): Observable<Parking[]> {
    const userId = this.authService.getUserIdFromToken();
    console.log('🏢 [ParkingsFacade] Obteniendo parkings del usuario', { userId });

    if (!userId) {
      console.warn('⚠️ [ParkingsFacade] No se encontró userId del usuario autenticado');
      return this.getParkings();
    }

    return this.getParkings(userId);
  }
}
