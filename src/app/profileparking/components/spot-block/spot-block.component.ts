import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpotStatus } from '../../models/spots.models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Componente que representa un bloque individual de spot/plaza
 */
@Component({
  selector: 'app-spot-block',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './spot-block.component.html',
  styleUrls: ['./spot-block.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotBlockComponent {
  constructor(private translate: TranslateService) {}

  @Input() id!: number;
  @Input() spotNumber!: number;
  @Input() status: SpotStatus = 'AVAILABLE';
  @Input() deviceId: string | null = null;
  @Input() iotStatus: 'CONNECTED' | 'OFFLINE' | null = null;
  @Input() sensorSerialNumber: string | null = null;
  @Output() openDetails = new EventEmitter<string>();
  @Output() markAsAvailable = new EventEmitter<number>();
  @Output() markAsOccupied = new EventEmitter<number>();

  /**
   * Obtiene el icono según el estado
   */
  getStatusIcon(): string {
    switch (this.status) {
      case 'AVAILABLE':
        return 'check_circle';
      case 'OCCUPIED':
        return 'local_parking';
      case 'RESERVED':
        return 'event_seat';
      default:
        return 'help_outline';
    }
  }

  /**
   * Obtiene el color del badge según el estado
   */
  getStatusColor(): string {
    switch (this.status) {
      case 'AVAILABLE':
        return 'spot-available';
      case 'OCCUPIED':
        return 'spot-occupied';
      case 'RESERVED':
        return 'spot-reserved';
      default:
        return 'spot-unknown';
    }
  }

  /**
   * Obtiene el texto descriptivo del estado
   */
  getStatusText(): string {
    switch (this.status) {
      case 'AVAILABLE':
        return this.translate.instant('SPOT.STATUS.AVAILABLE');
      case 'OCCUPIED':
        return this.translate.instant('SPOT.STATUS.OCCUPIED');
      case 'RESERVED':
        return this.translate.instant('SPOT.STATUS.RESERVED');
      default:
        return this.translate.instant('SPOT.STATUS.UNKNOWN');
    }
  }

  /**
   * Maneja el click en "Ver detalle de dispositivo IoT"
   */
  onOpenDetails(): void {
    if (this.deviceId) {
      this.openDetails.emit(this.deviceId);
    }
  }

  /**
   * Maneja el click en "Marcar como disponible"
   */
  onMarkAsAvailable(): void {
    this.markAsAvailable.emit(this.id);
  }

  /**
   * Maneja el click en "Marcar como ocupado"
   */
  onMarkAsOccupied(): void {
    this.markAsOccupied.emit(this.id);
  }

  /**
   * Verifica si el spot tiene dispositivo asignado
   */
  get hasDevice(): boolean {
    return !!this.deviceId;
  }

  /**
   * Obtiene el aria-label para accesibilidad
   */
  get ariaLabel(): string {
    const statusText = this.getStatusText();
    const deviceText = this.hasDevice ? this.translate.instant('SPOT.ARIA.HAS_DEVICE') : this.translate.instant('SPOT.ARIA.NO_DEVICE');
    return `Spot ${this.spotNumber}, ${statusText}, ${deviceText}`;
  }



  // Helper para traducir desde la plantilla sin usar el pipe
  t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  // Getters reutilizables para etiquetas usadas en la plantilla
  get noSensorTooltip(): string {
    return this.t('SPOT.NO_SENSOR_TOOLTIP');
  }

  get actionsLabel(): string {
    return this.t('SPOT.ACTIONS.LABEL');
  }

  get viewDeviceLabel(): string {
    return this.t('SPOT.ACTIONS.VIEW_DEVICE');
  }

  get isAvailable(): boolean {
    return this.status === 'AVAILABLE';
  }

  get isOccupied(): boolean {
    return this.status === 'OCCUPIED';
  }

  get isReserved(): boolean {
    return this.status === 'RESERVED';
  }

  /**
   * Obtiene el icono del estado IoT
   */
  getIotIcon(): string {
    if (!this.iotStatus) {
      return 'wifi_off';
    }
    return this.iotStatus === 'CONNECTED' ? 'wifi' : 'wifi_off';
  }

  /**
   * Obtiene el color del icono IoT
   */
  getIotIconColor(): string {
    if (!this.iotStatus) {
      return 'iot-no-sensor';
    }
    return this.iotStatus === 'CONNECTED' ? 'iot-connected' : 'iot-offline';
  }

  /**
   * Obtiene el tooltip del estado IoT
   */
  getIotTooltip(): string {
    if (!this.sensorSerialNumber) {
      return this.t('SPOT.IOT.NO_SENSOR');
    }
    const statusKey = this.iotStatus === 'CONNECTED' ? 'SPOT.IOT.CONNECTED' : 'SPOT.IOT.OFFLINE';
    return `${this.t(statusKey)} - ${this.sensorSerialNumber}`;
  }

  /**
   * Verifica si el spot tiene sensor IoT vinculado
   */
  get hasSensor(): boolean {
    return !!this.sensorSerialNumber;
  }
}
