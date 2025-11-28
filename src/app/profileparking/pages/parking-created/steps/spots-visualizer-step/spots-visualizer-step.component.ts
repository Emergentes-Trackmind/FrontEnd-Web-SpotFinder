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
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SpotBlockComponent } from '../../../../components/spot-block/spot-block.component';
import { ParkingStateService, SpotData, SpotFilterType } from '../../../../services/parking-state.service';
import { SpotsService, SpotStatistics } from '../../../../services/spots.service';
import { IoTService } from '../../../../services/iot-simulation.service';
import { IoTAlertsService } from '../../../../services/iot-alerts.service';
import { IotService } from '../../../../../iot/services/iot.service';

// Tipo de dispositivo IoT usado en este componente (compatible con el dominio)
interface IoTDevice {
  id: string;
  name: string; // displayName del dispositivo
  serialNumber: string;
  model: string;
  type: string;
  status: string;
  battery: number;
  lastCheckIn: string;
  parkingId?: string;
  spotNumber?: number | null;
  signalStrength?: number;
  ownerId?: string;
  firmware?: string;
  lastSeen?: string;
  createdAt?: string;
}

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
    free: 0,
    occupied: 0,
    maintenance: 0,
    offline: 0
  };

  currentFilter: SpotFilterType = 'all';
  totalSpots = 0;

  // Dispositivos IoT disponibles
  availableDevices: IoTDevice[] = [];

  private destroy$ = new Subject<void>();

  readonly filterOptions = [
    { value: 'all' as SpotFilterType, label: 'Todos', icon: 'grid_view' },
    { value: 'free' as SpotFilterType, label: 'Libres', icon: 'check_circle', color: 'free' },
    { value: 'occupied' as SpotFilterType, label: 'Ocupados', icon: 'local_parking', color: 'occupied' },
    { value: 'maintenance' as SpotFilterType, label: 'Mantenimiento', icon: 'engineering', color: 'maintenance' },
    { value: 'offline' as SpotFilterType, label: 'Offline', icon: 'wifi_off', color: 'offline' }
  ];

  constructor(
    private parkingStateService: ParkingStateService,
    private spotsService: SpotsService,
    private iotService: IoTService,
    private alertsService: IoTAlertsService,
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

    // Validar rango
    if (this.totalSpots < 1 || this.totalSpots > 300) {
      this.alertsService.showError('El número de plazas debe estar entre 1 y 300');
      this.router.navigate(['/parkings/new']);
      return;
    }

    // Generar spots o restaurar guardados
    const savedSpots = this.parkingStateService.getSpots();

    if (savedSpots && savedSpots.length === this.totalSpots) {
      // Restaurar spots guardados con sus asignaciones
      const spotsWithDevices = savedSpots.filter(s => s.deviceId);
      console.log(`✅ Restaurando ${savedSpots.length} spots guardados, ${spotsWithDevices.length} con dispositivos asignados`);
      if (spotsWithDevices.length > 0) {
        console.log('📱 Spots con dispositivos:', spotsWithDevices.map(s => `Spot ${s.spotNumber} -> ${s.deviceId}`));
      }
      this.spots = savedSpots;
      this.spotsService.restoreSpots(savedSpots); // Método para restaurar en el servicio
    } else {
      // Generar spots nuevos
      console.log('✅ Generando spots nuevos');
      this.spots = this.spotsService.generateSpots(this.totalSpots);
    }

    this.filteredSpots = [...this.spots];

    // NO registrar dispositivos simulados - usar solo los reales del usuario

    // Suscribirse a actualizaciones de spots
    this.spotsService.spots$
      .pipe(takeUntil(this.destroy$))
      .subscribe((spotsMap: Map<number, SpotData>) => {
        this.spots = Array.from(spotsMap.values());
        this.applyFilter(this.currentFilter);
        this.cdr.markForCheck();
      });

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
      this.filteredSpots = this.spots.filter(spot => spot.status === filter);
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
   * Maneja el click en "Marcar en mantenimiento"
   */
  onSetMaintenance(event: { id: number; inMaintenance: boolean }): void {
    this.spotsService.setSpotMaintenance(event.id, event.inMaintenance);

    const action = event.inMaintenance ? 'marcada en mantenimiento' : 'quitada de mantenimiento';
    this.alertsService.showSuccess(`Plaza ${event.id} ${action}`);
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
    // Guardar datos de spots en el estado - obtener directamente del servicio para asegurar que tenemos la última versión
    const currentSpots = this.spotsService.getSpotsArray();
    this.parkingStateService.setSpotsData(currentSpots);
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
  trackBySpotNumber(index: number, spot: SpotData): number {
    return spot.spotNumber;
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
        next: (devices: any[]) => {
          console.log('📥 Dispositivos recibidos desde edge API:', devices);

          // Convertir de domain IoT device al formato IoTDevice esperado por el componente
          this.availableDevices = devices
            .filter((d: any) => !d.parkingId || d.parkingId === '') // Filtrar solo disponibles
            .map((d: any) => ({
              id: d.id,
              name: d.model, // Usar model como name/displayName
              serialNumber: d.serialNumber,
              model: d.model,
              type: d.type as any,
              status: d.status as any,
              battery: d.battery,
              lastCheckIn: d.lastCheckIn,
              parkingId: d.parkingId,
              spotNumber: d.parkingSpotId ? parseInt(d.parkingSpotId) : null,
              signalStrength: 85, // Valor por defecto
              ownerId: userId.toString(),
              firmware: 'v1.0.0', // Valor por defecto
              lastSeen: d.updatedAt,
              createdAt: d.createdAt
            } as IoTDevice));

          // IMPORTANTE: Sincronizar con las asignaciones guardadas en los spots
          this.syncDevicesWithSpots();

          this.cdr.markForCheck();
          console.log(`✅ ${this.availableDevices.length} dispositivos IoT disponibles desde edge API`);
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
    const currentSpots = this.spotsService.getSpotsArray();
    let syncCount = 0;

    // Para cada dispositivo, verificar si está asignado a algún spot
    this.availableDevices.forEach(device => {
      const assignedSpot = currentSpots.find(spot => spot.deviceId === device.id);
      if (assignedSpot) {
        device.spotNumber = assignedSpot.spotNumber;
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
   * Obtiene los spots disponibles (sin dispositivo asignado)
   */
  getAvailableSpots(): SpotData[] {
    return this.spots.filter(spot => !spot.deviceId);
  }

  /**
   * Asigna un dispositivo IoT a un spot
   */
  assignDeviceToSpot(deviceId: string, spotNumber: number): void {
    // Encontrar el dispositivo
    const device = this.availableDevices.find(d => d.id === deviceId);
    if (!device) {
      console.error(`❌ Dispositivo ${deviceId} no encontrado en availableDevices`);
      return;
    }

    console.log(`📱 Asignando dispositivo ${device.name} (${deviceId}) al Spot ${spotNumber}`);

    // Actualizar el spot con el dispositivo en el servicio
    this.spotsService.assignDevice(spotNumber, deviceId);

    // Actualizar el dispositivo local para que la UI se actualice
    device.spotNumber = spotNumber;

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
        spotNumber.toString()
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
    const currentSpots = this.spotsService.getSpotsArray();
    this.parkingStateService.setSpotsData(currentSpots);
    console.log(`💾 Estado guardado inmediatamente - ${currentSpots.filter(s => s.deviceId).length} dispositivos asignados`);

    // Verificar que se guardó correctamente en el servicio
    const updatedSpot = this.spotsService.getSpot(spotNumber);
    console.log(`✅ Spot ${spotNumber} actualizado en servicio:`, updatedSpot);

    // Verificar en el array local (debería actualizarse por la suscripción)
    const localSpot = this.spots.find(s => s.spotNumber === spotNumber);
    console.log(`📍 Spot ${spotNumber} en array local:`, localSpot);

    // Verificar total de dispositivos asignados
    const totalAssigned = this.spotsService.getSpotsArray().filter(s => s.deviceId).length;
    console.log(`📊 Total de dispositivos asignados: ${totalAssigned}`);

    this.alertsService.showSuccess(`✅ Dispositivo ${device.name} asignado al Spot ${spotNumber}`);
    this.cdr.markForCheck();
  }

  /**
   * Desasigna un dispositivo IoT de un spot
   */
  unassignDevice(deviceId: string): void {
    // Encontrar el dispositivo
    const device = this.availableDevices.find(d => d.id === deviceId);
    if (!device || !device.spotNumber) return;

    const spotNumber = device.spotNumber;

    console.log(`🔗 Desasignando dispositivo ${device.name} del Spot ${spotNumber}`);

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

    // Actualizar el spot removiendo el dispositivo
    this.spotsService.assignDevice(spotNumber, null);

    // Actualizar el dispositivo local
    device.spotNumber = null;

    // ✨ CRÍTICO: Guardar INMEDIATAMENTE en el estado global
    const currentSpots = this.spotsService.getSpotsArray();
    this.parkingStateService.setSpotsData(currentSpots);
    console.log(`💾 Estado guardado inmediatamente - ${currentSpots.filter(s => s.deviceId).length} dispositivos asignados`);

    this.alertsService.showSuccess(`🔗 Dispositivo ${device.name} desasignado del Spot ${spotNumber}`);
    this.cdr.markForCheck();
  }
}


