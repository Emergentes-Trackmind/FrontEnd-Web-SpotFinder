import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

import { ParkingCreateService } from '../../../../services/parking-create.service';
import { CreatePricingDto } from '../../../../services/create-types';

@Component({
  selector: 'app-step-pricing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './step-pricing.component.html',
  styleUrls: ['./step-pricing.component.css']
})
export class StepPricingComponent implements OnInit, OnDestroy {
  pricingForm!: FormGroup;

  readonly currencies = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'Dólar ($)' },
    { value: 'GBP', label: 'Libra (£)' }
  ];

  readonly minimumStayOptions = [
    { value: 'SinLimite', label: 'Sin límite' },
    { value: '1h', label: '1 hora mínimo' },
    { value: '2h', label: '2 horas mínimo' },
    { value: '4h', label: '4 horas mínimo' },
    { value: '1d', label: '1 día mínimo' }
  ];

  readonly timeSlots = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  readonly weekDays = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private createService: ParkingCreateService,
    private translate: TranslateService
  ) {}

  // Helper para plantillas
  t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedData();
    this.setupFormSubscription();
    this.setupConditionalValidators();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.pricingForm = this.fb.group({
      // Tarifas básicas
      hourlyRate: [0, [Validators.required, Validators.min(0), Validators.max(999.99)]],
      dailyRate: [0, [Validators.required, Validators.min(0), Validators.max(9999.99)]],
      monthlyRate: [0, [Validators.required, Validators.min(0), Validators.max(99999.99)]],
      currency: ['EUR', [Validators.required]],
      minimumStay: ['SinLimite', [Validators.required]],

      // Horarios
      open24h: [false],
      operatingHours: this.fb.group({
        openTime: ['08:00', [Validators.required]],
        closeTime: ['22:00', [Validators.required]]
      }),

      // Días de funcionamiento
      operatingDays: this.fb.group({
        monday: [true],
        tuesday: [true],
        wednesday: [true],
        thursday: [true],
        friday: [true],
        saturday: [true],
        sunday: [false]
      }),

      // Promociones
      promotions: this.fb.group({
        earlyBird: [false],
        weekend: [false],
        longStay: [false]
      })
    });
  }

  private setupConditionalValidators(): void {
    // Cuando open24h cambia, actualizar validadores de horas
    this.pricingForm.get('open24h')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen24h => {
        const operatingHours = this.pricingForm.get('operatingHours');

        if (isOpen24h) {
          operatingHours?.get('openTime')?.clearValidators();
          operatingHours?.get('closeTime')?.clearValidators();
        } else {
          operatingHours?.get('openTime')?.setValidators([Validators.required]);
          operatingHours?.get('closeTime')?.setValidators([Validators.required]);
        }

        operatingHours?.get('openTime')?.updateValueAndValidity();
        operatingHours?.get('closeTime')?.updateValueAndValidity();
      });
  }

  private loadSavedData(): void {
    this.createService.pricing$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Partial<CreatePricingDto>) => {
        if (data) {
          this.pricingForm.patchValue(data, { emitEvent: false });
        }
      });
  }

  private setupFormSubscription(): void {
    this.pricingForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.createService.updatePricing(value);
      });
  }

  selectAllDays(): void {
    const operatingDays = this.pricingForm.get('operatingDays');
    if (operatingDays) {
      const allDaysSelected = {};
      this.weekDays.forEach(day => {
        (allDaysSelected as any)[day.key] = true;
      });
      operatingDays.patchValue(allDaysSelected);
    }
  }

  selectWeekdays(): void {
    const operatingDays = this.pricingForm.get('operatingDays');
    if (operatingDays) {
      operatingDays.patchValue({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      });
    }
  }

  selectWeekends(): void {
    const operatingDays = this.pricingForm.get('operatingDays');
    if (operatingDays) {
      operatingDays.patchValue({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: true,
        sunday: true
      });
    }
  }

  getSelectedDaysCount(): number {
    const operatingDays = this.pricingForm.get('operatingDays')?.value;
    if (!operatingDays) return 0;

    return Object.values(operatingDays).filter(value => value === true).length;
  }

  getSelectedPromotionsCount(): number {
    const promotions = this.pricingForm.get('promotions')?.value;
    if (!promotions) return 0;

    return Object.values(promotions).filter(value => value === true).length;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.pricingForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}`;

    return 'Campo inválido';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pricingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  get isOpen24h(): boolean {
    return this.pricingForm.get('open24h')?.value || false;
  }

  get selectedCurrency(): string {
    const currencyCode = this.pricingForm.get('currency')?.value || 'EUR';
    const currency = this.currencies.find(c => c.value === currencyCode);
    return currency ? currency.label.split('(')[1].replace(')', '') : '€';
  }
}
