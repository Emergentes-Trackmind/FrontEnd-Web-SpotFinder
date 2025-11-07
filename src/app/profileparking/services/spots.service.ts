import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpotData, SpotStatus } from './parking-state.service';

/**
 * Servicio para gestionar los spots (plazas) de un parking
 * Genera y mantiene el estado de cada spot
 */
@Injectable({
  providedIn: 'root'
})
export class SpotsService {
  private spotsSubject = new BehaviorSubject<Map<number, SpotData>>(new Map());
  spots$: Observable<Map<number, SpotData>> = this.spotsSubject.asObservable();

  /**
   * Genera el array de spots basado en el número total
   * @param totalSpots Número total de plazas (1-300)
   */
  generateSpots(totalSpots: number): SpotData[] {
    if (totalSpots < 1 || totalSpots > 300) {
      console.error('❌ Total de spots debe estar entre 1 y 300');
      return [];
    }

    const spots: SpotData[] = [];
    const spotsMap = new Map<number, SpotData>();

    for (let i = 1; i <= totalSpots; i++) {
      const spot: SpotData = {
        id: i,
        spotNumber: i,
        status: 'free',
        deviceId: null, // Se asignará cuando se vincule un dispositivo IoT
        inMaintenance: false,
        lastUpdated: new Date()
      };
      spots.push(spot);
      spotsMap.set(i, spot);
    }

    this.spotsSubject.next(spotsMap);
    console.log(`✅ Generados ${totalSpots} spots`);
    return spots;
  }

  /**
   * Actualiza el estado de un spot específico
   */
  updateSpotStatus(spotNumber: number, status: SpotStatus, deviceId?: string): void {
    const spotsMap = this.spotsSubject.value;
    const spot = spotsMap.get(spotNumber);

    if (!spot) {
      console.warn(`⚠️ Spot ${spotNumber} no encontrado`);
      return;
    }

    const updatedSpot: SpotData = {
      ...spot,
      status: spot.inMaintenance ? 'maintenance' : status, // Priorizar mantenimiento
      deviceId: deviceId || spot.deviceId,
      lastUpdated: new Date()
    };

    spotsMap.set(spotNumber, updatedSpot);
    this.spotsSubject.next(new Map(spotsMap));
  }

  /**
   * Marca un spot en mantenimiento
   */
  setSpotMaintenance(spotNumber: number, inMaintenance: boolean): void {
    const spotsMap = this.spotsSubject.value;
    const spot = spotsMap.get(spotNumber);

    if (!spot) {
      console.warn(`⚠️ Spot ${spotNumber} no encontrado`);
      return;
    }

    const updatedSpot: SpotData = {
      ...spot,
      inMaintenance,
      status: inMaintenance ? 'maintenance' : spot.status,
      lastUpdated: new Date()
    };

    spotsMap.set(spotNumber, updatedSpot);
    this.spotsSubject.next(new Map(spotsMap));
    console.log(`✅ Spot ${spotNumber} marcado como ${inMaintenance ? 'en mantenimiento' : 'activo'}`);
  }

  /**
   * Asigna un dispositivo IoT a un spot
   */
  assignDevice(spotNumber: number, deviceId: string): void {
    const spotsMap = this.spotsSubject.value;
    const spot = spotsMap.get(spotNumber);

    if (!spot) {
      console.warn(`⚠️ Spot ${spotNumber} no encontrado`);
      return;
    }

    const updatedSpot: SpotData = {
      ...spot,
      deviceId,
      lastUpdated: new Date()
    };

    spotsMap.set(spotNumber, updatedSpot);
    this.spotsSubject.next(new Map(spotsMap));
    console.log(`✅ Dispositivo ${deviceId} asignado al spot ${spotNumber}`);
  }

  /**
   * Restaura spots guardados (usado al volver del paso siguiente)
   */
  restoreSpots(spots: SpotData[]): void {
    const spotsMap = new Map<number, SpotData>();
    spots.forEach(spot => {
      spotsMap.set(spot.spotNumber, spot);
    });
    this.spotsSubject.next(spotsMap);
    console.log(`✅ Restaurados ${spots.length} spots con asignaciones`);
  }

  /**
   * Obtiene las estadísticas de los spots
   */
  getSpotStatistics(): Observable<SpotStatistics> {
    return this.spots$.pipe(
      map(spotsMap => {
        const spots = Array.from(spotsMap.values());
        return {
          total: spots.length,
          free: spots.filter(s => s.status === 'free').length,
          occupied: spots.filter(s => s.status === 'occupied').length,
          maintenance: spots.filter(s => s.status === 'maintenance').length,
          offline: spots.filter(s => s.status === 'offline').length
        };
      })
    );
  }

  /**
   * Obtiene un spot específico
   */
  getSpot(spotNumber: number): SpotData | undefined {
    return this.spotsSubject.value.get(spotNumber);
  }

  /**
   * Obtiene todos los spots como array
   */
  getSpotsArray(): SpotData[] {
    return Array.from(this.spotsSubject.value.values());
  }

  /**
   * Limpia todos los spots
   */
  clearSpots(): void {
    this.spotsSubject.next(new Map());
  }
}

export interface SpotStatistics {
  total: number;
  free: number;
  occupied: number;
  maintenance: number;
  offline: number;
}

