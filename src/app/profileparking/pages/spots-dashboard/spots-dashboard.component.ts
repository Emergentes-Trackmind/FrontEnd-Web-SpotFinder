import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { SpotsService } from '../../services/spots.service';
import { SpotData, SpotStatistics, SpotFilters, ManualSpotInput, SpotStatus } from '../../models/spots.models';
import {MatDivider} from '@angular/material/divider';
import { IotService } from '../../../iot/services/iot.service';
import { IotDevice } from '../../../iot/domain/entities/iot-device.entity';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeviceAssignmentDialogComponent, DeviceAssignmentData, AssignmentResult } from '../../../iot/presentation/components/device-assignment-dialog/device-assignment-dialog.component';
import { AssignmentConfirmationDialogComponent, AssignmentConfirmationData } from '../../../iot/presentation/components/assignment-confirmation-dialog/assignment-confirmation-dialog.component';

@Component({
  selector: 'app-spots-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDivider,
    MatDialogModule
  ],
  templateUrl: './spots-dashboard.component.html',
  styleUrls: ['./spots-dashboard.component.css']
})
export class SpotsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado del componente
  parkingId!: string;
  loading = false;
  creatingSpot = false;
  showCreateForm = false;

  // Observables
  spots$!: Observable<SpotData[]>;
  statistics$!: Observable<SpotStatistics>;
  filteredSpots$!: Observable<SpotData[]>;

  // Formularios
  createSpotForm!: FormGroup;
  filtersForm!: FormGroup;

  // Datos locales
  spots: SpotData[] = [];
  statistics: SpotStatistics = { total: 0, available: 0, occupied: 0, reserved: 0 };
  availableDevices: IotDevice[] = [];
  loadingDevices = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private spotsService: SpotsService,
    private snackBar: MatSnackBar,
    private iotService: IotService,
    private dialog: MatDialog
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    console.log('🚀 [SpotsDashboard] ===== COMPONENTE INICIALIZADO =====');
    this.parkingId = this.route.snapshot.paramMap.get('id')!;
    console.log('🚀 [SpotsDashboard] parkingId:', this.parkingId);

    if (!this.parkingId) {
      console.warn('⚠️ [SpotsDashboard] No hay parkingId, redirigiendo...');
      this.router.navigate(['/parkings']);
      return;
    }

    console.log('🚀 [SpotsDashboard] Llamando a setupObservables()...');
    this.setupObservables();

    console.log('🚀 [SpotsDashboard] Llamando a loadSpots()...');
    this.loadSpots();

    console.log('🚀 [SpotsDashboard] Llamando a loadAvailableDevices()...');
    this.loadAvailableDevices();

    console.log('🚀 [SpotsDashboard] ===== INICIALIZACIÓN COMPLETADA =====');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Formulario para crear spot manual
    this.createSpotForm = this.fb.group({
      columnLetter: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{1,3}$/)]],
      rowNumber: ['', [Validators.required, Validators.min(1), Validators.max(999)]]
    });

    // Formulario para filtros
    this.filtersForm = this.fb.group({
      status: [''],
      hasDevice: [''],
      column: [''],
      searchTerm: ['']
    });
  }

  private setupObservables(): void {
    this.spots$ = this.spotsService.spots$;
    this.statistics$ = this.spotsService.getSpotStatistics();

    // Aplicar filtros automáticamente
    this.filteredSpots$ = combineLatest([
      this.spots$,
      this.filtersForm.valueChanges.pipe(
        // startWith para emitir valor inicial
        takeUntil(this.destroy$)
      )
    ]).pipe(
      // switchMap para obtener spots filtrados
      takeUntil(this.destroy$)
    );

    // Suscribirse a spots para uso local
    this.spots$.pipe(takeUntil(this.destroy$)).subscribe(spots => {
      this.spots = spots;
    });

    // Suscribirse a estadísticas para uso local
    this.statistics$.pipe(takeUntil(this.destroy$)).subscribe(stats => {
      this.statistics = stats;
    });
  }

  private loadSpots(): void {
    this.loading = true;
    this.spotsService.loadSpotsForParking(this.parkingId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          console.log('✅ Spots cargados exitosamente');
        },
        error: (error: any) => {
          console.error('❌ Error cargando spots:', error);
          this.showError('Error cargando las plazas del parking');
        }
      });
  }

  /**
   * Carga los dispositivos IoT disponibles desde la API edge
   */
  private loadAvailableDevices(): void {
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

    console.log('🔄 [SpotsDashboard] Cargando dispositivos IoT desde edge API...');
    this.loadingDevices = true;

    this.iotService.getUserDevices(userId.toString())
      .pipe(
        finalize(() => this.loadingDevices = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (devices: IotDevice[]) => {
          console.log('📥 [SpotsDashboard] Dispositivos recibidos desde edge API:', devices);

          // Filtrar solo dispositivos no asignados a spots
          this.availableDevices = devices.filter(device => !device.parkingSpotId);

          console.log(`✅ [SpotsDashboard] ${this.availableDevices.length} dispositivos disponibles (sin asignar)`);
        },
        error: (error: any) => {
          console.error('❌ [SpotsDashboard] Error cargando dispositivos IoT desde edge API:', error);
          this.availableDevices = [];
        }
      });
  }

  // ====== MÉTODOS PARA CREACIÓN MANUAL ======

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createSpotForm.reset();
    }
  }

  createManualSpot(): void {
    if (this.createSpotForm.invalid) {
      this.markFormGroupTouched(this.createSpotForm);
      return;
    }

    const formValue = this.createSpotForm.value as ManualSpotInput;

    // Validación de duplicados en el frontend
    const label = `${formValue.columnLetter.toUpperCase()}${formValue.rowNumber}`;
    if (this.spotsService.labelExists(label)) {
      this.showError(`La plaza ${label} ya existe`);
      return;
    }

    this.creatingSpot = true;
    this.spotsService.createManualSpot(this.parkingId, formValue)
      .pipe(
        finalize(() => this.creatingSpot = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (spot: any) => {
          this.showSuccess(`Plaza ${spot.label} creada exitosamente`);
          this.toggleCreateForm();
        },
        error: (error: any) => {
          console.error('❌ Error creando spot:', error);
          this.showError('Error creando la plaza');
        }
      });
  }

  // ====== MÉTODOS PARA GESTIÓN DE SPOTS ======

  updateSpotStatus(spot: SpotData, status: SpotStatus): void {
    if (!spot.id) return;

    this.spotsService.updateSpotStatus(this.parkingId, spot.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess(`Plaza ${spot.label} actualizada`);
        },
        error: (error: any) => {
          console.error('❌ Error actualizando spot:', error);
          this.showError('Error actualizando la plaza');
        }
      });
  }

  deleteSpot(spot: SpotData): void {
    if (!spot.id) return;

    if (confirm(`¿Está seguro de eliminar la plaza ${spot.label}?`)) {
      this.spotsService.deleteSpot(this.parkingId, spot.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess(`Plaza ${spot.label} eliminada`);
          },
          error: (error: any) => {
            console.error('❌ Error eliminando spot:', error);
            this.showError('Error eliminando la plaza');
          }
        });
    }
  }

  // ====== MÉTODOS DE FILTRADO ======

  clearFilters(): void {
    this.filtersForm.reset();
  }

  getFilteredSpots(): SpotData[] {
    const filters = this.filtersForm.value;
    let filtered = [...this.spots];

    // Filtrar por estado
    if (filters.status && filters.status !== '') {
      filtered = filtered.filter(spot => spot.status === filters.status);
    }

    // Filtrar por dispositivo
    if (filters.hasDevice && filters.hasDevice !== '') {
      const hasDevice = filters.hasDevice === 'true' || filters.hasDevice === true;
      filtered = filtered.filter(spot =>
        hasDevice ? !!spot.deviceId : !spot.deviceId
      );
    }

    // Filtrar por búsqueda de texto
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(spot =>
        spot.label.toLowerCase().includes(searchTerm) ||
        (spot.deviceId && spot.deviceId.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  // ====== MÉTODOS DE UTILIDAD ======

  getStatusIcon(status: SpotStatus | string): string {
    switch (status) {
      case 'AVAILABLE': return 'check_circle';
      case 'OCCUPIED': return 'local_parking';
      case 'RESERVED': return 'event_seat';
      default: return 'help';
    }
  }

  getStatusColor(status: SpotStatus): string {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'OCCUPIED': return 'error';
      case 'RESERVED': return 'primary';
      default: return 'default';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // ====== MÉTODOS PARA ASIGNACIÓN DE DISPOSITIVOS ======

  /**
   * Abre el diálogo para asignar un dispositivo IoT a un spot
   */
  onAssignDevice(device: IotDevice): void {
    console.log('🔗 [SpotsDashboard] Iniciando asignación de dispositivo:', device);

    // Obtener spots disponibles (sin dispositivo asignado)
    const availableSpots = this.spots.filter(spot => !spot.deviceId);
    console.log('🏗️ [SpotsDashboard] Plazas disponibles para asignar:', availableSpots.length);

    if (availableSpots.length === 0) {
      this.showError('No hay plazas disponibles para asignar');
      return;
    }

    const dialogData: DeviceAssignmentData = {
      device,
      parkingId: this.parkingId,
      availableSpots: availableSpots
    };

    const dialogRef = this.dialog.open(DeviceAssignmentDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: AssignmentResult) => {
      if (result) {
        console.log('✅ [SpotsDashboard] Resultado de asignación:', result);
        this.showAssignmentConfirmation(result);
      } else {
        console.log('❌ [SpotsDashboard] Asignación cancelada');
      }
    });
  }

  /**
   * Muestra el diálogo de confirmación de asignación
   */
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
        console.log('✅ [SpotsDashboard] Confirmación aceptada, ejecutando asignación...');
        this.executeDeviceAssignment(assignmentResult);
      } else {
        console.log('❌ [SpotsDashboard] Confirmación cancelada');
      }
    });
  }

  /**
   * Ejecuta la asignación del dispositivo al spot
   */
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

    const { device, assignedSpot } = assignmentResult;

    console.log('🔄 [SpotsDashboard] Ejecutando asignación:', {
      deviceId: device.serialNumber,
      parkingId: this.parkingId,
      spotLabel: assignedSpot.label
    });

    // Llamar al servicio para asignar el dispositivo
    this.iotService.updateDeviceAssignment(
      userId,
      device.serialNumber,
      this.parkingId,
      assignedSpot.label
    ).subscribe({
      next: () => {
        console.log('✅ [SpotsDashboard] Dispositivo asignado exitosamente');
        this.showSuccess(`Dispositivo ${device.model} asignado a ${assignedSpot.label}`);

        // Recargar dispositivos y spots
        this.loadAvailableDevices();
        this.loadSpots();
      },
      error: (error: any) => {
        console.error('❌ [SpotsDashboard] Error asignando dispositivo:', error);
        this.showError('Error al asignar el dispositivo');
      }
    });
  }

  // ====== MÉTODOS PARA VINCULACIÓN DE SENSORES IOT ======

  /**
   * Abre un diálogo para vincular un sensor IoT a un spot
   */
  openLinkSensorDialog(spot: SpotData): void {
    console.log('🔗 [SpotsDashboard] Abriendo diálogo para vincular sensor al spot:', spot.label);

    // Crear un prompt para ingresar el serial number
    const serialNumber = prompt(
      `Ingrese el número de serie del sensor IoT para vincular al spot ${spot.label}:`,
      ''
    );

    if (!serialNumber || serialNumber.trim() === '') {
      console.log('❌ [SpotsDashboard] Vinculación cancelada - no se ingresó serial');
      return;
    }

    this.linkSensorToSpot(spot, serialNumber.trim());
  }

  /**
   * Vincula un sensor IoT a un spot
   */
  private linkSensorToSpot(spot: SpotData, serialNumber: string): void {
    if (!spot.id) {
      this.showError('ID de spot inválido');
      return;
    }

    console.log(`🔄 [SpotsDashboard] Vinculando sensor ${serialNumber} al spot ${spot.label}...`);

    this.spotsService.assignIoTDevice(this.parkingId, spot.id, serialNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ [SpotsDashboard] Sensor vinculado exitosamente:', response);
          this.showSuccess(`Sensor ${serialNumber} vinculado al spot ${spot.label}`);
        },
        error: (error) => {
          console.error('❌ [SpotsDashboard] Error vinculando sensor:', error);
          let errorMessage = 'Error al vincular el sensor';

          if (error.status === 404) {
            errorMessage = 'Sensor no encontrado';
          } else if (error.status === 400) {
            errorMessage = 'Datos inválidos o sensor ya vinculado';
          }

          this.showError(errorMessage);
        }
      });
  }

  /**
   * Desvincula un sensor IoT de un spot
   */
  unlinkSensor(spot: SpotData): void {
    if (!spot.id) {
      this.showError('ID de spot inválido');
      return;
    }

    const confirmed = confirm(
      `¿Está seguro que desea desvincular el sensor ${spot.sensorSerialNumber} del spot ${spot.label}?`
    );

    if (!confirmed) {
      console.log('❌ [SpotsDashboard] Desvinculación cancelada por el usuario');
      return;
    }

    console.log(`🔄 [SpotsDashboard] Desvinculando sensor del spot ${spot.label}...`);

    this.spotsService.unassignIoTDevice(this.parkingId, spot.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ [SpotsDashboard] Sensor desvinculado exitosamente');
          this.showSuccess(`Sensor desvinculado del spot ${spot.label}`);
        },
        error: (error) => {
          console.error('❌ [SpotsDashboard] Error desvinculando sensor:', error);
          this.showError('Error al desvincular el sensor');
        }
      });
  }

  // Método para volver a la lista de parkings
  goBack(): void {
    this.router.navigate(['/parkings']);
  }

  // TrackBy function para optimizar el rendimiento del ngFor
  trackBySpotId(index: number, spot: SpotData): string {
    return spot.id || `${spot.label}-${index}`;
  }
}
