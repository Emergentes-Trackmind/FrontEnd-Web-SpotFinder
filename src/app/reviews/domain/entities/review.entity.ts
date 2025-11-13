import { ReviewId } from '../value-objects/review-id.vo';

export interface Review {
  id: ReviewId;
  parkingId: string | number;
  parkingName: string;
  parkingOwnerId: string | number; // ID del dueño del parking (para privacidad)
  userId: string | number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  responded: boolean;
  responseText?: string | null;
  responseAt?: string | null;
  readAt?: string | null;
  archived?: boolean; // Para ocultar sin eliminar
  archivedAt?: string | null; // Fecha de archivo

  // Campos legacy (mantener compatibilidad)
  driver_name?: string;
  driver_avatar?: string;
  parking_name?: string;
  created_at?: string;
  response_text?: string;
  response_at?: string;
  read_at?: string;
}
