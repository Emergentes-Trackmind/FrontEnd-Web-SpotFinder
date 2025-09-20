import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivityItemDTO } from '../../../domain/dtos/metrics.dto';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <mat-card class="recent-activity-card">
      <div class="card-header">
        <div class="title-section">
          <h3 class="card-title">Actividad Reciente</h3>
          <p class="card-subtitle">Últimas acciones en tus parkings</p>
        </div>
        <div class="actions">
          <button mat-icon-button>
            <mat-icon>more_vert</mat-icon>
          </button>
        </div>
      </div>

      <div class="activity-content" *ngIf="!loading && activities && activities.length > 0; else emptyState">
        <div class="activity-list">
          <div *ngFor="let activity of activities; let i = index"
               class="activity-item"
               [class.last]="i === activities.length - 1">

            <div class="activity-icon">
              <mat-icon [class]="'icon-' + activity.type">{{ getActivityIcon(activity.type) }}</mat-icon>
            </div>

            <div class="activity-details">
              <div class="activity-main">
                <h4 class="activity-title">{{ activity.title }}</h4>
                <p class="activity-description">{{ activity.description }}</p>
              </div>

              <div class="activity-meta">
                <span class="activity-user">
                  <mat-icon class="user-icon">person</mat-icon>
                  {{ activity.userName }}
                </span>
                <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
              </div>

              <div class="activity-entity" *ngIf="activity.relatedEntity">
                <mat-icon class="entity-icon">{{ getEntityIcon(activity.relatedEntity.type) }}</mat-icon>
                <span class="entity-name">{{ activity.relatedEntity.name }}</span>
              </div>
            </div>

            <div class="activity-status">
              <span class="status-badge" [class]="'status-' + activity.status">
                {{ getStatusText(activity.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state" *ngIf="!loading">
          <mat-icon class="empty-icon">history</mat-icon>
          <h4 class="empty-title">No hay actividad reciente</h4>
          <p class="empty-message">Las acciones en tus parkings aparecerán aquí</p>
        </div>

        <div class="loading-state" *ngIf="loading">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p class="loading-text">Cargando actividad...</p>
        </div>
      </ng-template>
    </mat-card>
  `,
  styleUrl: './recent-activity.component.css'
})
export class RecentActivityComponent {
  @Input() activities: ActivityItemDTO[] = [];
  @Input() loading: boolean = false;

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'reservation_confirmed': 'check_circle',
      'payment_processed': 'payment',
      'reservation_cancelled': 'cancel',
      'parking_created': 'add_location',
      'review_added': 'star'
    };
    return iconMap[type] || 'info';
  }

  getEntityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'parking': 'local_parking',
      'reservation': 'event_seat',
      'payment': 'attach_money'
    };
    return iconMap[type] || 'business';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmed': 'Confirmado',
      'paid': 'Pagado',
      'cancelled': 'Cancelado',
      'created': 'Creado',
      'pending': 'Pendiente'
    };
    return statusMap[status] || status;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} min${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      if (days === 1) return 'Ayer';
      if (days < 7) return `Hace ${days} días`;
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
