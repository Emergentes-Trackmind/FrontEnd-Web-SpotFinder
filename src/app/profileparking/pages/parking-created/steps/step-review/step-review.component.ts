import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ParkingCreateService } from '../../../../services/parking-create.service';
import { ParkingStateService, SpotData } from '../../../../services/parking-state.service';
import { CreateBasicInfoDto, CreateLocationDto, CreateFeaturesDto, CreatePricingDto } from '../../../../services/create-types';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './step-review.component.html',
  styleUrls: ['./step-review.component.css']
})
export class StepReviewComponent implements OnInit, OnDestroy {
  basicInfo: Partial<CreateBasicInfoDto> = {};
  location: Partial<CreateLocationDto> = {};
  features: Partial<CreateFeaturesDto> = {};
  pricing: Partial<CreatePricingDto> = {};
  spots: SpotData[] = [];

  private destroy$ = new Subject<void>();
  private createService = inject(ParkingCreateService);
  private parkingStateService = inject(ParkingStateService);

  ngOnInit(): void {
    this.loadAllData();
    this.loadSpots();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllData(): void {
    // Cargar información básica
    this.createService.basicInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.basicInfo = data || {};
      });

    // Cargar ubicación
    this.createService.location$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.location = data || {};
      });

    // Cargar características
    this.createService.features$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.features = data || {};
      });

    // Cargar precios
    this.createService.pricing$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.pricing = data || {};
      });
  }

  // Getters para mostrar información formateada
  get formattedAddress(): string {
    if (!this.location.addressLine) return 'No especificado';

    const parts = [
      this.location.addressLine,
      this.location.city,
      this.location.postalCode,
      this.location.state,
      this.location.country
    ].filter(part => part && part.trim());

    return parts.join(', ');
  }

  get selectedFeatures(): string[] {
    const allFeatures: string[] = [];

    if (this.features.security) {
      if (this.features.security.security24h) allFeatures.push('Seguridad 24h');
      if (this.features.security.cameras) allFeatures.push('Cámaras de vigilancia');
      if (this.features.security.lighting) allFeatures.push('Iluminación LED');
      if (this.features.security.accessControl) allFeatures.push('Control de acceso');
    }

    if (this.features.amenities) {
      if (this.features.amenities.covered) allFeatures.push('Cubierto');
      if (this.features.amenities.elevator) allFeatures.push('Ascensor');
      if (this.features.amenities.bathrooms) allFeatures.push('Baños');
      if (this.features.amenities.carWash) allFeatures.push('Lavado de coches');
    }

    if (this.features.services) {
      if (this.features.services.electricCharging) allFeatures.push('Carga eléctrica');
      if (this.features.services.freeWifi) allFeatures.push('WiFi gratuito');
      if (this.features.services.valetService) allFeatures.push('Servicio de valet');
      if (this.features.services.maintenance) allFeatures.push('Mantenimiento');
    }

    if (this.features.payments) {
      if (this.features.payments.cardPayment) allFeatures.push('Pago con tarjeta');
      if (this.features.payments.mobilePayment) allFeatures.push('Pago móvil');
      if (this.features.payments.monthlyPasses) allFeatures.push('Abonos mensuales');
      if (this.features.payments.corporateRates) allFeatures.push('Tarifas corporativas');
    }

    return allFeatures;
  }

  get operatingSchedule(): string {
    if (!this.pricing.operatingDays) return 'No especificado';

    const selectedDays = Object.entries(this.pricing.operatingDays)
      .filter(([key, value]) => value === true)
      .map(([key]) => this.getDayName(key));

    if (selectedDays.length === 0) return 'No especificado';
    if (selectedDays.length === 7) return 'Todos los días';

    // Detectar patrones comunes
    const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const weekends = ['Sábado', 'Domingo'];

    const hasAllWeekdays = weekdays.every(day => selectedDays.includes(day));
    const hasAllWeekends = weekends.every(day => selectedDays.includes(day));

    if (hasAllWeekdays && !hasAllWeekends) {
      return 'Lunes a Viernes';
    } else if (hasAllWeekends && !hasAllWeekdays) {
      return 'Fines de semana';
    }

    return selectedDays.join(', ');
  }

  get operatingHours(): string {
    if (this.pricing.open24h) {
      return '24 horas';
    }

    if (this.pricing.operatingHours?.openTime && this.pricing.operatingHours?.closeTime) {
      return `${this.pricing.operatingHours.openTime} - ${this.pricing.operatingHours.closeTime}`;
    }

    return 'No especificado';
  }

  get selectedPromotions(): string[] {
    const promotions: string[] = [];

    if (this.pricing.promotions?.earlyBird) {
      promotions.push('Early Bird');
    }
    if (this.pricing.promotions?.weekend) {
      promotions.push('Fin de Semana');
    }
    if (this.pricing.promotions?.longStay) {
      promotions.push('Estancia Larga');
    }

    return promotions;
  }

  get currencySymbol(): string {
    switch (this.pricing.currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      default: return '€';
    }
  }

  get minimumStayLabel(): string {
    switch (this.pricing.minimumStay) {
      case 'SinLimite': return 'Sin límite';
      case '1h': return '1 hora mínimo';
      case '2h': return '2 horas mínimo';
      case '4h': return '4 horas mínimo';
      case '1d': return '1 día mínimo';
      default: return 'No especificado';
    }
  }

  private getDayName(key: string): string {
    const dayNames: { [key: string]: string } = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };

    return dayNames[key] || key;
  }

  // Métodos para validar completitud de secciones
  isBasicInfoComplete(): boolean {
    return !!(
      this.basicInfo.name &&
      this.basicInfo.type &&
      this.basicInfo.description &&
      this.basicInfo.totalSpaces &&
      this.basicInfo.phone &&
      this.basicInfo.email
    );
  }

  isLocationComplete(): boolean {
    return !!(
      this.location.addressLine &&
      this.location.city &&
      this.location.postalCode &&
      this.location.country &&
      this.location.latitude !== undefined &&
      this.location.longitude !== undefined
    );
  }

  isFeaturesComplete(): boolean {
    return this.selectedFeatures.length > 0;
  }

  isPricingComplete(): boolean {
    return !!(
      this.pricing.currency &&
      this.pricing.minimumStay &&
      this.pricing.operatingDays
    );
  }

  goToStep(step: number): void {
    this.createService.goToStep(step);
  }

  // Métodos para dispositivos IoT
  private loadSpots(): void {
    const savedSpots = this.parkingStateService.getSpots();
    this.spots = savedSpots || [];
  }

  getTotalSpots(): number {
    return this.spots.length;
  }

  getAssignedDevicesCount(): number {
    return this.spots.filter(spot => spot.deviceId).length;
  }

  getSpotsWithoutDevice(): number {
    return this.spots.filter(spot => !spot.deviceId).length;
  }

  getSpotsWithDevices(): SpotData[] {
    return this.spots.filter(spot => spot.deviceId);
  }

  hasIoTDevicesAssigned(): boolean {
    return this.getAssignedDevicesCount() > 0;
  }
}

