/**
 * IOT_DEVICES Entity
 * Representa un dispositivo IoT (sensor, cámara, barrera)
 */

export type DeviceType = 'sensor' | 'camera' | 'barrier';
export type DeviceStatus = 'online' | 'offline' | 'maintenance';

export interface IotDevice {
  id: string;
  parkingId: string;
  parkingSpotId?: string | null; // Opcional, solo para sensores de spot
  serialNumber: string; // Único global
  model: string;
  type: DeviceType;
  status: DeviceStatus;
  battery: number; // 0-100
  lastCheckIn: string; // ISO timestamp
  deviceToken?: string; // Para autenticación del dispositivo
  mqttTopic?: string; // Topic MQTT asignado
  webhookEndpoint?: string; // Endpoint HTTP para telemetría
  createdAt: string;
  updatedAt: string;

  // Datos relacionados (para vistas)
  parkingName?: string;
  parkingSpotLabel?: string;
}

export interface CreateIotDeviceDto {
  serialNumber: string;
  model: string;
  type: DeviceType;
  parkingId: string;
  parkingSpotId?: string | null;
  status?: DeviceStatus;
}

export interface UpdateIotDeviceDto {
  model?: string;
  type?: DeviceType;
  parkingSpotId?: string | null;
  status?: DeviceStatus;
}

export interface DeviceTelemetry {
  serialNumber: string;
  status: DeviceStatus;
  battery: number;
  checkedAt: string;
  // Extensión para sensores de ocupación
  occupied?: boolean;
}

export interface BulkCreateDeviceDto {
  serialNumber: string;
  model: string;
  type: DeviceType;
  spotLabel?: string; // Se resuelve a parkingSpotId
}

