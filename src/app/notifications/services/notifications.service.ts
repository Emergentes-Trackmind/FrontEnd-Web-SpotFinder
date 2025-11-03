import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationsApiClient } from './notifications-api.client';
import {
  AppNotification,
  NotificationListParams,
  ToastConfig
} from '../models/notification.models';

/**
 * Servicio central de notificaciones
 * Gestiona el estado reactivo, toasts y sincronización con el backend
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly apiClient = inject(NotificationsApiClient);

  // Estado reactivo con signals
  private readonly _notifications = signal<AppNotification[]>([]);
  private readonly _unreadCount = signal<number>(0);
  private readonly _loading = signal<boolean>(false);

  // Cola de toasts
  private readonly _visibleToasts = signal<AppNotification[]>([]);
  private readonly _toastQueue = signal<AppNotification[]>([]);
  private readonly maxVisibleToasts = 3;

  // Exposición pública de signals (readonly)
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly visibleToasts = this._visibleToasts.asReadonly();

  /**
   * Carga las notificaciones iniciales y el contador de no leídas
   */
  loadInitial(params?: NotificationListParams): Observable<any> {
    this._loading.set(true);
    return this.apiClient.list(params).pipe(
      tap((response) => {
        this._notifications.set(response.data);
        this._unreadCount.set(response.unreadCount);
        this._loading.set(false);
      })
    );
  }

  /**
   * Recarga las notificaciones con parámetros dados
   */
  reload(params?: NotificationListParams): Observable<any> {
    return this.loadInitial(params);
  }

  /**
   * Muestra un toast (si hay espacio) o lo encola
   */
  pushToast(notification: AppNotification, config?: ToastConfig): void {
    const visible = this._visibleToasts();
    const queue = this._toastQueue();

    if (visible.length < this.maxVisibleToasts) {
      this._visibleToasts.set([...visible, notification]);
    } else {
      // Encolar
      this._toastQueue.set([...queue, notification]);
    }
  }

  /**
   * Cierra un toast y libera un slot (saca de la cola si hay)
   */
  dismissToast(id: string): void {
    const visible = this._visibleToasts();
    const queue = this._toastQueue();

    // Remover de visibles
    const newVisible = visible.filter((t) => t.id !== id);

    // Si hay en cola, agregar el primero
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      this._visibleToasts.set([...newVisible, next]);
      this._toastQueue.set(rest);
    } else {
      this._visibleToasts.set(newVisible);
    }
  }

  /**
   * Maneja un mensaje FCM entrante (foreground)
   * Lo agrega al store, muestra toast y actualiza contador
   */
  onMessage(notification: AppNotification): void {
    // Agregar al inicio de la lista
    const current = this._notifications();
    this._notifications.set([notification, ...current]);

    // Incrementar contador si no está leída
    if (!notification.read) {
      this._unreadCount.update((count) => count + 1);
    }

    // Mostrar toast
    this.pushToast(notification);
  }

  /**
   * Marca una notificación como leída
   */
  markRead(id: string): Observable<void> {
    return this.apiClient.markRead(id).pipe(
      tap(() => {
        const notifications = this._notifications();
        const updated = notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        this._notifications.set(updated);

        // Decrementar contador si era no leída
        const wasUnread = notifications.find((n) => n.id === id && !n.read);
        if (wasUnread) {
          this._unreadCount.update((count) => Math.max(0, count - 1));
        }
      })
    );
  }

  /**
   * Marca todas como leídas
   */
  markAllRead(): Observable<void> {
    return this.apiClient.markAllRead().pipe(
      tap(() => {
        const notifications = this._notifications();
        const updated = notifications.map((n) => ({ ...n, read: true }));
        this._notifications.set(updated);
        this._unreadCount.set(0);
      })
    );
  }

  /**
   * Elimina una notificación
   */
  delete(id: string): Observable<void> {
    return this.apiClient.delete(id).pipe(
      tap(() => {
        const notifications = this._notifications();
        const toDelete = notifications.find((n) => n.id === id);
        const updated = notifications.filter((n) => n.id !== id);
        this._notifications.set(updated);

        // Decrementar contador si era no leída
        if (toDelete && !toDelete.read) {
          this._unreadCount.update((count) => Math.max(0, count - 1));
        }
      })
    );
  }

  /**
   * Elimina todas las notificaciones
   */
  deleteAll(): Observable<void> {
    return this.apiClient.deleteAll().pipe(
      tap(() => {
        this._notifications.set([]);
        this._unreadCount.set(0);
      })
    );
  }

  /**
   * Actualiza el contador de no leídas desde el servidor
   */
  refreshUnreadCount(): Observable<any> {
    return this.apiClient.getUnreadCount().pipe(
      tap((response) => {
        this._unreadCount.set(response.count);
      })
    );
  }
}

