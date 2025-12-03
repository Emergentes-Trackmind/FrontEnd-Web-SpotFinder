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

    return this.http.get<EdgeIotDevice[]>(
      `${this.baseUrl}${environment.iot?.endpoints.devices}`,
      { headers, params }
    ).pipe(
      map(response => {
        // Validar que la respuesta es un array
        if (!Array.isArray(response)) {
          console.warn('❌ [IoTService] La respuesta del edge API no es un array:', response);
          return [];
        }
        return response.map(edgeDevice => this.mapEdgeDeviceToDomain(edgeDevice));
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
