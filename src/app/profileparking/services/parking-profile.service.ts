import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ProfileParking, ParkingType, ParkingStatus, PricingData, LocationData, FeaturesData } from '../model/profileparking.entity';
import { ParkingProfileDto, CreateParkingProfileRequest } from './types';
import { CreateBasicInfoDto } from './create-types';
import { environment } from '../../../environments/environment';

// Interfaz simple para los datos del JSON
interface ParkingProfileJson {
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
}

// Interfaces para datos relacionados del JSON
interface PricingJson {
  id: string;
  profileId: string;
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

@Injectable({
  providedIn: 'root'
})
export class ParkingProfileService {

  private readonly baseUrl = `${environment.apiBase}${environment.endpoints.parkingProfiles}`;
  private readonly pricingUrl = `${environment.apiBase}/pricing`;
  private readonly locationsUrl = `${environment.apiBase}/locations`;
  private readonly featuresUrl = `${environment.apiBase}/features`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de perfiles de parking
   */
  getProfiles(): Observable<ProfileParking[]> {
    return this.http.get<ParkingProfileJson[]>(this.baseUrl).pipe(
      map(profiles => profiles.map(profile => this.mapJsonToProfile(profile))),
      catchError(error => {
        console.error('Error loading profiles:', error);
        return of(this.getMockProfiles());
      })
    );
  }

  /**
   * Obtener perfil por ID con mejor tolerancia a errores
   */
  getProfileById(id: string): Observable<ProfileParking> {
    if (!id || id.trim() === '') {
      console.warn('Invalid profile ID provided');
      return of(this.getDefaultProfile());
    }

    return this.http.get<ParkingProfileJson>(`${this.baseUrl}/${id}`).pipe(
      map(profile => this.mapJsonToProfile(profile)),
      catchError(error => {
        console.error(`Error loading profile ${id}:`, error);

        // Si es un 404 (perfil no encontrado), intentamos encontrarlo por búsqueda
        if (error.status === 404) {
          console.warn(`Profile with ID ${id} not found. Searching in all profiles...`);
          return this.searchProfileById(id);
        }

        // Para otros errores, devolvemos el perfil por defecto
        return of(this.getDefaultProfile());
      })
    );
  }

  /**
   * Buscar perfil por ID en toda la lista (fallback para IDs no encontrados)
   */
  private searchProfileById(id: string): Observable<ProfileParking> {
    return this.http.get<ParkingProfileJson[]>(this.baseUrl).pipe(
      map(profiles => {
        // Buscar por ID exacto primero
        let foundProfile = profiles.find(p => p.id === id);

        // Si no se encuentra, buscar por ID numérico (convertir string a número)
        if (!foundProfile) {
          const numericId = parseInt(id, 10);
          if (!isNaN(numericId)) {
            foundProfile = profiles.find(p => parseInt(p.id, 10) === numericId);
          }
        }

        if (foundProfile) {
          console.log(`Found profile through search: ${foundProfile.name} (ID: ${foundProfile.id})`);
          return this.mapJsonToProfile(foundProfile);
        } else {
          console.warn(`Profile with ID ${id} not found in database. Available IDs: ${profiles.map(p => p.id).join(', ')}`);
          return {
            ...this.getDefaultProfile(),
            id: id,
            name: `Parking no encontrado (ID: ${id})`,
            description: `Este perfil de parking no existe en la base de datos. IDs disponibles: ${profiles.map(p => p.id).join(', ')}`
          };
        }
      }),
      catchError(error => {
        console.error('Error searching for profile:', error);
        return of(this.getDefaultProfile());
      })
    );
  }

  /**
   * Crear un nuevo perfil de parking
   */
  createProfile(profileData: CreateParkingProfileRequest): Observable<ProfileParking> {
    return this.http.post<ParkingProfileJson>(this.baseUrl, profileData).pipe(
      map(profile => this.mapJsonToProfile(profile)),
      catchError(error => {
        console.error('Error creating profile:', error);
        // Retornar un perfil mock con los datos proporcionados
        return of({
          id: `mock-${Date.now()}`,
          name: profileData.basicInfo.name,
          type: this.mapStringToParkingType(profileData.basicInfo.type),
          description: profileData.basicInfo.description,
          totalSpaces: profileData.basicInfo.totalSpaces,
          accessibleSpaces: profileData.basicInfo.accessibleSpaces,
          phone: profileData.basicInfo.phone,
          email: profileData.basicInfo.email,
          website: profileData.basicInfo.website,
          status: ParkingStatus.Activo,
          image: undefined
        } as ProfileParking);
      })
    );
  }

  /**
   * Actualizar información básica de un parking
   */
  updateBasicInfo(profileId: string, basicInfo: Partial<ProfileParking>): Observable<ProfileParking> {
    return this.http.patch<ParkingProfileJson>(`${this.baseUrl}/${profileId}`, basicInfo).pipe(
      map(profile => this.mapJsonToProfile(profile)),
      catchError(error => {
        console.error('Error updating basic info:', error);
        return of({
          ...this.getMockProfile(profileId),
          ...basicInfo
        } as ProfileParking);
      })
    );
  }

