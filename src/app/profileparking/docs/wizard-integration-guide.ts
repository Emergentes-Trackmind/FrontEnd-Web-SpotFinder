/**
 * GUÍA DE INTEGRACIÓN: Cómo integrar la generación automática de spots en el wizard existente
 *
 * Este archivo muestra cómo modificar el componente de creación de parking existente
 * para incluir la generación automática de spots cuando el usuario complete el registro.
 */

// ============================================
// 1. IMPORTS NECESARIOS EN EL COMPONENTE WIZARD
// ============================================

/*
import { ParkingWizardSpotsService } from '../services/parking-wizard-spots.service';
*/

// ============================================
// 2. INYECTAR EL SERVICIO EN EL CONSTRUCTOR
// ============================================

/*
constructor(
  // ...otros servicios existentes
  private parkingWizardSpots: ParkingWizardSpotsService
) {}
*/

// ============================================
// 3. MODIFICAR EL MÉTODO DE ENVÍO DEL FORMULARIO
// ============================================

/*
// En el método donde se crea el parking (ej: onSubmit, createParking, etc.)
// ANTES - código existente:
this.parkingService.createParking(parkingData).subscribe({
  next: (response) => {
    console.log('✅ Parking creado:', response);
    this.router.navigate(['/parkings']);
  },
  error: (error) => {
    console.error('❌ Error creando parking:', error);
  }
});

// DESPUÉS - código modificado con generación automática de spots:
this.parkingService.createParking(parkingData).subscribe({
  next: (response) => {
    console.log('✅ Parking creado:', response);

    // NUEVA FUNCIONALIDAD: Generar spots automáticamente
    const totalSpots = parkingData.totalSpaces; // Este valor viene del "Paso 1"
    const parkingId = response.id;

    console.log(`🚀 Generando ${totalSpots} spots automáticamente...`);

    this.parkingWizardSpots.createAutoSpotsForNewParking(parkingId, totalSpots)
      .subscribe({
        next: (spotsResponse) => {
          console.log(`✅ ${spotsResponse.length} spots generados automáticamente`);
          this.showSuccess(`Parking creado con ${spotsResponse.length} plazas generadas automáticamente`);
          this.router.navigate(['/parkings']);
        },
        error: (spotsError) => {
          console.error('❌ Error generando spots:', spotsError);
          // El parking ya fue creado, solo falló la generación de spots
          this.showWarning('Parking creado, pero ocurrió un error generando las plazas automáticamente. Puede crearlas manualmente desde la gestión de plazas.');
          this.router.navigate(['/parkings']);
        }
      });
  },
  error: (error) => {
    console.error('❌ Error creando parking:', error);
    this.showError('Error creando el parking');
  }
});
*/

// ============================================
// 4. OPCIONAL: VISTA PREVIA EN EL WIZARD
// ============================================

/*
// Si quieres mostrar una vista previa de cómo se distribuirán las plazas
// en algún paso del wizard, puedes usar:

showDistributionPreview(totalSpots: number): void {
  const preview = this.parkingWizardSpots.getDistributionPreview(totalSpots);
  console.log('📊 Distribución de plazas:', preview);

  // Ejemplo de salida:
  // [
  //   { column: 'A', spots: ['A1', 'A2', 'A3', 'A4', 'A5'], count: 5 },
  //   { column: 'B', spots: ['B1', 'B2', 'B3', 'B4', 'B5'], count: 5 },
  //   { column: 'C', spots: ['C1', 'C2'], count: 2 }
  // ]
}
*/

// ============================================
// 5. VALIDACIÓN DEL NÚMERO DE SPOTS
// ============================================

/*
// En el formulario del "Paso 1", añadir validación:
onTotalSpotsChange(totalSpots: number): void {
  const validation = this.parkingWizardSpots.isValidSpotCount(totalSpots);

  if (!validation.valid) {
    console.warn('⚠️ Número de spots inválido:', validation.message);
    this.showError(validation.message);
    // Marcar el campo como inválido o mostrar mensaje de error
  } else {
    console.log('✅ Número de spots válido');
    // Opcional: mostrar vista previa
    this.showDistributionPreview(totalSpots);
  }
}
*/

// ============================================
// 6. EJEMPLO DE TEMPLATE HTML PARA VISTA PREVIA
// ============================================

/*
<!-- En el template del wizard, paso donde se ingresa totalSpaces -->
<div class="spots-preview" *ngIf="showPreview && totalSpots > 0">
  <h4>Vista previa de distribución de plazas:</h4>
  <div class="columns-preview">
    <div
      *ngFor="let col of getDistributionPreview(totalSpots)"
      class="column-preview">
      <div class="column-header">Columna {{ col.column }} ({{ col.count }})</div>
      <div class="spots-list">
        <span
          *ngFor="let spot of col.spots"
          class="spot-preview">
          {{ spot }}
        </span>
      </div>
    </div>
  </div>
  <p class="preview-note">
    <mat-icon>info</mat-icon>
    Las plazas se generarán automáticamente con un máximo de 5 filas por columna.
  </p>
</div>
*/

export const INTEGRATION_GUIDE = {
  title: 'Guía de integración para generación automática de spots',
  description: 'Este archivo contiene ejemplos de código para integrar la funcionalidad de generación automática de spots en el wizard existente.',
  keyPoints: [
    'Importar ParkingWizardSpotsService',
    'Modificar el método de creación de parking para incluir generación de spots',
    'Manejar errores apropiadamente (parking creado pero spots fallaron)',
    'Opcional: mostrar vista previa de distribución',
    'Validar número de spots en el formulario'
  ]
};
