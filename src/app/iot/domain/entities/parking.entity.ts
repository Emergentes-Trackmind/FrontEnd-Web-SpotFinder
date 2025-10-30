/**
 * PARKING Entity
 * Representa un estacionamiento con toda su información
 * Consolidado desde profileparking al módulo IoT
 */

export enum ParkingType {
  Comercial = 'Comercial',
  Privado = 'Privado',
  Publico = 'Público',
  Residencial = 'Residencial'
}

export enum ParkingStatus {
  Activo = 'Activo',
  Mantenimiento = 'Mantenimiento',
  Inactivo = 'Inactivo'
}

export interface Parking {
  id: string;
  ownerId: string;
  name: string;
  type: ParkingType;
  description: string;
  totalSpaces: number;
  accessibleSpaces: number;
  phone: string;
  email: string;
  website: string;
  status: ParkingStatus;

  // Location data
  location?: LocationData;

  // Pricing data
  pricing?: PricingData;

  // Features data
  features?: FeaturesData;

  // IoT relacionado
  deviceCount?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface LocationData {
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

export interface PricingData {
  id?: string;
  profileId?: string;
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  currency: string;
  minimumStay: string;
  open24h: boolean;
  operatingHours?: {
    openTime: string;
    closeTime: string;
  };
  operatingDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  promotions: {
    earlyBird: boolean;
    weekend: boolean;
    longStay: boolean;
  };
}

export interface FeaturesData {
  id?: string;
  profileId?: string;
  security: {
    security24h: boolean;
    cameras: boolean;
    lighting: boolean;
    accessControl: boolean;
  };
  amenities: {
    covered: boolean;
    elevator: boolean;
    bathrooms: boolean;
    carWash: boolean;
  };
  services: {
    electricCharging: boolean;
    freeWifi: boolean;
    valetService: boolean;
    maintenance: boolean;
  };
  payments: {
    cardPayment: boolean;
    mobilePayment: boolean;
    monthlyPasses: boolean;
    corporateRates: boolean;
  };
}

// DTOs para crear y actualizar
export interface CreateParkingDto {
  name: string;
  type: ParkingType;
  description: string;
  totalSpaces: number;
  accessibleSpaces: number;
  phone: string;
  email: string;
  website: string;
  status: ParkingStatus;
  location: LocationData;
  pricing: PricingData;
  features: FeaturesData;
}

export interface UpdateParkingDto {
  name?: string;
  type?: ParkingType;
  description?: string;
  totalSpaces?: number;
  accessibleSpaces?: number;
  phone?: string;
  email?: string;
  website?: string;
  status?: ParkingStatus;
  location?: LocationData;
  pricing?: PricingData;
  features?: FeaturesData;
}

