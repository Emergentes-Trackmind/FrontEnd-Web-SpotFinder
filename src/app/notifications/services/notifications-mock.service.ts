import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AppNotification, NotificationListResponse } from '../models/notification.models';

/**
 * Servicio mock de notificaciones para pruebas sin backend
 * Útil para desarrollo y testing sin dependencias externas
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsMockService {
  private mockNotifications: AppNotification[] = [
    {
      id: '1',
      title: '¡Bienvenido a SpotFinder!',
      body: 'Gracias por usar nuestra plataforma. Explora todas las funcionalidades.',
      kind: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutos atrás
      read: false,
      actionLabel: 'Explorar',
      actionUrl: '/dashboard'
    },
    {
      id: '2',
      title: 'Nueva reservación pendiente',
      body: 'Tienes una nueva reservación en "Parking Centro" para mañana a las 10:00 AM',
      kind: 'info',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
      read: false,
      actionLabel: 'Ver detalles',
      actionUrl: '/reservaciones',
      metadata: { parkingId: 'parking-1', reservationId: 'res-1' }
    },
    {
      id: '3',
      title: 'Parking ocupado al 80%',
      body: 'Tu parking "Parking Norte" está casi lleno. Solo quedan 5 espacios disponibles.',
      kind: 'warning',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hora atrás
      read: true,
      actionLabel: 'Ver parking',
      actionUrl: '/parkings',
      metadata: { parkingId: 'parking-2', occupancy: 80 }
    },
    {
      id: '4',
      title: 'Dispositivo IoT desconectado',
      body: 'El sensor "Sensor-B12" en "Parking Sur" no está respondiendo. Verifica la conexión.',
      kind: 'error',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 horas atrás
      read: true,
      actionLabel: 'Ver dispositivos',
      actionUrl: '/iot/devices',
      metadata: { deviceId: 'sensor-b12', parkingId: 'parking-3' }
    },
    {
      id: '5',
      title: 'Mantenimiento programado',
      body: 'Se realizará mantenimiento del sistema el próximo domingo de 2:00 AM a 4:00 AM.',
      kind: 'system',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 horas atrás
      read: true
    }
  ];

  /**
   * Obtiene la lista de notificaciones mock
   */
  getMockNotifications(): Observable<NotificationListResponse> {
    const unreadCount = this.mockNotifications.filter(n => !n.read).length;

    return of({
      data: [...this.mockNotifications],
      total: this.mockNotifications.length,
      unreadCount: unreadCount,
      page: 1,
      size: 20
    }).pipe(delay(500)); // Simular latencia de red
  }

  /**
   * Genera una notificación aleatoria para testing
   */
  generateRandomNotification(): AppNotification {
    const titles = [
      'Nueva reservación',
      'Parking lleno',
      'Dispositivo IoT alerta',
      'Pago recibido',
      'Review nueva',
      'Actualización del sistema'
    ];

    const bodies = [
      'Tienes una nueva acción pendiente.',
      'Revisa los detalles en tu dashboard.',
      'Se requiere tu atención inmediata.',
      'Todo está funcionando correctamente.',
      'Gracias por usar SpotFinder.'
    ];

    const kinds: Array<'info' | 'success' | 'warning' | 'error' | 'system'> =
      ['info', 'success', 'warning', 'error', 'system'];

    return {
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      body: bodies[Math.floor(Math.random() * bodies.length)],
      kind: kinds[Math.floor(Math.random() * kinds.length)],
      createdAt: new Date().toISOString(),
      read: false,
      actionLabel: 'Ver detalles',
      actionUrl: '/dashboard'
    };
  }

  /**
   * Agrega una notificación a la lista mock
   */
  addMockNotification(notification: AppNotification): void {
    this.mockNotifications = [notification, ...this.mockNotifications];
  }

  /**
   * Marca una notificación como leída
   */
  markAsReadMock(id: string): Observable<void> {
    const notification = this.mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return of(void 0).pipe(delay(300));
  }

  /**
   * Marca todas como leídas
   */
  markAllAsReadMock(): Observable<void> {
    this.mockNotifications.forEach(n => n.read = true);
    return of(void 0).pipe(delay(300));
  }

  /**
   * Elimina una notificación
   */
  deleteMock(id: string): Observable<void> {
    this.mockNotifications = this.mockNotifications.filter(n => n.id !== id);
    return of(void 0).pipe(delay(300));
  }

  /**
   * Elimina todas las notificaciones
   */
  deleteAllMock(): Observable<void> {
    this.mockNotifications = [];
    return of(void 0).pipe(delay(300));
  }

  /**
   * Obtiene el contador de no leídas
   */
  getUnreadCountMock(): Observable<{ count: number }> {
    const count = this.mockNotifications.filter(n => !n.read).length;
    return of({ count }).pipe(delay(200));
  }
}

