import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Parking, CreateParkingDto, UpdateParkingDto } from '../../domain/entities/parking.entity';
import { AuthService } from '../../../iam/services/auth.service';

interface ParkingJson {
  id: string;
  ownerId: string;
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

interface LocationJson {
  id: string;
  profileId: string;
  addressLine: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface PricingJson {
  id: string;
  profileId: string;
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

interface FeaturesJson {
  id: string;
  profileId: string;
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

/**
 * API HTTP para parkings
 * Maneja las llamadas HTTP al backend
 */
@Injectable()
export class ParkingsApi {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly parkingsUrl = `${environment.apiBase}${environment.endpoints.parkings}`;

  getParkings(ownerId?: string): Observable<Parking[]> {
    let params = new HttpParams();
    if (ownerId) {
      params = params.set('ownerId', ownerId);
    }

    return this.http.get<any[]>(this.parkingsUrl, { params }).pipe(
      map(parkings => {
        if (parkings.length === 0) {
          return [];
        }

        console.log('📥 [ParkingsApi] Parkings recibidos con datos embebidos:', parkings.length);

        // 🎯 Los parkings ya contienen location, pricing y features embebidos
        return parkings.map(parking => {
          const locationMap = new Map<string, LocationJson>();
          const pricingMap = new Map<string, PricingJson>();
          const featuresMap = new Map<string, FeaturesJson>();

          if (parking.location) locationMap.set(parking.id, parking.location);
          if (parking.pricing) pricingMap.set(parking.id, parking.pricing);
          if (parking.features) featuresMap.set(parking.id, parking.features);

          return this.mapToDomain(parking, locationMap, pricingMap, featuresMap);
        });
      })
    );
  }

  getParkingById(id: string): Observable<Parking> {
    return this.http.get<any>(`${this.parkingsUrl}/${id}`).pipe(
      map(parking => {
        console.log('📥 [ParkingsApi] Parking recibido con datos embebidos:', parking);

        // 🎯 El parking ya contiene location, pricing y features embebidos
        const locationMap = new Map<string, LocationJson>();
        const pricingMap = new Map<string, PricingJson>();
        const featuresMap = new Map<string, FeaturesJson>();

        if (parking.location) locationMap.set(parking.id, parking.location);
        if (parking.pricing) pricingMap.set(parking.id, parking.pricing);
        if (parking.features) featuresMap.set(parking.id, parking.features);

        return this.mapToDomain(parking, locationMap, pricingMap, featuresMap);
      })
    );
  }

  createParking(dto: CreateParkingDto): Observable<Parking> {
    // Obtener el ownerId del usuario autenticado
    const ownerId = this.authService.getUserIdFromToken();

    if (!ownerId) {
      throw new Error('Usuario no autenticado. No se puede crear el parking.');
    }

    // 🎯 SOLUCIÓN: Enviar TODO en un solo objeto al backend
    // El middleware de json-server guardará location, pricing y features dentro del parking
    const parkingData = {
      ownerId: ownerId,
      name: dto.name,
      type: dto.type,
      description: dto.description,
      totalSpaces: dto.totalSpaces,
      accessibleSpaces: dto.accessibleSpaces,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
      status: dto.status,
      location: dto.location,    // ✅ Incluir location directamente
      pricing: dto.pricing,      // ✅ Incluir pricing directamente
      features: dto.features     // ✅ Incluir features directamente
    };

    console.log('📦 [ParkingsApi] Creando parking con todos los datos:', parkingData);

    return this.http.post<any>(this.parkingsUrl, parkingData).pipe(
      map(parking => {
        console.log('✅ [ParkingsApi] Parking creado con location, pricing y features:', parking);

        // Mapear la respuesta al dominio
        const locationMap = new Map<string, LocationJson>();
        const pricingMap = new Map<string, PricingJson>();
        const featuresMap = new Map<string, FeaturesJson>();

        if (parking.location) locationMap.set(parking.id, parking.location);
        if (parking.pricing) pricingMap.set(parking.id, parking.pricing);
        if (parking.features) featuresMap.set(parking.id, parking.features);

        return this.mapToDomain(parking, locationMap, pricingMap, featuresMap);
      })
    );
  }

  updateParking(id: string, dto: UpdateParkingDto): Observable<Parking> {
    // 🎯 SOLUCIÓN: Enviar TODO en un solo objeto, incluyendo location, pricing y features
    const parkingData: any = {};
    if (dto.name !== undefined) parkingData.name = dto.name;
    if (dto.type !== undefined) parkingData.type = dto.type;
    if (dto.description !== undefined) parkingData.description = dto.description;
    if (dto.totalSpaces !== undefined) parkingData.totalSpaces = dto.totalSpaces;
    if (dto.accessibleSpaces !== undefined) parkingData.accessibleSpaces = dto.accessibleSpaces;
    if (dto.phone !== undefined) parkingData.phone = dto.phone;
    if (dto.email !== undefined) parkingData.email = dto.email;
    if (dto.website !== undefined) parkingData.website = dto.website;
    if (dto.status !== undefined) parkingData.status = dto.status;

    // ✅ Incluir location, pricing y features directamente en el objeto
    if (dto.location !== undefined) parkingData.location = dto.location;
    if (dto.pricing !== undefined) parkingData.pricing = dto.pricing;
    if (dto.features !== undefined) parkingData.features = dto.features;

    console.log('📦 [ParkingsApi] Actualizando parking con todos los datos:', parkingData);

    return this.http.patch<any>(`${this.parkingsUrl}/${id}`, parkingData).pipe(
      map(parking => {
        console.log('✅ [ParkingsApi] Parking actualizado con location, pricing y features:', parking);

        // Mapear la respuesta al dominio
        const locationMap = new Map<string, LocationJson>();
        const pricingMap = new Map<string, PricingJson>();
        const featuresMap = new Map<string, FeaturesJson>();

        if (parking.location) locationMap.set(parking.id, parking.location);
        if (parking.pricing) pricingMap.set(parking.id, parking.pricing);
        if (parking.features) featuresMap.set(parking.id, parking.features);

        return this.mapToDomain(parking, locationMap, pricingMap, featuresMap);
      })
    );
  }

  deleteParking(id: string): Observable<void> {
    console.log('🗑️ [ParkingsApi] Eliminando parking:', id);
    // En json-server, simplemente eliminamos el parking principal
    // Los datos relacionados (location, pricing, features) están dentro del objeto parking
    return this.http.delete<void>(`${this.parkingsUrl}/${id}`).pipe(
      map(() => {
        console.log('✅ [ParkingsApi] Parking eliminado exitosamente:', id);
        return undefined;
      }),
      catchError(error => {
        console.error('❌ [ParkingsApi] Error eliminando parking:', id, error);
        throw error;
      })
    );
  }

  /**
   * Elimina múltiples parkings
   */
  deleteManyParkings(ids: string[]): Observable<void> {
    if (ids.length === 0) {
      return of(undefined);
    }

    // Eliminar cada parking secuencialmente para evitar problemas
    const deleteOperations = ids.map(id => this.deleteParking(id));

    return forkJoin(deleteOperations).pipe(
      map(() => undefined)
    );
  }


  private mapToDomain(
    parking: ParkingJson,
    locations: Map<string, LocationJson>,
    pricing: Map<string, PricingJson>,
    features: Map<string, FeaturesJson>
  ): Parking {
    const location = locations.get(parking.id);
    const pricingData = pricing.get(parking.id);
    const featuresData = features.get(parking.id);

    return {
      id: parking.id,
      ownerId: parking.ownerId,
      name: parking.name,
      type: parking.type as any,
      description: parking.description,
      totalSpaces: parking.totalSpaces,
      accessibleSpaces: parking.accessibleSpaces,
      phone: parking.phone,
      email: parking.email,
      website: parking.website,
      status: parking.status as any,
      location: location ? {
        id: location.id,
        profileId: location.profileId,
        addressLine: location.addressLine,
        city: location.city,
        postalCode: location.postalCode,
        state: location.state,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude
      } : undefined,
      pricing: pricingData ? {
        id: pricingData.id,
        profileId: pricingData.profileId,
        hourlyRate: pricingData.hourlyRate,
        dailyRate: pricingData.dailyRate,
        monthlyRate: pricingData.monthlyRate,
        currency: pricingData.currency,
        minimumStay: pricingData.minimumStay,
        open24h: pricingData.open24h,
        operatingHours: pricingData.operatingHours,
        operatingDays: pricingData.operatingDays,
        promotions: pricingData.promotions
      } : undefined,
      features: featuresData ? {
        id: featuresData.id,
        profileId: featuresData.profileId,
        security: featuresData.security,
        amenities: featuresData.amenities,
        services: featuresData.services,
        payments: featuresData.payments
      } : undefined,
      createdAt: parking.createdAt,
      updatedAt: parking.updatedAt
    };
  }
}
