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

    // Occupied → Free (plaza liberada)
    if (previousStatus === 'occupied' && update.status === 'free') {
      this.showSuccess(`✅ Plaza ${spotNumber} ahora está libre`);
      return;
    }

    // Free → Occupied (plaza ocupada)
    if (previousStatus === 'free' && update.status === 'occupied') {
      this.showInfo(`🚗 Plaza ${spotNumber} ocupada`);
      return;
    }

    // Offline → Online (sensor recuperado)
    if (previousStatus === 'offline' && update.status !== 'offline') {
      this.showSuccess(`🔌 Sensor de plaza ${spotNumber} conectado`);
      return;
    }

    // Online → Offline (sensor perdido)
    if (previousStatus !== 'offline' && update.status === 'offline') {
      this.showWarning(`⚠️ Sensor de plaza ${spotNumber} desconectado`);
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

