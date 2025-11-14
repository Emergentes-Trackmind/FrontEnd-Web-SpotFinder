import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DevicesPort } from '../domain/services/devices.port';
import { IotDevice, CreateIotDeviceDto, UpdateIotDeviceDto, DeviceTelemetry, BulkCreateDeviceDto } from '../domain/entities/iot-device.entity';
import { DeviceFiltersDto, DeviceKpisDto, PaginatedDevicesDto } from '../domain/dtos/device-filters.dto';

/**
 * Facade para gestión de dispositivos IoT
 * Punto de entrada único para la capa de presentación
 */
@Injectable({ providedIn: 'root' })
export class DevicesFacade {
  private devicesPort = inject(DevicesPort);

  // Estado reactivo
  private devices = signal<IotDevice[]>([]);
  private kpis = signal<DeviceKpisDto | null>(null);
  private currentDevice = signal<IotDevice | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private filters = signal<DeviceFiltersDto>({
    type: 'all',
    status: 'all',
    parkingId: 'all',
    page: 1,
    size: 10
  });

  // Computed
  readonly devices$ = computed(() => this.devices());
  readonly kpis$ = computed(() => this.kpis());
  readonly currentDevice$ = computed(() => this.currentDevice());
  readonly loading$ = computed(() => this.loading());
  readonly error$ = computed(() => this.error());
  readonly filters$ = computed(() => this.filters());

  // Métodos de consulta
  loadDevices(filters?: DeviceFiltersDto): Observable<PaginatedDevicesDto> {
    this.loading.set(true);
    this.error.set(null);

    const finalFilters = { ...this.filters(), ...filters };
    this.filters.set(finalFilters);

    return this.devicesPort.getDevices(finalFilters).pipe(
      tap((response) => {
        console.log('✅ [DevicesFacade] Dispositivos cargados:', response);
        // 🔧 Manejar tanto Array directo como objeto paginado
        const devicesArray = Array.isArray(response) ? response : (response.data || []);
        this.devices.set(devicesArray);
        console.log('✅ [DevicesFacade] Signal actualizado con', devicesArray.length, 'dispositivos');
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('❌ [DevicesFacade] Error cargando dispositivos:', error);
        this.error.set('Error al cargar dispositivos');
        this.loading.set(false);
        // Retornar un objeto vacío válido en lugar de throw
        return of({
          data: [],
          total: 0,
          page: 1,
          size: 10,
          totalPages: 0
        } as PaginatedDevicesDto);
      })
    );
  }

  loadDeviceById(id: string): Observable<IotDevice> {
    this.loading.set(true);
    this.error.set(null);

    return this.devicesPort.getDeviceById(id).pipe(
      tap((device) => {
        this.currentDevice.set(device);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set('Error al cargar dispositivo');
        this.loading.set(false);
        throw error;
      })
    );
  }

  loadKpis(parkingId?: string): Observable<DeviceKpisDto> {
    return this.devicesPort.getDeviceKpis(parkingId).pipe(
      tap((kpis) => this.kpis.set(kpis)),
      catchError((error) => {
        this.error.set('Error al cargar KPIs');
        throw error;
      })
    );
  }

  // Métodos de comando
  createDevice(device: CreateIotDeviceDto): Observable<IotDevice> {
    this.loading.set(true);
    return this.devicesPort.createDevice(device).pipe(
      tap(() => this.loading.set(false)),
      catchError((error) => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  updateDevice(id: string, device: UpdateIotDeviceDto): Observable<IotDevice> {
    this.loading.set(true);
    return this.devicesPort.updateDevice(id, device).pipe(
      tap((updated) => {
        this.currentDevice.set(updated);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  deleteDevice(id: string): Observable<void> {
    this.loading.set(true);
    return this.devicesPort.deleteDevice(id).pipe(
      tap(() => this.loading.set(false)),
      catchError((error) => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  setMaintenance(id: string): Observable<IotDevice> {
    return this.devicesPort.setMaintenance(id).pipe(
      tap((device) => this.currentDevice.set(device))
    );
  }

  restoreDevice(id: string): Observable<IotDevice> {
    return this.devicesPort.restoreDevice(id).pipe(
      tap((device) => this.currentDevice.set(device))
    );
  }

  sendTelemetry(telemetry: DeviceTelemetry): Observable<void> {
    return this.devicesPort.sendTelemetry(telemetry);
  }

  bulkCreateDevices(parkingId: string, devices: BulkCreateDeviceDto[]): Observable<{ created: IotDevice[]; warnings: string[] }> {
    this.loading.set(true);
    return this.devicesPort.bulkCreateDevices(parkingId, devices).pipe(
      tap(() => this.loading.set(false)),
      catchError((error) => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  generateDeviceToken(deviceId: string): Observable<{ token: string; mqttTopic: string; webhookEndpoint: string }> {
    return this.devicesPort.generateDeviceToken(deviceId);
  }

  // Métodos de utilidad
  updateFilters(filters: Partial<DeviceFiltersDto>): void {
    this.filters.update(current => ({ ...current, ...filters }));
  }

  clearError(): void {
    this.error.set(null);
  }

  clearCurrentDevice(): void {
    this.currentDevice.set(null);
  }
}

