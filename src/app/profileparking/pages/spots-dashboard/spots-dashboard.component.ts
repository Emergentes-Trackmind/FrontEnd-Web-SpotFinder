import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { SpotsService } from '../../services/spots.service';
import { SpotData, SpotStatistics, SpotFilters, ManualSpotInput, SpotStatus } from '../../models/spots.models';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-spots-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDivider
  ],
  templateUrl: './spots-dashboard.component.html',
  styleUrls: ['./spots-dashboard.component.css']
})
export class SpotsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado del componente
  parkingId!: string;
  loading = false;
  creatingSpot = false;
  showCreateForm = false;

  // Observables
  spots$!: Observable<SpotData[]>;
  statistics$!: Observable<SpotStatistics>;
  filteredSpots$!: Observable<SpotData[]>;

  // Formularios
  createSpotForm!: FormGroup;
  filtersForm!: FormGroup;

  // Datos locales
  spots: SpotData[] = [];
  statistics: SpotStatistics = { total: 0, available: 0, occupied: 0, reserved: 0 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private spotsService: SpotsService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.parkingId = this.route.snapshot.paramMap.get('id')!;

    if (!this.parkingId) {
      this.router.navigate(['/parkings']);
      return;
    }

    this.setupObservables();
    this.loadSpots();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Formulario para crear spot manual
    this.createSpotForm = this.fb.group({
      columnLetter: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{1,3}$/)]],
      rowNumber: ['', [Validators.required, Validators.min(1), Validators.max(999)]]
    });

    // Formulario para filtros
    this.filtersForm = this.fb.group({
      status: [''],
      hasDevice: [''],
      column: [''],
      searchTerm: ['']
    });
  }

  private setupObservables(): void {
    this.spots$ = this.spotsService.spots$;
    this.statistics$ = this.spotsService.getSpotStatistics();

    // Aplicar filtros automáticamente
    this.filteredSpots$ = combineLatest([
      this.spots$,
      this.filtersForm.valueChanges.pipe(
        // startWith para emitir valor inicial
        takeUntil(this.destroy$)
      )
    ]).pipe(
      // switchMap para obtener spots filtrados
      takeUntil(this.destroy$)
    );

    // Suscribirse a spots para uso local
    this.spots$.pipe(takeUntil(this.destroy$)).subscribe(spots => {
      this.spots = spots;
    });

    // Suscribirse a estadísticas para uso local
    this.statistics$.pipe(takeUntil(this.destroy$)).subscribe(stats => {
      this.statistics = stats;
    });
  }

  private loadSpots(): void {
    this.loading = true;
    this.spotsService.loadSpotsForParking(this.parkingId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          console.log('✅ Spots cargados exitosamente');
        },
        error: (error: any) => {
          console.error('❌ Error cargando spots:', error);
          this.showError('Error cargando las plazas del parking');
        }
      });
  }

  // ====== MÉTODOS PARA CREACIÓN MANUAL ======

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createSpotForm.reset();
    }
  }

  createManualSpot(): void {
    if (this.createSpotForm.invalid) {
      this.markFormGroupTouched(this.createSpotForm);
      return;
    }

    const formValue = this.createSpotForm.value as ManualSpotInput;

    // Validación de duplicados en el frontend
    const label = `${formValue.columnLetter.toUpperCase()}${formValue.rowNumber}`;
    if (this.spotsService.labelExists(label)) {
      this.showError(`La plaza ${label} ya existe`);
      return;
    }

    this.creatingSpot = true;
    this.spotsService.createManualSpot(this.parkingId, formValue)
      .pipe(
        finalize(() => this.creatingSpot = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (spot: any) => {
          this.showSuccess(`Plaza ${spot.label} creada exitosamente`);
          this.toggleCreateForm();
        },
        error: (error: any) => {
          console.error('❌ Error creando spot:', error);
          this.showError('Error creando la plaza');
        }
      });
  }

  // ====== MÉTODOS PARA GESTIÓN DE SPOTS ======

  updateSpotStatus(spot: SpotData, status: SpotStatus): void {
    if (!spot.id) return;

    this.spotsService.updateSpotStatus(this.parkingId, spot.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess(`Plaza ${spot.label} actualizada`);
        },
        error: (error: any) => {
          console.error('❌ Error actualizando spot:', error);
          this.showError('Error actualizando la plaza');
        }
      });
  }

  deleteSpot(spot: SpotData): void {
    if (!spot.id) return;

    if (confirm(`¿Está seguro de eliminar la plaza ${spot.label}?`)) {
      this.spotsService.deleteSpot(this.parkingId, spot.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess(`Plaza ${spot.label} eliminada`);
          },
          error: (error: any) => {
            console.error('❌ Error eliminando spot:', error);
            this.showError('Error eliminando la plaza');
          }
        });
    }
  }

  // ====== MÉTODOS DE FILTRADO ======

  clearFilters(): void {
    this.filtersForm.reset();
  }

  getFilteredSpots(): SpotData[] {
    const filters = this.filtersForm.value;
    let filtered = [...this.spots];

    // Filtrar por estado
    if (filters.status && filters.status !== '') {
      filtered = filtered.filter(spot => spot.status === filters.status);
    }

    // Filtrar por dispositivo
    if (filters.hasDevice && filters.hasDevice !== '') {
      const hasDevice = filters.hasDevice === 'true' || filters.hasDevice === true;
      filtered = filtered.filter(spot =>
        hasDevice ? !!spot.deviceId : !spot.deviceId
      );
    }

    // Filtrar por búsqueda de texto
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(spot =>
        spot.label.toLowerCase().includes(searchTerm) ||
        (spot.deviceId && spot.deviceId.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  // ====== MÉTODOS DE UTILIDAD ======

  getStatusIcon(status: SpotStatus | string): string {
    switch (status) {
      case 'AVAILABLE': return 'check_circle';
      case 'OCCUPIED': return 'local_parking';
      case 'RESERVED': return 'event_seat';
      default: return 'help';
    }
  }

  getStatusColor(status: SpotStatus): string {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'OCCUPIED': return 'error';
      case 'RESERVED': return 'primary';
      default: return 'default';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Método para volver a la lista de parkings
  goBack(): void {
    this.router.navigate(['/parkings']);
  }

  // TrackBy function para optimizar el rendimiento del ngFor
  trackBySpotId(index: number, spot: SpotData): string {
    return spot.id || `${spot.label}-${index}`;
  }
}
