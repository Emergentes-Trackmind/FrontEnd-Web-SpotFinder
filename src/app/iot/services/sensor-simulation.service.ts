import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SensorDevice {
  serialNumber: string;
  deviceId: string;
  parkingSpotId?: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: Date;
  batteryLevel?: number;
  occupied: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface SensorReading {
  deviceId: string;
  serialNumber: string;
  occupied: boolean;
  timestamp: Date;
  batteryLevel: number;
  signalStrength: number;
}

@Injectable({
  providedIn: 'root'
})
export class SensorSimulationService {
  private http = inject(HttpClient);

  // Estado de los sensores conectados
  private connectedDevicesSubject = new BehaviorSubject<SensorDevice[]>([]);
  public connectedDevices$ = this.connectedDevicesSubject.asObservable();

  // Lecturas en tiempo real
  private sensorReadingsSubject = new BehaviorSubject<SensorReading[]>([]);
  public sensorReadings$ = this.sensorReadingsSubject.asObservable();

  private simulationInterval: any;
  private isSimulationActive = false;

  constructor() {
    // Iniciar simulación automática si está habilitada en environment
    if (environment.iot?.simulation.enabled) {
      this.startSimulation();
    } else {
      // Si usamos edge server real, cargar dispositivos al inicializar
      this.loadDevicesFromEdgeServer();
    }
  }

  /**
   * Cargar dispositivos desde el edge server real
   */
  private loadDevicesFromEdgeServer(): void {
    this.getAvailableDevices().subscribe({
      next: (devices) => {
        this.connectedDevicesSubject.next(devices);
        console.log('✅ Dispositivos cargados desde edge server:', devices.length);
      },
      error: (error) => {
        console.error('❌ Error conectando con edge server:', error);
        console.info('💡 Usa tu script de simulación externa para registrar dispositivos');
        // No generar mock data ya que tienes simulación externa
        this.connectedDevicesSubject.next([]);
      }
    });
  }

  /**
   * Obtener todos los dispositivos disponibles desde la API externa
   */
  getAvailableDevices(): Observable<SensorDevice[]> {
    const url = `${environment.iot?.sensorApiUrl}${environment.iot?.endpoints.devices}`;
    return this.http.get<SensorDevice[]>(url);
  }

  /**
   * Vincular un dispositivo físico (por número de serie) a un parking spot
   * @deprecated Usar IotService.bindDevice() en su lugar
   */
  bindDeviceToSpot(serialNumber: string, parkingSpotId: string): Observable<any> {
    const url = `${environment.iot?.sensorApiUrl}${environment.iot?.endpoints.bind(serialNumber)}`;
    return this.http.post(url, {
      parkingSpotId,
      bindTime: new Date().toISOString()
    });
  }

  /**
   * Desvincular un dispositivo de un parking spot
   * @deprecated Usar IotService.unbindDevice() en su lugar
   */
  unbindDevice(serialNumber: string): Observable<any> {
    const url = `${environment.iot?.sensorApiUrl}${environment.iot?.endpoints.unbind(serialNumber)}`;
    return this.http.delete(url);
  }



  /**
   * Iniciar simulación de lecturas de sensores
   */
  startSimulation(): void {
    if (this.isSimulationActive) return;

    this.isSimulationActive = true;
    const intervalMs = environment.iot?.simulation.mockDataInterval || 30000;

    this.simulationInterval = interval(intervalMs).subscribe(() => {
      this.generateMockSensorData();
    });
  }

  /**
   * Detener simulación de lecturas de sensores
   */
  stopSimulation(): void {
    if (this.simulationInterval) {
      this.simulationInterval.unsubscribe();
      this.simulationInterval = null;
    }
    this.isSimulationActive = false;
  }

  /**
   * Generar datos simulados de sensores
   */
  private generateMockSensorData(): void {
    // Obtener dispositivos conectados actuales
    const currentDevices = this.connectedDevicesSubject.value;

    // Si no hay dispositivos, crear algunos de ejemplo
    if (currentDevices.length === 0) {
      const mockDevices: SensorDevice[] = [
        {
          serialNumber: 'SN001-DEMO-001',
          deviceId: 'dev_001',
          status: 'online',
          lastSeen: new Date(),
          batteryLevel: 85,
          occupied: false,
          location: { lat: -12.0464, lng: -77.0428 }
        },
        {
          serialNumber: 'SN002-DEMO-002',
          deviceId: 'dev_002',
          status: 'online',
          lastSeen: new Date(),
          batteryLevel: 92,
          occupied: true,
          location: { lat: -12.0465, lng: -77.0429 }
        },
        {
          serialNumber: 'SN003-DEMO-003',
          deviceId: 'dev_003',
          status: 'online',
          lastSeen: new Date(),
          batteryLevel: 78,
          occupied: false,
          location: { lat: -12.0466, lng: -77.0430 }
        }
      ];
      this.connectedDevicesSubject.next(mockDevices);
    }

    // Generar lecturas simuladas
    const readings: SensorReading[] = currentDevices.map(device => ({
      deviceId: device.deviceId,
      serialNumber: device.serialNumber,
      occupied: Math.random() > 0.7, // 30% probabilidad de estar ocupado
      timestamp: new Date(),
      batteryLevel: Math.max(10, device.batteryLevel! - Math.random() * 2), // Degradar batería lentamente
      signalStrength: 70 + Math.random() * 30 // Señal entre 70-100%
    }));

    this.sensorReadingsSubject.next(readings);

    // Actualizar estado de dispositivos basado en lecturas
    const updatedDevices = currentDevices.map(device => {
      const reading = readings.find(r => r.deviceId === device.deviceId);
      if (reading) {
        return {
          ...device,
          occupied: reading.occupied,
          batteryLevel: reading.batteryLevel,
          lastSeen: reading.timestamp
        };
      }
      return device;
    });

    this.connectedDevicesSubject.next(updatedDevices);
  }

  /**
   * Agregar un nuevo dispositivo manualmente para simulación
   */
  addMockDevice(device: Partial<SensorDevice>): void {
    const currentDevices = this.connectedDevicesSubject.value;
    const newDevice: SensorDevice = {
      serialNumber: device.serialNumber || `SN${Date.now()}`,
      deviceId: device.deviceId || `dev_${Date.now()}`,
      status: device.status || 'online',
      lastSeen: new Date(),
      batteryLevel: device.batteryLevel || 100,
      occupied: device.occupied || false,
      location: device.location,
      parkingSpotId: device.parkingSpotId
    };

    this.connectedDevicesSubject.next([...currentDevices, newDevice]);
  }

  /**
   * Remover un dispositivo de la simulación
   */
  removeMockDevice(serialNumber: string): void {
    const currentDevices = this.connectedDevicesSubject.value;
    const updatedDevices = currentDevices.filter(d => d.serialNumber !== serialNumber);
    this.connectedDevicesSubject.next(updatedDevices);
  }

  /**
   * Obtener el estado de la simulación
   */
  isSimulationRunning(): boolean {
    return this.isSimulationActive;
  }

  /**
   * Refrescar datos desde el edge server (para APIs externas)
   */
  refreshFromEdgeServer(): Observable<SensorDevice[]> {
    return this.getAvailableDevices().pipe(
      map(devices => {
        this.connectedDevicesSubject.next(devices);
        return devices;
      })
    );
  }

  /**
   * Verificar conectividad con el edge server
   */
  checkEdgeServerConnectivity(): Observable<boolean> {
    const url = `${environment.iot?.sensorApiUrl}/health`;
    return this.http.get(url).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
