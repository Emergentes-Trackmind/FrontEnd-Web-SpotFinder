import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SpotBlockComponent } from '../../../../components/spot-block/spot-block.component';
import { ParkingStateService, SpotFilterType } from '../../../../services/parking-state.service';
import { SpotsService } from '../../../../services/spots-new.service';
import { ParkingWizardSpotsService } from '../../../../services/parking-wizard-spots.service';
import { SpotData, SpotStatistics, SpotStatus, SPOT_CONSTANTS } from '../../../../models/spots.models';
import { SpotDataMapper } from '../../../../mappers/spot-data.mapper';
import { IoTService } from '../../../../services/iot-simulation.service';
import { IoTAlertsService } from '../../../../services/iot-alerts.service';
import { IotService } from '../../../../../iot/services/iot.service';
import { DeviceAssignmentDialogComponent, DeviceAssignmentData, AssignmentResult } from '../../../../../iot/presentation/components/device-assignment-dialog/device-assignment-dialog.component';
import { AssignmentConfirmationDialogComponent, AssignmentConfirmationData } from '../../../../../iot/presentation/components/assignment-confirmation-dialog/assignment-confirmation-dialog.component';
import { IotDevice } from '../../../../../iot/domain/entities/iot-device.entity';



/**
 * Step 2: Visualización de Plazas (Spots)
 * Muestra N bloques según el valor de "Número Total de Plazas" del Step 1
 */
