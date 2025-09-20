import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Domain & Services
import { ReservationsService } from '../../../services/reservations.service';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';
import { StatusPillComponent } from '../../components/status-pill/status-pill.component';
import { canConfirm, canCancel } from '../../../domain/policies/reservation-policies';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    StatusPillComponent
  ],
  templateUrl: './reservation-detail.page.html',
  styleUrl: './reservation-detail.page.css'
})
export class ReservationDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationsService = inject(ReservationsService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  reservation$: Observable<Reservation>;
  reservationId: string | number = '';

  constructor() {
    this.reservation$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.reservationId = params.get('id') || '';
        return this.reservationsService.getReservation(this.reservationId);
      })
    );
  }

  ngOnInit() {
    // La carga se maneja a través del observable reservation$
  }

  onConfirmReservation(reservation: Reservation) {
    if (!canConfirm(reservation.status)) {
      this.snackBar.open('No se puede confirmar esta reserva', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    this.reservationsService.confirmReservation(reservation.id).subscribe({
      next: (updatedReservation) => {
        this.snackBar.open('Reserva confirmada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        // Refrescar los datos
        this.reservation$ = this.reservationsService.getReservation(this.reservationId);
      },
      error: (error) => {
        this.snackBar.open('Error al confirmar la reserva', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  onCancelReservation(reservation: Reservation) {
    if (!canCancel(reservation.status)) {
      this.snackBar.open('No se puede cancelar esta reserva', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    this.reservationsService.cancelReservation(reservation.id).subscribe({
      next: (updatedReservation) => {
        this.snackBar.open('Reserva cancelada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        // Refrescar los datos
        this.reservation$ = this.reservationsService.getReservation(this.reservationId);
      },
      error: (error) => {
        this.snackBar.open('Error al cancelar la reserva', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  onExportReservation(reservation: Reservation) {
    this.reservationsService.exportSingleReservation(reservation);
    this.snackBar.open('Exportando reserva...', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  onBack() {
    this.router.navigate(['/reservations']);
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }

  canConfirm(status: ReservationStatus): boolean {
    return canConfirm(status);
  }

  canCancel(status: ReservationStatus): boolean {
    return canCancel(status);
  }
}
