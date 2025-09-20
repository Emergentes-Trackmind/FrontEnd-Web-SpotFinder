import { ReservationStatus } from '../enums/reservation-status.enum';

export function canConfirm(status: ReservationStatus): boolean {
  return status === ReservationStatus.PENDING;
}

export function canCancel(status: ReservationStatus): boolean {
  return status !== ReservationStatus.CANCELLED && status !== ReservationStatus.COMPLETED;
}

export function canPay(status: ReservationStatus): boolean {
  return status === ReservationStatus.CONFIRMED;
}

export function canComplete(status: ReservationStatus): boolean {
  return status === ReservationStatus.PAID;
}

export function nextStatus(
  current: ReservationStatus,
  action: 'confirm' | 'cancel' | 'pay' | 'complete'
): ReservationStatus | null {
  switch (current) {
    case ReservationStatus.PENDING:
      if (action === 'confirm') return ReservationStatus.CONFIRMED;
      if (action === 'cancel') return ReservationStatus.CANCELLED;
      break;
    case ReservationStatus.CONFIRMED:
      if (action === 'pay') return ReservationStatus.PAID;
      if (action === 'cancel') return ReservationStatus.CANCELLED;
      break;
    case ReservationStatus.PAID:
      if (action === 'complete') return ReservationStatus.COMPLETED;
      break;
  }
  return null;
}

export function validateStatusTransition(
  from: ReservationStatus,
  to: ReservationStatus
): boolean {
  const validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
    [ReservationStatus.PENDING]: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
    [ReservationStatus.CONFIRMED]: [ReservationStatus.PAID, ReservationStatus.CANCELLED],
    [ReservationStatus.PAID]: [ReservationStatus.COMPLETED],
    [ReservationStatus.CANCELLED]: [],
    [ReservationStatus.COMPLETED]: []
  };

  return validTransitions[from].includes(to);
}