@Component({
  selector: 'app-spots-visualizer-step',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    ScrollingModule,
    SpotBlockComponent,
    TranslateModule
  ],
  templateUrl: './spots-visualizer-step.component.html',
  styleUrls: ['./spots-visualizer-step.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotsVisualizerStepComponent implements OnInit, OnDestroy {
  spots: SpotData[] = [];
  filteredSpots: SpotData[] = [];
  statistics: SpotStatistics = {
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0
  };

  currentFilter: SpotFilterType = 'all';
  totalSpots = 0;

  // Dispositivos IoT disponibles
  availableDevices: IotDevice[] = [];

  private destroy$ = new Subject<void>();

  readonly filterOptions = [
    { value: 'all' as SpotFilterType, label: 'Todos', icon: 'grid_view' },
    { value: 'available' as SpotFilterType, label: 'Disponibles', icon: 'check_circle', color: 'available' },
    { value: 'occupied' as SpotFilterType, label: 'Ocupados', icon: 'local_parking', color: 'occupied' },
    { value: 'reserved' as SpotFilterType, label: 'Reservados', icon: 'event_seat', color: 'reserved' }
  ];

  constructor(
    private parkingStateService: ParkingStateService,
    private spotsService: SpotsService,
    private parkingWizardSpots: ParkingWizardSpotsService,
    private iotService: IoTService,
    private alertsService: IoTAlertsService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private edgeIotService: IotService
  ) {}

  // Helper para traducciones en plantilla
  t(key: string, params?: any) {
    return this.translate.instant(key, params);
  }

  ngOnInit(): void {
    // Verificar que venimos del Step 1
    const basicInfo = this.parkingStateService.getBasicInfo();
    if (!basicInfo || !basicInfo.totalSpaces) {
      console.warn('⚠️ No hay información básica, redirigiendo al Step 1');
      this.router.navigate(['/parkings/new']);
      return;
    }

    this.totalSpots = basicInfo.totalSpaces;

    // Validar rango usando las nuevas constantes
    if (this.totalSpots < SPOT_CONSTANTS.MIN_TOTAL_SPOTS || this.totalSpots > SPOT_CONSTANTS.MAX_TOTAL_SPOTS) {
      this.alertsService.showError(`El número de plazas debe estar entre ${SPOT_CONSTANTS.MIN_TOTAL_SPOTS} y ${SPOT_CONSTANTS.MAX_TOTAL_SPOTS}`);
      this.router.navigate(['/parkings/new']);
      return;
    }

    // 🚀 NUEVA FUNCIONALIDAD: Verificar si hay spots creados automáticamente
    this.checkForAutoCreatedSpots();

    // Generar spots usando el nuevo sistema
    const savedSpots = this.parkingStateService.getSpots();

    if (savedSpots && savedSpots.length === this.totalSpots) {
      // Restaurar spots guardados con sus asignaciones - convertir del formato antiguo al nuevo
      this.spots = SpotDataMapper.arrayOldToNew(savedSpots);
      const spotsWithDevices = this.spots.filter(s => s.deviceId);
      console.log(`✅ Restaurando ${savedSpots.length} spots guardados, ${spotsWithDevices.length} con dispositivos asignados`);
      if (spotsWithDevices.length > 0) {
        console.log('📱 Spots con dispositivos:', spotsWithDevices.map(s => `Spot ${s.label} -> ${s.deviceId}`));
      }
      // Actualizar el estado local del servicio
      this.spotsService.updateSpots(this.spots);
    } else {
      // Generar spots nuevos usando el sistema refactorizado
      console.log('✅ Generando spots nuevos con la regla del 5');
      const spotsRequests = this.spotsService.generateAutoSpots(this.totalSpots);

      // Convertir CreateSpotRequest a SpotData para el wizard
      this.spots = spotsRequests.map((request: any, index: number) => ({
        id: `temp-${index + 1}`,
        row: request.row,
        column: request.column,
        label: request.label,
        status: 'AVAILABLE' as const,
        deviceId: null,
        lastUpdated: new Date()
      }));

      // Actualizar el estado local del servicio
      this.spotsService.updateSpots(this.spots);
    }

    this.filteredSpots = [...this.spots];

    // NO registrar dispositivos simulados - usar solo los reales del usuario

    // La suscripción a spots$ se maneja en checkForAutoCreatedSpots()

    // Suscribirse a estadísticas
    this.spotsService.getSpotStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats: SpotStatistics) => {
        this.statistics = stats;
        this.cdr.markForCheck();
      });

    // Suscribirse a actualizaciones IoT
    // NO iniciar simulación IoT - usar solo dispositivos reales
    // Restaurar filtro guardado
    const savedFilter = this.parkingStateService.currentState.filterSelection;
    if (savedFilter) {
      this.applyFilter(savedFilter);
    }

    // Cargar dispositivos IoT disponibles y sincronizar con spots
    this.loadAvailableDevices().then(() => {
      console.log(`✅ Step 2 iniciado con ${this.totalSpots} spots`);
    });
  }

  ngOnDestroy(): void {
    // Ya no hay simulación que detener
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Aplica un filtro a los spots
   */
  applyFilter(filter: SpotFilterType): void {
    this.currentFilter = filter;
    this.parkingStateService.setFilterSelection(filter);

    if (filter === 'all') {
      this.filteredSpots = [...this.spots];
    } else {
      // Mapear el filtro del formato de UI al enum del backend
      let newStatus: SpotStatus | null = null;
      switch (filter) {
        case 'available':
          newStatus = 'AVAILABLE';
          break;
        case 'occupied':
          newStatus = 'OCCUPIED';
          break;
        case 'reserved':
          newStatus = 'RESERVED';
          break;
      }

      if (newStatus) {
        this.filteredSpots = this.spots.filter(spot => spot.status === newStatus);
      } else {
        this.filteredSpots = [...this.spots];
      }
    }

    this.cdr.markForCheck();
  }

  /**
   * Maneja el click en "Ver detalle de dispositivo IoT"
   */
  onOpenDeviceDetails(deviceId: string): void {
    console.log(`📱 Navegando a detalles del dispositivo: ${deviceId}`);
    // Navegar al módulo IoT
    this.router.navigate(['/iot/devices', deviceId]);
  }

  /**
   * Maneja el click en "Marcar como disponible"
   */
  onMarkAsAvailable(spotId: number): void {
    // Encontrar el spot por número (convertir desde el ID numérico)
    const spot = this.spots.find(s => {
      const spotNum = parseInt(s.label.replace(/[A-Z]+/, ''), 10);
      return spotNum === spotId;
    });

    if (!spot) {
      console.error(`❌ Spot con número ${spotId} no encontrado`);
      return;
    }

    // Actualizar el estado local
    spot.status = 'AVAILABLE';
    spot.lastUpdated = new Date();

    // Actualizar el servicio
    this.spotsService.updateSpots([...this.spots]);

    this.alertsService.showSuccess(`Plaza ${spot.label} marcada como disponible`);
  }

  /**
   * Maneja el click en "Marcar como ocupado"
   */
  onMarkAsOccupied(spotId: number): void {
    // Encontrar el spot por número (convertir desde el ID numérico)
    const spot = this.spots.find(s => {
      const spotNum = parseInt(s.label.replace(/[A-Z]+/, ''), 10);
      return spotNum === spotId;
    });

    if (!spot) {
      console.error(`❌ Spot con número ${spotId} no encontrado`);
      return;
    }

    // Actualizar el estado local
    spot.status = 'OCCUPIED';
    spot.lastUpdated = new Date();

    // Actualizar el servicio
    this.spotsService.updateSpots([...this.spots]);

    this.alertsService.showSuccess(`Plaza ${spot.label} marcada como ocupada`);
  }

  /**
   * Navega al paso anterior
   */
  onPreviousClick(): void {
    this.parkingStateService.setCurrentStep(1);
    this.router.navigate(['/parkings/new']);
  }

  /**
   * Navega al siguiente paso
   */
  onNextClick(): void {
    // Guardar datos de spots en el estado - convertir al formato antiguo
    const currentSpots = [...this.spots];
    const oldFormatSpots = SpotDataMapper.arrayNewToOld(currentSpots);
    this.parkingStateService.setSpotsData(oldFormatSpots);
    this.parkingStateService.setCurrentStep(3);

    console.log(`✅ Guardando ${currentSpots.length} spots, ${currentSpots.filter(s => s.deviceId).length} con dispositivos IoT asignados`);

    // Navegar al siguiente paso (antiguo Step 2, ahora Step 3)
    this.router.navigate(['/parkings/new/step-3']);
  }

  /**
   * Obtiene el número de slides por vista según el ancho de pantalla
   */
  getSlidesPerView(): number {
    if (typeof window === 'undefined') return 5;

    const width = window.innerWidth;
    if (width < 640) return 2;
    if (width < 1024) return 3;
    if (width < 1440) return 5;
    return 7;
  }

  /**
   * TrackBy para optimización de rendering
   */
  trackBySpotNumber(index: number, spot: SpotData): string {
    return spot.id || spot.label;
  }

  /**
   * Obtiene el número de spot desde el label (ej: "A1" -> 1, "B5" -> 5)
   */
  getSpotNumberFromLabel(label: string): number {
    return parseInt(label.replace(/[A-Z]+/, ''), 10);
  }

  /**
   * Obtiene el label del spot desde el número
   */
  getSpotLabelFromNumber(spotNumber: number): string {
    const spot = this.spots.find(s => {
      const num = parseInt(s.label.replace(/[A-Z]+/, ''), 10);
      return num === spotNumber;
    });
    return spot ? spot.label : `Spot ${spotNumber}`;
  }

  /**
   * Obtiene la cantidad de spots para un filtro específico
   */
  getFilterCount(filterValue: SpotFilterType): number {
    switch (filterValue) {
      case 'available':
        return this.statistics.available;
      case 'occupied':
        return this.statistics.occupied;
      case 'reserved':
        return this.statistics.reserved;
      case 'all':
        return this.statistics.total;
      default:
        return 0;
    }
  }

  /**
   * Obtiene spots disponibles (sin dispositivo asignado)
   */
  getAvailableSpots(): SpotData[] {
    return this.spots.filter(spot => !spot.deviceId);
  }


  /**
   * Mapea el nuevo estado al formato antiguo para compatibilidad con SpotBlockComponent
   */
  mapNewStatusToOld(newStatus: SpotStatus): 'free' | 'occupied' | 'reserved' {
    switch (newStatus) {
      case 'AVAILABLE':
        return 'free';
      case 'OCCUPIED':
        return 'occupied';
      case 'RESERVED':
        return 'reserved';
      default:
        return 'free';
    }
  }

  /**
   * Carga los dispositivos IoT disponibles del usuario desde edge API
   */
  private async loadAvailableDevices(): Promise<void> {
    try {
      // Obtener userId del token
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

      console.log('🔄 Cargando dispositivos desde edge API...');

      // Usar el nuevo servicio edge IoT
      this.edgeIotService.getUserDevices(userId.toString()).subscribe({
        next: (devices: IotDevice[]) => {
          console.log('📥 Dispositivos recibidos desde edge API:', devices);

          // Usar directamente los dispositivos del dominio
          this.availableDevices = devices;

          // IMPORTANTE: Sincronizar con las asignaciones guardadas en los spots
          this.syncDevicesWithSpots();

          this.cdr.markForCheck();
          console.log(`✅ ${this.availableDevices.length} dispositivos IoT disponibles desde edge API`);
          console.log('🔍 Dispositivos cargados:', this.availableDevices.map(d => ({
            id: d.id,
            model: d.model,
            parkingSpotLabel: d.parkingSpotLabel
          })));
        },
        error: (error: any) => {
          console.error('❌ Error cargando dispositivos IoT desde edge API:', error);
          this.availableDevices = [];
          this.cdr.markForCheck();
        }
      });
    } catch (error) {
      console.error('❌ Error inesperado cargando dispositivos IoT:', error);
      this.availableDevices = [];
      this.cdr.markForCheck();
    }
  }

  /**
   * Sincroniza los dispositivos cargados con las asignaciones guardadas en los spots
   */
  private syncDevicesWithSpots(): void {
    const currentSpots = [...this.spots];
    let syncCount = 0;

    // Para cada dispositivo, verificar si está asignado a algún spot
    this.availableDevices.forEach(device => {
      const assignedSpot = currentSpots.find(spot => spot.deviceId === device.id);
      if (assignedSpot) {
        // Actualizar el parkingSpotLabel del dispositivo
        (device as any).parkingSpotLabel = assignedSpot.label;
        syncCount++;
      }
    });

    if (syncCount > 0) {
      console.log(`🔄 Sincronizados ${syncCount} dispositivos con sus spots asignados`);
    }
  }

  /**
   * Obtiene el icono según el tipo de dispositivo
   */
  getDeviceIcon(type: string): string {
    switch (type) {
      case 'ultrasonic':
        return 'sensors';
      case 'magnetic':
        return 'trip_origin';
      case 'infrared':
        return 'lightbulb';
      case 'camera':
        return 'videocam';
      default:
        return 'devices';
    }
  }


  /**
   * Asigna un dispositivo IoT a un spot usando el label del spot
   */
  assignDeviceToSpot(deviceId: string, spotLabel: string): void {
    // Encontrar el dispositivo
    const device = this.availableDevices.find(d => d.id === deviceId);
    if (!device) {
      console.error(`❌ Dispositivo ${deviceId} no encontrado en availableDevices`);
      return;
    }

    // Encontrar el spot por label
    const spot = this.spots.find(s => s.label === spotLabel);

    if (!spot) {
      console.error(`❌ Spot ${spotLabel} no encontrado`);
      return;
    }

    console.log(`📱 Asignando dispositivo ${device.model} (${deviceId}) al Spot ${spot.label}`);

    // Actualizar el spot local
    spot.deviceId = deviceId;
    spot.lastUpdated = new Date();

    // Actualizar el servicio
    this.spotsService.updateSpots([...this.spots]);

    // Actualizar el dispositivo local para que la UI se actualice
    (device as any).parkingSpotLabel = spotLabel;

    // Obtener información del parking para la actualización en edge API
    const basicInfo = this.parkingStateService.getBasicInfo();
    // En fase de wizard, usar el nombre del parking como identificador temporal
    const parkingId = basicInfo?.name || `parking-${Date.now()}`;

    // Obtener userId del token
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

    // Solo actualizar edge API si no es un ID temporal generado automáticamente
    if (basicInfo?.name && !parkingId.startsWith('parking-')) {
      // Actualizar asignación en edge API solo si el parking ya existe
      console.log(`🔄 Actualizando asignación en edge API para dispositivo ${device.serialNumber}`);
      this.edgeIotService.updateDeviceAssignment(
        userId.toString(),
        device.serialNumber,
        parkingId,
        spotLabel
      ).subscribe({
        next: () => {
          console.log(`✅ Dispositivo ${device.serialNumber} actualizado en edge API`);
        },
        error: (error: any) => {
          console.warn(`⚠️ No se pudo actualizar en edge API:`, error);
        }
      });
    } else {
      console.log(`⏳ Asignación local guardada. Se actualizará en edge API cuando se cree el parking real.`);
    }

    // ✨ CRÍTICO: Guardar INMEDIATAMENTE en el estado global
    const currentSpots = [...this.spots];
    const oldFormatSpots = SpotDataMapper.arrayNewToOld(currentSpots);
    this.parkingStateService.setSpotsData(oldFormatSpots);
    console.log(`💾 Estado guardado inmediatamente - ${currentSpots.filter(s => s.deviceId).length} dispositivos asignados`);

    // Verificar que se guardó correctamente
    console.log(`✅ Spot ${spot.label} actualizado:`, spot);

    // Verificar total de dispositivos asignados
    const totalAssigned = currentSpots.filter(s => s.deviceId).length;
    console.log(`📊 Total de dispositivos asignados: ${totalAssigned}`);

    this.alertsService.showSuccess(`✅ Dispositivo ${device.model} asignado al Spot ${spot.label}`);
    this.cdr.markForCheck();
  }

  /**
   * Desasigna un dispositivo IoT de un spot
   */
  unassignDevice(deviceId: string): void {
    // Encontrar el dispositivo
    const device = this.availableDevices.find(d => d.id === deviceId);
    if (!device || !(device as any).parkingSpotLabel) return;

    const spotLabel = (device as any).parkingSpotLabel;

    console.log(`🔗 Desasignando dispositivo ${device.model} del Spot ${spotLabel}`);

    // Obtener userId del token
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

    // Obtener información del parking para verificar si es real o temporal
    const basicInfo = this.parkingStateService.getBasicInfo();
    const parkingId = basicInfo?.name || `parking-${Date.now()}`;

    // Solo limpiar edge API si no es un ID temporal generado automáticamente
    if (basicInfo?.name && !parkingId.startsWith('parking-')) {
      console.log(`🔄 Limpiando asignación en edge API para dispositivo ${device.serialNumber}`);
      this.edgeIotService.updateDeviceAssignment(
        userId.toString(),
        device.serialNumber,
        '', // Parking vacío para limpiar asignación
        '' // Spot vacío para limpiar asignación
      ).subscribe({
        next: () => {
          console.log(`✅ Asignación limpiada en edge API para ${device.serialNumber}`);
        },
        error: (error: any) => {
          console.warn(`⚠️ No se pudo limpiar asignación en edge API:`, error);
        }
      });
    } else {
      console.log(`⏳ Asignación local removida. No hay edge API que limpiar en modo wizard.`);
    }

    // Encontrar y actualizar el spot
    const spot = this.spots.find(s => s.label === spotLabel);

    if (spot) {
      spot.deviceId = null;
      spot.lastUpdated = new Date();

      // Actualizar el servicio
      this.spotsService.updateSpots([...this.spots]);
    }

    // Actualizar el dispositivo local
    (device as any).parkingSpotLabel = null;

    // ✨ CRÍTICO: Guardar INMEDIATAMENTE en el estado global
    const currentSpots = [...this.spots];
    const oldFormatSpots = SpotDataMapper.arrayNewToOld(currentSpots);
    this.parkingStateService.setSpotsData(oldFormatSpots);
    console.log(`💾 Estado guardado inmediatamente - ${currentSpots.filter(s => s.deviceId).length} dispositivos asignados`);

    this.alertsService.showSuccess(`🔗 Dispositivo ${device.model} desasignado del Spot ${spotLabel}`);
    this.cdr.markForCheck();
  }

  /**
   * 🚀 NUEVA FUNCIONALIDAD: Verifica si hay spots creados automáticamente
   * y maneja todas las actualizaciones de spots
   */
  private checkForAutoCreatedSpots(): void {
    let hasShownAutoCreatedMessage = false;

    // Suscribirse a cambios del servicio de spots (única suscripción consolidada)
    this.spotsService.spots$
      .pipe(takeUntil(this.destroy$))
      .subscribe((apiSpots: SpotData[]) => {
        if (apiSpots && apiSpots.length > 0) {
          const isFromAPI = apiSpots.some(spot => spot.id && !spot.id.toString().startsWith('temp-'));

          if (isFromAPI && !hasShownAutoCreatedMessage) {
            console.log(`✅ Detectados ${apiSpots.length} spots cargados desde la API`);

            // Mostrar mensaje de éxito solo una vez
            this.alertsService.showSuccess(
              `¡Perfecto! Se han creado ${apiSpots.length} plazas automáticamente`
            );
            hasShownAutoCreatedMessage = true;
          }
        }

        // Actualizar spots locales siempre (tanto para API como para cambios locales)
        this.spots = apiSpots || [];
        this.applyFilter(this.currentFilter);
        this.cdr.markForCheck();
      });

    // Verificar si hay spots pendientes que se hayan creado
    const pendingSpots = this.parkingStateService.getPendingSpotsCreation();
    if (pendingSpots && pendingSpots.confirmed) {
      console.log('🔍 Detectados spots pendientes de creación automática:', pendingSpots);

      // Mostrar mensaje informativo
      this.alertsService.showInfo(
        `Se están creando ${pendingSpots.totalSpots} plazas automáticamente...`
      );
    }
  }

  /**
   * Método de prueba temporal para verificar que los eventos funcionan
   */
  testClick(): void {
    console.log('🧪 BOTÓN DE PRUEBA PRESIONADO');
    alert('¡Botón de prueba funcionando correctamente!');
  }

  /**
   * Maneja el click en "Asignar" dispositivo desde la lista
   */
  onAssignDevice(device: IotDevice): void {
    console.log('🔥 BOTÓN ASIGNAR PRESIONADO - MÉTODO LLAMADO');
    alert('¡Botón Asignar presionado! Método onAssignDevice ejecutándose correctamente');

    try {
      console.log('📱 Iniciando asignación de dispositivo:', device);

      // Por ahora, mostrar un menú simple con las plazas disponibles
      const availableSpots = this.getAvailableSpots();
      console.log('🏗️ Plazas disponibles:', availableSpots);

      if (availableSpots.length === 0) {
        alert('No hay plazas disponibles para asignar');
        return;
      }

      // Crear una lista de opciones para mostrar en un prompt
      const spotOptions = availableSpots.map((spot, index) => `${index + 1}. ${spot.label}`).join('\n');
      const choice = prompt(`Selecciona una plaza para asignar al dispositivo ${device.model}:\n\n${spotOptions}\n\nEscribe el número de la plaza:`);

      if (choice && !isNaN(Number(choice))) {
        const selectedIndex = Number(choice) - 1;
        if (selectedIndex >= 0 && selectedIndex < availableSpots.length) {
          const selectedSpot = availableSpots[selectedIndex];
          console.log('✅ Plaza seleccionada:', selectedSpot);

          // Confirmar la asignación
          if (confirm(`¿Confirmas asignar el dispositivo ${device.model} a la plaza ${selectedSpot.label}?`)) {
            this.assignDeviceToSpot(device.id, selectedSpot.label);
          }
        } else {
          alert('Número de plaza inválido');
        }
      }
    } catch (error) {
      console.error('❌ Error en onAssignDevice:', error);
      alert('Error: ' + error);
    }
  }

  /**
   * Muestra el diálogo de confirmación para la asignación
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
        this.executeDeviceAssignment(assignmentResult);
      }
    });
  }

  /**
   * Ejecuta la asignación del dispositivo al spot
   */
  private executeDeviceAssignment(assignmentResult: AssignmentResult): void {
    console.log('🔄 Ejecutando asignación:', assignmentResult);

    // Usar el label completo del spot (ej: "A1", "B2", etc.)
    const spotLabel = assignmentResult.assignedSpot.label;

    // Usar el método existente assignDeviceToSpot
    this.assignDeviceToSpot(assignmentResult.device.id, spotLabel);
  }


}
