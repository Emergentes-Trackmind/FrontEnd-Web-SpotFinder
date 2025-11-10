import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SensorSimulationService, SensorDevice, SensorReading } from '../../../services/sensor-simulation.service';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sensor-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6 space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Simulación de Sensores IoT</h1>
            <p class="text-gray-600 mt-1">Gestiona y simula dispositivos de sensores para parkings</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full mr-2"
                   [class]="isSimulationActive ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-sm font-medium">
                {{ isSimulationActive ? 'Simulación Activa' : 'Simulación Inactiva' }}
              </span>
            </div>
            <button
              (click)="toggleSimulation()"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              [class]="isSimulationActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'">
              {{ isSimulationActive ? 'Detener' : 'Iniciar' }}
            </button>
          </div>
        </div>

        <!-- Configuration Info -->
        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 class="font-medium text-blue-900 mb-2">Configuración Actual</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-blue-700 font-medium">API URL:</span>
              <p class="text-blue-600">{{ apiUrl }}</p>
            </div>
            <div>
              <span class="text-blue-700 font-medium">Intervalo:</span>
              <p class="text-blue-600">{{ updateInterval / 1000 }}s</p>
            </div>
            <div>
              <span class="text-blue-700 font-medium">Environment:</span>
              <p class="text-blue-600">{{ environmentName }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Device Form -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Agregar Dispositivo de Prueba</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            [(ngModel)]="newDevice.serialNumber"
            placeholder="Número de Serie (ej: SN005-LIMA-005)"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">

          <select
            [(ngModel)]="newDevice.status"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="online">En línea</option>
            <option value="offline">Fuera de línea</option>
            <option value="error">Error</option>
          </select>

          <input
            [(ngModel)]="newDevice.batteryLevel"
            type="number"
            min="0"
            max="100"
            placeholder="Batería (%)"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">

          <button
            (click)="addDevice()"
            [disabled]="!newDevice.serialNumber"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
            Agregar
          </button>
        </div>
      </div>

      <!-- Connected Devices -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            Dispositivos Conectados ({{ connectedDevices.length }})
          </h2>
          <button
            (click)="refreshDevices()"
            class="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            🔄 Actualizar
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full table-auto">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número de Serie
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocupado
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batería
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Conexión
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parking Vinculado
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let device of connectedDevices" class="hover:bg-gray-50">
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ device.serialNumber }}</div>
                  <div class="text-xs text-gray-500">{{ device.deviceId }}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(device.status)">
                    {{ getStatusText(device.status) }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="device.occupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                    {{ device.occupied ? 'Ocupado' : 'Libre' }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="h-2 rounded-full"
                           [class]="getBatteryClass(device.batteryLevel || 0)"
                           [style.width]="(device.batteryLevel || 0) + '%'"></div>
                    </div>
                    <span class="text-sm text-gray-900">{{ device.batteryLevel || 0 }}%</span>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(device.lastSeen) }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <span *ngIf="device.parkingSpotId" class="text-blue-600">{{ device.parkingSpotId }}</span>
                  <span *ngIf="!device.parkingSpotId" class="text-gray-400">No vinculado</span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    (click)="removeDevice(device.serialNumber)"
                    class="text-red-600 hover:text-red-900 mr-3">
                    Eliminar
                  </button>
                  <button
                    (click)="viewDetails(device)"
                    class="text-blue-600 hover:text-blue-900">
                    Detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="connectedDevices.length === 0" class="text-center py-8 text-gray-500">
            No hay dispositivos conectados. Agrega uno para comenzar la simulación.
          </div>
        </div>
      </div>

      <!-- Recent Readings -->
      <div class="bg-white rounded-lg shadow-md p-6" *ngIf="recentReadings.length > 0">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Últimas Lecturas ({{ recentReadings.length }})
        </h2>

        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div *ngFor="let reading of recentReadings"
               class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <span class="font-medium text-gray-900">{{ reading.serialNumber }}</span>
              <span class="ml-2 text-sm text-gray-500">{{ formatTime(reading.timestamp) }}</span>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <span [class]="reading.occupied ? 'text-red-600' : 'text-green-600'">
                {{ reading.occupied ? '🚗 Ocupado' : '✅ Libre' }}
              </span>
              <span class="text-gray-600">🔋 {{ reading.batteryLevel }}%</span>
              <span class="text-gray-600">📶 {{ reading.signalStrength }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SensorSimulationComponent implements OnInit, OnDestroy {
  private sensorService = inject(SensorSimulationService);

  connectedDevices: SensorDevice[] = [];
  recentReadings: SensorReading[] = [];
  isSimulationActive = false;

  apiUrl = environment.iot?.sensorApiUrl || 'No configurado';
  updateInterval = environment.iot?.simulation.mockDataInterval || 30000;
  environmentName = environment.production ? 'production' : 'development';

  newDevice = {
    serialNumber: '',
    status: 'online' as 'online' | 'offline' | 'error',
    batteryLevel: 100
  };

  private subscriptions = new Subscription();

  ngOnInit() {
    // Suscribirse a cambios en dispositivos conectados
    this.subscriptions.add(
      this.sensorService.connectedDevices$.subscribe(devices => {
        this.connectedDevices = devices;
      })
    );

    // Suscribirse a nuevas lecturas
    this.subscriptions.add(
      this.sensorService.sensorReadings$.subscribe(readings => {
        this.recentReadings = [...readings, ...this.recentReadings].slice(0, 10); // Mantener solo las últimas 10
      })
    );

    // Verificar estado de simulación
    this.isSimulationActive = this.sensorService.isSimulationRunning();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleSimulation() {
    if (this.isSimulationActive) {
      this.sensorService.stopSimulation();
    } else {
      this.sensorService.startSimulation();
    }
    this.isSimulationActive = this.sensorService.isSimulationRunning();
  }

  addDevice() {
    if (!this.newDevice.serialNumber.trim()) return;

    this.sensorService.addMockDevice({
      serialNumber: this.newDevice.serialNumber.trim(),
      status: this.newDevice.status,
      batteryLevel: this.newDevice.batteryLevel
    });

    // Limpiar formulario
    this.newDevice = {
      serialNumber: '',
      status: 'online',
      batteryLevel: 100
    };
  }

  removeDevice(serialNumber: string) {
    if (confirm(`¿Estás seguro de eliminar el dispositivo ${serialNumber}?`)) {
      this.sensorService.removeMockDevice(serialNumber);
    }
  }

  refreshDevices() {
    if (environment.iot?.simulation.enabled) {
      // Simulación local - regenerar datos mock
      console.log('Actualizando dispositivos simulados...');
      this.sensorService['generateMockSensorData']();
    } else {
      // Edge server real - refrescar desde API
      console.log('Actualizando desde edge server...');
      this.sensorService.refreshFromEdgeServer().subscribe({
        next: (devices) => {
          console.log('✅ Dispositivos actualizados desde edge server:', devices.length);
        },
        error: (error) => {
          console.error('❌ Error actualizando desde edge server:', error);
        }
      });
    }
  }

  viewDetails(device: SensorDevice) {
    console.log('Detalles del dispositivo:', device);
    // Aquí se podría abrir un modal con más información
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'online': return 'En línea';
      case 'offline': return 'Fuera de línea';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  }

  getBatteryClass(level: number): string {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-PE');
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-PE');
  }
}
