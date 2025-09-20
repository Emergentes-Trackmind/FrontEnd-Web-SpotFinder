import { ReservationStatus } from '../enums/reservation-status.enum';

export interface Reservation {
  id: string | number;
  userId: string | number;
  userName?: string;
  userEmail?: string;
  vehiclePlate?: string;
  parkingId: string | number;
  parkingName?: string;
  parkingSpotId?: string;   // UUID
  space?: string;           // A-3 si aplica
  startTime: string;        // ISO
  endTime: string;          // ISO
  totalPrice: number;
  currency: 'EUR' | 'USD' | 'PEN' | string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}
