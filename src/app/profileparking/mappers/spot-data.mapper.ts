import { SpotData as NewSpotData } from '../models/spots.models';
import { SpotData as OldSpotData } from '../services/parking-state.service';

/**
 * Mappers para convertir entre la estructura antigua y nueva de SpotData
 */
export class SpotDataMapper {

  /**
   * Convierte del nuevo modelo SpotData al modelo antiguo usado por ParkingStateService
   */
  static newToOld(newSpot: NewSpotData): OldSpotData {
    // Extraer el número del spot del label (ej: "A1" -> 1, "B5" -> 5)
    const spotNumber = parseInt(newSpot.label.replace(/[A-Z]+/, ''), 10);

    return {
      id: parseInt(newSpot.id || '0'),
      spotNumber: spotNumber,
      status: newSpot.status, // Usar directamente el status sin mapear
      deviceId: newSpot.deviceId || null,
      inMaintenance: false, // Ya no se usa maintenance
      lastUpdated: newSpot.lastUpdated || new Date()
    };
  }

  /**
   * Convierte del modelo antiguo al nuevo modelo SpotData
   */
  static oldToNew(oldSpot: OldSpotData, column?: number, row?: number): NewSpotData {
    // Generar label basado en spotNumber si no se proporcionan columna y fila
    const label = this.generateLabelFromSpotNumber(oldSpot.spotNumber);

    return {
      id: oldSpot.id.toString(),
      parkingId: undefined,
      row: row || this.extractRowFromSpotNumber(oldSpot.spotNumber),
      column: column || this.extractColumnFromSpotNumber(oldSpot.spotNumber),
      label: label,
      status: oldSpot.status, // Usar directamente el status sin mapear
      deviceId: oldSpot.deviceId,
      lastUpdated: oldSpot.lastUpdated
    };
  }

  /**
   * Convierte array del nuevo modelo al antiguo
   */
  static arrayNewToOld(newSpots: NewSpotData[]): OldSpotData[] {
    return newSpots.map(spot => this.newToOld(spot));
  }

  /**
   * Convierte array del modelo antiguo al nuevo
   */
  static arrayOldToNew(oldSpots: OldSpotData[]): NewSpotData[] {
    return oldSpots.map(spot => this.oldToNew(spot));
  }

  private static mapNewStatusToOld(newStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'): 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' {
    // Ahora ambos formatos usan los mismos enums del backend
    return newStatus;
  }

  private static mapOldStatusToNew(oldStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'): 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' {
    // Ahora ambos formatos usan los mismos enums del backend
    return oldStatus;
  }

  private static generateLabelFromSpotNumber(spotNumber: number): string {
    // Asumir regla del 5: cada 5 spots es una nueva columna
    const column = Math.ceil(spotNumber / 5);
    const row = ((spotNumber - 1) % 5) + 1;
    const columnLetter = this.columnNumberToLetter(column);

    return `${columnLetter}${row}`;
  }

  private static extractRowFromSpotNumber(spotNumber: number): number {
    // Asumir regla del 5
    return ((spotNumber - 1) % 5) + 1;
  }

  private static extractColumnFromSpotNumber(spotNumber: number): number {
    // Asumir regla del 5
    return Math.ceil(spotNumber / 5);
  }

  private static columnNumberToLetter(columnNumber: number): string {
    let result = '';
    let num = columnNumber;

    while (num > 0) {
      num--; // Hacer que sea base 0
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }

    return result;
  }
}
