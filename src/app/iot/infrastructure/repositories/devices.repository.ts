import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DevicesPort } from '../../domain/services/devices.port';
import { DevicesApi } from '../http/devices.api';
import { IotDevice, CreateIotDeviceDto, UpdateIotDeviceDto, DeviceTelemetry, BulkCreateDeviceDto } from '../../domain/entities/iot-device.entity';
import { DeviceFiltersDto, DeviceKpisDto, PaginatedDevicesDto } from '../../domain/dtos/device-filters.dto';

/**
 * Repositorio de dispositivos IoT
 * Implementa DevicesPort delegando a DevicesApi
 */
@Injectable()
export class DevicesRepository extends DevicesPort {
  private api = inject(DevicesApi);

  getDevices(filters: DeviceFiltersDto): Observable<PaginatedDevicesDto> {
    return this.api.getDevices(filters);
  }

  getDeviceById(id: string): Observable<IotDevice> {
    return this.api.getDeviceById(id);
  }

  getDeviceKpis(parkingId?: string): Observable<DeviceKpisDto> {
    return this.api.getDeviceKpis(parkingId);
  }

  createDevice(device: CreateIotDeviceDto): Observable<IotDevice> {
    return this.api.createDevice(device);
  }

  updateDevice(id: string, device: UpdateIotDeviceDto): Observable<IotDevice> {
    return this.api.updateDevice(id, device);
  }

  deleteDevice(id: string): Observable<void> {
    return this.api.deleteDevice(id);
  }

  setMaintenance(id: string): Observable<IotDevice> {
    return this.api.setMaintenance(id);
  }

  restoreDevice(id: string): Observable<IotDevice> {
    return this.api.restoreDevice(id);
  }

  sendTelemetry(telemetry: DeviceTelemetry): Observable<void> {
    return this.api.sendTelemetry(telemetry);
  }

  bulkCreateDevices(parkingId: string, devices: BulkCreateDeviceDto[]): Observable<{ created: IotDevice[]; warnings: string[] }> {
    return this.api.bulkCreateDevices(parkingId, devices);
  }

  generateDeviceToken(deviceId: string): Observable<{ token: string; mqttTopic: string; webhookEndpoint: string }> {
    return this.api.generateDeviceToken(deviceId);
  }
}

