import { Observable } from 'rxjs';
import { IotDevice, CreateIotDeviceDto, UpdateIotDeviceDto, DeviceTelemetry, BulkCreateDeviceDto } from '../entities/iot-device.entity';
import { DeviceFiltersDto, DeviceKpisDto, PaginatedDevicesDto } from '../dtos/device-filters.dto';

/**
 * Puerto de dominio para operaciones de dispositivos IoT
 * Define el contrato que debe implementar la infraestructura
 */
export abstract class DevicesPort {
  // Consultas
  abstract getDevices(filters: DeviceFiltersDto): Observable<PaginatedDevicesDto>;
  abstract getDeviceById(id: string): Observable<IotDevice>;
  abstract getDeviceKpis(parkingId?: string): Observable<DeviceKpisDto>;

  // Comandos
  abstract createDevice(device: CreateIotDeviceDto): Observable<IotDevice>;
  abstract updateDevice(id: string, device: UpdateIotDeviceDto): Observable<IotDevice>;
  abstract deleteDevice(id: string): Observable<void>;

  // Operaciones especiales
  abstract setMaintenance(id: string): Observable<IotDevice>;
  abstract restoreDevice(id: string): Observable<IotDevice>;
  abstract sendTelemetry(telemetry: DeviceTelemetry): Observable<void>;
  abstract bulkCreateDevices(parkingId: string, devices: BulkCreateDeviceDto[]): Observable<{
    created: IotDevice[];
    warnings: string[];
  }>;

  // Conectividad
  abstract generateDeviceToken(deviceId: string): Observable<{ token: string; mqttTopic: string; webhookEndpoint: string }>;
}

