import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NotificationsService } from '../../services/notifications.service';
import { AppNotification, NotificationKind } from '../../models/notification.models';

/**
 * Componente de prueba para demostrar toasts
 * Útil para desarrollo y testing sin necesidad de FCM
 */
@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Demo de Toasts</mat-card-title>
        <mat-card-subtitle>Prueba los diferentes tipos de notificaciones</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="demo-buttons">
          <button mat-raised-button color="primary" (click)="showToast('info')">
            <mat-icon>info</mat-icon>
            Info Toast
          </button>

          <button mat-raised-button class="success-btn" (click)="showToast('success')">
            <mat-icon>check_circle</mat-icon>
            Success Toast
          </button>

          <button mat-raised-button class="warning-btn" (click)="showToast('warning')">
            <mat-icon>warning</mat-icon>
            Warning Toast
          </button>

          <button mat-raised-button color="warn" (click)="showToast('error')">
            <mat-icon>error</mat-icon>
            Error Toast
          </button>

          <button mat-raised-button class="system-btn" (click)="showToast('system')">
            <mat-icon>campaign</mat-icon>
            System Toast
          </button>

          <button mat-raised-button (click)="showMultiple()">
            <mat-icon>filter_3</mat-icon>
            Mostrar 5 Toasts
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 800px;
      margin: 24px auto;
    }

    .demo-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 16px;
    }

    .demo-buttons button {
      height: 48px;
    }

    .demo-buttons button mat-icon {
      margin-right: 8px;
    }

    .success-btn {
      background-color: #2e7d32 !important;
      color: white !important;
    }

    .warning-btn {
      background-color: #f9a825 !important;
      color: white !important;
    }

    .system-btn {
      background-color: #5e35b1 !important;
      color: white !important;
    }
  `]
})
export class ToastDemoComponent {
  private readonly notificationsService = inject(NotificationsService);
  private counter = 0;

  showToast(kind: NotificationKind): void {
    this.counter++;

    const messages: Record<NotificationKind, { title: string; body: string }> = {
      info: {
        title: 'Información',
        body: 'Esta es una notificación informativa de ejemplo.'
      },
      success: {
        title: '¡Éxito!',
        body: 'La operación se completó correctamente.'
      },
      warning: {
        title: 'Advertencia',
        body: 'Por favor, revisa esta situación antes de continuar.'
      },
      error: {
        title: 'Error',
        body: 'Ocurrió un error al procesar la solicitud.'
      },
      system: {
        title: 'Notificación del Sistema',
        body: 'Actualización importante del sistema disponible.'
      }
    };

    const notification: AppNotification = {
      id: `demo_${this.counter}_${Date.now()}`,
      title: messages[kind].title,
      body: messages[kind].body,
      kind,
      createdAt: new Date().toISOString(),
      read: false
    };

    this.notificationsService.pushToast(notification);
  }

  showMultiple(): void {
    // Mostrar 5 toasts con diferentes tipos
    const kinds: NotificationKind[] = ['info', 'success', 'warning', 'error', 'system'];

    kinds.forEach((kind, index) => {
      setTimeout(() => {
        this.showToast(kind);
      }, index * 300);
    });
  }
}

