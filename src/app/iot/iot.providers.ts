/**
 * Providers para el módulo IoT
 * Configura la inyección de dependencias siguiendo arquitectura hexagonal
 */

import { Provider } from '@angular/core';
import { DevicesPort } from './domain/services/devices.port';
import { DevicesRepository } from './infrastructure/repositories/devices.repository';
import { DevicesApi } from './infrastructure/http/devices.api';
import { ParkingsPort } from './domain/services/parkings.port';
import { ParkingsRepository } from './infrastructure/repositories/parkings.repository';
import { ParkingsApi } from './infrastructure/http/parkings.api';

export const IOT_PROVIDERS: Provider[] = [
  // Devices
  DevicesApi,
  {
    provide: DevicesPort,
    useClass: DevicesRepository
  },
  // Parkings
  ParkingsApi,
  {
    provide: ParkingsPort,
    useClass: ParkingsRepository
  }
];
