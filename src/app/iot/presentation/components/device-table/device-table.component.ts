import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { IotDevice } from '../../../domain/entities/iot-device.entity';

/**
 * Componente tabla de dispositivos IoT
 */
@Component({
  selector: 'app-device-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule
  ],
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="devices() || []" class="devices-table">

        <!-- Columna Dispositivo -->
        <ng-container matColumnDef="device">
          <th mat-header-cell *matHeaderCellDef>Dispositivo</th>
          <td mat-cell *matCellDef="let device">
            <div class="device-info">
              <strong>{{ device.model }}</strong>
              <small>{{ device.serialNumber }}</small>
            </div>
          </td>
        </ng-container>

        <!-- Columna Tipo -->
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Tipo</th>
          <td mat-cell *matCellDef="let device">
            <mat-chip-option [class]="'chip-' + device.type" selected>
              {{ getTypeLabel(device.type) }}
            </mat-chip-option>
          </td>
        </ng-container>

        <!-- Columna Parking -->
        <ng-container matColumnDef="parking">
          <th mat-header-cell *matHeaderCellDef>Parking</th>
          <td mat-cell *matCellDef="let device">
            {{ device.parkingName || 'N/A' }}
          </td>
        </ng-container>

        <!-- Columna Spot -->
        <ng-container matColumnDef="spot">
          <th mat-header-cell *matHeaderCellDef>Spot</th>
          <td mat-cell *matCellDef="let device">
            {{ device.parkingSpotLabel || '-' }}
          </td>
        </ng-container>

        <!-- Columna Estado -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let device">
            <div class="status-badge" [class]="'status-' + device.status">
              <span class="status-dot"></span>
              {{ getStatusLabel(device.status) }}
            </div>
          </td>
        </ng-container>

        <!-- Columna Batería -->
        <ng-container matColumnDef="battery">
          <th mat-header-cell *matHeaderCellDef>Batería</th>
          <td mat-cell *matCellDef="let device">
            <div class="battery-container">
              <mat-progress-bar
                mode="determinate"
                [value]="device.battery"
                [class]="getBatteryClass(device.battery)">
              </mat-progress-bar>
              <span class="battery-value">{{ device.battery }}%</span>
            </div>
          </td>
        </ng-container>

        <!-- Columna Última conexión -->
        <ng-container matColumnDef="lastCheckIn">
          <th mat-header-cell *matHeaderCellDef>Última conexión</th>
          <td mat-cell *matCellDef="let device">
            {{ getTimeAgo(device.lastCheckIn) }}
          </td>
        </ng-container>

        <!-- Columna Acciones -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let device">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="onView.emit(device)">
                <mat-icon>visibility</mat-icon>
                <span>Ver</span>
              </button>
              <button mat-menu-item (click)="onEdit.emit(device)">
                <mat-icon>edit</mat-icon>
                <span>Editar</span>
              </button>
              <button mat-menu-item (click)="onMaintenance.emit(device)">
                <mat-icon>build</mat-icon>
                <span>{{ device.status === 'maintenance' ? 'Restaurar' : 'Mantenimiento' }}</span>
              </button>
              <button mat-menu-item (click)="onDelete.emit(device)">
                <mat-icon>delete</mat-icon>
                <span>Eliminar</span>
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      @if ((devices() || []).length === 0) {
        <div class="empty-state">
          <mat-icon>devices_other</mat-icon>
          <p>No se encontraron dispositivos</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .devices-table {
      width: 100%;
    }

    .device-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      strong {
        font-size: 0.875rem;
        color: #111827;
      }

      small {
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    .chip-sensor {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .chip-camera {
      background-color: #e9d5ff !important;
      color: #6b21a8 !important;
    }

    .chip-barrier {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-online {
      background-color: #d1fae5;
      color: #065f46;

      .status-dot {
        background-color: #10b981;
      }
    }

    .status-offline {
      background-color: #fee2e2;
      color: #991b1b;

      .status-dot {
        background-color: #ef4444;
      }
    }

    .status-maintenance {
      background-color: #fef3c7;
      color: #92400e;

      .status-dot {
        background-color: #f59e0b;
      }
    }

    .battery-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      mat-progress-bar {
        width: 80px;
        height: 8px;
        border-radius: 4px;
      }

      .battery-value {
        font-size: 0.75rem;
        color: #6b7280;
        min-width: 35px;
      }
    }

    ::ng-deep .battery-critical .mdc-linear-progress__bar-inner {
      border-color: #ef4444 !important;
    }

    ::ng-deep .battery-low .mdc-linear-progress__bar-inner {
      border-color: #f59e0b !important;
    }

    ::ng-deep .battery-normal .mdc-linear-progress__bar-inner {
      border-color: #10b981 !important;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #9ca3af;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
      }
    }
  `]
})
export class DeviceTableComponent {
  devices = input<IotDevice[]>([]);

  onView = output<IotDevice>();
  onEdit = output<IotDevice>();
  onMaintenance = output<IotDevice>();
  onDelete = output<IotDevice>();

  displayedColumns = ['device', 'type', 'parking', 'spot', 'status', 'battery', 'lastCheckIn', 'actions'];

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      sensor: 'Sensor',
      camera: 'Cámara',
      barrier: 'Barrera'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      online: 'Online',
      offline: 'Offline',
      maintenance: 'Mantenimiento'
    };
    return labels[status] || status;
  }

  getBatteryClass(battery: number): string {
    if (battery < 15) return 'battery-critical';
    if (battery < 30) return 'battery-low';
    return 'battery-normal';
  }

  getTimeAgo(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace menos de 1 min';
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  }
}

