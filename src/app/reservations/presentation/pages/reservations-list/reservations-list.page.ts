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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Domain & Services
import { ReservationsService } from '../../../services/reservations.service';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';
import { StatusPillComponent } from '../../components/status-pill/status-pill.component';

// Breakpoint observer for responsive
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    StatusPillComponent,
    TranslateModule
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
  private translate = inject(TranslateService);

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

  // KPI Properties
  totalReservations = 0;
  pendingReservations = 0;
  confirmedReservations = 0;
  paidReservations = 0;
  cancelledReservations = 0;

  // Trends (ejemplo estático - puedes calcular dinámicamente)
  totalTrend = 8.2;
  pendingTrend = -12;
  confirmedTrend = 15;
  cancelledTrend = -3;

  // Responsive behavior
  isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  ngOnInit() {
    this.initializeDataSubscriptions();
    this.initializeSearchControl();
    this.loadReservations();
  }

  private initializeDataSubscriptions() {
    // Suscribirse a las reservas filtradas para la tabla
    this.reservationsService.reservations$.subscribe(reservations => {
      this.dataSource.data = reservations;
    });

    // Suscribirse a TODAS las reservas para los KPIs (sin filtros)
    this.reservationsService.allReservations$.subscribe(allReservations => {
      this.calculateKPIs(allReservations);
    });

    this.reservationsService.total$.subscribe(total => {
      if (this.paginator) {
        this.paginator.length = total;
      }
    });
  }

  private calculateKPIs(reservations: Reservation[]) {
    this.totalReservations = reservations.length;
    this.pendingReservations = reservations.filter(r => r.status === ReservationStatus.PENDING).length;
    this.confirmedReservations = reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length;
    this.paidReservations = reservations.filter(r => r.status === ReservationStatus.PAID).length;
    this.cancelledReservations = reservations.filter(r => r.status === ReservationStatus.CANCELLED).length;
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

  onDeleteReservation(reservation: Reservation, event: Event) {
    event.stopPropagation();

    // Confirmar antes de eliminar
    const confirmDelete = confirm(
      `¿Estás seguro de que deseas eliminar permanentemente la reserva ${reservation.id}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    this.reservationsService.deleteReservation(reservation.id).subscribe({
      next: () => {
        this.snackBar.open('Reserva eliminada permanentemente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        this.snackBar.open('Error al eliminar la reserva', 'Cerrar', {
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

  formatCurrencySimple(amount: number, currency: string): string {
    const symbol = currency === 'PEN' ? 'S/.' : currency === 'USD' ? '$' : '€';
    return `${symbol}${amount.toFixed(2)}`;
  }

  formatDate(dateTime: string): string {
    return new Date(dateTime).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatTimeRange(startTime: string, endTime: string): string {
    const start = new Date(startTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const end = new Date(endTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${start} - ${end}`;
  }

  formatFullDate(dateTime: string): string {
    return new Date(dateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  }

  getTimeAgo(dateTime: string): string {
    const now = new Date();
    const past = new Date(dateTime);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

    return this.formatFullDate(dateTime);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  onViewDetails(reservation: Reservation, event: Event) {
    event.stopPropagation();
    this.reservationsService.openReservationDetail(reservation);
  }

  onMarkAsPaid(reservation: Reservation) {
    // Implementar lógica para marcar como pagada
    this.reservationsService.markAsPaid(reservation.id).subscribe({
      next: () => {
        this.snackBar.open('Reserva marcada como pagada', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: () => {
        this.snackBar.open('Error al marcar como pagada', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  canConfirm(status: ReservationStatus): boolean {
    return status === ReservationStatus.PENDING;
  }

  canCancel(status: ReservationStatus): boolean {
    return status !== ReservationStatus.CANCELLED && status !== ReservationStatus.COMPLETED;
  }

  canEdit(status: ReservationStatus): boolean {
    return status === ReservationStatus.PENDING || status === ReservationStatus.CONFIRMED;
  }

  canMarkAsPaid(status: ReservationStatus): boolean {
    return status === ReservationStatus.CONFIRMED;
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

  // Helper para usar traducciones en la plantilla
  t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }
}
