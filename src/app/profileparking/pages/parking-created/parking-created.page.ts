import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ParkingCreateService } from '../../services/parking-create.service';
import { CreationLimitGuard } from '../../../billing/guards/creation-limit.guard';
import { WizardState } from '../../services/create-types';
import { StepBasicComponent } from './steps/step-basic/step-basic.component';
import { StepLocationComponent } from './steps/step-location/step-location.component';
import { StepFeaturesComponent } from './steps/step-features/step-features.component';
import { StepPricingComponent } from './steps/step-pricing/step-pricing.component';
import { StepReviewComponent } from './steps/step-review/step-review.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-parking-created',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule,
    StepBasicComponent,
    StepLocationComponent,
    StepFeaturesComponent,
    StepPricingComponent,
    StepReviewComponent,
    TranslateModule
  ],
  templateUrl: './parking-created.page.html',
  styleUrls: ['./parking-created.page.css']
})
export class ParkingCreatedPageComponent implements OnInit, OnDestroy {
  wizardState: WizardState | null = null;
  isSubmitting = false;

  private destroy$ = new Subject<void>();

  readonly steps = [
    { number: 1, title: 'Información Básica', subtitle: 'Nombre y descripción del parking' },
    { number: 2, title: 'Ubicación', subtitle: 'Dirección y localización en el mapa' },
    { number: 3, title: 'Características', subtitle: 'Servicios y comodidades disponibles' },
    { number: 4, title: 'Precios', subtitle: 'Tarifas y horarios de funcionamiento' },
    { number: 5, title: 'Revisión', subtitle: 'Confirma la información antes de registrar' }
  ];

  // Inyección de dependencias usando inject()
  private createService = inject(ParkingCreateService);
  private limitGuard = inject(CreationLimitGuard);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    // Verificar límites al iniciar
    if (!this.limitGuard.canCreateParking()) {
      // El guard muestra el diálogo automáticamente
      this.router.navigate(['/parkings']);
      return;
    }

    this.createService.wizardState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.wizardState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentStep(): number {
    return this.wizardState?.currentStep || 1;
  }

  get canGoNext(): boolean {
    if (!this.wizardState) return false;
    return this.createService.isCurrentStepValid && this.currentStep < 5;
  }

  get canGoPrevious(): boolean {
    return this.currentStep > 1;
  }

  get progressPercentage(): number {
    return (this.currentStep / 5) * 100;
  }

  get currentStepData() {
    return this.steps.find(step => step.number === this.currentStep);
  }

  onStepClicked(stepNumber: number): void {
    // Solo permitir navegar a pasos anteriores o al siguiente si es válido
    if (stepNumber < this.currentStep ||
        (stepNumber === this.currentStep + 1 && this.canGoNext)) {
      this.createService.goToStep(stepNumber);
    }
  }

  onPreviousClick(): void {
    if (this.canGoPrevious) {
      this.createService.previousStep();
    }
  }

  onNextClick(): void {
    if (this.canGoNext) {
      this.createService.nextStep();
    }
  }

  async onSubmitClick(): Promise<void> {
    if (this.currentStep !== 5 || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      const result = await this.createService.submitParking().toPromise();

      this.snackBar.open('¡Parking registrado exitosamente!', 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });

      // Limpiar borrador y redirigir
      this.createService.clearDraft();

      if (result?.id) {
        this.router.navigate(['/parkings', result.id]);
      } else {
        this.router.navigate(['/parkings']);
      }

    } catch (error) {
      console.error('Error registrando parking:', error);

      this.snackBar.open('Error al registrar el parking. Inténtalo de nuevo.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los datos no guardados.')) {
      this.createService.clearDraft();
      this.router.navigate(['/parkings']);
    }
  }
}
