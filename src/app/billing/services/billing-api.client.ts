import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Plan,
  SubscriptionInfo,
  PaymentRow,
  CheckoutSessionResponse,
  PortalSessionResponse
} from '../models/billing.models';

/**
 * Cliente HTTP para operaciones de Billing
 * Solo realiza llamadas HTTP, sin lógica de negocio
 */
@Injectable({
  providedIn: 'root'
})
export class BillingApiClient {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/billing`;

  /**
   * Obtiene los planes disponibles
   */
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.baseUrl}/plans`);
  }

  /**
   * Obtiene la información de suscripción del usuario actual
   */
  getMe(): Observable<SubscriptionInfo> {
    return this.http.get<SubscriptionInfo>(`${this.baseUrl}/me`);
  }

  /**
   * Crea una sesión de Checkout de Stripe
   */
  createCheckoutSession(priceId: string): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(`${this.baseUrl}/create-checkout-session`, {
      priceId
    });
  }

  /**
   * Crea una sesión del Customer Portal de Stripe
   */
  createPortalSession(): Observable<PortalSessionResponse> {
    return this.http.post<PortalSessionResponse>(`${this.baseUrl}/create-portal-session`, {});
  }

  /**
   * Obtiene el historial de pagos
   */
  getPayments(): Observable<PaymentRow[]> {
    return this.http.get<PaymentRow[]>(`${this.baseUrl}/payments`);
  }
}

