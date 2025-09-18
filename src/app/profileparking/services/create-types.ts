// DTOs para el wizard de creación de parking

export interface CreateBasicInfoDto {
  name: string;
  type: string;
  description: string;
  totalSpaces: number;
  accessibleSpaces: number;
  phone: string;
  email: string;
  website?: string;
}

export interface CreateLocationDto {
  addressLine: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CreateFeaturesDto {
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

export interface CreatePricingDto {
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

export interface CreateParkingRequest {
  basicInfo: CreateBasicInfoDto;
  location: CreateLocationDto;
  features: CreateFeaturesDto;
  pricing: CreatePricingDto;
}

// Estado del wizard
export interface WizardState {
  currentStep: number;
  isValid: boolean;
  basicInfo: Partial<CreateBasicInfoDto>;
  location: Partial<CreateLocationDto>;
  features: Partial<CreateFeaturesDto>;
  pricing: Partial<CreatePricingDto>;
}

// Respuesta de geocodificación
export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  address?: {
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

// Coordenadas del mapa
export interface MapCoordinates {
  lat: number;
  lng: number;
}
