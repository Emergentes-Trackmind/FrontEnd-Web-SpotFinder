import {
  ParkingProfileDto,
  LocationDto,
  PricingDto,
  FeaturesDto,
  AnalyticsDto
} from './types';
import {
  ProfileParking,
  LocationData,
  PricingData,
  FeaturesData,
  ParkingType, ParkingStatus
} from '../model/profileparking.entity';

// ===== SANITIZERS =====
export function sanitizeString(value: any): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function sanitizeNumber(value: any): number {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export function sanitizeBoolean(value: any): boolean {
  return Boolean(value);
}

export function sanitizeArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

// ===== DEFAULTS =====
export function applyProfileDefaults(apiData: Partial<ParkingProfileDto>): ProfileParking {
  return {
    name: sanitizeString(apiData.name),
    type: (apiData.type as ParkingType) || ParkingType.Comercial,
    description: sanitizeString(apiData.description),
    totalSpaces: sanitizeNumber(apiData.totalSpaces),
    accessibleSpaces: sanitizeNumber(apiData.accessibleSpaces),
    phone: sanitizeString(apiData.phone),
    email: sanitizeString(apiData.email),
    website: sanitizeString(apiData.website),
    image: undefined, // File se maneja por separado
    status: (() => {
      const s = sanitizeString(apiData.status).toLowerCase();
      if (s === 'activo') return ParkingStatus.Activo;
      if (s === 'mantenimiento') return ParkingStatus.Mantenimiento;
      if (s === 'inactivo') return ParkingStatus.Inactivo;
      return ParkingStatus.Inactivo;
    })()
  };
}

export function applyLocationDefaults(apiData: Partial<LocationDto>): LocationData {
  return {
    addressLine: sanitizeString(apiData.addressLine),
    city: sanitizeString(apiData.city),
    postalCode: sanitizeString(apiData.postalCode),
    state: sanitizeString(apiData.state),
    country: sanitizeString(apiData.country),
    latitude: sanitizeNumber(apiData.latitude),
    longitude: sanitizeNumber(apiData.longitude)
  };
}

export function applyPricingDefaults(apiData: Partial<PricingDto>): PricingData {
  const operatingDaysArray = sanitizeArray<string>(apiData.operatingDays);

  return {
    hourlyRate: sanitizeNumber(apiData.hourlyRate),
    dailyRate: sanitizeNumber(apiData.dailyRate),
    monthlyRate: sanitizeNumber(apiData.monthlyRate),
    open24h: sanitizeBoolean(apiData.open24h),
    operatingDays: {
      monday: operatingDaysArray.includes('monday'),
      tuesday: operatingDaysArray.includes('tuesday'),
      wednesday: operatingDaysArray.includes('wednesday'),
      thursday: operatingDaysArray.includes('thursday'),
      friday: operatingDaysArray.includes('friday'),
      saturday: operatingDaysArray.includes('saturday'),
      sunday: operatingDaysArray.includes('sunday')
    },
    promotions: {
      earlyBird: sanitizeBoolean(apiData.promotions?.earlyBird),
      weekend: sanitizeBoolean(apiData.promotions?.weekend),
      longStay: sanitizeBoolean(apiData.promotions?.longStay)
    }
  };
}

export function applyFeaturesDefaults(apiData: Partial<FeaturesDto>): FeaturesData {
  const security = sanitizeArray<string>(apiData.security);
  const amenities = sanitizeArray<string>(apiData.amenities);
  const services = sanitizeArray<string>(apiData.services);
  const payments = sanitizeArray<string>(apiData.payments);

  return {
    security: {
      security24h: security.includes('security24h'),
      cameras: security.includes('cameras'),
      lighting: security.includes('lighting'),
      accessControl: security.includes('accessControl')
    },
    amenities: {
      covered: amenities.includes('covered'),
      elevator: amenities.includes('elevator'),
      bathrooms: amenities.includes('bathrooms'),
      carWash: amenities.includes('carWash')
    },
    services: {
      electricCharging: services.includes('electricCharging'),
      freeWifi: services.includes('freeWifi'),
      valetService: services.includes('valetService'),
      maintenance: services.includes('maintenance')
    },
    payments: {
      cardPayment: payments.includes('cardPayment'),
      mobilePayment: payments.includes('mobilePayment'),
      monthlyPasses: payments.includes('monthlyPasses'),
      corporateRates: payments.includes('corporateRates')
    }
  };
}

export function applyAnalyticsDefaults(apiData: Partial<AnalyticsDto>): any {
  const hourly = (apiData.hourlyOccupation ?? []) as Array<{ hour?: string; percentage?: number }>;
  const recent = (apiData.recentActivity ?? []) as Array<{ action?: string; details?: string; timestamp?: string; timeAgo?: string }>;

  return {
    kpis: {
      avgOccupation: sanitizeNumber(apiData.kpis?.avgOccupation),
      monthlyRevenue: sanitizeNumber(apiData.kpis?.monthlyRevenue),
      uniqueUsers: sanitizeNumber(apiData.kpis?.uniqueUsers),
      avgTime: sanitizeNumber(apiData.kpis?.avgTime),
      trends: {
        avgOccupation: sanitizeNumber(apiData.kpis?.trends?.avgOccupation),
        monthlyRevenue: sanitizeNumber(apiData.kpis?.trends?.monthlyRevenue),
        uniqueUsers: sanitizeNumber(apiData.kpis?.trends?.uniqueUsers),
        avgTime: sanitizeNumber(apiData.kpis?.trends?.avgTime)
      }
    },
    hourlyOccupation: hourly.map(item => ({
      hour: sanitizeString(item?.hour),
      percentage: sanitizeNumber(item?.percentage)
    })),
    recentActivity: recent.map(item => ({
      action: sanitizeString(item?.action),
      details: sanitizeString(item?.details),
      timestamp: sanitizeString(item?.timestamp),
      timeAgo: sanitizeString(item?.timeAgo)
    }))
  };
}

// ===== MAPPERS API → UI =====
export function mapApiToProfile(apiData: ParkingProfileDto): ProfileParking {
  return applyProfileDefaults(apiData);
}

export function mapApiToLocation(apiData: LocationDto): LocationData {
  return applyLocationDefaults(apiData);
}

export function mapApiToPricing(apiData: PricingDto): PricingData {
  return applyPricingDefaults(apiData);
}

export function mapApiToFeatures(apiData: FeaturesDto): FeaturesData {
  return applyFeaturesDefaults(apiData);
}

// ===== MAPPERS UI → API =====
export function mapProfileToApi(profile: ProfileParking): Partial<ParkingProfileDto> {
  return {
    name: profile.name,
    type: profile.type,
    description: profile.description,
    totalSpaces: profile.totalSpaces,
    accessibleSpaces: profile.accessibleSpaces,
    phone: profile.phone,
    email: profile.email,
    website: profile.website
  };
}

export function mapLocationToApi(location: LocationData): LocationDto {
  return {
    addressLine: location.addressLine,
    city: location.city,
    postalCode: location.postalCode,
    state: location.state,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude
  };
}

export function mapPricingToApi(pricing: PricingData): PricingDto {
  const operatingDays: string[] = [];
  if (pricing.operatingDays.monday) operatingDays.push('monday');
  if (pricing.operatingDays.tuesday) operatingDays.push('tuesday');
  if (pricing.operatingDays.wednesday) operatingDays.push('wednesday');
  if (pricing.operatingDays.thursday) operatingDays.push('thursday');
  if (pricing.operatingDays.friday) operatingDays.push('friday');
  if (pricing.operatingDays.saturday) operatingDays.push('saturday');
  if (pricing.operatingDays.sunday) operatingDays.push('sunday');

  return {
    hourlyRate: pricing.hourlyRate,
    dailyRate: pricing.dailyRate,
    monthlyRate: pricing.monthlyRate,
    open24h: pricing.open24h,
    operatingDays,
    promotions: pricing.promotions
  };
}

export function mapFeaturesToApi(features: FeaturesData): FeaturesDto {
  const security: string[] = [];
  const amenities: string[] = [];
  const services: string[] = [];
  const payments: string[] = [];

  // Security
  if (features.security.security24h) security.push('security24h');
  if (features.security.cameras) security.push('cameras');
  if (features.security.lighting) security.push('lighting');
  if (features.security.accessControl) security.push('accessControl');

  // Amenities
  if (features.amenities.covered) amenities.push('covered');
  if (features.amenities.elevator) amenities.push('elevator');
  if (features.amenities.bathrooms) amenities.push('bathrooms');
  if (features.amenities.carWash) amenities.push('carWash');

  // Services
  if (features.services.electricCharging) services.push('electricCharging');
  if (features.services.freeWifi) services.push('freeWifi');
  if (features.services.valetService) services.push('valetService');
  if (features.services.maintenance) services.push('maintenance');

  // Payments
  if (features.payments.cardPayment) payments.push('cardPayment');
  if (features.payments.mobilePayment) payments.push('mobilePayment');
  if (features.payments.monthlyPasses) payments.push('monthlyPasses');
  if (features.payments.corporateRates) payments.push('corporateRates');

  return { security, amenities, services, payments };
}
