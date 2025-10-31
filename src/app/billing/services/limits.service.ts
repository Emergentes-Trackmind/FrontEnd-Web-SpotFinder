import { Injectable, inject, signal, computed } from '@angular/core';
import { BillingApiClient } from './billing-api.client';
import { Plan, SubscriptionInfo, LimitsInfo } from '../models/billing.models';
import { forkJoin, tap } from 'rxjs';

/**
 * Servicio para gestionar los límites del plan y estado de suscripción
 */
@Injectable({
  providedIn: 'root'
})
export class LimitsService {
  private billingApi = inject(BillingApiClient);

  // Signals para estado reactivo
  private subscriptionInfo = signal<SubscriptionInfo | null>(null);
  private availablePlans = signal<Plan[]>([]);

  // Límites actuales (se actualizan desde fuera)
  private currentParkingsCount = signal<number>(0);
  private currentIotCount = signal<number>(0);

  // Computed signals
  readonly currentPlan = computed(() => this.subscriptionInfo()?.plan || null);
  readonly currentStatus = computed(() => this.subscriptionInfo()?.status || 'NONE');
  readonly isActive = computed(() => this.currentStatus() === 'ACTIVE');
  readonly isBasic = computed(() => this.currentPlan()?.code === 'BASIC');
  readonly isAdvanced = computed(() => this.currentPlan()?.code === 'ADVANCED');

  readonly limitsInfo = computed<LimitsInfo>(() => {
    const plan = this.currentPlan();
    const parkingsCount = this.currentParkingsCount();
    const iotCount = this.currentIotCount();

    if (!plan) {
      return {
        parkings: { current: parkingsCount, limit: 0, canCreate: false },
        iot: { current: iotCount, limit: 0, canCreate: false }
      };
    }

    return {
      parkings: {
        current: parkingsCount,
        limit: plan.parkingLimit,
        canCreate: parkingsCount < plan.parkingLimit
      },
      iot: {
        current: iotCount,
        limit: plan.iotLimit,
        canCreate: iotCount < plan.iotLimit
      }
    };
  });

  /**
   * Carga la información de suscripción y planes disponibles
   */
  load() {
    console.log('🔄 [LimitsService] Cargando información de suscripción y planes');

    return forkJoin({
      subscription: this.billingApi.getMe(),
      plans: this.billingApi.getPlans()
    }).pipe(
      tap(({ subscription, plans }) => {
        console.log('✅ [LimitsService] Información cargada', { subscription, plans });
        this.subscriptionInfo.set(subscription);
        this.availablePlans.set(plans);
      })
    );
  }

  /**
   * Actualiza el conteo actual de parkings
   */
  updateParkingsCount(count: number) {
    this.currentParkingsCount.set(count);
  }

  /**
   * Actualiza el conteo actual de dispositivos IoT
   */
  updateIotCount(count: number) {
    this.currentIotCount.set(count);
  }

  /**
   * Verifica si se puede crear un parking
   */
  canCreateParking(): boolean {
    return this.limitsInfo().parkings.canCreate;
  }

  /**
   * Verifica si se puede crear un dispositivo IoT
   */
  canCreateDevice(): boolean {
    return this.limitsInfo().iot.canCreate;
  }

  /**
   * Obtiene el plan Avanzado para upgrade
   */
  getUpgradePlan(): Plan | null {
    const plans = this.availablePlans();
    return plans.find(p => p.code === 'ADVANCED') || null;
  }

  /**
   * Obtiene todos los planes disponibles
   */
  getPlans(): Plan[] {
    return this.availablePlans();
  }

  /**
   * Obtiene la información de suscripción actual
   */
  getSubscriptionInfo(): SubscriptionInfo | null {
    return this.subscriptionInfo();
  }

  /**
   * Retorna el CTA de upgrade (plan y priceId)
   */
  getUpgradeCta(): { plan: Plan; priceId: string } | null {
    const upgradePlan = this.getUpgradePlan();
    if (!upgradePlan || !upgradePlan.priceId) {
      return null;
    }
    return {
      plan: upgradePlan,
      priceId: upgradePlan.priceId
    };
  }
}

