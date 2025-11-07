import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BillingApiClient } from '../../services/billing-api.client';
import { LimitsService } from '../../services/limits.service';
import { PlanCardComponent } from '../../components/plan-card/plan-card.component';
import { BillingSummaryComponent } from '../../components/billing-summary/billing-summary.component';
import { PaymentsTableComponent } from '../../components/payments-table/payments-table.component';
import { Plan, SubscriptionInfo, PaymentRow } from '../../models/billing.models';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    PlanCardComponent,
    BillingSummaryComponent,
    PaymentsTableComponent
  ],
  templateUrl: './subscription-page.component.html',
  styleUrls: ['./subscription-page.component.css']
})
export class SubscriptionPageComponent implements OnInit {
  private billingApi = inject(BillingApiClient);
  private limitsService = inject(LimitsService);
  private snackBar = inject(MatSnackBar);

  // Signals
  isLoading = signal(true);
  plans = signal<Plan[]>([]);
  subscriptionInfo = signal<SubscriptionInfo | null>(null);
  payments = signal<PaymentRow[]>([]);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.isLoading.set(true);

    // Cargar límites y planes
    this.limitsService.load().subscribe({
      next: () => {
        this.plans.set(this.limitsService.getPlans());
        this.subscriptionInfo.set(this.limitsService.getSubscriptionInfo());
        this.loadPayments();
      },
      error: (error) => {
        console.error('Error cargando datos de suscripción:', error);
        this.snackBar.open('Error al cargar los datos. Intenta de nuevo.', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading.set(false);
      }
    });
  }

  private loadPayments() {
    this.billingApi.getPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando pagos:', error);
        this.payments.set([]);
        this.isLoading.set(false);
      }
    });
  }

  async onChoosePlan(plan: Plan) {
    try {
      console.log('🔄 Actualizando plan...', { plan: plan.name, code: plan.code });

      const response = await this.billingApi.subscribe(plan.code).toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      console.log('✅ Plan actualizado exitosamente:', response);

      this.snackBar.open(`Plan actualizado a ${plan.name} exitosamente`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Recargar los datos
      this.loadData();

    } catch (error: any) {
      console.error('❌ Error al actualizar plan:', error);
      this.snackBar.open(
        error.message || 'Error al actualizar el plan. Intenta de nuevo.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    }
  }

  async onManagePayment() {
    // Por ahora solo mostrar mensaje, se puede implementar más adelante
    this.snackBar.open('Gestión de pagos disponible próximamente', 'Cerrar', {
      duration: 3000
    });
  }

  async onCancelSubscription() {
    try {
      console.log('🔄 Cancelando suscripción...');

      const response = await this.billingApi.cancelSubscription().toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      console.log('✅ Suscripción cancelada exitosamente:', response);

      this.snackBar.open('Suscripción cancelada. Ahora estás en el plan básico.', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Recargar los datos
      this.loadData();

    } catch (error: any) {
      console.error('❌ Error al cancelar suscripción:', error);
      this.snackBar.open(
        error.message || 'Error al cancelar la suscripción. Intenta de nuevo.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    }
  }


  isPlanActive(plan: Plan): boolean {
    const currentPlan = this.subscriptionInfo()?.plan;
    return currentPlan?.id === plan.id;
  }

  getCtaLabel(plan: Plan): string {
    if (this.isPlanActive(plan)) {
      return 'Plan Actual';
    }

    const currentPlan = this.subscriptionInfo()?.plan;
    if (!currentPlan) {
      return 'Elegir Plan';
    }

    // Si tiene un plan inferior, es upgrade
    if (currentPlan.code === 'BASIC' && plan.code === 'ADVANCED') {
      return 'Actualizar';
    }

    return 'Cambiar Plan';
  }
}
