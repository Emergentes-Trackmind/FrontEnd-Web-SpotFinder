/**
 * Tipos de notificaciones soportadas
 */
export type NotificationKind = 'info' | 'success' | 'warning' | 'error' | 'system';

/**
 * Interfaz principal de una notificación de la aplicación
 */
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  createdAt: string; // ISO 8601
  read: boolean;
  // Opcionales
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Request para enviar una notificación (con email opcional)
 */
export interface SendNotificationRequest {
  userId: string; // o se infiere por token
  title: string;
  body: string;
  kind?: NotificationKind; // default 'info'
  sendEmail?: boolean; // front = true por defecto
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Parámetros de búsqueda/filtrado de notificaciones
 */
export interface NotificationListParams {
  q?: string; // búsqueda por título o contenido
  read?: boolean; // filtrar por leídas/no leídas
  page?: number;
  size?: number;
}

/**
 * Response de la lista de notificaciones
 */
export interface NotificationListResponse {
  data: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  size: number;
}

/**
 * Configuración de un toast
 */
export interface ToastConfig {
  durationMs?: number;
  closable?: boolean;
  pauseOnHover?: boolean;
}

