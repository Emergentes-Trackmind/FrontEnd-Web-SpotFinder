import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { AppNotification, ToastConfig } from '../../models/notification.models';

/**
 * Componente individual de toast
 * Muestra una notificación temporal con auto-cierre y barra de progreso
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div
      class="toast"
      [ngClass]="notification.kind"
      [attr.role]="'alert'"
      [attr.aria-live]="'polite'"
      [attr.aria-atomic]="'true'"
      tabindex="0"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      [@slideIn]
    >
      <button
        class="close"
        mat-icon-button
        aria-label="Cerrar notificación"
        (click)="close()"
        *ngIf="config.closable"
      >
        <mat-icon>close</mat-icon>
      </button>

      <div class="toast-content">
        <div class="icon">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
        <div class="message">
          <div class="title">{{ notification.title }}</div>
          <div class="body">{{ notification.body }}</div>

          <a
            *ngIf="notification.actionUrl && notification.actionLabel"
            [href]="notification.actionUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="action-link"
          >
            {{ notification.actionLabel }}
          </a>
        </div>
      </div>

      <div class="progress" *ngIf="config.durationMs && config.durationMs > 0">
        <div class="bar" [style.animation-duration.ms]="config.durationMs" [class.paused]="isPaused()"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      width: 360px;
      max-width: calc(100vw - 32px);
      padding: 12px 16px 8px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      background: #fff;
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .toast .close {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 32px;
      height: 32px;
      z-index: 1;
    }

    .toast-content {
      display: flex;
      gap: 12px;
      margin-right: 28px;
    }

    .icon {
      flex-shrink: 0;
    }

    .icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .message {
      flex: 1;
      min-width: 0;
    }

    .toast .title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      color: rgba(0, 0, 0, 0.87);
    }

    .toast .body {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.4;
    }

    .action-link {
      display: inline-block;
      margin-top: 8px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      color: #1976d2;
    }

    .action-link:hover {
      text-decoration: underline;
    }

    .toast .progress {
      height: 3px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 8px;
    }

    .toast .bar {
      height: 100%;
      background: currentColor;
      animation-name: progress-bar;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }

    .toast .bar.paused {
      animation-play-state: paused;
    }

    @keyframes progress-bar {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Estilos por tipo */
    .toast.success {
      border-left: 4px solid #2e7d32;
    }

    .toast.success .icon mat-icon {
      color: #2e7d32;
    }

    .toast.info {
      border-left: 4px solid #0288d1;
    }

    .toast.info .icon mat-icon {
      color: #0288d1;
    }

    .toast.warning {
      border-left: 4px solid #f9a825;
    }

    .toast.warning .icon mat-icon {
      color: #f9a825;
    }

    .toast.error {
      border-left: 4px solid #c62828;
    }

    .toast.error .icon mat-icon {
      color: #c62828;
    }

    .toast.system {
      border-left: 4px solid #5e35b1;
    }

    .toast.system .icon mat-icon {
      color: #5e35b1;
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input({ required: true }) notification!: AppNotification;
  @Input() config: ToastConfig = {
    durationMs: 10000,
    closable: true,
    pauseOnHover: true
  };

  @Output() dismiss = new EventEmitter<void>();

  private timeoutId: any;
  protected isPaused = signal(false);

  ngOnInit(): void {
    // Auto-cerrar después del tiempo configurado
    if (this.config.durationMs && this.config.durationMs > 0) {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private startTimer(): void {
    this.clearTimer();
    this.timeoutId = setTimeout(() => {
      this.close();
    }, this.config.durationMs);
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  onMouseEnter(): void {
    if (this.config.pauseOnHover) {
      this.isPaused.set(true);
      this.clearTimer();
    }
  }

  onMouseLeave(): void {
    if (this.config.pauseOnHover) {
      this.isPaused.set(false);
      this.startTimer();
    }
  }

  close(): void {
    this.dismiss.emit();
  }

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

  @HostListener('click')
  onClick(): void {
    if (this.notification.actionUrl) {
      window.open(this.notification.actionUrl, '_blank', 'noopener,noreferrer');
    }
  }
}

