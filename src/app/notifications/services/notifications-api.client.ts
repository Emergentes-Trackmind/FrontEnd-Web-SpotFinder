import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppNotification,
  SendNotificationRequest,
  NotificationListParams,
  NotificationListResponse
} from '../models/notification.models';

/**
 * Cliente HTTP para gestionar notificaciones en el backend
 * Asume que el backend ya tiene los endpoints configurados
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/notifications`;

  /**
   * Obtiene la lista de notificaciones con filtros opcionales
   */
  list(params?: NotificationListParams): Observable<NotificationListResponse> {
    let httpParams = new HttpParams();

    if (params?.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params?.read !== undefined) {
      httpParams = httpParams.set('read', params.read.toString());
    }
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<NotificationListResponse>(this.baseUrl, { params: httpParams });
  }

  /**
   * Marca una notificación como leída
   */
  markRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {});
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/read-all`, {});
  }

  /**
   * Elimina una notificación
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Elimina todas las notificaciones del usuario
   */
  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}`);
  }

  /**
   * Envía una notificación (dispara FCM + email en backend)
   */
  send(req: SendNotificationRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/send`, req);
  }

  /**
   * Registra el token FCM del cliente para este usuario
   */
  registerFcmToken(token: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register-fcm-token`, { token });
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   */
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/unread-count`);
  }
}

