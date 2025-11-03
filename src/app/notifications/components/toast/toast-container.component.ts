import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast.component';
import { NotificationsService } from '../../services/notifications.service';

/**
 * Contenedor de toasts - se ubica en la esquina superior derecha
 * Gestiona la visualización de hasta 3 toasts simultáneos
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="toast-container" role="region" aria-label="Notificaciones" aria-live="polite">
      <app-toast
        *ngFor="let toast of visibleToasts(); trackBy: trackById"
        [notification]="toast"
        (dismiss)="onDismiss(toast.id)"
      />
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2000;
      pointer-events: none;
    }

    .toast-container > * {
      pointer-events: auto;
    }

    @media (max-width: 600px) {
      .toast-container {
        top: 8px;
        right: 8px;
        left: 8px;
      }
    }
  `]
})
export class ToastContainerComponent {
  private readonly notificationsService = inject(NotificationsService);

  protected readonly visibleToasts = this.notificationsService.visibleToasts;

  onDismiss(id: string): void {
    this.notificationsService.dismissToast(id);
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
}

