import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AppNotification } from '../../models/notification.models';

/**
 * Componente individual de notificación en el panel
 */
@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-card
      class="notification-item"
      [class.unread]="!notification.read"
      role="listitem"
      [attr.aria-label]="notification.title"
    >
      <div class="notification-content">
        <div class="icon-wrapper">
          <mat-icon [class]="'icon-' + notification.kind">{{ getIcon() }}</mat-icon>
        </div>

        <div class="details">
          <div class="header">
            <h3 class="title">{{ notification.title }}</h3>
            <span class="badge" *ngIf="!notification.read">Nuevo</span>
          </div>

          <p class="body">{{ notification.body }}</p>

          <div class="footer">
            <span class="date">{{ getRelativeTime() }}</span>

            <button
              *ngIf="notification.actionUrl && notification.actionLabel"
              mat-button
              color="primary"
              (click)="onActionClick()"
              class="action-btn"
            >
              {{ notification.actionLabel }}
            </button>
          </div>
        </div>

        <button
          mat-icon-button
          [matMenuTriggerFor]="menu"
          aria-label="Más opciones"
          class="menu-trigger"
        >
          <mat-icon>more_vert</mat-icon>
        </button>
      </div>

      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="onMarkRead()" *ngIf="!notification.read">
          <mat-icon>done</mat-icon>
          <span>Marcar como leída</span>
        </button>
        <button mat-menu-item (click)="onDelete()">
          <mat-icon>delete</mat-icon>
          <span>Eliminar</span>
        </button>
      </mat-menu>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .notification-item {
      background: #fff;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #E5E7EB;
    }

    .notification-item:hover {
      background: #F9FAFB;
    }

    .notification-item.unread {
      background: #EFF6FF;
      border-left: 4px solid #6D5AE6;
    }

    .notification-item.unread:hover {
      background: #DBEAFE;
    }

    .notification-content {
      display: flex;
      gap: 16px;
      padding: 20px;
      align-items: flex-start;
    }

    .icon-wrapper {
      flex-shrink: 0;
    }

    .icon-wrapper mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .icon-info { color: #3B82F6; }
    .icon-success { color: #10B981; }
    .icon-warning { color: #F59E0B; }
    .icon-error { color: #EF4444; }
    .icon-system { color: #8B5CF6; }

    .details {
      flex: 1;
      min-width: 0;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      flex: 1;
    }

    .badge {
      background: #6D5AE6;
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .body {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6B7280;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .date {
      font-size: 12px;
      color: #9CA3AF;
    }

    .action-btn {
      flex-shrink: 0;
      font-size: 13px;
    }

    .menu-trigger {
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .notification-content {
        padding: 16px;
        gap: 12px;
      }

      .icon-wrapper mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .title {
        font-size: 14px;
      }

      .body {
        font-size: 13px;
      }
    }
  `]
})
export class NotificationItemComponent {
  @Input({ required: true }) notification!: AppNotification;
  @Output() markRead = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  getIcon(): string {
    const icons: Record<string, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      system: 'campaign'
    };
    return icons[this.notification.kind] || 'info';
  }

  getRelativeTime(): string {
    const now = new Date();
    const created = new Date(this.notification.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;

    return created.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  }

  onMarkRead(): void {
    this.markRead.emit();
  }

  onDelete(): void {
    this.remove.emit();
  }

  onActionClick(): void {
    if (this.notification.actionUrl) {
      window.open(this.notification.actionUrl, '_blank', 'noopener,noreferrer');
    }
  }
}

