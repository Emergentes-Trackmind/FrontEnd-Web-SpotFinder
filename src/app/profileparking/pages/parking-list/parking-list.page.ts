import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil, startWith, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { ParkingsFacade } from '../../../iot/services/parkings.facade';
import { ParkingCardComponent } from '../../components/parking-card/parking-card.component';
import { Parking } from '../../../iot/domain/entities/parking.entity';

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

  private destroy$ = new Subject<void>();

  constructor(
    private parkingsFacade: ParkingsFacade,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadParkings();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

      // Asegurar que status tenga un valor por defecto válido
      const status = parking.status || 'Activo';

      return {
        id: parking.id || `${index + 1}`,
        name: parking.name || `Parking ${index + 1}`,
        address: parking.location?.addressLine || parking.location?.city || 'Dirección no disponible',
        status: status as 'Activo' | 'Mantenimiento' | 'Inactivo',
        rating: 0, // TODO: integrar con sistema de reviews
        reviewsCount: 0,
        pricePerMonth: Math.round(monthlyPrice),
        available: 0, // TODO: integrar con IoT devices
        total: parking.totalSpaces || 0,
        imageUrl: undefined
      };
    });
  }

  onNewParking() {
    this.router.navigate(['/parkings/new']);
  }

  onRetry() {
    this.loadParkings();
  }

  /**
   * TrackBy function para optimizar el renderizado de la lista
   */
  trackByParkingId(index: number, parking: ParkingCardData): string {
    return parking.id;
  }

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
