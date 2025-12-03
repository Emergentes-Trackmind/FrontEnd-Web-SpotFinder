import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CreateBasicInfoDto,
  CreateLocationDto,
  CreateFeaturesDto,
  CreatePricingDto,
  WizardState
} from './create-types';
import { ParkingType } from '../model/profileparking.entity';
import { ParkingsFacade } from '../../iot/services/parkings.facade';
import { CreateParkingDto, Parking } from '../../iot/domain/entities/parking.entity';
import { IotService } from '../../iot/services/iot.service';
import { ParkingStateService } from './parking-state.service';
import { SpotsService } from './spots-new.service';

@Injectable({
  providedIn: 'root'
})
export class ParkingCreateService {
  private readonly storageKey = 'parking-wizard-draft';

  private wizardStateSubject = new BehaviorSubject<WizardState>({
    currentStep: 1,
    isValid: false,
    basicInfo: this.getDefaultBasicInfo(),
    location: this.getDefaultLocation(),
    features: this.getDefaultFeatures(),
    pricing: this.getDefaultPricing()
  });

  private basicInfoSubject = new BehaviorSubject<Partial<CreateBasicInfoDto>>(this.getDefaultBasicInfo());
  private locationSubject = new BehaviorSubject<Partial<CreateLocationDto>>(this.getDefaultLocation());
  private featuresSubject = new BehaviorSubject<Partial<CreateFeaturesDto>>(this.getDefaultFeatures());
  private pricingSubject = new BehaviorSubject<Partial<CreatePricingDto>>(this.getDefaultPricing());

  public wizardState$ = this.wizardStateSubject.asObservable();
  public basicInfo$ = this.basicInfoSubject.asObservable();
  public location$ = this.locationSubject.asObservable();
  public features$ = this.featuresSubject.asObservable();
  public pricing$ = this.pricingSubject.asObservable();

  constructor(
    private parkingsFacade: ParkingsFacade,
    private iotService: IotService,
    private parkingStateService: ParkingStateService,
    private spotsService: SpotsService
  ) {
    this.loadDraft();
  }

  get currentStep(): number {
    return this.wizardStateSubject.value.currentStep;
  }

  get isCurrentStepValid(): boolean {
    return this.isStepValid(this.currentStep);
  }

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

  submitParking(): Observable<Parking> {
    if (!this.isAllDataValid()) {
      throw new Error('Datos del formulario inválidos');
    }

    const basicInfo = this.basicInfoSubject.value as CreateBasicInfoDto;
    const location = this.locationSubject.value as CreateLocationDto;
    const features = this.featuresSubject.value as CreateFeaturesDto;
    const pricing = this.pricingSubject.value as CreatePricingDto;

    const createDto: CreateParkingDto = {
      name: basicInfo.name,
      type: basicInfo.type as any,
      description: basicInfo.description,
      totalSpaces: basicInfo.totalSpaces || 0, // Valor por defecto
      accessibleSpaces: basicInfo.accessibleSpaces || 0, // Valor por defecto
      phone: basicInfo.phone,
      email: basicInfo.email,
      website: basicInfo.website || '',
      status: 'Activo' as any,
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

    return this.parkingsFacade.createParking(createDto).pipe(
      tap((createdParking: Parking) => {
        console.log('✅ Parking creado exitosamente:', createdParking.id);

        // 🚀 NUEVA FUNCIONALIDAD: Crear spots automáticamente si hay pendientes
        this.handlePendingSpotsCreation(createdParking.id);

        // Después de crear el parking, actualizar los dispositivos IoT con el ID real
        this.updateIotDevicesWithRealParkingId(createdParking.id);
      })
    );
  }

  /**
   * Actualiza los dispositivos IoT con el ID real del parking después de crearlo
   */
  private updateIotDevicesWithRealParkingId(realParkingId: string): void {
    // Obtener la información de los spots con dispositivos asignados
    const spotsData = this.parkingStateService.getSpots();
    const assignedDevices = spotsData?.filter((spot: any) => spot.deviceId) || [];

    if (assignedDevices.length === 0) {
      console.log('🔍 No hay dispositivos IoT asignados, saltando actualización');
      return;
    }

    // Obtener userId del token
    const token = localStorage.getItem('token');
    let userId = '1761826163261';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.sub || userId;
      } catch (e) {
        console.warn('No se pudo decodificar el token, usando userId por defecto');
      }
    }

