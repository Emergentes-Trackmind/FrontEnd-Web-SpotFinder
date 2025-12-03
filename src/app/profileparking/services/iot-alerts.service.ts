import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpotStatus } from './parking-state.service';
import { IoTStatusUpdate } from './iot-simulation.service';

/**
 * Servicio para gestionar alertas y notificaciones de IoT
 */
@Injectable({
  providedIn: 'root'
})
export class IoTAlertsService {
  private previousStates = new Map<number, SpotStatus>();

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Procesa una actualización IoT y muestra alertas si hay cambios significativos
   */
  processUpdate(update: IoTStatusUpdate): void {
    const previousStatus = this.previousStates.get(update.spotNumber);

    // Primera vez que vemos este spot
    if (!previousStatus) {
      this.previousStates.set(update.spotNumber, update.status);
      return;
    }

    // Si no hay cambio, no hacer nada
    if (previousStatus === update.status) {
      return;
    }

    // Detectar cambios importantes
    this.handleStatusChange(update, previousStatus);

    // Actualizar estado previo
    this.previousStates.set(update.spotNumber, update.status);
  }

  /**
   * Maneja cambios de estado y muestra notificaciones apropiadas
   */
  private handleStatusChange(update: IoTStatusUpdate, previousStatus: SpotStatus): void {
    const spotNumber = update.spotNumber;

    // OCCUPIED → AVAILABLE (plaza liberada)
    if (previousStatus === 'OCCUPIED' && update.status === 'AVAILABLE') {
      this.showSuccess(`✅ Plaza ${spotNumber} ahora está disponible`);
      return;
    }

    // AVAILABLE → OCCUPIED (plaza ocupada)
    if (previousStatus === 'AVAILABLE' && update.status === 'OCCUPIED') {
      this.showInfo(`🚗 Plaza ${spotNumber} ocupada`);
      return;
    }

    // RESERVED → AVAILABLE (reserva cancelada)
    if (previousStatus === 'RESERVED' && update.status === 'AVAILABLE') {
      this.showInfo(`🅿️ Reserva de plaza ${spotNumber} cancelada`);
      return;
    }

    // AVAILABLE → RESERVED (plaza reservada)
    if (previousStatus === 'AVAILABLE' && update.status === 'RESERVED') {
      this.showInfo(`📅 Plaza ${spotNumber} reservada`);
      return;
    }

    // OCCUPIED → RESERVED (cambio de ocupado a reservado)
    if (previousStatus === 'OCCUPIED' && update.status === 'RESERVED') {
      this.showInfo(`📅 Plaza ${spotNumber} ahora está reservada`);
      return;
    }

    // RESERVED → OCCUPIED (reserva confirmada)
    if (previousStatus === 'RESERVED' && update.status === 'OCCUPIED') {
      this.showInfo(`✅ Reserva de plaza ${spotNumber} confirmada`);
      return;
    }

    // Batería baja
    if (update.battery < 20) {
      this.showWarning(`🔋 Batería baja en plaza ${spotNumber} (${update.battery}%)`);
    }
  }

  /**
   * Muestra notificación de éxito
   */
  showSuccess(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Muestra notificación informativa
   */
  showInfo(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Muestra notificación de advertencia
   */
  showWarning(message: string, duration = 4000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Muestra notificación de error
   */
  showError(message: string, duration = 5000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Limpia el historial de estados
   */
  clearHistory(): void {
    this.previousStates.clear();
  }
}

