import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  selector: 'app-parking-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './parking-card.component.html',
  styleUrls: ['./parking-card.component.css']
})
export class ParkingCardComponent {
  @Input() parking!: ParkingCardData;

  get statusColor(): string {
    switch (this.parking.status) {
      case 'Activo':
        return 'success';
      case 'Mantenimiento':
        return 'warning';
      case 'Inactivo':
        return 'error';
      default:
        return 'default';
    }
  }

  get ratingStars(): number[] {
    const rating = Math.floor(this.parking.rating);
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  get availabilityPercentage(): number {
    return (this.parking.available / this.parking.total) * 100;
  }

  get availabilityColor(): string {
    const percentage = this.availabilityPercentage;
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'error';
  }
}
