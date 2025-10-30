import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IotDevice, CreateIotDeviceDto, UpdateIotDeviceDto, DeviceTelemetry, BulkCreateDeviceDto } from '../../domain/entities/iot-device.entity';
import { DeviceFiltersDto, DeviceKpisDto, PaginatedDevicesDto } from '../../domain/dtos/device-filters.dto';

/**
 * API HTTP para dispositivos IoT
 * Implementa las llamadas HTTP reales al backend
 */
@Injectable()
export class DevicesApi {
  private http = inject(HttpClient);
  private baseUrl = '/api/iot/devices';

  getDevices(filters: DeviceFiltersDto): Observable<PaginatedDevicesDto> {
    let params = new HttpParams();

    if (filters.type && filters.type !== 'all') params = params.set('type', filters.type);
    if (filters.status && filters.status !== 'all') params = params.set('status', filters.status);
    if (filters.parkingId && filters.parkingId !== 'all') params = params.set('parking_id', filters.parkingId);
    if (filters.q) params = params.set('q', filters.q);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.size) params = params.set('size', filters.size.toString());

    return this.http.get<PaginatedDevicesDto>(this.baseUrl, { params });
  }

  getDeviceById(id: string): Observable<IotDevice> {
    return this.http.get<IotDevice>(`${this.baseUrl}/${id}`);
  }

  getDeviceKpis(parkingId?: string): Observable<DeviceKpisDto> {
    let params = new HttpParams();
    if (parkingId) params = params.set('parking_id', parkingId);

    return this.http.get<DeviceKpisDto>(`${this.baseUrl}/kpis`, { params });
  }

  createDevice(device: CreateIotDeviceDto): Observable<IotDevice> {
    return this.http.post<IotDevice>(this.baseUrl, device);
  }

  updateDevice(id: string, device: UpdateIotDeviceDto): Observable<IotDevice> {
    return this.http.put<IotDevice>(`${this.baseUrl}/${id}`, device);
  }

  deleteDevice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  setMaintenance(id: string): Observable<IotDevice> {
    return this.http.post<IotDevice>(`${this.baseUrl}/${id}/maintenance`, {});
  }

  restoreDevice(id: string): Observable<IotDevice> {
    return this.http.post<IotDevice>(`${this.baseUrl}/${id}/restore`, {});
  }

  sendTelemetry(telemetry: DeviceTelemetry): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${telemetry.serialNumber}/telemetry`, telemetry);
  }

  bulkCreateDevices(parkingId: string, devices: BulkCreateDeviceDto[]): Observable<{
    created: IotDevice[];
    warnings: string[];
  }> {
    return this.http.post<{ created: IotDevice[]; warnings: string[] }>(
      `${this.baseUrl}/bulk`,
      { parkingId, devices }
    );
  }

  generateDeviceToken(deviceId: string): Observable<{ token: string; mqttTopic: string; webhookEndpoint: string }> {
    return this.http.post<{ token: string; mqttTopic: string; webhookEndpoint: string }>(
      `${this.baseUrl}/${deviceId}/token`,
      {}
    );
  }
}

