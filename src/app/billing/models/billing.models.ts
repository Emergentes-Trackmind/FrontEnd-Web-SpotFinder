/**
 * Modelos de Billing y Suscripciones
 */

export interface Plan {
  id: string;
  code: 'BASIC' | 'ADVANCED';
  name: string;
  price: number;
  currency: string;
  parkingLimit: number;
  iotLimit: number;
  priceId?: string; // Stripe price id
  features?: string[];
}

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'NONE';

export interface SubscriptionInfo {
  plan: Plan | null;
  status: SubscriptionStatus;
  startDate?: string;
  renewalDate?: string;
  stripeCustomerId?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface PaymentRow {
  id: string;
  paidAt: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
  transactionId: string;
}

export interface CheckoutSessionResponse {
  url?: string;
  sessionId?: string;
}

export interface PortalSessionResponse {
  url: string;
}

export interface LimitsInfo {
  parkings: {
    current: number;
    limit: number;
    canCreate: boolean;
  };
  iot: {
    current: number;
    limit: number;
    canCreate: boolean;
  };
}

