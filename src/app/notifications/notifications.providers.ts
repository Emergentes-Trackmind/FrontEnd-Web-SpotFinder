import { Provider } from '@angular/core';
import { NotificationsService } from './services/notifications.service';
import { NotificationsApiClient } from './services/notifications-api.client';
import { FcmService } from './services/fcm.service';

/**
 * Providers para el módulo de notificaciones
 */
export const NOTIFICATIONS_PROVIDERS: Provider[] = [
  NotificationsService,
  NotificationsApiClient,
  FcmService
];

