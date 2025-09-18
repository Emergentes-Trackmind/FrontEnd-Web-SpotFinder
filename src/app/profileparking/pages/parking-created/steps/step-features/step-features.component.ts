import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

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
    MatButtonModule
  ],
  templateUrl: './step-features.component.html',
  styleUrls: ['./step-features.component.css']
})
export class StepFeaturesComponent implements OnInit, OnDestroy {
  featuresForm!: FormGroup;

  readonly featureCategories = {
    security: {
      title: 'Seguridad',
      icon: 'security',
      features: [
        { key: 'security24h', label: 'Seguridad 24 horas', description: 'Personal de seguridad las 24 horas' },
        { key: 'cameras', label: 'Cámaras de vigilancia', description: 'Sistema de videovigilancia' },
        { key: 'lighting', label: 'Iluminación LED', description: 'Iluminación completa del parking' },
        { key: 'accessControl', label: 'Control de acceso', description: 'Sistema de acceso controlado' }
      ]
    },
    amenities: {
      title: 'Comodidades',
      icon: 'apartment',
      features: [
        { key: 'covered', label: 'Cubierto', description: 'Parking techado' },
        { key: 'elevator', label: 'Ascensor', description: 'Acceso por ascensor' },
        { key: 'bathrooms', label: 'Baños', description: 'Servicios disponibles' },
        { key: 'carWash', label: 'Lavado de coches', description: 'Servicio de lavado' }
      ]
    },
    services: {
      title: 'Servicios',
      icon: 'build',
      features: [
        { key: 'electricCharging', label: 'Carga eléctrica', description: 'Puntos de carga para vehículos eléctricos' },
        { key: 'freeWifi', label: 'WiFi gratuito', description: 'Conexión a internet gratuita' },
        { key: 'valetService', label: 'Servicio de valet', description: 'Aparcamiento y recogida de vehículos' },
        { key: 'maintenance', label: 'Mantenimiento', description: 'Servicios de mantenimiento de vehículos' }
      ]
    },
    payments: {
      title: 'Pagos',
      icon: 'payment',
      features: [
        { key: 'cardPayment', label: 'Pago con tarjeta', description: 'Pago con tarjeta de crédito/débito' },
        { key: 'mobilePayment', label: 'Pago móvil', description: 'Pago a través de aplicaciones móviles' },
        { key: 'monthlyPasses', label: 'Abonos mensuales', description: 'Suscripciones mensuales disponibles' },
        { key: 'corporateRates', label: 'Tarifas corporativas', description: 'Descuentos para empresas' }
      ]
    }
  };

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private createService: ParkingCreateService
  ) {}

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
