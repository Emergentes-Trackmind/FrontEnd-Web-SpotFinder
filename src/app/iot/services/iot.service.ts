import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Import domain IotDevice type
import { IotDevice as DomainIotDevice } from '../domain/entities/iot-device.entity';

export interface EdgeIotDevice {
  id: string;
  serialNumber: string;
  model: string;
  type: string;
  status: string;
  battery?: number;
  parkingId?: string;
  parkingSpotId?: string;
  createdAt: string;
  updatedAt: string;
  displayName?: string;
}

export interface BindDeviceRequest {
  userId: string;
  displayName?: string;
  parkingId?: string;
  parkingSpotId?: string;
}

export interface TelemetryData {
  serialNumber: string;
  timestamp: string;
  occupied: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  temperature?: number;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class IotService {
  private baseUrl = environment.iot?.sensorApiUrl || '';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los dispositivos del usuario usando GET /api/iot/devices
   * @param userId ID del usuario
   * @returns Observable con la lista de dispositivos mapeados al formato domain
   */
  getUserDevices(userId: string): Observable<DomainIotDevice[]> {
    const headers = new HttpHeaders({
      'X-User-Id': userId
    });
    const params = new HttpParams().set('userId', userId);

    const url = `${this.baseUrl}${environment.iot?.endpoints.devices}`;
    console.log('🌐 [IoTService] ===== INICIANDO PETICIÓN getUserDevices =====');
    console.log('🌐 [IoTService] URL completa:', url);
    console.log('🌐 [IoTService] baseUrl:', this.baseUrl);
    console.log('🌐 [IoTService] endpoint:', environment.iot?.endpoints.devices);
    console.log('🌐 [IoTService] userId:', userId);
    console.log('🌐 [IoTService] headers:', headers);
    console.log('🌐 [IoTService] params:', params);

    return this.http.get<any>(url, { headers, params }).pipe(
      map(response => {
        console.log('📥 [IoTService] Respuesta raw del edge API:', response);
        console.log('📥 [IoTService] Tipo de respuesta:', typeof response);
        console.log('📥 [IoTService] Es array?:', Array.isArray(response));
        let devicesArray: EdgeIotDevice[] = [];

        // Caso 1: La respuesta ya es un array
        if (Array.isArray(response)) {
          devicesArray = response;
        }
        // Caso 2: La respuesta es un objeto con una propiedad que contiene el array
        else if (response && typeof response === 'object') {
          // Intentar extraer el array de diferentes posibles propiedades
          if (Array.isArray(response.devices)) {
            devicesArray = response.devices;
          } else if (Array.isArray(response.data)) {
            devicesArray = response.data;
          } else if (Array.isArray(response.items)) {
            devicesArray = response.items;
          } else if (Array.isArray(response.results)) {
            devicesArray = response.results;
          } else {
            console.warn('❌ [IoTService] La respuesta no contiene un array en ninguna propiedad conocida:', Object.keys(response));
            return [];
          }
        }
        // Caso 3: Respuesta inválida
        else {
          console.warn('❌ [IoTService] La respuesta del edge API no es ni array ni objeto:', response);
          return [];
        }

        console.log(`✅ [IoTService] Dispositivos extraídos: ${devicesArray.length}`);
        return devicesArray.map(edgeDevice => this.mapEdgeDeviceToDomain(edgeDevice));
      }),
      catchError(error => {
        console.error('❌ [IoTService] Error en getUserDevices:', error);
        // Devolver array vacío en caso de error para mantener la interfaz funcionando
        return of([]);
      })
    );
  }

  /**
   * Mapea un dispositivo del edge API al formato domain
   */
  private mapEdgeDeviceToDomain(edgeDevice: EdgeIotDevice): DomainIotDevice {
    return {
      id: edgeDevice.id,
      parkingId: edgeDevice.parkingId || '',
      parkingSpotId: edgeDevice.parkingSpotId || null,
      serialNumber: edgeDevice.serialNumber,
      model: edgeDevice.displayName || edgeDevice.model,
      type: edgeDevice.type as any, // Cast to domain type
      status: (edgeDevice.status || 'offline').toLowerCase() as any, // Normalize status to lowercase
      battery: edgeDevice.battery || 100, // Use battery from edge API or default to 100
      lastCheckIn: edgeDevice.updatedAt,
      createdAt: edgeDevice.createdAt,
      updatedAt: edgeDevice.updatedAt
    };
  }

  /**
   * Vincula un dispositivo existente al usuario actual
   * @param userId ID del usuario
   * @param serialNumber Número de serie del dispositivo
   * @param displayName Nombre que el usuario quiere dar al dispositivo
   * @returns Observable de la respuesta
   */
  bindDevice(userId: string, serialNumber: string, displayName: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-User-Id': userId,
      'Content-Type': 'application/json'
    });

    const body: BindDeviceRequest = {
      userId,
      displayName
    };

    return this.http.post(
      `${this.baseUrl}${environment.iot?.endpoints.bind(serialNumber)}`,
      body,
      { headers }
    );
  }

  /**
   * Desvincula un dispositivo del usuario actual
   * @param userId ID del usuario
   * @param serialNumber Número de serie del dispositivo
   * @returns Observable de la respuesta
   */
  unbindDevice(userId: string, serialNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-User-Id': userId
    });

    return this.http.delete(
      `${this.baseUrl}${environment.iot?.endpoints.unbind(serialNumber)}`,
      { headers }
    );
  }

  /**
   * Envía datos de telemetría (usado por el simulador)
   * @param payload Datos de telemetría
   * @returns Observable de la respuesta
   */
  sendTelemetry(payload: TelemetryData): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${environment.iot?.endpoints.telemetry}`,
      payload
    );
  }

  /**
   * Registra un nuevo dispositivo (usado por el simulador automáticamente)
   * @param deviceData Datos del dispositivo
   * @returns Observable de la respuesta
   */
  registerDevice(deviceData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${environment.iot?.endpoints.register}`,
      deviceData
    );
  }

  /**
   * Actualiza la asignación de parking y spot de un dispositivo
   * @param userId ID del usuario
   * @param serialNumber Número de serie del dispositivo
   * @param parkingId ID del parking
   * @param spotId ID del spot (opcional)
   * @returns Observable de la respuesta
   */
  updateDeviceAssignment(userId: string, serialNumber: string, parkingId: string, spotId?: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-User-Id': userId,
      'Content-Type': 'application/json'
    });

    // El body debe incluir userId (requerido por la API) más la información de asignación
    const body = {
      userId, // Requerido por el endpoint bind
      parkingId,
      parkingSpotId: spotId || null
    };

    console.log(`🔄 Actualizando asignación para ${serialNumber}:`, body);

    // Usando el endpoint de bind para actualizar la asignación
    return this.http.post(
      `${this.baseUrl}${environment.iot?.endpoints.bind(serialNumber)}`,
      body,
      { headers }
    );
  }
}
