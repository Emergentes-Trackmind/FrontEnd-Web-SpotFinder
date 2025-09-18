import { CreateParkingRequest } from './create-types';

// DTOs para la comunicación con la API
export interface ParkingProfileDto {
  id: string;
  name: string;
  type: string;
  description: string;
  totalSpaces: number;
  accessibleSpaces: number;
  phone: string;
  email: string;
  website: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// DTO para ubicación
export interface LocationDto {
  id?: string;
  profileId?: string;
  addressLine: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

// DTO para precios
export interface PricingDto {
  id?: string;
  profileId?: string;
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  open24h: boolean;
  operatingDays: string[]; // Array de días: ['monday', 'tuesday', etc.]
  promotions?: {
    earlyBird: boolean;
    weekend: boolean;
    longStay: boolean;
  };
}

// DTO para características
export interface FeaturesDto {
  id?: string;
  profileId?: string;
  security: string[]; // Array de características de seguridad
  amenities: string[]; // Array de comodidades
  services: string[]; // Array de servicios
  payments: string[]; // Array de métodos de pago
}

// DTO para analytics
export interface AnalyticsDto {
  profileId?: string;
  kpis?: {
    avgOccupation: number;
    monthlyRevenue: number;
    uniqueUsers: number;
    avgTime: number;
    trends?: {
      avgOccupation: number;
      monthlyRevenue: number;
      uniqueUsers: number;
      avgTime: number;
    };
  };
  hourlyOccupation?: Array<{
    hour: string;
    percentage: number;
  }>;
  recentActivity?: Array<{
    action: string;
    details: string;
    timestamp: string;
    timeAgo: string;
  }>;
}

// Tipos para creación de perfiles
export interface CreateParkingProfileRequest {
  name: string;
  type: string;
  description: string;
  totalSpaces: number;
  accessibleSpaces: number;
  phone: string;
  email: string;
  website: string;
}

// Tipos para actualización de perfiles
export interface UpdateParkingProfileRequest {
  name?: string;
  type?: string;
  description?: string;
  totalSpaces?: number;
  accessibleSpaces?: number;
  phone?: string;
  email?: string;
  website?: string;
  status?: string;
}

export interface CreateParkingProfileRequest extends CreateParkingRequest {}
