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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DevicesFacade } from '../../../services/devices.facade';
import { LimitsService } from '../../../../billing/services/limits.service';
import { CreationLimitGuard } from '../../../../billing/guards/creation-limit.guard';
import { DeviceKpisComponent } from '../../components/device-kpis/device-kpis.component';
import { DeviceTableComponent } from '../../components/device-table/device-table.component';
import { DeviceAssignmentDialogComponent, DeviceAssignmentData, AssignmentResult } from '../../components/device-assignment-dialog/device-assignment-dialog.component';
import { AssignmentConfirmationDialogComponent, AssignmentConfirmationData } from '../../components/assignment-confirmation-dialog/assignment-confirmation-dialog.component';
import { IotDevice } from '../../../domain/entities/iot-device.entity';
import { TranslateModule } from '@ngx-translate/core';
import { IotService } from '../../../services/iot.service';

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
    MatTooltipModule,
    MatDialogModule,
    DeviceKpisComponent,
    DeviceTableComponent,
    TranslateModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-title">
          <h1>Dispositivos IoT</h1>
          <p>Gestiona tus sensores, cámaras y barreras</p>
        </div>
        <button
          mat-raised-button
          color="primary"
          (click)="onAddDevice()"
          [disabled]="!canCreateDevice"
          [matTooltip]="addDeviceTooltip">
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
        (onAssign)="onAssignDevice($event)"
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
  private dialog = inject(MatDialog);
  private limitsService = inject(LimitsService);
  private limitGuard = inject(CreationLimitGuard);
  private iotService = inject(IotService);

  searchQuery = '';
  selectedType: any = 'all';
  selectedStatus: any = 'all';
  selectedParking: any = 'all';

  ngOnInit(): void {
    // 🔧 SOLUCIÓN: Primero cargar límites, DESPUÉS cargar dispositivos
    console.log('🔄 [DevicesDashboard] Cargando límites...');
    this.limitsService.load().subscribe({
      next: () => {
        console.log('✅ [DevicesDashboard] Límites cargados:', {
          canCreate: this.canCreateDevice,
          limitsInfo: this.limitsService.limitsInfo(),
          tooltip: this.addDeviceTooltip
        });

        // AHORA sí cargar los datos (después de cargar límites)
        this.loadData();
      },
      error: (error) => {
        console.error('❌ [DevicesDashboard] Error cargando límites:', error);
        // Intentar cargar datos de todas formas
        this.loadData();
      }
    });
  }

  loadData(): void {
    // Obtener userId del localStorage
    const token = localStorage.getItem('token');
    let userId = '1761826163261'; // Usuario por defecto

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.sub || userId;
      } catch (e) {
        console.warn('No se pudo decodificar el token, usando userId por defecto');
      }
    }

    console.log('🔄 [DevicesDashboard] Cargando dispositivos desde edge API...');
    this.iotService.getUserDevices(userId.toString()).subscribe({
      next: (devices) => {
        console.log('📥 [DevicesDashboard] Dispositivos recibidos desde edge API:', devices);

        const devicesArray = devices || [];
        const totalDevices = devicesArray.length;

        console.log('📊 [DevicesDashboard] Dispositivos procesados:', {
          total: totalDevices,
          devices: devicesArray
        });

        // Actualizar el facade con los dispositivos recibidos de la edge API
        // Esto mantiene compatibilidad con los componentes existentes
        this.facade.setDevices(devicesArray);

        // Calcular KPIs basados en los dispositivos reales del edge API
        this.calculateAndSetKpis(devicesArray);

        // Actualizar el conteo de dispositivos IoT en el servicio de límites
        console.log(`🔢 [DevicesDashboard] Actualizando conteo IoT a: ${totalDevices}`);
        this.limitsService.updateIotCount(totalDevices);

        // Esperar un tick para que el computed se actualice
        setTimeout(() => {
          console.log('✅ [DevicesDashboard] Conteo IoT actualizado. Nuevo estado:', {
            canCreate: this.canCreateDevice,
            limitsInfo: this.limitsService.limitsInfo()
          });
        }, 100);
      },
      error: (err) => {
        console.error('❌ [DevicesDashboard] Error cargando dispositivos desde edge API:', err);
        let errorMessage = 'Error al cargar dispositivos';

        if (err.status === 0) {
          errorMessage = 'No se puede conectar con el servidor IoT. Verifica la conexión.';
        } else if (err.status === 404) {
          // En caso de 404, mostrar lista vacía en lugar de error
          this.facade.setDevices([]);
          this.calculateAndSetKpis([]); // También limpiar KPIs
          this.limitsService.updateIotCount(0);
          return;
        }

        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  onSearchChange(): void {
    this.onFilterChange();
  }

  onFilterChange(): void {
    // Para mantener la funcionalidad de filtros, recargamos los datos
    // En una implementación futura, el edge API podría soportar filtros
    this.loadData();
  }

  /**
   * Calcula los KPIs basándose en los dispositivos reales del edge API
   */
  private calculateAndSetKpis(devices: any[]): void {
    // Calcular estadísticas de batería
    const batteries = devices.map(d => d.battery || 100);
    const averageBattery = batteries.length > 0 ?
      Math.round(batteries.reduce((sum, battery) => sum + battery, 0) / batteries.length) : 0;
    const criticalBatteryCount = batteries.filter(b => b < 15).length;
    const lowBatteryCount = batteries.filter(b => b >= 15 && b <= 30).length;

    // Normalizar estados a minúsculas para comparación consistente
    const normalizeStatus = (status: string) => status?.toLowerCase() || 'offline';

    const kpis = {
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => normalizeStatus(d.status) === 'online').length,
      offlineDevices: devices.filter(d => normalizeStatus(d.status) === 'offline').length,
      maintenanceDevices: devices.filter(d => normalizeStatus(d.status) === 'maintenance').length,
      averageBattery,
      criticalBatteryCount,
      lowBatteryCount
    };

    console.log('📊 [DevicesDashboard] KPIs calculados desde edge API:', kpis);
    console.log('📋 [DevicesDashboard] Estados de dispositivos:', devices.map(d => ({
      serial: d.serialNumber,
      status: d.status,
      normalized: normalizeStatus(d.status)
    })));

    // Actualizar los KPIs en el facade
    this.facade.setKpis(kpis);
  }

  onAddDevice(): void {
    // Verificar límites antes de navegar
    if (this.limitGuard.canCreateDevice()) {
      this.router.navigate(['/iot/devices/new']);
    }
  }

  /**
   * Verifica si se puede crear un nuevo dispositivo
   */
  get canCreateDevice(): boolean {
    return this.limitsService.canCreateDevice();
  }

  /**
   * Obtiene el tooltip para el botón de añadir dispositivo
   */
  get addDeviceTooltip(): string {
    if (this.canCreateDevice) {
      return 'Añadir un nuevo dispositivo IoT';
    }

    const limits = this.limitsService.limitsInfo();
    return `Has alcanzado el límite de ${limits.iot.limit} dispositivos IoT. Actualiza tu plan para añadir más.`;
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
    const displayName = device.model || device.serialNumber;
    if (confirm(`¿Estás seguro de desvincular el dispositivo "${displayName}"? El dispositivo seguirá existiendo en el sistema, pero no estará asociado a tu usuario.`)) {
      // Obtener userId del localStorage
      const token = localStorage.getItem('token');
      let userId = '1761826163261';

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId || payload.sub || userId;
        } catch (e) {
          console.warn('No se pudo decodificar el token, usando userId por defecto');
        }
      }

      this.iotService.unbindDevice(userId.toString(), device.serialNumber).subscribe({
        next: () => {
          this.snackBar.open('✅ Dispositivo desvinculado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (err) => {
          console.error('Error al desvincular dispositivo:', err);
          let errorMessage = '❌ Error al desvincular dispositivo';

          if (err.status === 404) {
            errorMessage = '❌ Dispositivo no encontrado o ya no está vinculado.';
          } else if (err.status === 403) {
            errorMessage = '❌ No tienes permisos para desvincular este dispositivo.';
          }

          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  onAssignDevice(device: IotDevice): void {
    // Abrir el diálogo de asignación de dispositivos
    const dialogData: DeviceAssignmentData = {
      device,
      parkingId: device.parkingId || this.getUserParkingId()
    };

    const dialogRef = this.dialog.open(DeviceAssignmentDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: AssignmentResult) => {
      if (result) {
        // Mostrar diálogo de confirmación
        this.showAssignmentConfirmation(result);
      }
    });
  }

  private showAssignmentConfirmation(assignmentResult: AssignmentResult): void {
    const confirmationData: AssignmentConfirmationData = {
      device: assignmentResult.device,
      spot: assignmentResult.assignedSpot,
      action: assignmentResult.action
    };

    const confirmationRef = this.dialog.open(AssignmentConfirmationDialogComponent, {
      width: '550px',
      maxHeight: '90vh',
      data: confirmationData,
      disableClose: false
    });

    confirmationRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.executeDeviceAssignment(assignmentResult);
      }
    });
  }

  private executeDeviceAssignment(assignmentResult: AssignmentResult): void {
    // Obtener userId del localStorage
    const token = localStorage.getItem('token');
    let userId = '1761826163261';

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.sub || userId;
      } catch (e) {
        console.warn('No se pudo decodificar el token, usando userId por defecto');
      }
    }

    // Actualizar el dispositivo con los nuevos IDs de la plaza
    const parkingId = assignmentResult.assignedSpot.parkingId?.toString() || assignmentResult.device.parkingId || '1';
    const spotId = assignmentResult.assignedSpot.id;

    // Usar el método correcto del servicio IoT
    this.iotService.updateDeviceAssignment(
      userId.toString(),
      assignmentResult.device.serialNumber,
      parkingId,
      spotId || undefined
    ).subscribe({
      next: () => {
        const actionText = assignmentResult.action === 'reassign' ? 'reasignado' : 'asignado';
        this.snackBar.open(
          `✅ Dispositivo ${actionText} exitosamente a la plaza ${assignmentResult.assignedSpot.label}`,
          'Cerrar',
          { duration: 4000 }
        );
        // Recargar los datos para mostrar los cambios
        this.loadData();
      },
      error: (error) => {
        console.error('Error al asignar dispositivo:', error);
        const actionText = assignmentResult.action === 'reassign' ? 'reasignar' : 'asignar';
        this.snackBar.open(
          `❌ Error al ${actionText} dispositivo. Inténtalo de nuevo.`,
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  private getUserParkingId(): string {
    // Método auxiliar para obtener el parkingId del usuario actual
    // Esto debería obtenerse del contexto del usuario o localStorage
    return localStorage.getItem('currentParkingId') || '1';
  }
}
