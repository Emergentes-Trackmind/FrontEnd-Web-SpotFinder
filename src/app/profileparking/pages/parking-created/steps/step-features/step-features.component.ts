import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ParkingCreateService } from '../../../../services/parking-create.service';
import { CreateFeaturesDto } from '../../../../services/create-types';

@Component({
  selector: 'app-step-features',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './step-features.component.html',
  styleUrls: ['./step-features.component.css']
})
export class StepFeaturesComponent implements OnInit, OnDestroy {
  featuresForm!: FormGroup;

  get featureCategories() {
    return {
      security: {
        title: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.TITLE'),
        icon: 'security',
        features: [
          {
            key: 'security24h',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.FEATURES.SECURITY_24H.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.FEATURES.SECURITY_24H.DESCRIPTION')
          },
          {
            key: 'cameras',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.FEATURES.CAMERAS.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.FEATURES.CAMERAS.DESCRIPTION')
          },
          {
            key: 'lighting',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.FEATURES.LIGHTING.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.FEATURES.LIGHTING.DESCRIPTION')
          },
          {
            key: 'accessControl',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.FEATURES.ACCESS_CONTROL.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SECURITY.FEATURES.ACCESS_CONTROL.DESCRIPTION')
          }
        ]
      },
      amenities: {
        title: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.TITLE'),
        icon: 'apartment',
        features: [
          {
            key: 'covered',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.FEATURES.COVERED.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.FEATURES.COVERED.DESCRIPTION')
          },
          {
            key: 'elevator',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.FEATURES.ELEVATOR.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.FEATURES.ELEVATOR.DESCRIPTION')
          },
          {
            key: 'bathrooms',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.FEATURES.BATHROOMS.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.FEATURES.BATHROOMS.DESCRIPTION')
          },
          {
            key: 'carWash',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.FEATURES.CAR_WASH.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.AMENITIES.FEATURES.CAR_WASH.DESCRIPTION')
          }
        ]
      },
      services: {
        title: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.TITLE'),
        icon: 'build',
        features: [
          {
            key: 'electricCharging',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.FEATURES.ELECTRIC_CHARGING.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.FEATURES.ELECTRIC_CHARGING.DESCRIPTION')
          },
          {
            key: 'freeWifi',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.FEATURES.FREE_WIFI.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.FEATURES.FREE_WIFI.DESCRIPTION')
          },
          {
            key: 'valetService',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.FEATURES.VALET_SERVICE.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.FEATURES.VALET_SERVICE.DESCRIPTION')
          },
          {
            key: 'maintenance',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.FEATURES.MAINTENANCE.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.SERVICES.FEATURES.MAINTENANCE.DESCRIPTION')
          }
        ]
      },
      payments: {
        title: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.TITLE'),
        icon: 'payment',
        features: [
          {
            key: 'cardPayment',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.FEATURES.CARD_PAYMENT.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.FEATURES.CARD_PAYMENT.DESCRIPTION')
          },
          {
            key: 'mobilePayment',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.FEATURES.MOBILE_PAYMENT.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.FEATURES.MOBILE_PAYMENT.DESCRIPTION')
          },
          {
            key: 'monthlyPasses',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.FEATURES.MONTHLY_PASSES.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.FEATURES.MONTHLY_PASSES.DESCRIPTION')
          },
          {
            key: 'corporateRates',
            label: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.FEATURES.CORPORATE_RATES.LABEL'),
            description: this.translate.instant('PARKING_STEPS.FEATURES.CATEGORIES.PAYMENTS.FEATURES.CORPORATE_RATES.DESCRIPTION')
          }
        ]
      }
    };
  }

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private createService: ParkingCreateService,
    private translate: TranslateService
  ) {}

  // Helper para traducir en plantillas (evita uso del pipe)
  t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedData();
    this.setupFormSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.featuresForm = this.fb.group({
      security: this.fb.group({
        security24h: [false],
        cameras: [false],
        lighting: [false],
        accessControl: [false]
      }),
      amenities: this.fb.group({
        covered: [false],
        elevator: [false],
        bathrooms: [false],
        carWash: [false]
      }),
      services: this.fb.group({
        electricCharging: [false],
        freeWifi: [false],
        valetService: [false],
        maintenance: [false]
      }),
      payments: this.fb.group({
        cardPayment: [false],
        mobilePayment: [false],
        monthlyPasses: [false],
        corporateRates: [false]
      })
    });
  }

  private loadSavedData(): void {
    this.createService.features$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.featuresForm.patchValue(data, { emitEvent: false });
        }
      });
  }

  private setupFormSubscription(): void {
    this.featuresForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.createService.updateFeatures(value);
      });
  }

  getSelectedFeaturesCount(category: string): number {
    const categoryGroup = this.featuresForm.get(category);
    if (!categoryGroup) return 0;

    const values = categoryGroup.value;
    return Object.values(values).filter(value => value === true).length;
  }

  getTotalSelectedFeatures(): number {
    return Object.keys(this.featureCategories).reduce((total, category) => {
      return total + this.getSelectedFeaturesCount(category);
    }, 0);
  }

  selectAllInCategory(category: string): void {
    const categoryGroup = this.featuresForm.get(category);
    if (!categoryGroup) return;

    const features = this.featureCategories[category as keyof typeof this.featureCategories].features;
    const updates: any = {};

    features.forEach(feature => {
      updates[feature.key] = true;
    });

    categoryGroup.patchValue(updates);
  }

  clearAllInCategory(category: string): void {
    const categoryGroup = this.featuresForm.get(category);
    if (!categoryGroup) return;

    const features = this.featureCategories[category as keyof typeof this.featureCategories].features;
    const updates: any = {};

    features.forEach(feature => {
      updates[feature.key] = false;
    });

    categoryGroup.patchValue(updates);
  }
}
