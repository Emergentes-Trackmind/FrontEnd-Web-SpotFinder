import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DeviceKpisDto } from '../../../domain/dtos/device-filters.dto';

/**
 * Componente para mostrar KPIs de dispositivos IoT
 * Muestra: Total, Online, Offline, Mantenimiento
 */
@Component({
  selector: 'app-device-kpis',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="kpis-container">
      <mat-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-icon purple">
            <mat-icon>devices</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Total Dispositivos</span>
            <span class="kpi-value">{{ kpis()?.totalDevices || 0 }}</span>
          </div>
        </div>
      </mat-card>

      <mat-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-icon green">
            <mat-icon>wifi</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Online</span>
            <span class="kpi-value">{{ kpis()?.onlineDevices || 0 }}</span>
          </div>
        </div>
      </mat-card>

      <mat-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-icon red">
            <mat-icon>wifi_off</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Offline</span>
            <span class="kpi-value">{{ kpis()?.offlineDevices || 0 }}</span>
          </div>
        </div>
      </mat-card>

      <mat-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-icon yellow">
            <mat-icon>build</mat-icon>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Mantenimiento</span>
            <span class="kpi-value">{{ kpis()?.maintenanceDevices || 0 }}</span>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .kpis-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      padding: 1.25rem;
    }

    .kpi-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .kpi-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: white;
      }
    }

    .kpi-icon.purple {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .kpi-icon.green {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .kpi-icon.red {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .kpi-icon.yellow {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .kpi-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .kpi-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
    }
  `]
})
export class DeviceKpisComponent {
  kpis = input<DeviceKpisDto | null>(null);
}

