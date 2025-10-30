import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ParkingEditService } from '../../../../services/parking-edit.service';
import { CreateBasicInfoDto, CreateLocationDto, CreateFeaturesDto, CreatePricingDto } from '../../../../services/create-types';

@Component({
  selector: 'app-step-review-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './step-review-edit.component.html',
  styleUrls: ['./step-review-edit.component.css']
})
export class StepReviewEditComponent implements OnInit, OnDestroy {
  basicInfo: Partial<CreateBasicInfoDto> = {};
  location: Partial<CreateLocationDto> = {};
  features: Partial<CreateFeaturesDto> = {};
  pricing: Partial<CreatePricingDto> = {};

  private destroy$ = new Subject<void>();

  constructor(private editService: ParkingEditService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllData(): void {
    this.editService.basicInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.basicInfo = data || {};
      });

    this.editService.location$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.location = data || {};
      });

    this.editService.features$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.features = data || {};
      });

    this.editService.pricing$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.pricing = data || {};
      });
  }

  goToStep(stepNumber: number): void {
    this.editService.goToStep(stepNumber);
  }

  isBasicInfoComplete(): boolean {
    return !!(
      this.basicInfo.name &&
      this.basicInfo.type &&
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
      this.location.latitude &&
      this.location.longitude
    );
  }

  isFeaturesComplete(): boolean {
    // Las características son opcionales, siempre está completo
    return true;
  }

  isPricingComplete(): boolean {
    return !!(
      (this.pricing.hourlyRate || this.pricing.dailyRate || this.pricing.monthlyRate) &&
      (this.pricing.open24h || this.pricing.operatingHours)
    );
  }

  get currencySymbol(): string {
    return '€';
  }

  get minimumStayLabel(): string {
    if (!this.pricing.minimumStay) {
      return 'No especificado';
    }

    // minimumStay es un string, retornarlo directamente
    return this.pricing.minimumStay;
  }

  get formattedAddress(): string {
    if (!this.location.addressLine) return 'No especificado';

    const parts = [
      this.location.addressLine,
      this.location.city,
      this.location.postalCode,
      this.location.state,
      this.location.country
    ].filter(part => part && part.trim());

    return parts.length > 0 ? parts.join(', ') : 'No especificado';
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
      .filter(([, value]) => value === true)
      .map(([key]) => this.getDayName(key));

    if (selectedDays.length === 0) return 'No especificado';
    if (selectedDays.length === 7) return 'Todos los días';

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

    if (this.pricing.operatingHours) {
      return `${this.pricing.operatingHours.openTime} - ${this.pricing.operatingHours.closeTime}`;
    }

    return 'No especificado';
  }

  get selectedPromotions(): string[] {
    const promotions: string[] = [];

    if (this.pricing.promotions) {
      if (this.pricing.promotions.earlyBird) promotions.push('Early Bird');
      if (this.pricing.promotions.weekend) promotions.push('Fin de semana');
      if (this.pricing.promotions.longStay) promotions.push('Estancia larga');
    }

    return promotions;
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
}

