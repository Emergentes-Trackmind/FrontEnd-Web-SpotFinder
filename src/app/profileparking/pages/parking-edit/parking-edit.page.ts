import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ParkingEditService } from '../../services/parking-edit.service';
import { WizardState } from '../../services/create-types';
import { StepBasicEditComponent } from './steps/step-basic-edit/step-basic-edit.component';
import { StepLocationEditComponent } from './steps/step-location-edit/step-location-edit.component';
import { StepFeaturesEditComponent } from './steps/step-features-edit/step-features-edit.component';
import { StepPricingEditComponent } from './steps/step-pricing-edit/step-pricing-edit.component';
import { StepReviewEditComponent } from './steps/step-review-edit/step-review-edit.component';

@Component({
  selector: 'app-parking-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule,
    StepBasicEditComponent,
    StepLocationEditComponent,
    StepFeaturesEditComponent,
    StepPricingEditComponent,
    StepReviewEditComponent
  ],
  templateUrl: './parking-edit.page.html',
  styleUrls: ['./parking-edit.page.css']
})
export class ParkingEditPageComponent implements OnInit, OnDestroy {
  wizardState: WizardState | null = null;
  isSubmitting = false;
  isLoading = true;
  parkingId: string | null = null;

  private destroy$ = new Subject<void>();

  readonly steps = [
    { number: 1, title: 'Información Básica', subtitle: 'Nombre y descripción del parking' },
    { number: 2, title: 'Ubicación', subtitle: 'Dirección y localización en el mapa' },
    { number: 3, title: 'Características', subtitle: 'Servicios y comodidades disponibles' },
    { number: 4, title: 'Precios', subtitle: 'Tarifas y horarios de funcionamiento' },
    { number: 5, title: 'Revisión', subtitle: 'Confirma la información antes de guardar' }
  ];

  constructor(
    private editService: ParkingEditService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener ID del parking de la ruta
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.parkingId = params['id'];
        if (this.parkingId) {
          this.loadParkingData(this.parkingId);
        }
      });

    // Suscribirse al estado del wizard
    this.editService.wizardState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.wizardState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadParkingData(id: string): void {
    this.isLoading = true;
    this.editService.loadParking(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando parking:', error);
          this.isLoading = false;
          this.snackBar.open('Error al cargar los datos del parking', 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/parkings']);
        }
      });
  }

  get currentStep(): number {
    return this.wizardState?.currentStep || 1;
  }

  get canGoNext(): boolean {
    if (!this.wizardState) return false;
    return this.editService.isCurrentStepValid && this.currentStep < 5;
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
      this.editService.goToStep(stepNumber);
    }
  }

  onPreviousClick(): void {
    if (this.canGoPrevious) {
      this.editService.previousStep();
    }
  }

  onNextClick(): void {
    if (this.canGoNext) {
      this.editService.nextStep();
    }
  }

  async onSubmitClick(): Promise<void> {
    if (this.currentStep !== 5 || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      const result = await this.editService.submitParking().toPromise();

      this.snackBar.open('¡Parking actualizado exitosamente!', 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });

      // Redirigir al detalle del parking
      if (this.parkingId) {
        this.router.navigate(['/parkings', this.parkingId]);
      } else {
        this.router.navigate(['/parkings']);
      }

    } catch (error) {
      console.error('Error actualizando parking:', error);

      this.snackBar.open('Error al actualizar el parking. Inténtalo de nuevo.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los cambios no guardados.')) {
      this.editService.resetWizard();
      if (this.parkingId) {
        this.router.navigate(['/parkings', this.parkingId]);
      } else {
        this.router.navigate(['/parkings']);
      }
    }
  }
}

