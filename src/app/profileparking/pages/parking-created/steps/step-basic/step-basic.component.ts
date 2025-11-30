import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ParkingCreateService } from '../../../../services/parking-create.service';
import { ParkingStateService } from '../../../../services/parking-state.service';
import { ParkingType } from '../../../../model/profileparking.entity';

@Component({
  selector: 'app-step-basic',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './step-basic.component.html',
  styleUrls: ['./step-basic.component.css']
})
export class StepBasicComponent implements OnInit, OnDestroy {
  basicForm!: FormGroup;

  readonly parkingTypes = [
    { value: ParkingType.Comercial, labelKey: 'PARKING_TYPES.COMERCIAL' },
    { value: ParkingType.Publico, labelKey: 'PARKING_TYPES.PUBLICO' },
    { value: ParkingType.Privado, labelKey: 'PARKING_TYPES.PRIVADO' },
    { value: ParkingType.Residencial, labelKey: 'PARKING_TYPES.RESIDENCIAL' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private createService: ParkingCreateService,
    private parkingStateService: ParkingStateService,
    private translate: TranslateService
  ) {}

  // Helper para traducciones en plantilla
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
    this.basicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      type: [ParkingType.Comercial, [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s()\-]{9,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.pattern(/^https?:\/\/[^\s$.?#].[^\s]*$/)]]
    });
  }

  private loadSavedData(): void {
    this.createService.basicInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.basicForm.patchValue(data, { emitEvent: false });
        }
      });
  }

  private setupFormSubscription(): void {
    this.basicForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value) {
          this.createService.updateBasicInfo(value as any);
          // También actualizar el ParkingStateService
          this.parkingStateService.setBasicInfo(value as any);
        }
      });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.basicForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'name':
        if (errors['required']) return 'El nombre es obligatorio';
        if (errors['minlength']) return 'El nombre debe tener al menos 3 caracteres';
        if (errors['maxlength']) return 'El nombre no puede exceder 100 caracteres';
        break;



      case 'description':
        if (errors['required']) return 'La descripción es obligatoria';
        if (errors['minlength']) return 'La descripción debe tener al menos 10 caracteres';
        if (errors['maxlength']) return 'La descripción no puede exceder 500 caracteres';
        break;

      case 'phone':
        if (errors['required']) return 'El teléfono es obligatorio';
        if (errors['pattern']) return 'Formato de teléfono inválido';
        break;

      case 'email':
        if (errors['required']) return 'El email es obligatorio';
        if (errors['email']) return 'Formato de email inválido';
        break;

      case 'website':
        if (errors['pattern']) return 'Debe ser una URL válida (http:// o https://)';
        break;
    }

    return 'Campo inválido';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.basicForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }


  }

