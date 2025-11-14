import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpotStatus } from '../../services/parking-state.service';
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
  @Input() status: SpotStatus = 'free';
  @Input() deviceId: string | null = null;
  @Input() inMaintenance = false;

  @Output() openDetails = new EventEmitter<string>();
  @Output() setMaintenance = new EventEmitter<{ id: number; inMaintenance: boolean }>();

  /**
   * Obtiene el icono según el estado
   */
  getStatusIcon(): string {
    switch (this.status) {
      case 'free':
        return 'check_circle';
      case 'occupied':
        return 'local_parking';
      case 'maintenance':
        return 'engineering';
      case 'offline':
        return 'wifi_off';
      default:
        return 'help';
    }
  }

  /**
   * Obtiene el color del badge según el estado
   */
  getStatusColor(): string {
    switch (this.status) {
      case 'free':
        return 'status-free';
      case 'occupied':
        return 'status-occupied';
      case 'maintenance':
        return 'status-maintenance';
      case 'offline':
        return 'status-offline';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Obtiene el texto descriptivo del estado
   */
  getStatusText(): string {
    switch (this.status) {
      case 'free':
        return this.translate.instant('SPOT.STATUS.FREE');
      case 'occupied':
        return this.translate.instant('SPOT.STATUS.OCCUPIED');
      case 'maintenance':
        return this.translate.instant('SPOT.STATUS.MAINTENANCE');
      case 'offline':
        return this.translate.instant('SPOT.STATUS.OFFLINE');
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
   * Maneja el click en "Marcar en mantenimiento"
   */
  onToggleMaintenance(): void {
    this.setMaintenance.emit({
      id: this.id,
      inMaintenance: !this.inMaintenance
    });
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

  get maintenanceActionLabel(): string {
    return this.inMaintenance ? this.t('SPOT.ACTIONS.REMOVE_MAINTENANCE') : this.t('SPOT.ACTIONS.MARK_MAINTENANCE');
  }
}
