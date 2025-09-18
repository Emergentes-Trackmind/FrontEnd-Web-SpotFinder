// Mappers específicos para el wizard de creación
import { CreateBasicInfoDto, CreateLocationDto, CreateFeaturesDto, CreatePricingDto } from './create-types';
import { ProfileParking, ParkingType, ParkingStatus, LocationData, PricingData, FeaturesData } from '../model/profileparking.entity';

/**
 * Convertir datos del wizard a formato de entidad ProfileParking
 */
export function mapCreateDataToProfile(
  basicInfo: CreateBasicInfoDto,
  location: CreateLocationDto,
  features: CreateFeaturesDto,
  pricing: CreatePricingDto
): ProfileParking {
  return {
    id: undefined, // Se asignará cuando se cree en el servidor
    name: basicInfo.name,
    type: basicInfo.type as ParkingType,
    description: basicInfo.description,
    totalSpaces: basicInfo.totalSpaces,
    accessibleSpaces: basicInfo.accessibleSpaces,
    phone: basicInfo.phone,
    email: basicInfo.email,
    website: basicInfo.website || '', // Manejar el caso opcional con string vacío por defecto
    status: ParkingStatus.Activo, // Por defecto activo al crear
    image: undefined
  };
}

/**
 * Convertir datos de ubicación del wizard a LocationData
 */
export function mapCreateLocationToLocationData(location: CreateLocationDto): LocationData {
  return {
    addressLine: location.addressLine,
    city: location.city,
    postalCode: location.postalCode,
    state: location.state || '',
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude
  };
}

/**
 * Convertir datos de características del wizard a FeaturesData
 */
export function mapCreateFeaturesToFeaturesData(features: CreateFeaturesDto): FeaturesData {
  return {
    security: features.security,
    amenities: features.amenities,
    services: features.services,
    payments: features.payments
  };
}

/**
 * Convertir datos de precios del wizard a PricingData
 */
export function mapCreatePricingToPricingData(pricing: CreatePricingDto): PricingData {
  return {
    hourlyRate: pricing.hourlyRate,
    dailyRate: pricing.dailyRate,
    monthlyRate: pricing.monthlyRate,
    open24h: pricing.open24h,
    operatingDays: pricing.operatingDays,
    promotions: pricing.promotions
  };
}

/**
 * Validar datos básicos de creación
 */
export function validateBasicInfo(data: Partial<CreateBasicInfoDto>): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('El nombre es obligatorio');
  }

  if (!data.type) {
    errors.push('El tipo de parking es obligatorio');
  }

  if (!data.description?.trim()) {
    errors.push('La descripción es obligatoria');
  }

  if (!data.totalSpaces || data.totalSpaces < 1) {
    errors.push('El número de plazas debe ser mayor a 0');
  }

  if (data.accessibleSpaces === undefined || data.accessibleSpaces < 0) {
    errors.push('Las plazas accesibles no pueden ser negativas');
  }

  if (data.accessibleSpaces && data.totalSpaces && data.accessibleSpaces > data.totalSpaces) {
    errors.push('Las plazas accesibles no pueden exceder el total');
  }

  if (!data.phone?.trim()) {
    errors.push('El teléfono es obligatorio');
  }

  if (!data.email?.trim()) {
    errors.push('El email es obligatorio');
  }

  return errors;
}

/**
 * Validar datos de ubicación
 */
export function validateLocation(data: Partial<CreateLocationDto>): string[] {
  const errors: string[] = [];

  if (!data.addressLine?.trim()) {
    errors.push('La dirección es obligatoria');
  }

  if (!data.city?.trim()) {
    errors.push('La ciudad es obligatoria');
  }

  if (!data.postalCode?.trim()) {
    errors.push('El código postal es obligatorio');
  }

  if (!data.country?.trim()) {
    errors.push('El país es obligatorio');
  }

  if (data.latitude === undefined || data.longitude === undefined) {
    errors.push('Las coordenadas son obligatorias');
  }

  return errors;
}

/**
 * Validar datos de precios
 */
export function validatePricing(data: Partial<CreatePricingDto>): string[] {
  const errors: string[] = [];

  if (!data.currency) {
    errors.push('La moneda es obligatoria');
  }

  if (!data.minimumStay) {
    errors.push('La estancia mínima es obligatoria');
  }

  if (!data.operatingDays) {
    errors.push('Los días de funcionamiento son obligatorios');
  }

  // Validar que al menos un día esté seleccionado
  if (data.operatingDays) {
    const selectedDays = Object.values(data.operatingDays).filter(Boolean);
    if (selectedDays.length === 0) {
      errors.push('Debe seleccionar al menos un día de funcionamiento');
    }
  }

  // Validar horarios si no es 24h
  if (!data.open24h && data.operatingHours) {
    if (!data.operatingHours.openTime) {
      errors.push('La hora de apertura es obligatoria');
    }
    if (!data.operatingHours.closeTime) {
      errors.push('La hora de cierre es obligatoria');
    }
  }

  return errors;
}

/**
 * Generar un resumen del parking para mostrar en la revisión
 */
export function generateParkingSummary(
  basicInfo: Partial<CreateBasicInfoDto>,
  location: Partial<CreateLocationDto>,
  features: Partial<CreateFeaturesDto>,
  pricing: Partial<CreatePricingDto>
): string {
  const parts: string[] = [];

  if (basicInfo.name) {
    parts.push(`Parking: ${basicInfo.name}`);
  }

  if (basicInfo.type) {
    parts.push(`Tipo: ${basicInfo.type}`);
  }

  if (basicInfo.totalSpaces) {
    parts.push(`${basicInfo.totalSpaces} plazas`);
  }

  if (location.city) {
    parts.push(`Ubicado en ${location.city}`);
  }

  return parts.join(' | ');
}
