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
    if (!plan.priceId) {
      this.snackBar.open('Este plan no está disponible actualmente.', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    try {
      console.log('🔄 Creando sesión de Checkout...', { plan: plan.name, priceId: plan.priceId });

      const response = await this.billingApi.createCheckoutSession(plan.priceId).toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // Redirigir a Stripe Checkout usando la URL
      if (response.url) {
        console.log('✅ Redirigiendo a Stripe Checkout:', response.url);
        window.location.href = response.url;
      } else if (response.sessionId) {
        console.log('⚠️ Recibido sessionId sin URL. El backend debe devolver la URL completa.');
        throw new Error('El servidor debe devolver una URL de checkout');
      } else {
        throw new Error('No se recibió URL ni sessionId del servidor');
      }

    } catch (error: any) {
      console.error('❌ Error al crear sesión de Checkout:', error);
      this.snackBar.open(
        error.message || 'Error al procesar el pago. Intenta de nuevo.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    }
  }

  async onManagePayment() {
    try {
      console.log('🔄 Abriendo Customer Portal de Stripe...');

      const response = await this.billingApi.createPortalSession().toPromise();

      if (!response || !response.url) {
        throw new Error('No se recibió URL del portal');
      }

      console.log('✅ Redirigiendo a Customer Portal:', response.url);
      window.location.href = response.url;

    } catch (error: any) {
      console.error('❌ Error al abrir Customer Portal:', error);
      this.snackBar.open(
        error.message || 'Error al abrir el portal de gestión. Intenta de nuevo.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    }
  }

  onCancelSubscription() {
    // La cancelación se hace a través del Customer Portal
    this.onManagePayment();
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