  /**
   * Obtener precios de un parking
   */
  getPricing(profileId: string): Observable<PricingData> {
    return this.http.get<PricingJson[]>(`${this.pricingUrl}?profileId=${profileId}`).pipe(
      map(pricing => {
        const data = pricing.find(p => p.profileId === profileId);
        return data ? this.mapJsonToPricing(data) : this.getDefaultPricing();
      }),
      catchError(() => {
        console.error('Error loading pricing');
        return of(this.getDefaultPricing());
      })
    );
  }

  /**
   * Actualizar precios de un parking
   */
  updatePricing(profileId: string, pricing: PricingData): Observable<PricingData> {
    return this.http.get<PricingJson[]>(`${this.pricingUrl}?profileId=${profileId}`).pipe(
      switchMap(existingPricing => {
        const existing = existingPricing.find(p => p.profileId === profileId);
        if (existing) {
          const updatedData = { ...existing, ...pricing };
          return this.http.put<PricingJson>(`${this.pricingUrl}/${existing.id}`, updatedData).pipe(
            map(result => this.mapJsonToPricing(result))
          );
        } else {
          const newData: Omit<PricingJson, 'id'> = {
            profileId,
            ...pricing
          };
          return this.http.post<PricingJson>(this.pricingUrl, newData).pipe(
            map(result => this.mapJsonToPricing(result))
          );
        }
      }),
      catchError(() => of(pricing))
    );
  }

  /**
   * Obtener ubicación de un parking
   */
  getLocation(profileId: string): Observable<LocationData> {
    return this.http.get<LocationJson[]>(`${this.locationsUrl}?profileId=${profileId}`).pipe(
      map(locations => {
        const data = locations.find(l => l.profileId === profileId);
        return data ? this.mapJsonToLocation(data) : this.getDefaultLocation();
      }),
      catchError(() => of(this.getDefaultLocation()))
    );
  }

  /**
   * Actualizar ubicación de un parking
   */
  updateLocation(profileId: string, location: LocationData): Observable<LocationData> {
    return this.http.get<LocationJson[]>(`${this.locationsUrl}?profileId=${profileId}`).pipe(
      switchMap(existingLocations => {
        const existing = existingLocations.find(l => l.profileId === profileId);
        if (existing) {
          const updatedData = { ...existing, ...location };
          return this.http.put<LocationJson>(`${this.locationsUrl}/${existing.id}`, updatedData).pipe(
            map(result => this.mapJsonToLocation(result))
          );
        } else {
          const newData: Omit<LocationJson, 'id'> = {
            profileId,
            ...location
          };
          return this.http.post<LocationJson>(this.locationsUrl, newData).pipe(
            map(result => this.mapJsonToLocation(result))
          );
        }
      }),
      catchError(() => of(location))
    );
  }

  /**
   * Obtener características de un parking
   */
  getFeatures(profileId: string): Observable<FeaturesData> {
    return this.http.get<FeaturesJson[]>(`${this.featuresUrl}?profileId=${profileId}`).pipe(
      map(features => {
        const data = features.find(f => f.profileId === profileId);
        return data ? this.mapJsonToFeatures(data) : this.getDefaultFeatures();
      }),
      catchError(() => of(this.getDefaultFeatures()))
    );
  }

  /**
   * Actualizar características de un parking
   */
  updateFeatures(profileId: string, features: FeaturesData): Observable<FeaturesData> {
    return this.http.get<FeaturesJson[]>(`${this.featuresUrl}?profileId=${profileId}`).pipe(
      switchMap(existingFeatures => {
        const existing = existingFeatures.find(f => f.profileId === profileId);
        if (existing) {
          const updatedData = { ...existing, ...features };
          return this.http.put<FeaturesJson>(`${this.featuresUrl}/${existing.id}`, updatedData).pipe(
            map(result => this.mapJsonToFeatures(result))
          );
        } else {
          const newData: Omit<FeaturesJson, 'id'> = {
            profileId,
            ...features
          };
          return this.http.post<FeaturesJson>(this.featuresUrl, newData).pipe(
            map(result => this.mapJsonToFeatures(result))
          );
        }
      }),
      catchError(() => of(features))
    );
  }

  /**
   * Subir imagen de un parking
   */
  uploadImage(profileId: string, file: File): Observable<string> {
    // En una implementación real, aquí se subiría el archivo al servidor
    // Por ahora es una implementación mock que simula la subida
    return new Observable<string>(observer => {
      setTimeout(() => {
        const mockImageUrl = `assets/parking-images/${profileId}-${Date.now()}.jpg`;
        console.log('Image uploaded successfully:', mockImageUrl);
        observer.next(mockImageUrl);
        observer.complete();
      }, 1500);
    }).pipe(
      catchError(() => of(`assets/parking-default.jpg`))
    );
  }

