import { Injectable, inject } from '@angular/core';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { NotificationsService } from './notifications.service';
import { NotificationsApiClient } from './notifications-api.client';
import { AppNotification } from '../models/notification.models';

/**
 * Servicio para gestionar Firebase Cloud Messaging (FCM)
 * Responsable de:
 * - Solicitar permisos de notificaciones
 * - Obtener y registrar token FCM
 * - Escuchar mensajes en foreground
 */
@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private readonly notificationsService = inject(NotificationsService);
  private readonly apiClient = inject(NotificationsApiClient);

  private firebaseApp: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private currentToken: string | null = null;

  /**
   * Inicializa FCM: solicita permisos, obtiene token y escucha mensajes
   */
  async init(): Promise<void> {
    try {
      // Verificar si Firebase está configurado en environment
      if (!environment.firebase || environment.firebase.apiKey === 'TU_API_KEY') {
        console.warn('⚠️ Firebase no está configurado. FCM no estará disponible.');
        console.log('ℹ️ Las notificaciones funcionarán solo a través del backend.');
        console.log('ℹ️ Para habilitar notificaciones push, configura Firebase en environment.ts');
        return;
      }

      // Inicializar Firebase App
      this.firebaseApp = initializeApp(environment.firebase);
      this.messaging = getMessaging(this.firebaseApp);

      // Solicitar permiso de notificaciones
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Permiso de notificaciones denegado');
        return;
      }

      // Obtener token FCM
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey
      });

      if (token) {
        this.currentToken = token;
        console.log('Token FCM obtenido:', token);

        // Registrar token en el backend
        this.apiClient.registerFcmToken(token).subscribe({
          next: () => console.log('Token FCM registrado en backend'),
          error: (err) => console.error('Error al registrar token FCM:', err)
        });
      } else {
        console.warn('No se pudo obtener token FCM');
      }

      // Escuchar mensajes en foreground
      this.listenToMessages();
    } catch (error) {
      console.error('Error al inicializar FCM:', error);
    }
  }

  /**
   * Escucha mensajes FCM cuando la app está en foreground
   */
  private listenToMessages(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload: any) => {
      console.log('Mensaje FCM recibido en foreground:', payload);

      // Mapear payload a AppNotification
      const notification = this.mapPayloadToNotification(payload);

      // Notificar al servicio de notificaciones
      this.notificationsService.onMessage(notification);
    });
  }

  /**
   * Mapea el payload de FCM a AppNotification
   */
  private mapPayloadToNotification(payload: any): AppNotification {
    const data = payload.data || {};
    const notification = payload.notification || {};

    return {
      id: data.id || this.generateId(),
      title: notification.title || data.title || 'Notificación',
      body: notification.body || data.body || '',
      kind: data.kind || 'info',
      createdAt: data.createdAt || new Date().toISOString(),
      read: false,
      actionLabel: data.actionLabel,
      actionUrl: data.actionUrl,
      metadata: data.metadata ? JSON.parse(data.metadata) : undefined
    };
  }

  /**
   * Genera un ID único para la notificación
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.currentToken;
  }
}

