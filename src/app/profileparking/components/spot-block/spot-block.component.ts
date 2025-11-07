import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpotStatus } from '../../services/parking-state.service';

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
    MatTooltipModule
  ],
  templateUrl: './spot-block.component.html',
  styleUrls: ['./spot-block.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotBlockComponent {
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
        return 'Libre';
      case 'occupied':
        return 'Ocupado';
      case 'maintenance':
        return 'Mantenimiento';
      case 'offline':
        return 'Sin conexión';
      default:
        return 'Desconocido';
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
    return `Spot ${this.spotNumber}, estado ${this.getStatusText()}${this.hasDevice ? ', dispositivo conectado' : ', sin sensor'}`;
  }
}

