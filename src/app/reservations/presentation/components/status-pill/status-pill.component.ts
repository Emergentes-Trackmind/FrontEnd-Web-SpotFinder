import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-pill.component.html',
  styleUrl: './status-pill.component.css'
})
export class StatusPillComponent {
  @Input() status!: ReservationStatus;

  get statusConfig() {
    switch (this.status) {
      case ReservationStatus.PENDING:
        return {
          color: '#6B7280',
          backgroundColor: '#F3F4F6',
          label: 'Pendiente'
        };
      case ReservationStatus.CONFIRMED:
        return {
          color: '#6D5AE6',
          backgroundColor: '#EDE9FE',
          label: 'Confirmada'
        };
      case ReservationStatus.PAID:
        return {
          color: '#16A34A',
          backgroundColor: '#DCFCE7',
          label: 'Pagada'
        };
      case ReservationStatus.CANCELLED:
        return {
          color: '#EF4444',
          backgroundColor: '#FEE2E2',
          label: 'Cancelada'
        };
      case ReservationStatus.COMPLETED:
        return {
          color: '#065F46',
          backgroundColor: '#D1FAE5',
          label: 'Completada'
        };
      default:
        return {
          color: '#6B7280',
          backgroundColor: '#F3F4F6',
          label: 'Desconocido'
        };
    }
  }
}
