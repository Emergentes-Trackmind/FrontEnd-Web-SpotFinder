import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { TopParkingDTO } from '../../../domain/dtos/metrics.dto';

@Component({
  selector: 'app-top-parkings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatBadgeModule],
  template: `
    <mat-card class="top-parkings-card">
      <div class="card-header">
        <div class="title-section">
          <h3 class="card-title">Top Parkings</h3>
          <p class="card-subtitle">Los parkings con mejor rendimiento</p>
        </div>
        <div class="actions">
          <button mat-icon-button>
            <mat-icon>more_vert</mat-icon>
          </button>
        </div>
      </div>

      <div class="parkings-content" *ngIf="!loading && parkings && parkings.length > 0; else emptyState">
        <div class="parkings-list">
          <div *ngFor="let parking of parkings; let i = index"
               class="parking-item"
               [class.last]="i === parkings.length - 1">

            <div class="parking-rank">
              <div class="rank-badge" [class]="getRankClass(i)">
                <span class="rank-number">{{ i + 1 }}</span>
              </div>
            </div>

            <div class="parking-details">
              <div class="parking-main">
                <h4 class="parking-name">{{ parking.name }}</h4>
                <p class="parking-address">
                  <mat-icon class="address-icon">place</mat-icon>
                  {{ parking.address }}
                </p>
              </div>

              <div class="parking-metrics">
                <div class="metric">
                  <mat-icon class="metric-icon">local_parking</mat-icon>
                  <span class="metric-value">{{ parking.occupancyPercentage }}%</span>
                  <span class="metric-label">Ocupación</span>
                </div>

                <div class="metric">
                  <mat-icon class="metric-icon">star</mat-icon>
                  <span class="metric-value">{{ parking.rating.toFixed(1) }}</span>
                  <span class="metric-label">Rating</span>
                </div>

                <div class="metric">
                  <mat-icon class="metric-icon">attach_money</mat-icon>
                  <span class="metric-value">{{ parking.currency }}{{ formatRevenue(parking.monthlyRevenue) }}</span>
                  <span class="metric-label">Mensual</span>
                </div>
              </div>
            </div>

            <div class="parking-status">
              <span class="status-indicator" [class]="'status-' + parking.status"></span>
              <span class="status-text">{{ getStatusText(parking.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state" *ngIf="!loading">
          <mat-icon class="empty-icon">local_parking</mat-icon>
          <h4 class="empty-title">No hay datos de parkings</h4>
          <p class="empty-message">Los parkings con mejor rendimiento aparecerán aquí</p>
        </div>

        <div class="loading-state" *ngIf="loading">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p class="loading-text">Cargando top parkings...</p>
        </div>
      </ng-template>
    </mat-card>
  `,
  styleUrl: './top-parkings.component.css'
})
export class TopParkingsComponent {
  @Input() parkings: TopParkingDTO[] = [];
  @Input() loading: boolean = false;

  getRankClass(index: number): string {
    if (index === 0) return 'rank-first';
    if (index === 1) return 'rank-second';
    if (index === 2) return 'rank-third';
    return 'rank-other';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'maintenance': 'Mantenimiento',
      'inactive': 'Inactivo'
    };
    return statusMap[status] || status;
  }

  formatRevenue(revenue: number): string {
    if (revenue >= 1000000) {
      return (revenue / 1000000).toFixed(1) + 'M';
    } else if (revenue >= 1000) {
      return (revenue / 1000).toFixed(1) + 'K';
    }
    return revenue.toLocaleString();
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return '#EF4444'; // Rojo
    if (percentage >= 70) return '#F59E0B'; // Amarillo
    if (percentage >= 50) return '#6D5AE6'; // Morado
    return '#16A34A'; // Verde
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#16A34A'; // Verde
    if (rating >= 4.0) return '#6D5AE6'; // Morado
    if (rating >= 3.0) return '#F59E0B'; // Amarillo
    return '#EF4444'; // Rojo
  }
}
