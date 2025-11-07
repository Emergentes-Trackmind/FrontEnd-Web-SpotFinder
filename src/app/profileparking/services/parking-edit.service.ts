import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {
  CreateBasicInfoDto,
  CreateLocationDto,
  CreateFeaturesDto,
  CreatePricingDto,
  WizardState
} from './create-types';
import { ProfileParking, ParkingType } from '../model/profileparking.entity';
import { AuthService } from '../../iam/services/auth.service';
import { ParkingsFacade } from '../../iot/services/parkings.facade';
import { UpdateParkingDto } from '../../iot/domain/entities/parking.entity';

@Injectable({
  providedIn: 'root'
})
export class ParkingEditService {
  private parkingId: string | null = null;

  // Estado del wizard
  private wizardStateSubject = new BehaviorSubject<WizardState>({
    currentStep: 1,
    isValid: false,
    basicInfo: this.getDefaultBasicInfo(),
    location: this.getDefaultLocation(),
    features: this.getDefaultFeatures(),
    pricing: this.getDefaultPricing()
  });

  // Observables para cada paso
  private basicInfoSubject = new BehaviorSubject<Partial<CreateBasicInfoDto>>(this.getDefaultBasicInfo());
  private locationSubject = new BehaviorSubject<Partial<CreateLocationDto>>(this.getDefaultLocation());
  private featuresSubject = new BehaviorSubject<Partial<CreateFeaturesDto>>(this.getDefaultFeatures());
  private pricingSubject = new BehaviorSubject<Partial<CreatePricingDto>>(this.getDefaultPricing());

  // Observables públicos
  public wizardState$ = this.wizardStateSubject.asObservable();
  public basicInfo$ = this.basicInfoSubject.asObservable();
  public location$ = this.locationSubject.asObservable();
  public features$ = this.featuresSubject.asObservable();
  public pricing$ = this.pricingSubject.asObservable();

  constructor(
    private parkingsFacade: ParkingsFacade,
    private authService: AuthService
  ) {}