  private mapJsonToProfile(json: ParkingProfileJson): ProfileParking {
    return {
      id: json.id,
      name: json.name,
      type: this.mapStringToParkingType(json.type),
      description: json.description,
      totalSpaces: json.totalSpaces,
      accessibleSpaces: json.accessibleSpaces,
      phone: json.phone,
      email: json.email,
      website: json.website,
      status: this.mapStringToParkingStatus(json.status),
      image: undefined
    };
  }

  private mapStringToParkingType(type: string): ParkingType {
    switch (type) {
      case 'Comercial': return ParkingType.Comercial;
      case 'Público': return ParkingType.Publico;
      case 'Privado': return ParkingType.Privado;
      case 'Residencial': return ParkingType.Residencial;
      default: return ParkingType.Comercial;
    }
  }

  private mapStringToParkingStatus(status: string): ParkingStatus {
    switch (status) {
      case 'active':
      case 'Activo': return ParkingStatus.Activo;
      case 'maintenance':
      case 'Mantenimiento': return ParkingStatus.Mantenimiento;
      case 'inactive':
      case 'Inactivo': return ParkingStatus.Inactivo;
      default: return ParkingStatus.Activo;
    }
  }

  private mapJsonToPricing(json: PricingJson): PricingData {
    return {
      hourlyRate: json.hourlyRate,
      dailyRate: json.dailyRate,
      monthlyRate: json.monthlyRate,
      open24h: json.open24h,
      operatingDays: json.operatingDays,
      promotions: json.promotions
    };
  }

  private mapJsonToLocation(json: LocationJson): LocationData {
    return {
      addressLine: json.addressLine,
      city: json.city,
      postalCode: json.postalCode,
      state: json.state,
      country: json.country,
      latitude: json.latitude,
      longitude: json.longitude
    };
  }

  private mapJsonToFeatures(json: FeaturesJson): FeaturesData {
    return {
      security: json.security,
      amenities: json.amenities,
      services: json.services,
      payments: json.payments
    };
  }

  private getDefaultProfile(): ProfileParking {
    return {
      id: '',
      name: '',
      type: ParkingType.Comercial,
      description: '',
      totalSpaces: 0,
      accessibleSpaces: 0,
      phone: '',
      email: '',
      website: '',
      status: ParkingStatus.Activo,
      image: undefined
    };
  }

  private getDefaultPricing(): PricingData {
    return {
      hourlyRate: 0,
      dailyRate: 0,
      monthlyRate: 0,
      open24h: false,
      operatingDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      promotions: {
        earlyBird: false,
        weekend: false,
        longStay: false
      }
    };
  }

  private getDefaultLocation(): LocationData {
    return {
      addressLine: '',
      city: '',
      postalCode: '',
      state: '',
      country: 'España',
      latitude: 0,
      longitude: 0
    };
  }

  private getDefaultFeatures(): FeaturesData {
    return {
      security: {
        security24h: false,
        cameras: false,
        lighting: false,
        accessControl: false
      },
      amenities: {
        covered: false,
        elevator: false,
        bathrooms: false,
        carWash: false
      },
      services: {
        electricCharging: false,
        freeWifi: false,
        valetService: false,
        maintenance: false
      },
      payments: {
        cardPayment: false,
        mobilePayment: false,
        monthlyPasses: false,
        corporateRates: false
      }
    };
  }

  private getMockProfiles(): ProfileParking[] {
    return [
      {
        id: '1',
        name: 'Parking Centro Comercial',
        type: ParkingType.Comercial,
        status: ParkingStatus.Activo,
        description: 'Parking cubierto de 3 plantas en pleno centro comercial',
        totalSpaces: 150,
        accessibleSpaces: 12,
        phone: '+34 911 234 567',
        email: 'info@parkingcentro.com',
        website: 'https://parkingcentro.com',
        image: undefined
      },
      {
        id: '2',
        name: 'Parking Plaza Mayor',
        type: ParkingType.Publico,
        status: ParkingStatus.Activo,
        description: 'Parking público en el centro histórico de la ciudad',
        totalSpaces: 200,
        accessibleSpaces: 18,
        phone: '+34 915 678 901',
        email: 'contacto@plazamayor-parking.es',
        website: 'https://plazamayor-parking.es',
        image: undefined
      }
    ];
  }

  private getMockProfile(id: string): ProfileParking {
    const mockProfiles = this.getMockProfiles();
    const index = parseInt(id) - 1;
    return mockProfiles[index] || {
      id: id,
      name: `Parking ${id}`,
      type: ParkingType.Comercial,
      status: ParkingStatus.Activo,
      description: 'Parking moderno con todas las comodidades',
      totalSpaces: 150,
      accessibleSpaces: 12,
      phone: '+34 911 123 456',
      email: 'info@parking.com',
      website: 'https://parking.com',
      image: undefined
    };
  }
}
