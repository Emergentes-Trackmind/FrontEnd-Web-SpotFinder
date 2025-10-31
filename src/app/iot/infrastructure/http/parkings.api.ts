import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Parking, CreateParkingDto, UpdateParkingDto, LocationData, PricingData, FeaturesData } from '../../domain/entities/parking.entity';
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
  private readonly locationsUrl = `${environment.apiBase}${environment.endpoints.locations}`;
  private readonly pricingUrl = `${environment.apiBase}${environment.endpoints.pricing}`;
  private readonly featuresUrl = `${environment.apiBase}${environment.endpoints.features}`;

  getParkings(ownerId?: string): Observable<Parking[]> {
    let params = new HttpParams();
    if (ownerId) {
      params = params.set('ownerId', ownerId);
    }

    return this.http.get<ParkingJson[]>(this.parkingsUrl, { params }).pipe(
      switchMap(parkings => {
        if (parkings.length === 0) {
          return of([]);
        }

        // Cargar datos relacionados para todos los parkings
        const parkingIds = parkings.map(p => p.id);
        return forkJoin({
          parkings: of(parkings),
          locations: this.getLocationsByParkingIds(parkingIds),
          pricing: this.getPricingByParkingIds(parkingIds),
          features: this.getFeaturesByParkingIds(parkingIds)
        }).pipe(
          map(({ parkings, locations, pricing, features }) => {
            return parkings.map(parking => this.mapToDomain(parking, locations, pricing, features));
          })
        );
      })
    );
  }

  getParkingById(id: string): Observable<Parking> {
    return this.http.get<ParkingJson>(`${this.parkingsUrl}/${id}`).pipe(
      switchMap(parking => {
        return forkJoin({
          parking: of(parking),
          location: this.http.get<LocationJson[]>(`${this.locationsUrl}?profileId=${id}`).pipe(
            map(locations => locations[0] || null),
            catchError(() => of(null))
          ),
          pricing: this.http.get<PricingJson[]>(`${this.pricingUrl}?profileId=${id}`).pipe(
            map(pricing => pricing[0] || null),
            catchError(() => of(null))
          ),
          features: this.http.get<FeaturesJson[]>(`${this.featuresUrl}?profileId=${id}`).pipe(
            map(features => features[0] || null),
            catchError(() => of(null))
          )
        }).pipe(
          map(({ parking, location, pricing, features }) => {
            const locationMap = new Map<string, LocationJson>();
            const pricingMap = new Map<string, PricingJson>();
            const featuresMap = new Map<string, FeaturesJson>();

            if (location) locationMap.set(parking.id, location);
            if (pricing) pricingMap.set(parking.id, pricing);
            if (features) featuresMap.set(parking.id, features);

            return this.mapToDomain(parking, locationMap, pricingMap, featuresMap);
          })
        );
      })
    );
  }

  createParking(dto: CreateParkingDto): Observable<Parking> {
    // Obtener el ownerId del usuario autenticado
    const ownerId = this.authService.getUserIdFromToken();

    if (!ownerId) {
      throw new Error('Usuario no autenticado. No se puede crear el parking.');
    }

    const parkingData = {
      ownerId: ownerId,  // ✅ AGREGAR ESTO
      name: dto.name,
      type: dto.type,
      description: dto.description,
      totalSpaces: dto.totalSpaces,
      accessibleSpaces: dto.accessibleSpaces,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
      status: dto.status
    };

    return this.http.post<ParkingJson>(this.parkingsUrl, parkingData).pipe(
      switchMap(parking => {
        // Crear datos relacionados
        const locationData = { ...dto.location, profileId: parking.id };
        const pricingData = { ...dto.pricing, profileId: parking.id };
        const featuresData = { ...dto.features, profileId: parking.id };

        return forkJoin({
          parking: of(parking),
          location: this.http.post<LocationJson>(this.locationsUrl, locationData),
          pricing: this.http.post<PricingJson>(this.pricingUrl, pricingData),
          features: this.http.post<FeaturesJson>(this.featuresUrl, featuresData)
        }).pipe(
          map(({ parking, location, pricing, features }) => {
            const locationMap = new Map<string, LocationJson>();
            const pricingMap = new Map<string, PricingJson>();
            const featuresMap = new Map<string, FeaturesJson>();

            locationMap.set(parking.id, location);
            pricingMap.set(parking.id, pricing);
            featuresMap.set(parking.id, features);

            return this.mapToDomain(parking, locationMap, pricingMap, featuresMap);
          })
        );
      })
    );
  }

  updateParking(id: string, dto: UpdateParkingDto): Observable<Parking> {
    // Actualizar datos básicos del parking
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

    return this.http.patch<ParkingJson>(`${this.parkingsUrl}/${id}`, parkingData).pipe(
      switchMap(parking => {
        const updates: Observable<any>[] = [of(parking)];

        // Actualizar datos relacionados si se proporcionan
        if (dto.location) {
          updates.push(
            this.http.get<LocationJson[]>(`${this.locationsUrl}?profileId=${id}`).pipe(
              switchMap(locations => {
                const locationId = locations[0]?.id;
                if (locationId) {
                  return this.http.patch<LocationJson>(`${this.locationsUrl}/${locationId}`, dto.location);
                }
                return this.http.post<LocationJson>(this.locationsUrl, { ...dto.location, profileId: id });
              })
            )
          );
        }

        if (dto.pricing) {
          updates.push(
            this.http.get<PricingJson[]>(`${this.pricingUrl}?profileId=${id}`).pipe(
              switchMap(pricing => {
                const pricingId = pricing[0]?.id;
                if (pricingId) {
                  return this.http.patch<PricingJson>(`${this.pricingUrl}/${pricingId}`, dto.pricing);
                }
                return this.http.post<PricingJson>(this.pricingUrl, { ...dto.pricing, profileId: id });
              })
            )
          );
        }

        if (dto.features) {
          updates.push(
            this.http.get<FeaturesJson[]>(`${this.featuresUrl}?profileId=${id}`).pipe(
              switchMap(features => {
                const featuresId = features[0]?.id;
                if (featuresId) {
                  return this.http.patch<FeaturesJson>(`${this.featuresUrl}/${featuresId}`, dto.features);
                }
                return this.http.post<FeaturesJson>(this.featuresUrl, { ...dto.features, profileId: id });
              })
            )
          );
        }

        return forkJoin(updates).pipe(
          switchMap(() => this.getParkingById(id))
        );
      })
    );
  }

  deleteParking(id: string): Observable<void> {
    // Eliminar datos relacionados primero
    return forkJoin({
      locations: this.http.get<LocationJson[]>(`${this.locationsUrl}?profileId=${id}`),
      pricing: this.http.get<PricingJson[]>(`${this.pricingUrl}?profileId=${id}`),
      features: this.http.get<FeaturesJson[]>(`${this.featuresUrl}?profileId=${id}`)
    }).pipe(
      switchMap(({ locations, pricing, features }) => {
        const deletes: Observable<any>[] = [];

        locations.forEach(loc => {
          deletes.push(this.http.delete(`${this.locationsUrl}/${loc.id}`));
        });
        pricing.forEach(pr => {
          deletes.push(this.http.delete(`${this.pricingUrl}/${pr.id}`));
        });
        features.forEach(feat => {
          deletes.push(this.http.delete(`${this.featuresUrl}/${feat.id}`));
        });

        if (deletes.length > 0) {
          return forkJoin(deletes);
        }
        return of([]);
      }),
      switchMap(() => this.http.delete<void>(`${this.parkingsUrl}/${id}`))
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

  private getLocationsByParkingIds(parkingIds: string[]): Observable<Map<string, LocationJson>> {
    const requests = parkingIds.map(id =>
      this.http.get<LocationJson[]>(`${this.locationsUrl}?profileId=${id}`).pipe(
        map(locations => ({ id, location: locations[0] || null })),
        catchError(() => of({ id, location: null }))
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        const map = new Map<string, LocationJson>();
        results.forEach(result => {
          if (result.location) {
            map.set(result.id, result.location);
          }
        });
        return map;
      })
    );
  }

  private getPricingByParkingIds(parkingIds: string[]): Observable<Map<string, PricingJson>> {
    const requests = parkingIds.map(id =>
      this.http.get<PricingJson[]>(`${this.pricingUrl}?profileId=${id}`).pipe(
        map(pricing => ({ id, pricing: pricing[0] || null })),
        catchError(() => of({ id, pricing: null }))
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        const map = new Map<string, PricingJson>();
        results.forEach(result => {
          if (result.pricing) {
            map.set(result.id, result.pricing);
          }
        });
        return map;
      })
    );
  }

  private getFeaturesByParkingIds(parkingIds: string[]): Observable<Map<string, FeaturesJson>> {
    const requests = parkingIds.map(id =>
      this.http.get<FeaturesJson[]>(`${this.featuresUrl}?profileId=${id}`).pipe(
        map(features => ({ id, features: features[0] || null })),
        catchError(() => of({ id, features: null }))
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        const map = new Map<string, FeaturesJson>();
        results.forEach(result => {
          if (result.features) {
            map.set(result.id, result.features);
          }
        });
        return map;
      })
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
