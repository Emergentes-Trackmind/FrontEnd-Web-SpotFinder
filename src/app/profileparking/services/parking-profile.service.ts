import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProfileParking, ParkingType, ParkingStatus, PricingData, LocationData, FeaturesData } from '../model/profileparking.entity';
import { CreateParkingProfileRequest } from './types';
import { AuthService } from '../../iam/services/auth.service';
import { ParkingsFacade } from '../../iot/services/parkings.facade';
import { Parking, CreateParkingDto, UpdateParkingDto } from '../../iot/domain/entities/parking.entity';

@Injectable({
  providedIn: 'root'
})
export class ParkingProfileService {

  constructor(
    private parkingsFacade: ParkingsFacade,
    private authService: AuthService
  ) {}

  /**
   * Obtener lista de perfiles de parking del usuario autenticado
   */
  getProfiles(): Observable<ProfileParking[]> {
    const userId = this.authService.getUserIdFromToken();

    if (!userId) {
      console.warn('No se pudo obtener el ID del usuario autenticado');
      return of([]);
    }

    return this.parkingsFacade.getParkings(userId).pipe(
      map(parkings => parkings.map(parking => this.mapToProfileParking(parking))),
      catchError(error => {
        console.error('Error loading profiles:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener perfil por ID
   */
  getProfileById(id: string): Observable<ProfileParking> {
    if (!id || id.trim() === '') {
      console.warn('Invalid profile ID provided');
      return of(this.getDefaultProfile());
    }

    return this.parkingsFacade.getParkingById(id).pipe(
      map(parking => this.mapToProfileParking(parking)),
      catchError(error => {
        console.error(`Error loading profile ${id}:`, error);
        return of(this.getDefaultProfile());
      })
    );
  }

  /**
   * Crear un nuevo perfil de parking
   */
  createProfile(profileData: CreateParkingProfileRequest): Observable<ProfileParking> {
    const createDto: CreateParkingDto = {
      name: profileData.basicInfo.name,
      type: this.mapStringToParkingType(profileData.basicInfo.type) as any,
      description: profileData.basicInfo.description,
      totalSpaces: profileData.basicInfo.totalSpaces,
      accessibleSpaces: profileData.basicInfo.accessibleSpaces,
      phone: profileData.basicInfo.phone,
      email: profileData.basicInfo.email,
      website: profileData.basicInfo.website || '',
      status: 'Activo' as any,
      location: profileData.location,
      pricing: profileData.pricing,
      features: profileData.features
    };

    return this.parkingsFacade.createParking(createDto).pipe(
      map(parking => this.mapToProfileParking(parking)),
      catchError(error => {
        console.error('Error creating profile:', error);
        throw error;
      })
    );
  }

  /**
   * Actualizar información básica de un parking
   */
  updateBasicInfo(profileId: string, basicInfo: Partial<ProfileParking>): Observable<ProfileParking> {
    const updateDto: UpdateParkingDto = {
      name: basicInfo.name,
      type: basicInfo.type as any,
      description: basicInfo.description,
      totalSpaces: basicInfo.totalSpaces,
      accessibleSpaces: basicInfo.accessibleSpaces,
      phone: basicInfo.phone,
      email: basicInfo.email,
      website: basicInfo.website,
      status: basicInfo.status as any
    };

    return this.parkingsFacade.updateParking(profileId, updateDto).pipe(
      map(parking => this.mapToProfileParking(parking)),
      catchError(error => {
        console.error('Error updating basic info:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener precios de un parking
   */
  getPricing(profileId: string): Observable<PricingData> {
    return this.parkingsFacade.getParkingById(profileId).pipe(
      map(parking => parking.pricing || this.getDefaultPricing()),
      catchError(() => of(this.getDefaultPricing()))
    );
  }

  /**
   * Actualizar precios de un parking
   */
  updatePricing(profileId: string, pricing: PricingData): Observable<PricingData> {
    const updateDto: UpdateParkingDto = {
      pricing: pricing
    };

    return this.parkingsFacade.updateParking(profileId, updateDto).pipe(
      map(parking => parking.pricing || pricing),
      catchError(() => of(pricing))
    );
  }

  /**
   * Obtener ubicación de un parking
   */
  getLocation(profileId: string): Observable<LocationData> {
    return this.parkingsFacade.getParkingById(profileId).pipe(
      map(parking => parking.location || this.getDefaultLocation()),
      catchError(() => of(this.getDefaultLocation()))
    );
  }

  /**
   * Actualizar ubicación de un parking
   */
  updateLocation(profileId: string, location: LocationData): Observable<LocationData> {
    const updateDto: UpdateParkingDto = {
      location: location
    };

    return this.parkingsFacade.updateParking(profileId, updateDto).pipe(
      map(parking => parking.location || location),
      catchError(() => of(location))
    );
  }

  /**
   * Obtener características de un parking
   */
  getFeatures(profileId: string): Observable<FeaturesData> {
    return this.parkingsFacade.getParkingById(profileId).pipe(
      map(parking => parking.features || this.getDefaultFeatures()),
      catchError(() => of(this.getDefaultFeatures()))
    );
  }

  /**
   * Actualizar características de un parking
   */
  updateFeatures(profileId: string, features: FeaturesData): Observable<FeaturesData> {
    const updateDto: UpdateParkingDto = {
      features: features
    };

    return this.parkingsFacade.updateParking(profileId, updateDto).pipe(
      map(parking => parking.features || features),
      catchError(() => of(features))
    );
  }

  /**
   * Subir imagen de un parking
   */
  uploadImage(profileId: string, _file: File): Observable<string> {
    // En una implementación real, aquí se subiría el archivo al servidor
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

  /**
   * Eliminar un perfil de parking
   */
  deleteProfile(profileId: string): Observable<void> {
    return this.parkingsFacade.deleteParking(profileId).pipe(
      catchError(error => {
        console.error('Error deleting profile:', error);
        return throwError(() => new Error('No se pudo eliminar el parking. Por favor, intenta de nuevo.'));
      })
    );
  }

  /**
   * Mapear de Parking (IoT) a ProfileParking (legacy)
   */
  private mapToProfileParking(parking: Parking): ProfileParking {
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
      currency: 'EUR',
      minimumStay: 'SinLimite',
      open24h: false,
      operatingHours: {
        openTime: '08:00',
        closeTime: '22:00'
      },
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
      latitude: 40.4168,
      longitude: -3.7038
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
}
