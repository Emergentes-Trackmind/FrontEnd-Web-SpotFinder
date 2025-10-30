import { DeviceType, DeviceStatus } from '../entities/iot-device.entity';

/**
 * DTOs para filtros y búsqueda de dispositivos
 */

export interface DeviceFiltersDto {
  type?: DeviceType | 'all';
  status?: DeviceStatus | 'all';
  parkingId?: string | 'all';
  q?: string; // Búsqueda por nombre/serial
  page?: number;
  size?: number;
}

export interface DeviceKpisDto {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  averageBattery: number;
  criticalBatteryCount: number; // < 15%
  lowBatteryCount: number; // 15-30%
}

export interface PaginatedDevicesDto {
  data: any[]; // IotDevice[]
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

