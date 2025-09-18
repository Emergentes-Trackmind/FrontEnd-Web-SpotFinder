import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import {
  CreateBasicInfoDto,
  CreateLocationDto,
  CreateFeaturesDto,
  CreatePricingDto,
  CreateParkingRequest,
  WizardState
} from './create-types';
import { ProfileParking, ParkingType, ParkingStatus } from '../model/profileparking.entity';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ParkingCreateService {
  private readonly storageKey = 'parking-wizard-draft';

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

  constructor(private http: HttpClient) {
    this.loadDraft();
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
    if (step >= 1 && step <= 5) {
      this.updateWizardState({ currentStep: step });
    }
  }

  nextStep(): void {
    if (this.currentStep < 5 && this.isCurrentStepValid) {
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
    this.saveDraft();
  }

  updateLocation(data: Partial<CreateLocationDto>): void {
    const current = this.locationSubject.value;
    const updated = { ...current, ...data };
    this.locationSubject.next(updated);
    this.updateWizardState({ location: updated });
    this.saveDraft();
  }

  updateFeatures(data: Partial<CreateFeaturesDto>): void {
    const current = this.featuresSubject.value;
    const updated = { ...current, ...data };
    this.featuresSubject.next(updated);
    this.updateWizardState({ features: updated });
    this.saveDraft();
  }

  updatePricing(data: Partial<CreatePricingDto>): void {
    const current = this.pricingSubject.value;
    const updated = { ...current, ...data };
    this.pricingSubject.next(updated);
    this.updateWizardState({ pricing: updated });
    this.saveDraft();
  }

  // Validaciones por paso
  private isStepValid(step: number): boolean {
    switch (step) {
      case 1: return this.isBasicInfoValid();
      case 2: return this.isLocationValid();
      case 3: return this.isFeaturesValid();
      case 4: return this.isPricingValid();
      case 5: return this.isAllDataValid();
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
    // Las características son opcionales, siempre válido
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

  // Envío final
  submitParking(): Observable<ProfileParking> {
    if (!this.isAllDataValid()) {
      throw new Error('Datos del formulario inválidos');
    }

    const basicInfo = this.basicInfoSubject.value as CreateBasicInfoDto;
    const location = this.locationSubject.value as CreateLocationDto;
    const features = this.featuresSubject.value as CreateFeaturesDto;
    const pricing = this.pricingSubject.value as CreatePricingDto;

    const profilesApiUrl = `${environment.apiBase}${environment.endpoints.parkingProfiles}`;

    // Primero obtener todos los perfiles para determinar el próximo ID numérico
    return this.http.get<any[]>(profilesApiUrl).pipe(
      switchMap(existingProfiles => {
        // Encontrar el ID más alto y generar el siguiente
        const nextId = this.getNextNumericId(existingProfiles);

        // Crear el perfil principal con ID numérico
        const parkingProfileRequest = {
          id: nextId.toString(),
          name: basicInfo.name,
          type: basicInfo.type,
          description: basicInfo.description,
          totalSpaces: basicInfo.totalSpaces,
          accessibleSpaces: basicInfo.accessibleSpaces,
          phone: basicInfo.phone,
          email: basicInfo.email,
          website: basicInfo.website || '',
          status: 'Inactivo'  // Cambiar a Inactivo por defecto
        };

        return this.http.post<ProfileParking>(profilesApiUrl, parkingProfileRequest).pipe(
          switchMap(createdProfile => {
            // Una vez creado el perfil, crear los registros relacionados
            const profileId = createdProfile.id!;

            // Crear requests paralelos para todas las tablas relacionadas
            const locationRequest = this.createLocationRecord(profileId, location);
            const pricingRequest = this.createPricingRecord(profileId, pricing);
            const featuresRequest = this.createFeaturesRecord(profileId, features);

            // Ejecutar todas las creaciones en paralelo
            return forkJoin([
              locationRequest,
              pricingRequest,
              featuresRequest
            ]).pipe(
              map(() => createdProfile) // Retornar el perfil creado
            );
          })
        );
      })
    );
  }

  // Método para generar el próximo ID numérico consecutivo
  private getNextNumericId(existingProfiles: any[]): number {
    let maxId = 0;

    existingProfiles.forEach(profile => {
      const id = profile.id;
      // Intentar convertir el ID a número
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId) && numericId > maxId) {
        maxId = numericId;
      }
    });

    return maxId + 1;
  }

  // Gestión de borradores
  private saveDraft(): void {
    const snapshot = this.getSnapshot();
    localStorage.setItem(this.storageKey, JSON.stringify(snapshot));
  }

  private loadDraft(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const draft = JSON.parse(saved);
        this.basicInfoSubject.next(draft.basicInfo || this.getDefaultBasicInfo());
        this.locationSubject.next(draft.location || this.getDefaultLocation());
        this.featuresSubject.next(draft.features || this.getDefaultFeatures());
        this.pricingSubject.next(draft.pricing || this.getDefaultPricing());
      }
    } catch (error) {
      console.error('Error cargando borrador:', error);
    }
  }

  clearDraft(): void {
    localStorage.removeItem(this.storageKey);
    this.resetWizard();
  }

  resetWizard(): void {
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

  // Snapshot del estado actual
  getSnapshot(): WizardState {
    return {
      currentStep: this.currentStep,
      isValid: this.isAllDataValid(),
      basicInfo: this.basicInfoSubject.value,
      location: this.locationSubject.value,
      features: this.featuresSubject.value,
      pricing: this.pricingSubject.value
    };
  }

  // Helpers privados
  private updateWizardState(partial: Partial<WizardState>): void {
    const current = this.wizardStateSubject.value;
    const updated = { ...current, ...partial, isValid: this.isAllDataValid() };
    this.wizardStateSubject.next(updated);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Valores por defecto
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
      latitude: 40.4168, // Madrid
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

  // Métodos para crear registros relacionados
  private createLocationRecord(profileId: string, location: CreateLocationDto): Observable<any> {
    const locationData = {
      profileId: profileId,
      addressLine: location.addressLine || '',
      city: location.city || '',
      postalCode: location.postalCode || '',
      state: location.state || '',
      country: location.country || 'España',
      latitude: location.latitude || 40.4168,
      longitude: location.longitude || -3.7038
    };

    return this.http.post(`${environment.apiBase}${environment.endpoints.locations}`, locationData);
  }

  private createPricingRecord(profileId: string, pricing: CreatePricingDto): Observable<any> {
    const pricingData = {
      profileId: profileId,
      hourlyRate: pricing.hourlyRate || 0,
      dailyRate: pricing.dailyRate || 0,
      monthlyRate: pricing.monthlyRate || 0,
      open24h: pricing.open24h || false,
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
    };

    return this.http.post(`${environment.apiBase}${environment.endpoints.pricing}`, pricingData);
  }

  private createFeaturesRecord(profileId: string, features: CreateFeaturesDto): Observable<any> {
    const featuresData = {
      profileId: profileId,
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
    };

    return this.http.post(`${environment.apiBase}${environment.endpoints.features}`, featuresData);
  }
}
