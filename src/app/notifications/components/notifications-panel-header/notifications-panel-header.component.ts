import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Cabecera del panel de notificaciones
 */
@Component({
  selector: 'app-notifications-panel-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>Notificaciones</h1>
      <div class="header-actions">
        <button
          mat-stroked-button
          (click)="markAllRead.emit()"
          aria-label="Marcar todas como leídas"
        >
          <mat-icon>done_all</mat-icon>
          <span class="button-text">Marcar todas como leídas</span>
        </button>

        <button
          mat-stroked-button
          color="warn"
          (click)="deleteAll.emit()"
          aria-label="Eliminar todas"
        >
          <mat-icon>delete_sweep</mat-icon>
          <span class="button-text">Eliminar todas</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 0;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .header-actions button mat-icon {
      margin-right: 8px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 768px) {
      .page-header {
        padding: 20px 0;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      h1 {
        font-size: 24px;
      }

      .header-actions {
        width: 100%;
        flex-direction: column;
      }

      .header-actions button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .button-text {
        display: none;
      }

      .header-actions button mat-icon {
        margin-right: 0;
      }
    }
  `]
})
export class NotificationsPanelHeaderComponent {
  @Output() markAllRead = new EventEmitter<void>();
  @Output() deleteAll = new EventEmitter<void>();
}

