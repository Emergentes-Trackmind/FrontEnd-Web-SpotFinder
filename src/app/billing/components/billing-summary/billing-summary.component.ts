import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SubscriptionInfo } from '../../models/billing.models';

@Component({
  selector: 'app-billing-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="billing-summary">
      <h2>Resumen de Suscripción</h2>

      <div class="summary-content" *ngIf="info && info.plan">
        <!-- Plan actual -->
        <div class="info-row">
          <div class="label">
            <mat-icon>workspace_premium</mat-icon>
            <span>Plan Actual</span>
          </div>
          <div class="value">
            <strong>{{ info.plan.name }}</strong>
          </div>
        </div>

        <!-- Estado -->
        <div class="info-row">
          <div class="label">
            <mat-icon>info</mat-icon>
            <span>Estado</span>
          </div>
          <div class="value">
            <mat-chip [class]="'status-' + info.status.toLowerCase()">
              {{ getStatusLabel(info.status) }}
            </mat-chip>
          </div>
        </div>

        <!-- Fecha de inicio -->
        <div class="info-row" *ngIf="info.startDate">
          <div class="label">
            <mat-icon>calendar_today</mat-icon>
            <span>Fecha de Inicio</span>
          </div>
          <div class="value">
            {{ info.startDate | date: 'dd/MM/yyyy' }}
          </div>
        </div>

        <!-- Próxima renovación -->
        <div class="info-row" *ngIf="info.renewalDate && info.status === 'ACTIVE'">
          <div class="label">
            <mat-icon>event</mat-icon>
            <span>Próxima Renovación</span>
          </div>
          <div class="value">
            {{ info.renewalDate | date: 'dd/MM/yyyy' }}
          </div>
        </div>

        <!-- Precio -->
        <div class="info-row">
          <div class="label">
            <mat-icon>payments</mat-icon>
            <span>Precio Mensual</span>
          </div>
          <div class="value">
            <strong>{{ info.plan.currency === 'EUR' ? '€' : '$' }}{{ info.plan.price }}</strong>
          </div>
        </div>

        <!-- Advertencia de cancelación -->
        <div class="cancel-warning" *ngIf="info.cancelAtPeriodEnd">
          <mat-icon>warning</mat-icon>
          <span>Tu suscripción se cancelará el {{ info.renewalDate | date: 'dd/MM/yyyy' }}</span>
        </div>
      </div>

      <!-- Sin suscripción -->
      <div class="no-subscription" *ngIf="!info || !info.plan">
        <mat-icon>info</mat-icon>
        <p>No tienes una suscripción activa</p>
      </div>

      <!-- Acciones -->
      <div class="summary-actions">
        <button
          mat-raised-button
          color="primary"
          (click)="managePayment.emit()"
          *ngIf="info && info.status === 'ACTIVE'">
          <mat-icon>credit_card</mat-icon>
          Gestionar Método de Pago
        </button>

        <button
          mat-button
          color="warn"
          (click)="cancel.emit()"
          *ngIf="info && info.status === 'ACTIVE' && !info.cancelAtPeriodEnd">
          <mat-icon>cancel</mat-icon>
          Cancelar Suscripción
        </button>
      </div>
    </mat-card>
  `,
  styles: [`
    .billing-summary {
      padding: 24px;
      border-radius: 12px;
    }

    h2 {
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    }

    .summary-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #E5E7EB;
    }

    .info-row:last-of-type {
      border-bottom: none;
    }

    .label {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #6B7280;
      font-size: 15px;
    }

    .label mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .value {
      font-size: 15px;
      color: #111827;
    }

    .value strong {
      font-weight: 600;
    }

    mat-chip {
      font-weight: 600;
      font-size: 12px;
    }

    .status-active {
      background-color: #10B981 !important;
      color: white !important;
    }

    .status-canceled {
      background-color: #EF4444 !important;
      color: white !important;
    }

    .status-past_due {
      background-color: #F59E0B !important;
      color: white !important;
    }

    .status-incomplete {
      background-color: #6B7280 !important;
      color: white !important;
    }

    .cancel-warning {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 8px;
      color: #92400E;
      font-size: 14px;
      margin-top: 8px;
    }

    .cancel-warning mat-icon {
      color: #F59E0B;
    }

    .no-subscription {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      color: #6B7280;
    }

    .no-subscription mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .summary-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 2px solid #E5E7EB;
    }

    .summary-actions button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      font-weight: 500;
    }

    .summary-actions button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class BillingSummaryComponent {
  @Input() info: SubscriptionInfo | null = null;

  @Output() managePayment = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'ACTIVO',
      'CANCELED': 'CANCELADO',
      'PAST_DUE': 'PAGO PENDIENTE',
      'INCOMPLETE': 'INCOMPLETO',
      'NONE': 'SIN SUSCRIPCIÓN'
    };
    return labels[status] || status;
  }
}

