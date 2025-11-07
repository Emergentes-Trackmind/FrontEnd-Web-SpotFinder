import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Plan } from '../../models/billing.models';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="plan-card" [class.active]="active">
      <!-- Badge de plan activo -->
      <div class="plan-badge" *ngIf="active">
        <mat-icon>check_circle</mat-icon>
        <span>PLAN ACTIVO</span>
      </div>

      <!-- Header con icono -->
      <div class="plan-header">
        <mat-icon class="plan-icon">workspace_premium</mat-icon>
        <h2 class="plan-name">{{ plan.name }}</h2>
      </div>

      <!-- Precio -->
      <div class="plan-price">
        <span class="amount">{{ getCurrencySymbol() }}{{ plan.price }}</span>
        <span class="period">/mes</span>
      </div>

      <!-- Features/Límites -->
      <div class="plan-features">
        <div class="feature-item">
          <mat-icon>local_parking</mat-icon>
          <span>Hasta {{ plan.parkingLimit }} parkings</span>
        </div>
        <div class="feature-item">
          <mat-icon>devices</mat-icon>
          <span>Hasta {{ plan.iotLimit }} dispositivos IoT</span>
        </div>
        <div class="feature-item" *ngFor="let feature of plan.features">
          <mat-icon>check</mat-icon>
          <span>{{ feature }}</span>
        </div>
      </div>

      <!-- CTA -->
      <div class="plan-actions">
        <button
          mat-raised-button
          [color]="active ? 'accent' : 'primary'"
          [disabled]="active"
          (click)="select.emit(plan)"
          class="cta-button">
          {{ ctaLabel }}
        </button>
      </div>
    </mat-card>
  `,
  styles: [`
    .plan-card {
      position: relative;
      padding: 24px;
      border-radius: 16px;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .plan-card.active {
      border: 2px solid #6D5AE6;
      background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);
    }

    .plan-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: #6D5AE6;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .plan-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .plan-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .plan-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #6D5AE6;
      margin-bottom: 12px;
    }

    .plan-name {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .plan-price {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 2px solid #E5E7EB;
    }

    .plan-price .amount {
      font-size: 40px;
      font-weight: 700;
      color: #111827;
    }

    .plan-price .period {
      font-size: 16px;
      color: #6B7280;
      margin-left: 4px;
    }

    .plan-features {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #111827;
      font-size: 15px;
    }

    .feature-item mat-icon {
      color: #6D5AE6;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .plan-actions {
      margin-top: auto;
    }

    .cta-button {
      width: 100%;
      padding: 12px;
      font-weight: 600;
      font-size: 16px;
      border-radius: 8px;
    }
  `]
})
export class PlanCardComponent {
  @Input({ required: true }) plan!: Plan;
  @Input() active = false;
  @Input() ctaLabel = 'Elegir Plan';

  @Output() select = new EventEmitter<Plan>();

  getCurrencySymbol(): string {
    switch (this.plan.currency) {
      case 'EUR':
        return '€';
      case 'PEN':
        return 'S/';
      case 'USD':
        return '$';
      default:
        return '$';
    }
  }
}

