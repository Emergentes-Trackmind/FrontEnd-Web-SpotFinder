import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Domain & Services
import { ReservationsService } from '../../../services/reservations.service';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';
import { StatusPillComponent } from '../../components/status-pill/status-pill.component';

// Breakpoint observer for responsive
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    StatusPillComponent
  ],
  templateUrl: './reservations-list.page.html',
  styleUrl: './reservations-list.page.css'
})
export class ReservationsListPage implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private reservationsService = inject(ReservationsService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private breakpointObserver = inject(BreakpointObserver);

  displayedColumns: string[] = ['id', 'userName', 'startTime', 'status', 'totalPrice', 'actions'];
  dataSource = new MatTableDataSource<Reservation>([]);

  searchControl = new FormControl('');
  selectedStatusFilter: ReservationStatus[] = [];

  statusOptions = [
    { value: [], label: 'Todas', chipClass: 'chip-all' },
    { value: [ReservationStatus.PENDING], label: 'Pendiente', chipClass: 'chip-pending' },
    { value: [ReservationStatus.CONFIRMED], label: 'Confirmada', chipClass: 'chip-confirmed' },
    { value: [ReservationStatus.PAID], label: 'Pagada', chipClass: 'chip-paid' },
    { value: [ReservationStatus.CANCELLED], label: 'Cancelada', chipClass: 'chip-cancelled' }
  ];

  selectedFilterIndex = 0;

  // Responsive behavior
  isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  ngOnInit() {
    this.initializeDataSubscriptions();
    this.initializeSearchControl();
    this.loadReservations();
  }

  private initializeDataSubscriptions() {
    this.reservationsService.reservations$.subscribe(reservations => {
      this.dataSource.data = reservations;
    });

    this.reservationsService.total$.subscribe(total => {
      if (this.paginator) {
        this.paginator.length = total;
      }
    });
  }

  private initializeSearchControl() {
    this.searchControl.valueChanges.subscribe(searchTerm => {
      if (searchTerm !== null) {
        this.reservationsService.setSearchQuery(searchTerm);
      }
    });
  }

  private loadReservations() {
    this.reservationsService.refreshReservations();
  }

  onStatusFilterClick(index: number) {
    this.selectedFilterIndex = index;
    const selectedOption = this.statusOptions[index];
    this.selectedStatusFilter = selectedOption.value;
    this.reservationsService.setStatusFilter(this.selectedStatusFilter);
  }

  onRowClick(reservation: Reservation) {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        // En móvil, navegar a página de detalle
        this.router.navigate(['/reservations', reservation.id]);
      } else {
        // En desktop, abrir panel lateral
        this.reservationsService.openReservationDetail(reservation);
      }
    });
  }

  onConfirmReservation(reservation: Reservation, event: Event) {
    event.stopPropagation();

    this.reservationsService.confirmReservation(reservation.id).subscribe({
      next: (updatedReservation) => {
        this.snackBar.open('Reserva confirmada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
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

  onCancelReservation(reservation: Reservation, event: Event) {
    event.stopPropagation();

    this.reservationsService.cancelReservation(reservation.id).subscribe({
      next: (updatedReservation) => {
        this.snackBar.open('Reserva cancelada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
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

  onExportCsv() {
    this.reservationsService.exportReservations();
    this.snackBar.open('Exportando reservas...', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  onOpenAdvancedFilters() {
    // TODO: Implementar diálogo de filtros avanzados
    this.snackBar.open('Filtros avanzados próximamente', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  onPageChange(event: any) {
    this.reservationsService.setPage(event.pageIndex + 1);
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

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }

  canConfirm(status: ReservationStatus): boolean {
    return status === ReservationStatus.PENDING;
  }

  canCancel(status: ReservationStatus): boolean {
    return status !== ReservationStatus.CANCELLED && status !== ReservationStatus.COMPLETED;
  }

  // Propiedades públicas para el template
  get isDetailPanelOpen(): boolean {
    return this.reservationsService.isDetailPanelOpen();
  }

  get selectedReservation() {
    return this.reservationsService.selectedReservation();
  }

  closeReservationDetail() {
    this.reservationsService.closeReservationDetail();
  }

  exportSingleReservation(reservation: Reservation) {
    this.reservationsService.exportSingleReservation(reservation);
  }
}