  // Cargar parking existente para edición
  loadParking(parkingId: string): Observable<void> {
    this.parkingId = parkingId;

    const currentUserId = this.authService.getUserIdFromToken();

    if (!currentUserId) {
      console.error('❌ No se pudo obtener el ID del usuario autenticado');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.parkingsFacade.getParkingById(parkingId).pipe(
      tap(parking => {
        // Verificar que el parking pertenece al usuario autenticado
        if (parking.ownerId !== currentUserId) {
          console.error('❌ El parking no pertenece al usuario autenticado', {
            parkingOwnerId: parking.ownerId,
            currentUserId: currentUserId
          });
          throw new Error('No tienes permiso para editar este parking');
        }

        console.log('✅ Verificación de propiedad exitosa:', {
          parkingId: parkingId,
          ownerId: parking.ownerId,
          currentUserId: currentUserId
        });

        // Cargar información básica
        const basicInfo: Partial<CreateBasicInfoDto> = {
          name: parking.name,
          type: parking.type as any,
          description: parking.description,
          totalSpaces: parking.totalSpaces,
          accessibleSpaces: parking.accessibleSpaces,
          phone: parking.phone,
          email: parking.email,
          website: parking.website || ''
        };
        this.basicInfoSubject.next(basicInfo);

        // Cargar ubicación
        if (parking.location) {
          const location: Partial<CreateLocationDto> = {
            addressLine: parking.location.addressLine,
            city: parking.location.city,
            postalCode: parking.location.postalCode,
            state: parking.location.state,
            country: parking.location.country,
            latitude: parking.location.latitude,
            longitude: parking.location.longitude
          };
          this.locationSubject.next(location);
        }

        // Cargar precios
        if (parking.pricing) {
          const pricing: Partial<CreatePricingDto> = {
            hourlyRate: parking.pricing.hourlyRate,
            dailyRate: parking.pricing.dailyRate,
            monthlyRate: parking.pricing.monthlyRate,
            currency: parking.pricing.currency,
            minimumStay: parking.pricing.minimumStay,
            open24h: parking.pricing.open24h,
            operatingHours: parking.pricing.operatingHours,
            operatingDays: parking.pricing.operatingDays,
            promotions: parking.pricing.promotions
          };
          this.pricingSubject.next(pricing);
        }

        // Cargar características
        if (parking.features) {
          const features: Partial<CreateFeaturesDto> = {
            security: parking.features.security,
            amenities: parking.features.amenities,
            services: parking.features.services,
            payments: parking.features.payments
          };
          this.featuresSubject.next(features);
        }

        this.updateWizardState({
          basicInfo: this.basicInfoSubject.value,
          location: this.locationSubject.value,
          features: this.featuresSubject.value,
          pricing: this.pricingSubject.value
        });
      }),
      map(() => void 0),
      catchError(error => {
        console.error('Error cargando parking:', error);
        return throwError(() => error);
      })
    );
  }

  // Getters para valores actuales
  get currentStep(): number {
    return this.wizardStateSubject.value.currentStep;
  }

  get isCurrentStepValid(): boolean {
    return this.isStepValid(this.currentStep);
  }

  // Navegación del wizard
  goToStep(step: number): void {
    if (step >= 1 && step <= 6) {
      this.updateWizardState({ currentStep: step });
    }
  }

  nextStep(): void {
    if (this.currentStep < 6 && this.isCurrentStepValid) {
      this.goToStep(this.currentStep + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  // Actualización de datos por paso
  updateBasicInfo(data: Partial<CreateBasicInfoDto>): void {
    const current = this.basicInfoSubject.value;
    const updated = { ...current, ...data };
    this.basicInfoSubject.next(updated);
    this.updateWizardState({ basicInfo: updated });
  }

  updateLocation(data: Partial<CreateLocationDto>): void {
    const current = this.locationSubject.value;
    const updated = { ...current, ...data };
    this.locationSubject.next(updated);
    this.updateWizardState({ location: updated });
  }

  updateFeatures(data: Partial<CreateFeaturesDto>): void {
    const current = this.featuresSubject.value;
    const updated = { ...current, ...data };
    this.featuresSubject.next(updated);
    this.updateWizardState({ features: updated });
  }

  updatePricing(data: Partial<CreatePricingDto>): void {
    const current = this.pricingSubject.value;
    const updated = { ...current, ...data };
    this.pricingSubject.next(updated);
    this.updateWizardState({ pricing: updated });
  }

  // Validaciones por paso
  private isStepValid(step: number): boolean {
    switch (step) {
      case 1: return this.isBasicInfoValid();
      case 2: return true; // Step 2 (Spots Visualizer) siempre es válido en edición
      case 3: return this.isLocationValid();
      case 4: return this.isFeaturesValid();
      case 5: return this.isPricingValid();
      case 6: return this.isAllDataValid();
      default: return false;
    }
  }

  private isBasicInfoValid(): boolean {
    const data = this.basicInfoSubject.value;
    return !!(
      data.name?.trim() &&
      data.type &&
      data.description?.trim() &&
      data.totalSpaces && data.totalSpaces > 0 &&
      data.accessibleSpaces !== undefined && data.accessibleSpaces >= 0 &&
      data.phone?.trim() &&
      data.email?.trim() && this.isValidEmail(data.email)
    );
  }

  private isLocationValid(): boolean {
    const data = this.locationSubject.value;
    return !!(
      data.addressLine?.trim() &&
      data.city?.trim() &&
      data.postalCode?.trim() &&
      data.country?.trim() &&
      data.latitude !== undefined &&
      data.longitude !== undefined
    );
  }

  private isFeaturesValid(): boolean {
    return true;
  }

  private isPricingValid(): boolean {
    const data = this.pricingSubject.value;
    return !!(
      data.currency &&
      data.minimumStay &&
      (data.open24h || (data.operatingHours?.openTime && data.operatingHours?.closeTime)) &&
      data.operatingDays
    );
  }

  private isAllDataValid(): boolean {
    return this.isBasicInfoValid() &&
           this.isLocationValid() &&
           this.isFeaturesValid() &&
           this.isPricingValid();
  }

  // Envío final - Actualización
  submitParking(): Observable<ProfileParking> {
    if (!this.isAllDataValid() || !this.parkingId) {
      throw new Error('Datos del formulario inválidos o ID de parking no encontrado');
    }

    const basicInfo = this.basicInfoSubject.value as CreateBasicInfoDto;
    const location = this.locationSubject.value as CreateLocationDto;
    const features = this.featuresSubject.value as CreateFeaturesDto;
    const pricing = this.pricingSubject.value as CreatePricingDto;

    const updateDto: UpdateParkingDto = {
      name: basicInfo.name,
      type: basicInfo.type as any,
      description: basicInfo.description,
      totalSpaces: basicInfo.totalSpaces,
      accessibleSpaces: basicInfo.accessibleSpaces,
      phone: basicInfo.phone,
      email: basicInfo.email,
      website: basicInfo.website || '',
      location: {
        addressLine: location.addressLine || '',
        city: location.city || '',
        postalCode: location.postalCode || '',
        state: location.state || '',
        country: location.country || 'España',
        latitude: location.latitude || 40.4168,
        longitude: location.longitude || -3.7038
      },
      pricing: {
        hourlyRate: pricing.hourlyRate || 0,
        dailyRate: pricing.dailyRate || 0,
        monthlyRate: pricing.monthlyRate || 0,
        currency: pricing.currency || 'EUR',
        minimumStay: pricing.minimumStay || 'SinLimite',
        open24h: pricing.open24h || false,
        operatingHours: pricing.operatingHours,
        operatingDays: pricing.operatingDays || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: false
        },
        promotions: pricing.promotions || {
          earlyBird: false,
          weekend: false,
          longStay: false
        }
      },
      features: {
        security: features.security || {
          security24h: false,
          cameras: false,
          lighting: false,
          accessControl: false
        },
        amenities: features.amenities || {
          covered: false,
          elevator: false,
          bathrooms: false,
          carWash: false
        },
        services: features.services || {
          electricCharging: false,
          freeWifi: false,
          valetService: false,
          maintenance: false
        },
        payments: features.payments || {
          cardPayment: true,
          mobilePayment: false,
          monthlyPasses: false,
          corporateRates: false
        }
      }
    };

    return this.parkingsFacade.updateParking(this.parkingId, updateDto).pipe(
      map(parking => ({
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
      })),
      catchError(error => {
        console.error('Error actualizando parking:', error);
        return throwError(() => error);
      })
    );
  }

  resetWizard(): void {
    this.parkingId = null;
    this.basicInfoSubject.next(this.getDefaultBasicInfo());
    this.locationSubject.next(this.getDefaultLocation());
    this.featuresSubject.next(this.getDefaultFeatures());
    this.pricingSubject.next(this.getDefaultPricing());
    this.updateWizardState({
      currentStep: 1,
      basicInfo: this.getDefaultBasicInfo(),
      location: this.getDefaultLocation(),
      features: this.getDefaultFeatures(),
      pricing: this.getDefaultPricing()
    });
  }

  private updateWizardState(partial: Partial<WizardState>): void {
    const current = this.wizardStateSubject.value;
    const updated = { ...current, ...partial, isValid: this.isAllDataValid() };
    this.wizardStateSubject.next(updated);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getDefaultBasicInfo(): Partial<CreateBasicInfoDto> {
    return {
      name: '',
      type: ParkingType.Comercial,
      description: '',
      totalSpaces: 0,
      accessibleSpaces: 0,
      phone: '',
      email: '',
      website: ''
    };
  }

  private getDefaultLocation(): Partial<CreateLocationDto> {
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

  private getDefaultFeatures(): Partial<CreateFeaturesDto> {
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

  private getDefaultPricing(): Partial<CreatePricingDto> {
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
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false
      },
      promotions: {
        earlyBird: false,
        weekend: false,
        longStay: false
      }
    };
  }
}
