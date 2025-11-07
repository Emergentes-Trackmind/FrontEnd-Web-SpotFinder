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

import { SpotBlockComponent } from '../../../../components/spot-block/spot-block.component';
import { ParkingStateService, SpotData, SpotFilterType } from '../../../../services/parking-state.service';
import { SpotsService, SpotStatistics } from '../../../../services/spots.service';
import { IoTService } from '../../../../services/iot-simulation.service';
import { IoTAlertsService } from '../../../../services/iot-alerts.service';

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
    SpotBlockComponent
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
    private cdr: ChangeDetectorRef
  ) {}

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
      console.log('✅ Restaurando spots guardados con asignaciones');
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

    // Cargar dispositivos IoT disponibles
    this.loadAvailableDevices();

    console.log(`✅ Step 2 iniciado con ${this.totalSpots} spots`);
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
    // Guardar datos de spots en el estado
    this.parkingStateService.setSpotsData(this.spots);
    this.parkingStateService.setCurrentStep(3);

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
   * Carga los dispositivos IoT disponibles del usuario
   */
  private async loadAvailableDevices(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3001/api/iot/devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const devices = await response.json();
        // Filtrar solo dispositivos disponibles (sin asignar)
        this.availableDevices = devices.filter((d: IoTDevice) => !d.parkingId);
        this.cdr.markForCheck();
        console.log(`✅ ${this.availableDevices.length} dispositivos IoT disponibles`);
      }
    } catch (error) {
      console.error('❌ Error cargando dispositivos IoT:', error);
      this.availableDevices = [];
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
    if (!device) return;

    // Actualizar el spot con el dispositivo
    this.spotsService.assignDevice(spotNumber, deviceId);

    // Actualizar el dispositivo local
    device.spotNumber = spotNumber;

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

    // Actualizar el spot removiendo el dispositivo
    this.spotsService.assignDevice(spotNumber, '');

    // Actualizar el dispositivo local
    device.spotNumber = null;

    this.alertsService.showSuccess(`🔗 Dispositivo ${device.name} desasignado del Spot ${spotNumber}`);
    this.cdr.markForCheck();
  }
}

/**
 * Interfaz para dispositivos IoT
 */
export interface IoTDevice {
  id: string;
  name: string;
  type: 'ultrasonic' | 'magnetic' | 'infrared' | 'camera';
  status: 'available' | 'assigned' | 'offline';
  battery: number;
  signalStrength: number;
  parkingId: string | null;
  spotNumber: number | null;
  ownerId: string;
  serialNumber: string;
  firmware: string;
  lastSeen: string;
  createdAt: string;
}
