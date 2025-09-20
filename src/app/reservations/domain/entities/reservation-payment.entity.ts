export interface ReservationPayment {
  id: number | string;
  reservationId: number | string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paidAt?: string; // ISO date
  refundedAt?: string; // ISO date
  refundAmount?: number;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date

  // Metadata adicional
  processorResponse?: ProcessorResponse;
  failureReason?: string;
  retryCount?: number;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  DIGITAL_WALLET = 'DIGITAL_WALLET'
}

export interface ProcessorResponse {
  transactionId: string;
  authorizationCode?: string;
  processorName: string;
  rawResponse?: any;
  fees?: {
    processingFee: number;
    platformFee: number;
    totalFees: number;
  };
}

export interface PaymentSummary {
  totalAmount: number;
  currency: string;
  breakdown: {
    baseAmount: number;
    taxes: number;
    fees: number;
    discounts: number;
  };
}
