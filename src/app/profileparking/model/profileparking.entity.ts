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

  export interface ProfileParking {
    id?: string;
    name: string;
    type: ParkingType;
    description: string;
    totalSpaces: number;
    accessibleSpaces: number;
    phone: string;
    email: string;
    website: string;
    status: ParkingStatus;
    image?: File;
  }

  export interface LocationData {
    addressLine: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  }

  export interface PricingData {
    hourlyRate: number;
    dailyRate: number;
    monthlyRate: number;
    open24h: boolean;
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
