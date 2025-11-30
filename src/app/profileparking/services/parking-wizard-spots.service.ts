import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SpotsService } from '../services/spots.service';
import { SpotGeneratorHelper } from '../helpers/spot-generator.helper';
import { CreateSpotRequest } from '../models/spots.models';

/**
 * Servicio para integrar la generación automática de spots en el wizard de creación de parking
 */
@Injectable({
  providedIn: 'root'
})
export class ParkingWizardSpotsService {

  constructor(private spotsService: SpotsService) {}

  /**
   * Método para ser llamado desde el wizard cuando el usuario completa el registro
   * Este método se ejecuta después de crear el parking exitosamente
   *
   * @param parkingId ID del parking recién creado
   * @param totalSpots Número total de plazas ingresado en el "Paso 1"
   * @returns Observable con el resultado de la operación
   */
  createAutoSpotsForNewParking(parkingId: string, totalSpots: number): Observable<any> {
    console.log(`🚀 ParkingWizard: Iniciando generación automática de ${totalSpots} spots para parking ${parkingId}`);

    // Generar los spots usando el helper con la regla del 5
    const spotsToCreate = this.spotsService.generateAutoSpots(totalSpots);

    if (spotsToCreate.length === 0) {
      console.error('❌ ParkingWizard: No se pudieron generar los spots');
      return of(null);
    }

    // Crear los spots en el backend
    return this.spotsService.createBulkSpots(parkingId, spotsToCreate);
  }

  /**
   * Vista previa de cómo se distribuirán las plazas (opcional para mostrar en el wizard)
   *
   * @param totalSpots Número de plazas
   * @returns Array de objetos con la distribución por columnas
   */
  getDistributionPreview(totalSpots: number): { column: string, spots: string[], count: number }[] {
    const spots = SpotGeneratorHelper.generateAutoSpots(totalSpots);
    const distribution = new Map<number, string[]>();

    // Agrupar por columna
    spots.forEach(spot => {
      if (!distribution.has(spot.column)) {
        distribution.set(spot.column, []);
      }
      distribution.get(spot.column)!.push(spot.label);
    });

    // Convertir a formato de vista previa
    const preview: { column: string, spots: string[], count: number }[] = [];
    distribution.forEach((spotLabels, columnNumber) => {
      const columnLetter = SpotGeneratorHelper.columnNumberToLetter(columnNumber);
      preview.push({
        column: columnLetter,
        spots: spotLabels,
        count: spotLabels.length
      });
    });

    return preview;
  }

  /**
   * Validar si el número de spots es válido para la generación automática
   */
  isValidSpotCount(totalSpots: number): { valid: boolean, message?: string } {
    if (totalSpots < 1) {
      return { valid: false, message: 'El número de plazas debe ser mayor a 0' };
    }

    if (totalSpots > 300) {
      return { valid: false, message: 'El número máximo de plazas es 300' };
    }

    return { valid: true };
  }
}
