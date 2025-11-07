import { Injectable } from '@angular/core';
import { Observable, Subject, interval, BehaviorSubject } from 'rxjs';
import { map, share, takeUntil } from 'rxjs/operators';
import { SpotStatus } from './parking-state.service';

/**
 * Servicio de simulación IoT para eventos de sensores en tiempo real
 * En producción, esto se conectaría a un WebSocket o SSE real
 */
@Injectable({
  providedIn: 'root'
})
export class IoTService {
  private statusUpdatesSubject = new Subject<IoTStatusUpdate>();
  private destroy$ = new Subject<void>();
  private isSimulationActive = false;

  // Observable público para actualizaciones de estado
  statusUpdates$: Observable<IoTStatusUpdate> = this.statusUpdatesSubject.asObservable();

  // Mapa de estados actual de dispositivos
  private devicesMapSubject = new BehaviorSubject<Map<string, IoTDeviceStatus>>(new Map());
  devicesMap$: Observable<Map<string, IoTDeviceStatus>> = this.devicesMapSubject.asObservable();

  constructor() {
    console.log('🔌 IoTService inicializado');
  }

  /**
   * Inicia la simulación de eventos IoT
   * En producción: conectar a WebSocket o EventSource (SSE)
   */
  startSimulation(totalSpots: number): void {
    if (this.isSimulationActive) {
      console.log('⚠️ Simulación IoT ya está activa');
      return;
    }

    this.isSimulationActive = true;
    console.log(`🚀 Iniciando simulación IoT para ${totalSpots} spots`);

    // Simular cambios de estado cada 8-15 segundos
    interval(8000 + Math.random() * 7000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (totalSpots > 0) {
          this.simulateRandomUpdate(totalSpots);
        }
      });
  }

  /**
   * Detiene la simulación
   */
  stopSimulation(): void {
    console.log('🛑 Deteniendo simulación IoT');
    this.isSimulationActive = false;
    this.destroy$.next();
  }

  /**
   * Simula una actualización aleatoria de un spot
   */
  private simulateRandomUpdate(totalSpots: number): void {
    const spotNumber = Math.floor(Math.random() * totalSpots) + 1;
    const statuses: SpotStatus[] = ['free', 'occupied', 'offline'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const deviceId = `dev-${String(spotNumber).padStart(3, '0')}`;

    const update: IoTStatusUpdate = {
      deviceId,
      spotNumber,
      status: randomStatus,
      battery: 50 + Math.floor(Math.random() * 50),
      signalStrength: 60 + Math.floor(Math.random() * 40),
      lastSeen: new Date().toISOString(),
      temperature: 20 + Math.floor(Math.random() * 10)
    };

    // Actualizar mapa de dispositivos
    const devicesMap = this.devicesMapSubject.value;
    devicesMap.set(deviceId, {
      deviceId,
      spotNumber,
      status: randomStatus,
      battery: update.battery,
      signalStrength: update.signalStrength,
      lastSeen: update.lastSeen,
      isOnline: randomStatus !== 'offline'
    });
    this.devicesMapSubject.next(new Map(devicesMap));

    // Emitir actualización
    this.statusUpdatesSubject.next(update);

    console.log(`📡 IoT Update: Spot ${spotNumber} → ${randomStatus} (${update.battery}% batería)`);
  }

  /**
   * Simula una actualización manual de un spot específico
   */
  simulateUpdate(spotNumber: number, status: SpotStatus): void {
    const deviceId = `dev-${String(spotNumber).padStart(3, '0')}`;

    const update: IoTStatusUpdate = {
      deviceId,
      spotNumber,
      status,
      battery: 75,
      signalStrength: 85,
      lastSeen: new Date().toISOString(),
      temperature: 22
    };

    this.statusUpdatesSubject.next(update);
    console.log(`📡 IoT Manual Update: Spot ${spotNumber} → ${status}`);
  }

  /**
   * Obtiene el estado actual de un dispositivo
   */
  getDeviceStatus(deviceId: string): IoTDeviceStatus | undefined {
    return this.devicesMapSubject.value.get(deviceId);
  }

  /**
   * Conecta a un stream SSE real (para producción)
   * Ejemplo: GET /api/iot/stream?parkingId=...
   */
  connectToSSE(parkingId: string): Observable<IoTStatusUpdate> {
    // TODO: Implementar conexión SSE real
    console.log(`🔌 Conectando a SSE para parking ${parkingId}`);

    // Simular por ahora
    return this.statusUpdates$;
  }

  /**
   * Conecta a un WebSocket real (para producción)
   * Ejemplo: ws://.../iot?parkingId=...
   */
  connectToWebSocket(parkingId: string): Observable<IoTStatusUpdate> {
    // TODO: Implementar WebSocket real
    console.log(`🔌 Conectando a WebSocket para parking ${parkingId}`);

    // Simular por ahora
    return this.statusUpdates$;
  }

  /**
   * Registra un nuevo dispositivo IoT
   */
  registerDevice(spotNumber: number): string {
    const deviceId = `dev-${String(spotNumber).padStart(3, '0')}`;

    const device: IoTDeviceStatus = {
      deviceId,
      spotNumber,
      status: 'free',
      battery: 100,
      signalStrength: 95,
      lastSeen: new Date().toISOString(),
      isOnline: true
    };

    const devicesMap = this.devicesMapSubject.value;
    devicesMap.set(deviceId, device);
    this.devicesMapSubject.next(new Map(devicesMap));

    console.log(`✅ Dispositivo ${deviceId} registrado para spot ${spotNumber}`);
    return deviceId;
  }

  ngOnDestroy(): void {
    this.stopSimulation();
  }
}

export interface IoTStatusUpdate {
  deviceId: string;
  spotNumber: number;
  status: SpotStatus;
  battery: number;
  signalStrength: number;
  lastSeen: string;
  temperature?: number;
}

export interface IoTDeviceStatus {
  deviceId: string;
  spotNumber: number;
  status: SpotStatus;
  battery: number;
  signalStrength: number;
  lastSeen: string;
  isOnline: boolean;
}

