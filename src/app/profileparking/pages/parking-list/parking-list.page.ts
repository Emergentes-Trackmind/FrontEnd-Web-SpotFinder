import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ParkingProfileService } from '../../services/parking-profile.service';
import {ParkingCardComponent} from '../../components/parking-card/parking-card.component';
import {ProfileParking} from '../../model/profileparking.entity';

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
    private parkingService: ParkingProfileService,
    private router: Router
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

    this.parkingService.getProfiles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profiles: ProfileParking[]) => {
          this.parkings = this.mapProfilesToCards(profiles);
          this.filteredParkings = [...this.parkings];
          this.isLoading = false;
        },
        error: (error) => {
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

  private mapProfilesToCards(profiles: ProfileParking[]): ParkingCardData[] {
    return profiles.map((profile, index) => ({
      id: `${index + 1}`,
      name: profile.name || `Parking ${index + 1}`,
      address: this.getMockAddress(index),
      status: this.mapParkingStatusToCardStatus(profile.status),
      rating: this.getRandomRating(),
      reviewsCount: Math.floor(Math.random() * 500),
      pricePerMonth: Math.floor(Math.random() * 200) + 100,
      available: Math.floor(Math.random() * profile.totalSpaces),
      total: profile.totalSpaces || 50,
      imageUrl: undefined
    }));
  }

  private mapParkingStatusToCardStatus(status: any): 'Activo' | 'Mantenimiento' | 'Inactivo' {
    if (typeof status === 'string') {
      return status as 'Activo' | 'Mantenimiento' | 'Inactivo';
    }
    // Si es enum, convertir a string
    return status?.toString() || 'Activo';
  }

  private getMockAddress(index: number): string {
    const addresses = [
      'Calle Gran Vía, 25, Madrid',
      'Plaza Mayor, 15, Madrid',
      'Terminal T1, Barajas, Madrid',
      'Calle Alfonso XII, 62, Madrid',
      'Complejo Las Flores, Madrid',
      'Gran Vía, 50, Madrid'
    ];
    return addresses[index] || 'Calle Gran Vía, 25, Madrid';
  }

  private getRandomRating(): number {
    return Number((Math.random() * 2 + 3).toFixed(1));
  }

  onNewParking() {
    this.router.navigate(['/parkings/new']);
  }

  onRetry() {
    this.loadParkings();
  }

  trackByParkingId(index: number, parking: ParkingCardData): string {
    return parking.id;
  }
}
