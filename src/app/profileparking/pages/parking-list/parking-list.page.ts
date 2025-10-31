import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil, startWith, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { ParkingsFacade } from '../../../iot/services/parkings.facade';
import { LimitsService } from '../../../billing/services/limits.service';
import { CreationLimitGuard } from '../../../billing/guards/creation-limit.guard';
import { ParkingCardComponent } from '../../components/parking-card/parking-card.component';
import { Parking } from '../../../iot/domain/entities/parking.entity';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';

export interface ParkingCardData {
  id: string;
  name: string;
  address: string;
  status: 'Activo' | 'Mantenimiento' | 'Inactivo';
  rating: number;
  reviewsCount: number;
  pricePerMonth: number;
  available: number;
  total: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    ParkingCardComponent
  ],
  templateUrl: './parking-list.page.html',
  styleUrls: ['./parking-list.page.css']
})
export class ParkingListPage implements OnInit, OnDestroy {

  searchControl = new FormControl('');
  parkings: ParkingCardData[] = [];
  filteredParkings: ParkingCardData[] = [];
  isLoading = true;
  hasError = false;

  // Modo selección múltiple
  isSelectionMode = false;
  selectedParkingIds = new Set<string>();

  private destroy$ = new Subject<void>();
  private longPressTimeout: any;
  private readonly LONG_PRESS_DURATION = 600; // ms