    console.log(`🔄 Actualizando ${assignedDevices.length} dispositivos IoT con parking ID real: ${realParkingId}`);

    // Primero obtener los dispositivos actuales desde edge API para mapear ID -> serialNumber
    this.iotService.getUserDevices(userId).subscribe({
      next: (devices) => {
        // Validar que devices sea un array
        const devicesArray = Array.isArray(devices) ? devices : [];
        console.log(`✅ [ParkingCreate] Dispositivos validados: ${devicesArray.length} dispositivos`);

        // Crear un mapa de deviceId -> serialNumber
        const deviceMap = new Map();
        devicesArray.forEach(device => {
          deviceMap.set(device.id, device.serialNumber);
        });

        // Actualizar cada dispositivo asignado con el ID real del parking
        assignedDevices.forEach((spot: any) => {
          if (spot.deviceId) {
            const serialNumber = deviceMap.get(spot.deviceId);
            if (serialNumber) {
              this.iotService.updateDeviceAssignment(
                userId,
                serialNumber, // Usar el serialNumber correcto
                realParkingId,
                spot.spotNumber.toString()
              ).subscribe({
                next: () => {
                  console.log(`✅ Dispositivo ${serialNumber} actualizado con parking real ${realParkingId}`);
                },
                error: (error: any) => {
                  console.error(`❌ Error actualizando dispositivo ${serialNumber}:`, error);
                }
              });
            } else {
              console.warn(`⚠️ No se encontró serialNumber para deviceId ${spot.deviceId}`);
            }
          }
        });
      },
      error: (error: any) => {
        console.error(`❌ Error obteniendo dispositivos para actualización:`, error);
      }
    });
  }

  /**
   * 🚀 NUEVA FUNCIONALIDAD: Maneja la creación de spots pendientes
   * después de que se crea el parking exitosamente
   */
  private handlePendingSpotsCreation(realParkingId: string): void {
    const pendingSpots = this.parkingStateService.getPendingSpotsCreation();

    if (!pendingSpots || !pendingSpots.confirmed) {
      console.log('🔍 No hay spots pendientes para crear');
      return;
    }

    console.log(`🚀 Creando ${pendingSpots.totalSpots} spots automáticamente para parking ${realParkingId}`);

    // Usar los spots data ya generados
    const spotsToCreate = pendingSpots.spotsData;

    this.spotsService.createBulkSpots(realParkingId, spotsToCreate).subscribe({
      next: (createdSpots) => {
        console.log(`✅ ${createdSpots.length} spots creados exitosamente:`, createdSpots);

        // Limpiar los spots pendientes después de crearlos
        this.parkingStateService.clearPendingSpotsCreation();

        // Cargar los spots creados en el servicio para visualización
        this.spotsService.loadSpotsForParking(realParkingId).subscribe();
      },
      error: (error) => {
        console.error('❌ Error creando spots automáticamente:', error);

        // Mostrar mensaje de error pero no limpiar los pendientes por si el usuario quiere reintentar
        console.warn('⚠️ Los spots quedaron pendientes de creación manual');
      }
    });
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

  private updateWizardState(partial: Partial<WizardState>): void {
    const current = this.wizardStateSubject.value;
    const updated = { ...current, ...partial, isValid: this.isAllDataValid() };
    this.wizardStateSubject.next(updated);
  }

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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getDefaultBasicInfo(): Partial<CreateBasicInfoDto> {
    return {
      name: '',
      type: ParkingType.Comercial,
      description: '',
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
