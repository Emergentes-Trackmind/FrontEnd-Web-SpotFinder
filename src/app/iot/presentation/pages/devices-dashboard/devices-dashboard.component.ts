import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DevicesFacade } from '../../../services/devices.facade';
import { DeviceKpisComponent } from '../../components/device-kpis/device-kpis.component';
import { DeviceTableComponent } from '../../components/device-table/device-table.component';
import { IotDevice } from '../../../domain/entities/iot-device.entity';
import { DeviceFiltersDto } from '../../../domain/dtos/device-filters.dto';

/**
 * Dashboard principal de dispositivos IoT
 * Muestra KPIs, filtros y tabla de dispositivos
 */
@Component({
  selector: 'app-devices-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    DeviceKpisComponent,
    DeviceTableComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-title">
          <h1>Dispositivos IoT</h1>
          <p>Gestiona tus sensores, cámaras y barreras</p>
        </div>
        <button mat-raised-button color="primary" (click)="onAddDevice()">
          <mat-icon>add</mat-icon>
          Añadir Dispositivo
        </button>
      </div>

      <!-- KPIs -->
      <app-device-kpis [kpis]="facade.kpis$()"></app-device-kpis>

      <!-- Filtros y búsqueda -->
      <mat-card class="filters-card">
        <div class="filters-container">
          <mat-form-field class="search-field">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput
                   placeholder="Buscar dispositivo..."
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="onSearchChange()">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Tipo</mat-label>
            <mat-select [(ngModel)]="selectedType" (ngModelChange)="onFilterChange()">
              <mat-option value="all">Todos</mat-option>
              <mat-option value="sensor">Sensor</mat-option>
              <mat-option value="camera">Cámara</mat-option>
              <mat-option value="barrier">Barrera</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()">
              <mat-option value="all">Todos</mat-option>
              <mat-option value="online">Online</mat-option>
              <mat-option value="offline">Offline</mat-option>
              <mat-option value="maintenance">Mantenimiento</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Parking</mat-label>
            <mat-select [(ngModel)]="selectedParking" (ngModelChange)="onFilterChange()">
              <mat-option value="all">Todos</mat-option>
              <!-- TODO: Cargar parkings del usuario -->
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Tabla de dispositivos -->
      <app-device-table
        [devices]="facade.devices$()"
        (onView)="onViewDevice($event)"
        (onEdit)="onEditDevice($event)"
        (onMaintenance)="onToggleMaintenance($event)"
        (onDelete)="onDeleteDevice($event)">
      </app-device-table>

      <!-- Loading overlay -->
      @if (facade.loading$()) {
        <div class="loading-overlay">
          <mat-icon class="loading-spinner">hourglass_empty</mat-icon>
          <p>Cargando dispositivos...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-title {
      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
      }

      p {
        color: #6b7280;
        margin: 0.5rem 0 0 0;
      }
    }

    .filters-card {
      margin-bottom: 1.5rem;
      padding: 1.5rem;
    }

    .filters-container {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1rem;
      align-items: center;
    }

    .search-field {
      width: 100%;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;

      .loading-spinner {
        font-size: 48px;
        width: 48px;
        height: 48px;
        animation: spin 2s linear infinite;
        color: #667eea;
      }

      p {
        margin-top: 1rem;
        color: #6b7280;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .filters-container {
        grid-template-columns: 1fr;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class DevicesDashboardComponent implements OnInit {
  facade = inject(DevicesFacade);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  searchQuery = '';
  selectedType: any = 'all';
  selectedStatus: any = 'all';
  selectedParking: any = 'all';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.facade.loadKpis().subscribe({
      error: (err) => {
        this.snackBar.open('Error al cargar KPIs', 'Cerrar', { duration: 3000 });
      }
    });

    this.facade.loadDevices().subscribe({
      error: (err) => {
        this.snackBar.open('Error al cargar dispositivos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSearchChange(): void {
    this.onFilterChange();
  }

  onFilterChange(): void {
    const filters: DeviceFiltersDto = {
      q: this.searchQuery || undefined,
      type: this.selectedType,
      status: this.selectedStatus,
      parkingId: this.selectedParking,
      page: 1,
      size: 10
    };

    this.facade.loadDevices(filters).subscribe({
      error: (err) => {
        this.snackBar.open('Error al filtrar dispositivos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onAddDevice(): void {
    this.router.navigate(['/iot/devices/new']);
  }

  onViewDevice(device: IotDevice): void {
    this.router.navigate(['/iot/devices', device.id]);
  }

  onEditDevice(device: IotDevice): void {
    this.router.navigate(['/iot/devices', device.id, 'edit']);
  }

  onToggleMaintenance(device: IotDevice): void {
    const action = device.status === 'maintenance'
      ? this.facade.restoreDevice(device.id)
      : this.facade.setMaintenance(device.id);

    action.subscribe({
      next: () => {
        this.snackBar.open(
          device.status === 'maintenance'
            ? 'Dispositivo restaurado'
            : 'Dispositivo en mantenimiento',
          'Cerrar',
          { duration: 3000 }
        );
        this.loadData();
      },
      error: () => {
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onDeleteDevice(device: IotDevice): void {
    if (confirm(`¿Estás seguro de eliminar el dispositivo ${device.model}?`)) {
      this.facade.deleteDevice(device.id).subscribe({
        next: () => {
          this.snackBar.open('Dispositivo eliminado', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Error al eliminar dispositivo', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}