  // Inyección de dependencias usando inject()
  private parkingsFacade = inject(ParkingsFacade);
  private limitsService = inject(LimitsService);
  private limitGuard = inject(CreationLimitGuard);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isSelectionMode) {
      this.exitSelectionMode();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    // Solo si no estamos escribiendo en un input
    if (event.target instanceof HTMLInputElement) return;

    // Tecla S para toggle modo selección
    if (event.key === 's' || event.key === 'S') {
      event.preventDefault();
      this.toggleSelectionMode();
    }
  }

  ngOnInit() {
    this.loadParkings();
    this.setupSearch();

    // Cargar información de límites
    this.limitsService.load().subscribe({
      error: (error) => {
        console.error('Error cargando límites:', error);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearLongPressTimeout();
  }

  private loadParkings() {
    this.isLoading = true;
    this.hasError = false;

    this.parkingsFacade.getUserParkings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parkings: Parking[]) => {
          this.parkings = this.mapProfilesToCards(parkings);
          this.filteredParkings = [...this.parkings];
          this.isLoading = false;

          // Actualizar el conteo de parkings en el servicio de límites
          this.limitsService.updateParkingsCount(parkings.length);
        },
        error: (error: any) => {
          console.error('Error loading parkings:', error);
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterParkings(searchTerm || '');
      });
  }

  private filterParkings(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredParkings = [...this.parkings];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredParkings = this.parkings.filter(parking =>
      parking.name.toLowerCase().includes(term) ||
      parking.address.toLowerCase().includes(term)
    );
  }

  private mapProfilesToCards(parkings: Parking[]): ParkingCardData[] {
    return parkings.map((parking, index) => {
      const monthlyPrice = parking.pricing?.monthlyRate || 0;
      const status = parking.status || 'Activo';

      return {
        id: parking.id || `${index + 1}`,
        name: parking.name || `Parking ${index + 1}`,
        address: parking.location?.addressLine || parking.location?.city || 'Dirección no disponible',
        status: status as 'Activo' | 'Mantenimiento' | 'Inactivo',
        rating: 0,
        reviewsCount: 0,
        pricePerMonth: Math.round(monthlyPrice),
        available: 0,
        total: parking.totalSpaces || 0,
        imageUrl: undefined
      };
    });
  }

  onNewParking() {
    // Verificar límites antes de navegar
    if (this.limitGuard.canCreateParking()) {
      this.router.navigate(['/parkings/new']);
    }
  }

  /**
   * Verifica si se puede crear un nuevo parking
   */
  get canCreateParking(): boolean {
    return this.limitsService.canCreateParking();
  }

  /**
   * Obtiene el tooltip para el botón de nuevo parking
   */
  get newParkingTooltip(): string {
    if (this.canCreateParking) {
      return 'Crear un nuevo parking';
    }

    const limits = this.limitsService.limitsInfo();
    return `Has alcanzado el límite de ${limits.parkings.limit} parkings. Actualiza tu plan para crear más.`;
  }

  onRetry() {
    this.loadParkings();
  }

  trackByParkingId(index: number, parking: ParkingCardData): string {
    return parking.id;
  }

  // ============ MODO SELECCIÓN MÚLTIPLE ============

  onParkingPressStart(parkingId: string, event: MouseEvent | TouchEvent) {
    if (this.isSelectionMode) return;

    event.preventDefault();

    this.longPressTimeout = setTimeout(() => {
      this.enterSelectionMode(parkingId);
    }, this.LONG_PRESS_DURATION);
  }

  onParkingPressEnd() {
    this.clearLongPressTimeout();
  }

  onParkingClick(parkingId: string, event: Event) {
    if (this.isSelectionMode) {
      event.preventDefault();
      event.stopPropagation();
      this.toggleParkingSelection(parkingId);
    }
  }

  onParkingKeydown(parkingId: string, event: KeyboardEvent) {
    if (!this.isSelectionMode) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggleParkingSelection(parkingId);
    }
  }

  private enterSelectionMode(initialParkingId?: string) {
    this.isSelectionMode = true;

    if (initialParkingId) {
      this.selectedParkingIds.add(initialParkingId);
    }

    this.announceSelectionChange();
  }

  exitSelectionMode() {
    this.isSelectionMode = false;
    this.selectedParkingIds.clear();
  }

  private toggleSelectionMode() {
    if (this.isSelectionMode) {
      this.exitSelectionMode();
    } else {
      this.enterSelectionMode();
    }
  }

  toggleParkingSelection(parkingId: string) {
    if (this.selectedParkingIds.has(parkingId)) {
      this.selectedParkingIds.delete(parkingId);
    } else {
      this.selectedParkingIds.add(parkingId);
    }

    this.announceSelectionChange();
  }

  isParkingSelected(parkingId: string): boolean {
    return this.selectedParkingIds.has(parkingId);
  }

  get selectedCount(): number {
    return this.selectedParkingIds.size;
  }

  get canDelete(): boolean {
    return this.selectedCount > 0;
  }

  private announceSelectionChange() {
    const announcement = `${this.selectedCount} parking${this.selectedCount !== 1 ? 's' : ''} seleccionado${this.selectedCount !== 1 ? 's' : ''}`;

    const liveRegion = document.getElementById('selection-announcer');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  }

  private clearLongPressTimeout() {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }

  // ============ BORRADO MÚLTIPLE ============

  onDeleteSelected() {
    if (this.selectedCount === 0) return;

    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      data: {
        title: '¿Eliminar parkings seleccionados?',
        message: '¿Realmente deseas eliminar estos parkings?',
        confirmText: 'Aceptar',
        cancelText: 'Denegar',
        parkingCount: this.selectedCount
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteSelectedParkings();
      }
    });
  }

  private deleteSelectedParkings() {
    const idsToDelete = Array.from(this.selectedParkingIds);
    this.isLoading = true;

    this.parkingsFacade.deleteManyParkings(idsToDelete)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.parkings = this.parkings.filter(p => !this.selectedParkingIds.has(p.id));
          this.filteredParkings = this.filteredParkings.filter(p => !this.selectedParkingIds.has(p.id));

          this.exitSelectionMode();

          this.snackBar.open('Los parkings se borraron exitosamente.', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: any) => {
          console.error('Error deleting parkings:', error);
          this.snackBar.open('Error al eliminar los parkings. Por favor, intenta de nuevo.', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  // ============ BORRADO INDIVIDUAL ============

  onDeleteParking(parkingId: string): void {
    const parking = this.parkings.find(p => p.id === parkingId);
    if (!parking) return;

    const confirmMessage = `¿Estás seguro de que deseas eliminar "${parking.name}"?\n\nEsta acción no se puede deshacer.`;

    if (confirm(confirmMessage)) {
      this.deleteParking(parkingId);
    }
  }

  private deleteParking(parkingId: string): void {
    this.isLoading = true;

    this.parkingsFacade.deleteParking(parkingId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.parkings = this.parkings.filter(p => p.id !== parkingId);
          this.filteredParkings = this.filteredParkings.filter(p => p.id !== parkingId);

          this.snackBar.open('Parking eliminado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: any) => {
          console.error('Error deleting parking:', error);
          this.snackBar.open('Error al eliminar el parking. Por favor, intenta de nuevo.', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
}
